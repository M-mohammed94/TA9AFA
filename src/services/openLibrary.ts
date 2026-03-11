import { Book, SearchResponse } from '../types';

const BASE_URL = 'https://openlibrary.org';

export const searchBooks = async (query: string): Promise<SearchResponse> => {
  const response = await fetch(`${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=20`);
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }
  return response.json();
};

export const getBookCoverUrl = (coverId?: number, size: 'S' | 'M' | 'L' = 'M') => {
  if (!coverId) return 'https://via.placeholder.com/200x300?text=No+Cover';
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

export const getBooksBySubject = async (subject: string): Promise<Book[]> => {
  const response = await fetch(`${BASE_URL}/subjects/${subject.toLowerCase().replace(/ & /g, '_')}.json?limit=20`);
  if (!response.ok) {
    throw new Error('Failed to fetch books by subject');
  }
  const data = await response.json();
  return data.works.map((work: any) => ({
    key: work.key,
    title: work.title,
    author_name: work.authors?.map((a: any) => a.name),
    cover_i: work.cover_id || work.cover_i,
    first_publish_year: work.first_publish_year,
  }));
};
