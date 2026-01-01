import { Story, Chapter } from '../types';

const STORIES_KEY = 'novelia_stories';
const CHAPTERS_KEY = 'novelia_chapters';
const AUTH_KEY = 'novelia_admin_auth';

// Seed data to avoid empty state
const seedData = () => {
  if (!localStorage.getItem(STORIES_KEY)) {
    const stories: Story[] = [
      {
        id: '1',
        title: 'The Clockwork Alchemist',
        author: 'Julian Vane',
        authorBio: 'Julian Vane is a connoisseur of steam, gears, and tea. Living in a renovated lighthouse, he writes stories that blend history with the impossible.',
        synopsis: 'In a city powered by steam and gears, a young apprentice discovers a forbidden formula that could rewrite the laws of physics, or destroy reality itself.',
        coverUrl: 'https://picsum.photos/300/450?random=1',
        genre: 'Sci-Fi',
        status: 'Ongoing',
        createdAt: Date.now(),
      },
      {
        id: '2',
        title: 'Whispers of the Old Forest',
        author: 'Elara Moon',
        authorBio: 'Elara Moon grew up on the edge of a dense forest, which inspired her love for folklore and dark fantasy. She currently resides in the Pacific Northwest with her two cats.',
        synopsis: 'The village elders warned them never to cross the river. But when the crops fail and sickness spreads, Elara has no choice but to seek the Witch of the Woods.',
        coverUrl: 'https://picsum.photos/300/450?random=2',
        genre: 'Fantasy',
        status: 'Completed',
        createdAt: Date.now() - 10000000,
      }
    ];
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  }

  if (!localStorage.getItem(CHAPTERS_KEY)) {
    const chapters: Chapter[] = [
      {
        id: 'c1',
        storyId: '1',
        title: 'Chapter 1: The Brass Key',
        content: '<p>The gears turned with a rhythmic thrum that vibrated through the floorboards of the workshop. Elian wiped the grease from his forehead, his eyes fixed on the small, intricate mechanism before him.</p><p>"It works," he whispered, hardly daring to believe it.</p><p>The brass key hummed with a faint blue light, a color that shouldn\'t exist in their world of copper and steam.</p>',
        order: 1,
        publishedAt: Date.now(),
      },
      {
        id: 'c2',
        storyId: '1',
        title: 'Chapter 2: Pursuit',
        content: '<p>They came at night. Not the city guard, but the cloaked figures of the Guild.</p><p>Elian grabbed his satchel, stuffing the key inside just as the door burst open.</p>',
        order: 2,
        publishedAt: Date.now(),
      }
    ];
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
  }
};

seedData();

export const StorageService = {
  getStories: (): Story[] => {
    const data = localStorage.getItem(STORIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getStory: (id: string): Story | undefined => {
    const stories = StorageService.getStories();
    return stories.find((s) => s.id === id);
  },

  saveStory: (story: Story): void => {
    const stories = StorageService.getStories();
    const index = stories.findIndex((s) => s.id === story.id);
    if (index >= 0) {
      stories[index] = story;
    } else {
      stories.push(story);
    }
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  },

  deleteStory: (id: string): void => {
    let stories = StorageService.getStories();
    stories = stories.filter((s) => s.id !== id);
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
    
    // Cascade delete chapters
    let chapters = StorageService.getAllChapters();
    chapters = chapters.filter(c => c.storyId !== id);
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
  },

  getAllChapters: (): Chapter[] => {
    const data = localStorage.getItem(CHAPTERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getChaptersByStory: (storyId: string): Chapter[] => {
    const chapters = StorageService.getAllChapters();
    return chapters
      .filter((c) => c.storyId === storyId)
      .sort((a, b) => a.order - b.order);
  },

  getChapter: (id: string): Chapter | undefined => {
    const chapters = StorageService.getAllChapters();
    return chapters.find((c) => c.id === id);
  },

  saveChapter: (chapter: Chapter): void => {
    const chapters = StorageService.getAllChapters();
    const index = chapters.findIndex((c) => c.id === chapter.id);
    if (index >= 0) {
      chapters[index] = chapter;
    } else {
      chapters.push(chapter);
    }
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
  },

  deleteChapter: (id: string): void => {
    let chapters = StorageService.getAllChapters();
    chapters = chapters.filter((c) => c.id !== id);
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  },

  login: (password: string): boolean => {
    // Authentication with specific passkey
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