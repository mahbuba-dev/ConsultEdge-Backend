import { aiProvider } from "../utils/aiProvider";
import {
  summaryPrompt,
  buildChatMessages,
  documentAnalysisPrompt,
} from "../prompts";
import { sanitizeText } from "../utils/sanitize";
import { prisma } from "../../../lib/prisma";
import { ReviewStatus } from "../../../generated/client";

export type AIMeta = {
  model: string;
  provider: string;
  tokensUsed: number;
  latencyMs: number;
};

export type AIRecommendationsInput = {
  viewedExperts?: string[];
  exploredIndustries?: string[];
  searchHistory?: string[];
  clickedCategories?: string[];
};

export type AIRecommendationsResult = {
  mode: "cold-start" | "personalized";
  activityCount: number;
  experts: Array<{
    name: string;
    title: string;
    specialization: string;
    description: string;
    experienceYears: number;
    fee: number;
    whyReason: string;
    rankingScore: number;
  }>;
};

export type AIIndustryCreationInput = {
  industryName: string;
};

export type AIIndustryCreationResult = {
  industryName: string;
  industryDescription: string;
  idealExpertTypes: string[];
  commonUseCases: string[];
  shortTagline: string;
};

type ExpertCandidate = {
  id: string;
  name: string;
  title: string;
  industry: string;
  description: string;
  experienceYears: number;
  fee: number;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  weeklyBookings: number;
  totalBookings: number;
};

const normalizeList = (items?: string[]): string[] => {
  if (!Array.isArray(items)) return [];
  return Array.from(
    new Set(
      items
        .map((item) => sanitizeText(item, 140).trim())
        .filter((item) => item.length > 0)
    )
  );
};

const normalizeTerm = (value: string) => value.trim().toLowerCase();

const getWeekStartUtc = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
};

const roundScore = (value: number) => Math.round(Math.max(0, Math.min(100, value)) * 100) / 100;

const buildEmptyStateFallback = (
  mode: "cold-start" | "personalized",
  context: {
    exploredIndustries: string[];
    viewedExperts: string[];
    searchHistory: string[];
    clickedCategories: string[];
  }
): AIRecommendationsResult["experts"] => {
  const personalizedReason =
    context.exploredIndustries[0]
      ? `Why: Because you explored ${context.exploredIndustries[0]}`
      : context.viewedExperts[0]
        ? `Why: Because you viewed ${context.viewedExperts[0]}`
        : context.searchHistory[0]
          ? `Why: Because you searched "${context.searchHistory[0]}"`
          : context.clickedCategories[0]
            ? `Why: Because you clicked on ${context.clickedCategories[0]}`
            : "Why: Because you interacted with similar experts";

  return [
    {
      name: "ConsultEdge Growth Advisor",
      title: "Startup Growth Consultant",
      specialization: "Go-to-market and growth strategy",
      description:
        "Helps early-stage teams shape positioning, channel strategy, and execution plans.",
      experienceYears: 10,
      fee: 120,
      whyReason:
        mode === "cold-start" ? "Why: Popular among new users" : personalizedReason,
      rankingScore: 86,
    },
    {
      name: "ConsultEdge Finance Mentor",
      title: "Finance and Fundraising Specialist",
      specialization: "Fundraising readiness and financial planning",
      description:
        "Supports founders with investor narratives, runway planning, and capital strategy.",
      experienceYears: 12,
      fee: 140,
      whyReason: mode === "cold-start" ? "Why: Verified specialist" : personalizedReason,
      rankingScore: 82,
    },
    {
      name: "ConsultEdge Product Strategist",
      title: "Product and Customer Strategy Expert",
      specialization: "Product-market fit and retention",
      description:
        "Works with teams to improve customer journeys, retention, and product prioritization.",
      experienceYears: 9,
      fee: 110,
      whyReason: mode === "cold-start" ? "Why: Trending this week" : personalizedReason,
      rankingScore: 79,
    },
  ];
};

const buildColdStartReason = (expert: ExpertCandidate): string => {
  if (expert.weeklyBookings >= 2) return "Why: Frequently booked by founders";
  if (expert.averageRating >= 4.5) return "Why: High success rate";
  if (expert.isVerified) return "Why: Verified specialist";
  if (expert.totalBookings >= 5) return "Why: Trending this week";
  return "Why: Popular among new users";
};

const buildPersonalizedReason = (
  expert: ExpertCandidate,
  context: {
    exploredIndustries: string[];
    viewedExperts: string[];
    searchHistory: string[];
    clickedCategories: string[];
    viewedIndustrySet: Set<string>;
  }
): string => {
  const normalizedIndustry = normalizeTerm(expert.industry);
  const explored = context.exploredIndustries.find(
    (industry) => normalizeTerm(industry) === normalizedIndustry
  );
  if (explored) return `Why: Because you explored ${explored}`;

  const viewed = context.viewedExperts.find((item) => {
    const token = normalizeTerm(item);
    return token === normalizeTerm(expert.id) || token === normalizeTerm(expert.name);
  });
  if (viewed) return `Why: Because you viewed ${viewed}`;

  const haystack = `${expert.title} ${expert.description} ${expert.industry}`.toLowerCase();
  const searchedKeyword = context.searchHistory.find((keyword) =>
    haystack.includes(normalizeTerm(keyword))
  );
  if (searchedKeyword) return `Why: Because you searched "${searchedKeyword}"`;

  const clickedCategory = context.clickedCategories.find((category) =>
    haystack.includes(normalizeTerm(category))
  );
  if (clickedCategory) return `Why: Because you clicked on ${clickedCategory}`;

  if (context.viewedIndustrySet.has(normalizedIndustry)) {
    return "Why: Because you interacted with similar experts";
  }

  return "Why: Because you interacted with similar experts";
};

const fetchExpertCandidates = async (): Promise<ExpertCandidate[]> => {
  const weekStart = getWeekStartUtc();

  const [experts, ratings, weeklyBookings, totalBookings] = await Promise.all([
    prisma.expert.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        fullName: true,
        title: true,
        bio: true,
        experience: true,
        consultationFee: true,
        isVerified: true,
        industry: { select: { name: true } },
      },
      orderBy: [{ isVerified: "desc" }, { updatedAt: "desc" }],
      take: 120,
    }),
    prisma.testimonial.groupBy({
      by: ["expertId"],
      where: { status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.consultation.groupBy({
      by: ["expertId"],
      where: {
        expertId: { not: null },
        createdAt: { gte: weekStart },
      },
      _count: { _all: true },
    }),
    prisma.consultation.groupBy({
      by: ["expertId"],
      where: { expertId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const ratingMap = new Map(
    ratings.map((item) => [
      item.expertId,
      {
        avg: item._avg.rating ?? 0,
        count: item._count._all,
      },
    ])
  );

  const weeklyBookingMap = new Map(
    weeklyBookings
      .filter((item): item is typeof item & { expertId: string } => !!item.expertId)
      .map((item) => [item.expertId, item._count._all])
  );

  const totalBookingMap = new Map(
    totalBookings
      .filter((item): item is typeof item & { expertId: string } => !!item.expertId)
      .map((item) => [item.expertId, item._count._all])
  );

  return experts.map((expert) => {
    const ratingStats = ratingMap.get(expert.id);
    return {
      id: expert.id,
      name: expert.fullName,
      title: expert.title?.trim() || "Business Consultant",
      industry: expert.industry.name,
      description:
        expert.bio?.trim() ||
        `${expert.fullName} advises teams on ${expert.industry.name.toLowerCase()} priorities.`,
      experienceYears: Math.max(0, expert.experience ?? 0),
      fee: Math.max(0, expert.consultationFee ?? 0),
      isVerified: expert.isVerified,
      averageRating: ratingStats?.avg ?? 0,
      reviewCount: ratingStats?.count ?? 0,
      weeklyBookings: weeklyBookingMap.get(expert.id) ?? 0,
      totalBookings: totalBookingMap.get(expert.id) ?? 0,
    };
  });
};

const recommendations = async (
  input: AIRecommendationsInput
): Promise<{ data: AIRecommendationsResult; meta: AIMeta }> => {
  try {
    const viewedExperts = normalizeList(input.viewedExperts);
    const exploredIndustries = normalizeList(input.exploredIndustries);
    const searchHistory = normalizeList(input.searchHistory);
    const clickedCategories = normalizeList(input.clickedCategories);

    const activityCount =
      viewedExperts.length +
      exploredIndustries.length +
      searchHistory.length +
      clickedCategories.length;
    const mode: "cold-start" | "personalized" =
      activityCount === 0 ? "cold-start" : "personalized";

    const candidates = await fetchExpertCandidates();
    if (candidates.length === 0) {
      throw new Error(
        "No expert candidates found. Real AI unavailable or insufficient data. Please try again later."
      );
    }

    const viewedTokenSet = new Set(viewedExperts.map(normalizeTerm));
    const exploredIndustrySet = new Set(exploredIndustries.map(normalizeTerm));
    const searchTokens = new Set(
      searchHistory
        .flatMap((query) => query.split(/\s+/))
        .map(normalizeTerm)
        .filter((token) => token.length > 1)
    );
    const clickedCategorySet = new Set(clickedCategories.map(normalizeTerm));

    const viewedMatches = candidates.filter((candidate) => {
      const byId = viewedTokenSet.has(normalizeTerm(candidate.id));
      const byName = viewedTokenSet.has(normalizeTerm(candidate.name));
      return byId || byName;
    });
    const viewedIndustrySet = new Set(viewedMatches.map((item) => normalizeTerm(item.industry)));

    const scored = candidates
      .map((candidate) => {
        let score = 35;

        if (candidate.isVerified) score += 10;
        if (candidate.averageRating >= 4.7) score += 8;
        else if (candidate.averageRating >= 4.3) score += 5;

        if (candidate.weeklyBookings >= 4) score += 12;
        else if (candidate.weeklyBookings >= 2) score += 8;
        else if (candidate.weeklyBookings >= 1) score += 4;

        score += Math.min(10, candidate.totalBookings * 0.6);

        if (mode === "personalized") {
          const candidateIndustry = normalizeTerm(candidate.industry);
          const haystack = `${candidate.name} ${candidate.title} ${candidate.description} ${candidate.industry}`.toLowerCase();

          const sameIndustry = exploredIndustrySet.has(candidateIndustry);
          if (sameIndustry) score += 24;

          const viewedThisExpert =
            viewedTokenSet.has(normalizeTerm(candidate.id)) ||
            viewedTokenSet.has(normalizeTerm(candidate.name));
          if (viewedThisExpert) score += 18;
          else if (viewedIndustrySet.has(candidateIndustry)) score += 14;

          const matchedSearch = Array.from(searchTokens).some(
            (token) => token.length > 1 && haystack.includes(token)
          );
          if (matchedSearch) score += 14;

          const matchedCategory = Array.from(clickedCategorySet).some(
            (category) => category.length > 1 && haystack.includes(category)
          );
          if (matchedCategory) score += 12;
        }

        const whyReason =
          mode === "cold-start"
            ? buildColdStartReason(candidate)
            : buildPersonalizedReason(candidate, {
                exploredIndustries,
                viewedExperts,
                searchHistory,
                clickedCategories,
                viewedIndustrySet,
              });

        return {
          name: candidate.name,
          title: candidate.title,
          specialization: candidate.industry,
          description: candidate.description,
          experienceYears: candidate.experienceYears,
          fee: candidate.fee,
          whyReason,
          rankingScore: roundScore(score),
        };
      })
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .slice(0, 8);

    return {
      data: {
        mode,
        activityCount,
        experts:
          scored.length > 0
            ? scored
            : buildEmptyStateFallback(mode, {
                exploredIndustries,
                viewedExperts,
                searchHistory,
                clickedCategories,
              }),
      },
      meta: {
        model: meta.model,
        provider: meta.provider,
        tokensUsed: meta.tokensUsed,
        latencyMs: meta.latencyMs,
      },
    };
  } catch (err) {
    throw new Error(
      "AI recommendations unavailable. Real AI provider failed or is not configured. Please try again later."
    );
  }
};

const ensureIndustryArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeText(item, 80))
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 8);
};

const ensureTaglineLength = (value: string): string => {
  const cleaned = sanitizeText(value, 120);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 5 && words.length <= 7) return words.join(" ");
  return words.slice(0, 7).join(" ") || "Optimize every customer moment better";
};

const buildIndustryFallback = (industryName: string): AIIndustryCreationResult => ({
  industryName,
  industryDescription:
    `${industryName} focuses on designing, measuring, and continuously improving the end-to-end customer journey across channels. ` +
    "It blends service operations, experience strategy, and performance analytics to raise satisfaction, loyalty, and growth.",
  idealExpertTypes: [
    "Customer experience strategists",
    "Service design and operations consultants",
    "Contact center transformation leaders",
    "Customer success and retention specialists",
  ],
  commonUseCases: [
    "Improve customer satisfaction and retention",
    "Redesign support workflows and SLAs",
    "Scale omnichannel service operations",
    "Reduce churn through journey optimization",
  ],
  shortTagline: "Elevate service quality at scale",
});

const industryCreation = async (
  input: AIIndustryCreationInput
): Promise<{ data: AIIndustryCreationResult; meta: AIMeta }> => {
  const industryName = sanitizeText(input.industryName, 100).trim() || "General Industry";

  try {
    const { data, meta } = await aiProvider.generateJSON<AIIndustryCreationResult>({
      messages: [
        {
          role: "system",
          content:
            "You are the ConsultEdge admin industry content generator. Return strict JSON only.",
        },
        {
          role: "user",
          content: [
            "Generate a premium SaaS-grade industry profile.",
            "Output JSON shape:",
            '{ "industryName": string, "industryDescription": string, "idealExpertTypes": string[], "commonUseCases": string[], "shortTagline": string }',
            "Rules:",
            "- industryDescription must be 2-3 concise lines.",
            "- idealExpertTypes and commonUseCases must never be empty.",
            "- shortTagline must be 5-7 words.",
            `Industry name: ${industryName}`,
          ].join("\n"),
        },
      ],
      temperature: 0.4,
      maxTokens: 550,
    });

    if (!data) {
      throw new Error(
        "AI industry creation unavailable. Real AI provider failed or is not configured. Please try again later."
      );
    }

    const safe: AIIndustryCreationResult = {
      industryName: sanitizeText(data.industryName, 100).trim() || industryName,
      industryDescription:
        sanitizeText(data.industryDescription, 500).trim() ||
        buildIndustryFallback(industryName).industryDescription,
      idealExpertTypes: ensureIndustryArray(data.idealExpertTypes),
      commonUseCases: ensureIndustryArray(data.commonUseCases),
      shortTagline: ensureTaglineLength(data.shortTagline || ""),
    };

    if (safe.idealExpertTypes.length === 0 || safe.commonUseCases.length === 0) {
      const fallback = buildIndustryFallback(industryName);
      safe.idealExpertTypes = fallback.idealExpertTypes;
      safe.commonUseCases = fallback.commonUseCases;
    }

    return {
      data: safe,
      meta: {
        model: meta.model,
        provider: meta.provider,
        tokensUsed: meta.tokensUsed,
        latencyMs: meta.latencyMs,
      },
    };
  } catch (err) {
    throw new Error(
      "AI industry creation unavailable. Real AI provider failed or is not configured. Please try again later."
    );
  }
};

export type AISearchInput = {
  query: string;
  userActivity?: {
    viewedExperts?: string[];
    exploredIndustries?: string[];
    searchHistory?: string[];
    clickedCategories?: string[];
  };
  db?: {
    experts?: Array<{
      id: string;
      name: string;
      title?: string;
      specialization?: string;
      industry?: string;
      tags?: string[];
      description?: string;
      bio?: string;
      expertise?: string[];
    }>;
    industries?: Array<{
      id?: string;
      industryName?: string;
      name?: string;
      description?: string;
      keywords?: string[];
    }>;
    testimonials?: Array<{
      id?: string;
      expertName?: string;
      content?: string;
      comment?: string;
    }>;
    trending?: Array<{
      title?: string;
      category?: string;
      reason?: string;
    }>;
  };
};

export type AISearchResult = {
  experts: Array<{
    type: "expert";
    id: string;
    name: string;
    title: string;
    specialization: string;
    industry: string;
    matchScore: number;
  }>;
  industries: Array<{
    type: "industry";
    id: string;
    industryName: string;
    description: string;
    matchScore: number;
  }>;
  testimonials: Array<{
    type: "testimonial";
    id: string;
    expertName: string;
    contentSnippet: string;
    matchScore: number;
  }>;
  trending: Array<{
    type: "trending";
    title: string;
    category: string;
    reason: string;
  }>;
  aiSuggestions: string[];
  recentSearches: string[];
};

type SearchActivity = {
  viewedExperts: string[];
  exploredIndustries: string[];
  searchHistory: string[];
  clickedCategories: string[];
};

type SearchExpertRow = {
  id: string;
  name: string;
  title: string;
  specialization: string;
  industry: string;
  tags: string[];
  description: string;
  popularity: number;
};

type SearchIndustryRow = {
  id: string;
  industryName: string;
  description: string;
  keywords: string[];
};

type SearchTestimonialRow = {
  id: string;
  expertName: string;
  content: string;
  popularity: number;
};

const tokenize = (text: string): string[] =>
  sanitizeText(text, 500)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);

const uniqueStrings = (items: string[], max = 100): string[] =>
  Array.from(new Set(items.map((item) => sanitizeText(item, 160).trim()).filter(Boolean))).slice(0, max);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const countTokenMatches = (tokens: string[], haystack: string) =>
  tokens.reduce((sum, token) => (haystack.includes(token) ? sum + 1 : sum), 0);

const mapPopularityBoost = (popularity: number) => Math.min(0.2, popularity * 0.02);

const buildRecentSearches = (query: string, history: string[]) => {
  const cleanedQuery = sanitizeText(query, 200).trim();
  const deduped = [cleanedQuery, ...history.filter((item) => item.toLowerCase() !== cleanedQuery.toLowerCase())];
  return uniqueStrings(deduped, 5);
};

const snippet = (text: string, max = 160) => {
  const clean = sanitizeText(text, 1000).trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 3)}...`;
};

const normalizeActivity = (activity?: AISearchInput["userActivity"]): SearchActivity => ({
  viewedExperts: uniqueStrings(activity?.viewedExperts ?? [], 100),
  exploredIndustries: uniqueStrings(activity?.exploredIndustries ?? [], 100),
  searchHistory: uniqueStrings(activity?.searchHistory ?? [], 100),
  clickedCategories: uniqueStrings(activity?.clickedCategories ?? [], 100),
});

const aggregateFrequency = (items: string[]) => {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.toLowerCase();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
};

const fetchUniversalSearchData = async (input: AISearchInput) => {
  const [bookingCounts, dbExperts, dbIndustries, dbTestimonials] = await Promise.all([
    prisma.consultation.groupBy({
      by: ["expertId"],
      where: { expertId: { not: null } },
      _count: { _all: true },
    }),
    prisma.expert.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        fullName: true,
        title: true,
        bio: true,
        industry: { select: { name: true } },
      },
      take: 300,
    }),
    prisma.industry.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, description: true },
      take: 300,
    }),
    prisma.testimonial.findMany({
      where: { status: ReviewStatus.APPROVED, comment: { not: null } },
      select: {
        id: true,
        comment: true,
        expert: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  const bookingMap = new Map(
    bookingCounts
      .filter((item): item is typeof item & { expertId: string } => !!item.expertId)
      .map((item) => [item.expertId, item._count._all])
  );

  const sourceExperts: SearchExpertRow[] = [
    ...dbExperts.map((expert) => ({
      id: expert.id,
      name: expert.fullName,
      title: expert.title?.trim() || "Consulting Expert",
      specialization: expert.industry.name,
      industry: expert.industry.name,
      tags: uniqueStrings([expert.title ?? "", expert.industry.name]),
      description:
        expert.bio?.trim() ||
        `${expert.fullName} advises teams in ${expert.industry.name.toLowerCase()}.`,
      popularity: bookingMap.get(expert.id) ?? 0,
    })),
    ...((input.db?.experts ?? []).map((expert) => ({
      id: sanitizeText(expert.id, 80).trim(),
      name: sanitizeText(expert.name, 200).trim(),
      title: sanitizeText(expert.title ?? "Consulting Expert", 120).trim() || "Consulting Expert",
      specialization: sanitizeText(expert.specialization ?? expert.industry ?? "General Consulting", 120).trim() || "General Consulting",
      industry: sanitizeText(expert.industry ?? "General", 120).trim() || "General",
      tags: uniqueStrings([...(expert.tags ?? []), ...(expert.expertise ?? [])], 12),
      description: sanitizeText(expert.description ?? expert.bio ?? "", 600).trim(),
      popularity: 0,
    })) ?? []),
  ].filter((expert) => expert.id && expert.name);

  const sourceIndustries: SearchIndustryRow[] = [
    ...dbIndustries.map((industry) => ({
      id: industry.id,
      industryName: industry.name,
      description: industry.description?.trim() || `${industry.name} consulting and strategic advisory.`,
      keywords: uniqueStrings([industry.name, ...(industry.description ? tokenize(industry.description).slice(0, 8) : [])]),
    })),
    ...((input.db?.industries ?? []).map((industry) => ({
      id: sanitizeText(industry.id ?? industry.name ?? industry.industryName ?? "", 80).trim(),
      industryName:
        sanitizeText(industry.industryName ?? industry.name ?? "", 120).trim() || "General",
      description: sanitizeText(industry.description ?? "", 600).trim(),
      keywords: uniqueStrings(industry.keywords ?? [], 20),
    })) ?? []),
  ].filter((industry) => industry.id && industry.industryName);

  const sourceTestimonials: SearchTestimonialRow[] = [
    ...dbTestimonials.map((testimonial) => ({
      id: testimonial.id,
      expertName: testimonial.expert.fullName,
      content: testimonial.comment?.trim() ?? "",
      popularity: 1,
    })),
    ...((input.db?.testimonials ?? []).map((testimonial) => ({
      id: sanitizeText(testimonial.id ?? "", 80).trim(),
      expertName: sanitizeText(testimonial.expertName ?? "", 200).trim(),
      content: sanitizeText(testimonial.content ?? testimonial.comment ?? "", 1200).trim(),
      popularity: 0,
    })) ?? []),
  ].filter((testimonial) => testimonial.id && testimonial.expertName && testimonial.content);

  return {
    experts: sourceExperts,
    industries: sourceIndustries,
    testimonials: sourceTestimonials,
    bookingMap,
  };
};

const generateAISuggestions = (input: {
  query: string;
  topIndustries: string[];
  topExpertSkills: string[];
  trendingTitles: string[];
}): string[] => {
  const intent = sanitizeText(input.query, 120).trim();
  const pool = uniqueStrings(
    [
      `${intent} strategy for founders`,
      input.topIndustries[0] ? `${intent} in ${input.topIndustries[0]}` : "",
      input.topExpertSkills[0] ? `${intent} with ${input.topExpertSkills[0]} experts` : "",
      input.trendingTitles[0] ? `${input.trendingTitles[0]} playbook` : "",
      input.topIndustries[1] ? `${intent} roadmap for ${input.topIndustries[1]}` : "",
      input.topExpertSkills[1] ? `How to execute ${intent} with ${input.topExpertSkills[1]}` : "",
    ],
    5
  );
  return pool.slice(0, 5);
};

const search = async (
  input: AISearchInput
): Promise<{ data: AISearchResult; meta: AIMeta }> => {
  try {
    const query = sanitizeText(input.query, 500).trim();
    const queryTokens = tokenize(query);
    const activity = normalizeActivity(input.userActivity);
    const viewedFreq = aggregateFrequency(activity.viewedExperts);
    const exploredIndustryFreq = aggregateFrequency(activity.exploredIndustries);
    const clickedCategoryFreq = aggregateFrequency(activity.clickedCategories);

    const sources = await fetchUniversalSearchData(input);

    const experts = sources.experts
      .map((expert) => {
        const haystack = [
          expert.name,
          expert.title,
          expert.specialization,
          expert.industry,
          expert.tags.join(" "),
          expert.description,
        ]
          .join(" ")
          .toLowerCase();

        const textScore =
          queryTokens.length === 0 ? 0 : countTokenMatches(queryTokens, haystack) / queryTokens.length;
        const viewedBoost =
          (viewedFreq.get(expert.name.toLowerCase()) ?? 0) > 0 ||
          (viewedFreq.get(expert.id.toLowerCase()) ?? 0) > 0
            ? 0.12
            : 0;
        const industryBoost = (exploredIndustryFreq.get(expert.industry.toLowerCase()) ?? 0) > 0 ? 0.1 : 0;
        const categoryBoost = (clickedCategoryFreq.get(expert.specialization.toLowerCase()) ?? 0) > 0 ? 0.08 : 0;
        const popularityBoost = mapPopularityBoost(expert.popularity);
        const finalScore = clamp01(textScore * 0.65 + viewedBoost + industryBoost + categoryBoost + popularityBoost);

        return {
          type: "expert" as const,
          id: expert.id,
          name: expert.name,
          title: expert.title,
          specialization: expert.specialization,
          industry: expert.industry,
          matchScore: Math.round(finalScore * 1000) / 1000,
        };
      })
      .filter((item) => item.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 12);

    const industries = sources.industries
      .map((industry) => {
        const haystack = `${industry.industryName} ${industry.description} ${industry.keywords.join(" ")}`.toLowerCase();
        const textScore =
          queryTokens.length === 0 ? 0 : countTokenMatches(queryTokens, haystack) / queryTokens.length;
        const activityBoost = (exploredIndustryFreq.get(industry.industryName.toLowerCase()) ?? 0) > 0 ? 0.15 : 0;
        const finalScore = clamp01(textScore * 0.8 + activityBoost);

        return {
          type: "industry" as const,
          id: industry.id,
          industryName: industry.industryName,
          description: snippet(industry.description, 180),
          matchScore: Math.round(finalScore * 1000) / 1000,
        };
      })
      .filter((item) => item.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    const testimonials = sources.testimonials
      .map((testimonial) => {
        const haystack = `${testimonial.expertName} ${testimonial.content}`.toLowerCase();
        const textScore =
          queryTokens.length === 0 ? 0 : countTokenMatches(queryTokens, haystack) / queryTokens.length;
        const finalScore = clamp01(textScore * 0.9 + mapPopularityBoost(testimonial.popularity));

        return {
          type: "testimonial" as const,
          id: testimonial.id,
          expertName: testimonial.expertName,
          contentSnippet: snippet(testimonial.content),
          matchScore: Math.round(finalScore * 1000) / 1000,
        };
      })
      .filter((item) => item.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    const mostBookedExperts = sources.experts
      .map((expert) => ({
        title: expert.name,
        category: "most-booked-experts",
        reason: `Booked ${expert.popularity} consultations`,
        score: expert.popularity,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const mostSearched = Array.from(aggregateFrequency(activity.searchHistory).entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([title, count]) => ({
        title,
        category: "most-searched-queries",
        reason: `Searched ${count} time${count > 1 ? "s" : ""}`,
        score: count,
      }));

    const mostViewed = Array.from(viewedFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([title, count]) => ({
        title,
        category: "most-viewed-experts",
        reason: `Viewed ${count} time${count > 1 ? "s" : ""}`,
        score: count,
      }));

    const mostExploredIndustries = Array.from(exploredIndustryFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([title, count]) => ({
        title,
        category: "most-explored-industries",
        reason: `Explored ${count} time${count > 1 ? "s" : ""}`,
        score: count,
      }));

    const incomingTrending = (input.db?.trending ?? [])
      .map((item) => ({
        title: sanitizeText(item.title ?? "", 120).trim(),
        category: sanitizeText(item.category ?? "trending", 80).trim() || "trending",
        reason: sanitizeText(item.reason ?? "Popular this week", 200).trim() || "Popular this week",
        score: 1,
      }))
      .filter((item) => item.title);

    const trending = [
      ...incomingTrending,
      ...mostSearched,
      ...mostViewed,
      ...mostExploredIndustries,
      ...mostBookedExperts,
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => ({
        type: "trending" as const,
        title: item.title,
        category: item.category,
        reason: item.reason,
      }));

    const topExpertScore = experts[0]?.matchScore ?? 0;
    const topIndustryScore = industries[0]?.matchScore ?? 0;
    const weakResults = experts.length + industries.length + testimonials.length < 4 ||
      Math.max(topExpertScore, topIndustryScore) < 0.45;

    const aiSuggestions = weakResults
      ? generateAISuggestions({
          query,
          topIndustries: industries.map((item) => item.industryName),
          topExpertSkills: experts.map((item) => item.specialization),
          trendingTitles: trending.map((item) => item.title),
        })
      : [];

    const recentSearches = buildRecentSearches(query, activity.searchHistory);

    return {
      data: {
        experts,
        industries,
        testimonials,
        trending,
        aiSuggestions,
        recentSearches,
      },
      meta: {
        model: meta.model,
        provider: meta.provider,
        tokensUsed: meta.tokensUsed,
        latencyMs: meta.latencyMs,
      },
    };
  } catch (err) {
    throw new Error(
      "AI search unavailable. Real AI provider failed or is not configured. Please try again later."
    );
  }
};

export type AISummaryInput = { text: string; audience?: string };
export type AISummaryResult = {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
};

const summary = async (
  input: AISummaryInput
): Promise<{ data: AISummaryResult; meta: AIMeta }> => {
  const { data, meta } = await aiProvider.generateJSON<AISummaryResult>({
    messages: [
      { role: "system", content: "You are a consulting analyst. Always return strict JSON." },
      { role: "user", content: summaryPrompt(input) },
    ],
    temperature: 0.3,
    maxTokens: 700,
  });

  const safe: AISummaryResult = {
    summary: data?.summary ?? input.text.slice(0, 280),
    keyPoints: data?.keyPoints ?? [],
    actionItems: data?.actionItems ?? [],
  };

  return {
    data: safe,
    meta: {
      model: meta.model,
      provider: meta.provider,
      tokensUsed: meta.tokensUsed,
      latencyMs: meta.latencyMs,
    },
  };
};

export type AIChatInput = {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  context?: string;
};
export type AIChatResult = { reply: string };

const chat = async (
  input: AIChatInput
): Promise<{ data: AIChatResult; meta: AIMeta }> => {
  const messages = buildChatMessages(input);
  const result = await aiProvider.generate({
    messages,
    temperature: 0.5,
    maxTokens: 500,
  });

  return {
    data: { reply: result.text || "I'm here to help. Could you share a bit more detail?" },
    meta: {
      model: result.model,
      provider: result.provider,
      tokensUsed: result.tokensUsed,
      latencyMs: result.latencyMs,
    },
  };
};

export type AIDocumentAnalysisInput = { text: string; objective?: string };
export type AIDocumentAnalysisResult = {
  summary: string;
  topics: string[];
  entities: { people: string[]; organizations: string[]; locations: string[] };
  risks: string[];
  opportunities: string[];
  recommendedExperts: string[];
};

const documentAnalysis = async (
  input: AIDocumentAnalysisInput
): Promise<{ data: AIDocumentAnalysisResult; meta: AIMeta }> => {
  const cleanText = sanitizeText(input.text, 16000);
  const { data, meta } = await aiProvider.generateJSON<AIDocumentAnalysisResult>({
    messages: [
      { role: "system", content: "You are a consulting document analyst. Always return strict JSON." },
      {
        role: "user",
        content: documentAnalysisPrompt({ text: cleanText, objective: input.objective }),
      },
    ],
    temperature: 0.2,
    maxTokens: 1200,
  });

  const safe: AIDocumentAnalysisResult = {
    summary: data?.summary ?? "",
    topics: data?.topics ?? [],
    entities: {
      people: data?.entities?.people ?? [],
      organizations: data?.entities?.organizations ?? [],
      locations: data?.entities?.locations ?? [],
    },
    risks: data?.risks ?? [],
    opportunities: data?.opportunities ?? [],
    recommendedExperts: data?.recommendedExperts ?? [],
  };

  return {
    data: safe,
    meta: {
      model: meta.model,
      provider: meta.provider,
      tokensUsed: meta.tokensUsed,
      latencyMs: meta.latencyMs,
    },
  };
};

export const aiAdvancedService = {
  recommendations,
  industryCreation,
  search,
  summary,
  chat,
  documentAnalysis,
};
