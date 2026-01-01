import { Story, Chapter } from '../types';
import { supabase } from './supabaseClient';

const AUTH_KEY = 'novelia_admin_auth';
const LOCAL_STORIES_KEY = 'novelia_stories';
const LOCAL_CHAPTERS_KEY = 'novelia_chapters';

// --- Local Storage Helpers (Fallback) ---
const getLocalStories = (): Story[] => {
  try {
    const s = localStorage.getItem(LOCAL_STORIES_KEY);
    return s ? JSON.parse(s) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalStories = (stories: Story[]) => {
  localStorage.setItem(LOCAL_STORIES_KEY, JSON.stringify(stories));
};

const getLocalChapters = (): Chapter[] => {
  try {
    const c = localStorage.getItem(LOCAL_CHAPTERS_KEY);
    return c ? JSON.parse(c) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalChapters = (chapters: Chapter[]) => {
  localStorage.setItem(LOCAL_CHAPTERS_KEY, JSON.stringify(chapters));
};

export const StorageService = {
  // Fetch all stories
  getStories: async (): Promise<Story[]> => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!data) return [];

      return data.map((s: any) => ({
        id: s.id,
        title: s.title,
        author: s.author,
        authorBio: s.author_bio,
        synopsis: s.synopsis,
        coverUrl: s.cover_url,
        genre: s.genre,
        status: s.status,
        createdAt: s.created_at ? new Date(s.created_at).getTime() : Date.now(),
      }));
    } catch (error) {
      console.warn('Supabase error (falling back to local storage):', error);
      return getLocalStories().sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  // Fetch a single story
  getStory: async (id: string): Promise<Story | undefined> => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return undefined;

      return {
        id: data.id,
        title: data.title,
        author: data.author,
        authorBio: data.author_bio,
        synopsis: data.synopsis,
        coverUrl: data.cover_url,
        genre: data.genre,
        status: data.status,
        createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      };
    } catch (error) {
      console.warn('Supabase error fetching story:', error);
      return getLocalStories().find(s => s.id === id);
    }
  },

  // Save (Create or Update) a story
  saveStory: async (story: Story): Promise<void> => {
    // 1. Save to Local Storage (Always works as backup)
    const localStories = getLocalStories();
    const index = localStories.findIndex(s => s.id === story.id);
    if (index >= 0) {
      localStories[index] = story;
    } else {
      localStories.push(story);
    }
    saveLocalStories(localStories);

    // 2. Try Supabase
    try {
      const dbStory = {
        id: story.id,
        title: story.title,
        author: story.author,
        author_bio: story.authorBio,
        synopsis: story.synopsis,
        cover_url: story.coverUrl,
        genre: story.genre,
        status: story.status,
        created_at: new Date(story.createdAt).toISOString(),
      };

      const { error } = await supabase
        .from('stories')
        .upsert(dbStory);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving story to Supabase:', error);
    }
  },

  // Delete a story
  deleteStory: async (id: string): Promise<void> => {
    // 1. Delete from Local Storage
    const localStories = getLocalStories().filter(s => s.id !== id);
    saveLocalStories(localStories);
    
    // Also delete associated chapters locally
    const localChapters = getLocalChapters().filter(c => c.storyId !== id);
    saveLocalChapters(localChapters);

    // 2. Try Supabase
    try {
      const { error } = await supabase.from('stories').delete().eq('id', id);
      if (error) throw error;
      
      // Cascade delete is usually handled by DB, but we can explicit delete chapters if needed
      await supabase.from('chapters').delete().eq('story_id', id);
    } catch (error) {
      console.error('Error deleting story from Supabase:', error);
    }
  },

  // Fetch chapters for a story
  getChaptersByStory: async (storyId: string): Promise<Chapter[]> => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', storyId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return data.map((c: any) => ({
        id: c.id,
        storyId: c.story_id,
        title: c.title,
        content: c.content,
        order: c.order_index,
        publishedAt: c.published_at ? new Date(c.published_at).getTime() : Date.now(),
      }));
    } catch (error) {
      console.warn('Supabase error fetching chapters:', error);
      return getLocalChapters()
        .filter(c => c.storyId === storyId)
        .sort((a, b) => a.order - b.order);
    }
  },

  // Fetch a single chapter
  getChapter: async (id: string): Promise<Chapter | undefined> => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return undefined;

      return {
        id: data.id,
        storyId: data.story_id,
        title: data.title,
        content: data.content,
        order: data.order_index,
        publishedAt: data.published_at ? new Date(data.published_at).getTime() : Date.now(),
      };
    } catch (error) {
      console.warn('Supabase error fetching single chapter:', error);
      return getLocalChapters().find(c => c.id === id);
    }
  },

  // Save (Create or Update) a chapter
  saveChapter: async (chapter: Chapter): Promise<void> => {
    // 1. Save to Local Storage
    const localChapters = getLocalChapters();
    const index = localChapters.findIndex(c => c.id === chapter.id);
    if (index >= 0) {
      localChapters[index] = chapter;
    } else {
      localChapters.push(chapter);
    }
    saveLocalChapters(localChapters);

    // 2. Try Supabase
    try {
      const dbChapter = {
        id: chapter.id,
        story_id: chapter.storyId,
        title: chapter.title,
        content: chapter.content,
        order_index: chapter.order,
        published_at: new Date(chapter.publishedAt).toISOString(),
      };

      const { error } = await supabase
        .from('chapters')
        .upsert(dbChapter);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving chapter to Supabase:', error);
    }
  },

  // Delete a chapter
  deleteChapter: async (id: string): Promise<void> => {
    // 1. Delete from Local Storage
    const localChapters = getLocalChapters().filter(c => c.id !== id);
    saveLocalChapters(localChapters);

    // 2. Try Supabase
    try {
      const { error } = await supabase.from('chapters').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting chapter from Supabase:', error);
    }
  },

  // Auth Methods (Kept simple for now)
  isAuthenticated: (): boolean => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  },

  login: (password: string): boolean => {
    if (password === '040507') {
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_KEY);
  }
};
