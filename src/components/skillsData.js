// Skill groups + recognition, shown in the Skills section.
// `image` is what the stamp flips to when that group is level — a signature
// brand logo per group (Growth has no single brand, so it shows a photo).

export const skillGroups = [
  { key: 'lang',     label: 'Languages',        image: '/logos/python.svg',   items: ['Python', 'TypeScript', 'Swift', 'Kotlin'] },
  { key: 'frontend', label: 'Frontend & apps',  image: '/logos/react.svg',    items: ['React', 'Next.js', 'Vite', 'Tailwind', 'SwiftUI', 'Jetpack Compose'] },
  { key: 'backend',  label: 'Backend & data',   image: '/logos/postgres.svg', items: ['Node', 'Deno', 'Supabase', 'Postgres', 'Stripe'] },
  { key: 'ai',       label: 'AI & ML',          image: '/logos/anthropic.svg', items: ['Anthropic', 'OpenAI', 'Groq', 'Gemini', 'xAI', 'RAG', 'Agents', 'Real-time voice', 'RL (GRPO, PPO, LoRA)'] },
  { key: 'growth',   label: 'Growth & craft',   image: '/logos/google.svg',   items: ['Technical SEO', 'GEO', 'Social growth', 'Video editing', 'Post-production', 'Creative direction'] },
  { key: 'infra',    label: 'Infra & tooling',  image: '/logos/vercel.svg',   items: ['Vercel', 'Railway', 'Hugging Face', 'mitmproxy', 'Git'] },
]

export const recognition = [
  { key: 'meta', title: 'Meta × PyTorch Hackathon', detail: 'Top 100 of 35,000+ teams' },
  { key: 'deepmind', title: 'Google DeepMind Bengaluru Hackathon', detail: 'Top 20 Finalist' },
  { key: 'iqoo', title: 'iQOO Hackathon, Bengaluru', detail: 'Special Honour' },
]
