// Resolve course media from the site root, including on nested teacher pages.
// The build config supplies the same prefix as Next's GitHub Pages basePath.
const assetBasePath = process.env.NEXT_PUBLIC_COURSE_BASE_PATH || "";

export function publicAsset(path: string): string;
export function publicAsset(path: string | undefined): string | undefined;
export function publicAsset(path: string | undefined): string | undefined {
  if (!path || /^(?:[a-z][a-z\d+.-]*:|\/\/|[?#])/i.test(path)) return path;
  if (assetBasePath && (path === assetBasePath || path.startsWith(`${assetBasePath}/`))) return path;
  return `${assetBasePath}/${path.replace(/^(?:\.\/|\/)+/, "")}`;
}
