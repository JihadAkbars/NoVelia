
export interface Story {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  author_bio: string;
  cover_url: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  story_id: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
}

export type Language = 'English' | 'Indonesian' | 'Spanish' | 'French' | 'Japanese';

export interface ReadingSettings {
  fontSize: number;
  isSerif: boolean;
  language: Language;
}
