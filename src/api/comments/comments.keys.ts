export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (slug: string) => [...commentKeys.lists(), { slug }] as const,
};
