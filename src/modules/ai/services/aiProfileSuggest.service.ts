import { aiProvider } from "../utils/aiProvider";
import { sanitizeText } from "../utils/sanitize";

export const aiProfileSuggestService = {
  async profileSuggest(input: { industry: string; feedback?: string }) {
    const industry = sanitizeText(input.industry, 100);
    const feedback = input.feedback ? sanitizeText(input.feedback, 400) : "";

    const prompt = `You are an expert onboarding assistant. Given the industry: "${industry}"${feedback ? ` and user feedback: "${feedback}"` : ""}, suggest:
- A concise expert title (max 60 chars)
- A professional bio (max 300 chars)
- A reasonable consultation fee in USD (integer, typical for this industry)

Return JSON:
{
  "title": string,
  "bio": string,
  "fee": number
}`;

    const { data, meta } = await aiProvider.generateJSON<{
      title: string;
      bio: string;
      fee: number;
    }>({
      messages: [
        { role: "system", content: "You are a helpful assistant for expert onboarding." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      maxTokens: 400,
    });

    return {
      data: {
        title: data?.title ?? "",
        bio: data?.bio ?? "",
        fee: data?.fee ?? 50,
      },
      meta,
    };
  },
};
