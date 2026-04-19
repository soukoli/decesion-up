import { NextResponse } from 'next/server';
import { AICommunity } from '@/types';

// Curated list of top 3 AI communities/podcasts - Czech and international
// All links verified April 2026
const AI_COMMUNITIES: AICommunity[] = [
  {
    id: 'lex-fridman',
    name: 'Lex Fridman Podcast',
    nameCS: 'Lex Fridman Podcast',
    description: 'Deep conversations about AI, science, technology, history, and the nature of intelligence with world-leading researchers and entrepreneurs.',
    descriptionCS: 'Hluboké rozhovory o AI, vědě, technologii, historii a povaze inteligence s předními světovými výzkumníky a podnikateli.',
    type: 'podcast',
    url: 'https://open.spotify.com/show/2MAi0BvDc6GTFvKFPXnkCL',
    language: 'en',
    author: 'Lex Fridman',
    frequency: 'Weekly',
    frequencyCS: 'Týdně',
    subscribers: '3.5M+ YouTube',
    topics: ['Deep Learning', 'Robotics', 'AGI', 'Philosophy of AI'],
    topicsCS: ['Hluboké učení', 'Robotika', 'AGI', 'Filosofie AI'],
  },
  {
    id: 'practical-ai',
    name: 'Practical AI',
    nameCS: 'Practical AI',
    description: 'Making artificial intelligence practical, productive, and accessible to everyone. Weekly discussions about AI/ML in the real world.',
    descriptionCS: 'Praktické využití umělé inteligence dostupné pro každého. Týdenní diskuze o AI/ML v reálném světě.',
    type: 'podcast',
    url: 'https://open.spotify.com/show/1LaCr5TFAgYPK5qHjP3XDp',
    language: 'en',
    author: 'Changelog Media',
    frequency: 'Weekly',
    frequencyCS: 'Týdně',
    subscribers: '50K+ listeners',
    topics: ['MLOps', 'LLMs', 'AI Tools', 'Industry Applications'],
    topicsCS: ['MLOps', 'LLM modely', 'AI nástroje', 'Průmyslové aplikace'],
  },
  {
    id: 'two-minute-papers',
    name: 'Two Minute Papers',
    nameCS: 'Two Minute Papers',
    description: 'Bite-sized explanations of the latest AI research papers with stunning visual demonstrations. Perfect for staying up-to-date with cutting-edge AI.',
    descriptionCS: 'Krátká vysvětlení nejnovějších AI výzkumných článků s úžasnými vizuálními ukázkami. Ideální pro sledování nejnovějších trendů v AI.',
    type: 'youtube',
    url: 'https://www.youtube.com/c/K%C3%A1rolyZsolnai',
    language: 'en',
    author: 'Dr. Károly Zsolnai-Fehér',
    frequency: '2-3 times per week',
    frequencyCS: '2-3x týdně',
    subscribers: '1.5M+ YouTube',
    topics: ['AI Research', 'Computer Graphics', 'Neural Networks', 'Simulations'],
    topicsCS: ['AI výzkum', 'Počítačová grafika', 'Neuronové sítě', 'Simulace'],
  },
];

export const revalidate = 1800; // 30 minutes

export async function GET() {
  try {
    return NextResponse.json({
      communities: AI_COMMUNITIES,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching AI communities:', error);
    return NextResponse.json({
      communities: AI_COMMUNITIES,
      updatedAt: new Date().toISOString(),
    });
  }
}
