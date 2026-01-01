export interface Story {
  id: string;
  title: string;
  author: string;
  authorBio?: string;
  synopsis: string;
  coverUrl: string;
  genre: string;
  status: 'Ongoing' | 'Completed';
  createdAt: number;
}

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  content: string; // HTML or Markdown content
  order: number;
  publishedAt: number;
}

export interface AdminState {
  isAuthenticated: boolean;
}

export const GENRES = [
  'Fantasy',
  'Sci-Fi',
  'Romance',
  'Mystery',
  'Thriller',
  'Horror',
  'Historical',
  'Literary Fiction',
  'Adventure',
];