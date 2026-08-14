/** Canonical public origin, used by Open Graph metadata and the SEO routes. */
export const SITE_ORIGIN = 'https://dashboard.cachyos.org';

/** Site name for `og:site_name`. */
export const SITE_NAME = 'CachyOS Package Dashboard';

/** Default description, used by the root route and the package search page. */
export const SITE_DESCRIPTION =
  'Search and view packages across all CachyOS repositories.';

/** Brand prefix every page title carries, e.g. `CachyOS | Mirrors List`. */
const TITLE_PREFIX = 'CachyOS';

type LinkTag = React.JSX.IntrinsicElements['link'];
type MetaTag = React.JSX.IntrinsicElements['meta'];

type PageHeadOptions = {
  description: string;
  /** Site-relative path, already URL-encoded where it contains params. */
  path: string;
  /** e.g. `'noindex, follow'` for filtered or stub pages. */
  robots?: string;
  /** Page title without the brand prefix, e.g. `'Mirrors List'`. */
  title: string;
};

/** Absolute URL for a site-relative path. */
export function canonicalUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).href;
}

export function pageHead(options: PageHeadOptions): {
  links: LinkTag[];
  meta: MetaTag[];
} {
  const {description, path, robots} = options;
  const title = `${TITLE_PREFIX} | ${options.title}`;
  const url = canonicalUrl(path);

  return {
    links: [{href: url, rel: 'canonical'}],
    meta: [
      {title},
      {content: description, name: 'description'},
      {content: title, property: 'og:title'},
      {content: description, property: 'og:description'},
      {content: url, property: 'og:url'},
      {content: title, name: 'twitter:title'},
      {content: description, name: 'twitter:description'},
      ...(robots ? [{content: robots, name: 'robots'}] : []),
    ],
  };
}
