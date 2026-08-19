const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
const isLocalSiteUrl = configuredSiteUrl
  ? /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredSiteUrl)
  : false;

export const SITE_URL =
  configuredSiteUrl && !isLocalSiteUrl
    ? configuredSiteUrl
    : "https://master.travel-guide-pages.pages.dev";
