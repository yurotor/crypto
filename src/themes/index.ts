export interface ThemeInfo {
  id: string;
  name: string;
  description: string;
}

export const themes: ThemeInfo[] = [
  { id: 'standard', name: 'Standard', description: 'Clean, modern Apple-like design' },
  { id: 'retro', name: 'Retro', description: '90s CRT terminal aesthetic' },
  { id: 'futuristic', name: 'Futuristic', description: 'Neon cyberpunk vibes' },
  { id: 'vaporwave', name: 'Vaporwave', description: '80s aesthetic, pink & purple' },
  { id: 'paper', name: 'Paper', description: 'Warm parchment, newspaper style' },
  { id: 'hacker', name: 'Hacker', description: 'Matrix green on black' },
];
