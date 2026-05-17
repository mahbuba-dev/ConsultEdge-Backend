import 'dotenv/config';


import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! })
});

// Utility to load and parse seed-data.json

/**
 * @typedef {Object} SeedUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 */
/**
 * @typedef {Object} SeedExpert
 * @property {string} id
 * @property {string} userId
 */
/**
 * @typedef {Object} SeedClient
 * @property {string} id
 * @property {string} userId
 */

function loadSeedData() {
  const filePath = path.join(__dirname, '../../prisma/seed-data.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  return {
    expertUsers: data.expertUsers,
    clientUsers: data.clientUsers,
    experts: data.experts,
    clients: data.clients,
  };
}

// Realistic testimonial comments
const testimonialComments = [
  "Working with this expert was a fantastic experience!",
  "Very knowledgeable and helpful. Highly recommend.",
  "Professional, prompt, and insightful advice.",
  "Helped me solve a complex problem quickly.",
  "Great communication and expertise.",
  "Exceeded my expectations in every way.",
  "Clear explanations and actionable guidance.",
  "Friendly and easy to work with.",
  "Delivered high-quality results on time.",
  "Would definitely consult again!",
  "Impressed by the depth of knowledge.",
  "Made a real difference for my project.",
  "Quick to respond and very thorough.",
  "Helped me gain new insights.",
  "A true professional in their field.",
  "Went above and beyond to assist.",
  "Outstanding service and support.",
  "Very satisfied with the consultation.",
  "Brought clarity to a confusing issue.",
  "Highly skilled and reliable.",
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomComment(): string {
  return testimonialComments[getRandomInt(0, testimonialComments.length - 1)];
}

async function main() {
  const seed = loadSeedData();

  // Map clientUsers to their client records
  const clientMap = new Map();
  seed.clients.forEach((c) => clientMap.set(c.userId, c));
  // Map expertUsers to their expert records
  const expertMap = new Map();
  seed.experts.forEach((e) => expertMap.set(e.userId, e));

  // Only use real users that have both user and client/expert records
  const realClients = seed.clientUsers
    .map((u) => Object.assign({}, u, { clientId: clientMap.get(u.id)?.id }))
    .filter((u) => u.clientId);
  const realExperts = seed.expertUsers
    .map((u) => Object.assign({}, u, { expertId: expertMap.get(u.id)?.id }))
    .filter((u) => u.expertId);

  // Shuffle arrays for randomness
  function shuffle(arr) {
    return arr
      .map((v) => ({ v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ v }) => v);
  }

  const usedPairs = new Set();
  const testimonials = [];
  let attempts = 0;
  const maxAttempts = 1000;

  while (testimonials.length < 30 && attempts < maxAttempts) {
    attempts++;
    const client = realClients[getRandomInt(0, realClients.length - 1)];
    const expert = realExperts[getRandomInt(0, realExperts.length - 1)];
    if (client.clientId === undefined || expert.expertId === undefined) continue;
    if (client.clientId === expert.expertId) continue; // Prevent self-testimonials
    const pairKey = `${client.clientId}_${expert.expertId}`;
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);
    testimonials.push({
      clientId: client.clientId,
      expertId: expert.expertId,
      rating: getRandomInt(4, 5),
      comment: getRandomComment(),
      createdAt: new Date(Date.now() - getRandomInt(0, 60 * 24 * 60 * 60 * 1000)), // up to 60 days ago
    });
  }

  if (testimonials.length < 30) {
    throw new Error('Could not generate enough unique client-expert testimonial pairs.');
  }

  // Insert testimonials
  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: t,
    });
  }

  console.log(`Inserted ${testimonials.length} testimonials.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
