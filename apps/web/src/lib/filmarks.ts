const FILMARKS_TYPE_PATH: Record<string, string> = {
  anime: "animes",
  drama: "dramas",
  movie: "movies",
};

export function filmarksSearchUrl(type: string, title: string): string | null {
  const path = FILMARKS_TYPE_PATH[type];
  if (!path) return null;
  return `https://filmarks.com/search/${path}?q=${encodeURIComponent(title)}`;
}
