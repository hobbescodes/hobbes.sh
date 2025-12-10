const SITE_NAME = "hobbescodes";
const SITE_URL = "https://hobbes.sh";
const DEFAULT_DESCRIPTION =
  "Software engineer and tiger enthusiast. Building things on the internet.";
const TWITTER_HANDLE = "@hobbescodes";
const THEME_COLOR = "#08071c";

interface SeoOptions {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  tags?: string[];
}

export function seo({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image,
  url,
  type = "website",
  publishedTime,
  author = "hobbescodes",
  tags,
}: SeoOptions) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : undefined;

  const meta = [
    { title: fullTitle },
    { name: "description", content: description },
    ...(keywords ? [{ name: "keywords", content: keywords }] : []),
    { name: "theme-color", content: THEME_COLOR },

    // Open Graph
    { property: "og:type", content: type },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:site_name", content: SITE_NAME },
    ...(canonicalUrl ? [{ property: "og:url", content: canonicalUrl }] : []),
    ...(image
      ? [{ property: "og:image", content: `${SITE_URL}${image}` }]
      : []),

    // Article-specific
    ...(type === "article" && publishedTime
      ? [{ property: "article:published_time", content: publishedTime }]
      : []),
    ...(type === "article" && author
      ? [{ property: "article:author", content: author }]
      : []),
    ...(type === "article" && tags
      ? tags.map((tag) => ({ property: "article:tag", content: tag }))
      : []),

    // Twitter Card
    {
      name: "twitter:card",
      content: image ? "summary_large_image" : "summary",
    },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: TWITTER_HANDLE },
    { name: "twitter:site", content: TWITTER_HANDLE },
    ...(image
      ? [{ name: "twitter:image", content: `${SITE_URL}${image}` }]
      : []),
  ];

  const links = [
    // Favicons
    { rel: "icon", href: "/favicon.ico" },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    { rel: "manifest", href: "/manifest.json" },
    // Canonical URL
    ...(canonicalUrl ? [{ rel: "canonical", href: canonicalUrl }] : []),
  ];

  return { meta, links };
}
