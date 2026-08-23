/**
 * Directory data for announcements. Each one gets its own page, so a notice
 * can carry the full detail, attachments and links rather than being squeezed
 * into a feed entry — and so it has an address you can send someone.
 *
 * A .js file rather than .json for the computed share description: a link
 * preview that reads the same site-wide blurb for every announcement tells
 * nobody which announcement they are about to open.
 */

const asPlainText = (value) =>
  String(value || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default {
  tags: ["news"],
  layout: "announcement.njk",
  permalink: "/news/{{ page.fileSlug }}/",

  eleventyComputed: {
    pageDescription: (data) => {
      const text = asPlainText(data.body);
      if (text.length <= 160) return text;
      return text.slice(0, 157).replace(/\s+\S*$/, "") + "…";
    },
  },
};
