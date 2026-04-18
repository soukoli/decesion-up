import { NextResponse } from 'next/server';
import { AICommunity } from '@/types';

// Curated list of top 3 AI communities/podcasts - Czech and international
const AI_COMMUNITIES: AICommunity[] = [
  {
    id: 'lex-fridman',
    name: 'Lex Fridman Podcast',
    nameCS: 'Lex Fridman Podcast',
    description: 'Deep conversations about AI, science, technology, history, and the nature of intelligence with world-leading researchers and entrepreneurs.',
    descriptionCS: 'Hluboké rozhovory o AI, vědě, technologii, historii a povaze inteligence s předními světovými výzkumníky a podnikateli.',
    type: 'podcast',
    url: 'https://lexfridman.com/podcast/',
    language: 'en',
    author: 'Lex Fridman',
    frequency: 'Weekly',
    frequencyCS: 'Týdně',
    imageUrl: 'https://lexfridman.com/wordpress/wp-content/uploads/2021/04/lex-cover-art.png',
    subscribers: '3.5M+ YouTube',
    topics: ['Deep Learning', 'Robotics', 'AGI', 'Philosophy of AI'],
    topicsCS: ['Hluboké učení', 'Robotika', 'AGI', 'Filosofie AI'],
  },
  {
    id: 'ai-thinkers-cz',
    name: 'AI Thinkers',
    nameCS: 'AI Thinkers',
    description: 'Czech podcast about artificial intelligence, machine learning, and their practical applications in business and everyday life.',
    descriptionCS: 'Český podcast o umělé inteligenci, strojovém učení a jejich praktickém využití v podnikání a běžném životě.',
    type: 'podcast',
    url: 'https://www.youtube.com/@AIThinkersCZ',
    language: 'cs',
    author: 'AI Thinkers CZ',
    frequency: 'Bi-weekly',
    frequencyCS: 'Každé 2 týdny',
    subscribers: '5K+ YouTube',
    topics: ['ChatGPT', 'Automation', 'Business AI', 'Czech AI Scene'],
    topicsCS: ['ChatGPT', 'Automatizace', 'AI v byznysu', 'Česká AI scéna'],
  },
  {
    id: 'two-minute-papers',
    name: 'Two Minute Papers',
    nameCS: 'Two Minute Papers',
    description: 'Bite-sized explanations of the latest AI research papers with stunning visual demonstrations. Perfect for staying up-to-date with cutting-edge AI.',
    descriptionCS: 'Krátká vysvětlení nejnovějších AI výzkumných článků s úžasnými vizuálními ukázkami. Ideální pro sledování nejnovějších trendů v AI.',
    type: 'youtube',
    url: 'https://www.youtube.com/@TwoMinutePapers',
    language: 'en',
    author: 'Dr. Károly Zsolnai-Fehér',
    frequency: '2-3 times per week',
    frequencyCS: '2-3x týdně',
    imageUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_lGRs-XJh5fEnw2TjuAuQdXQIFdIc9vy_m2vMEYQEF30A=s900-c-k-c0x00ffffff-no-rj',
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
