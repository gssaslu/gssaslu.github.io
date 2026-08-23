/**
 * Directory data for events. A .js file rather than the .json used by the
 * other collections, because event pages need one computed field: a share
 * description. These pages exist to be pasted into a group chat, and a link
 * preview that reads "A student-led organization at Saint Louis University"
 * for every single event tells nobody which event they are looking at.
 */

// Markdown is written for the page body, not for a <meta> tag. Strip the
// syntax rather than let asterisks and brackets show up in a link preview.
const asPlainText = (value) =>
  String(value || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default {
  tags: ["events"],
  layout: "event.njk",
  permalink: "/events/{{ page.fileSlug }}/",
  pageScript: "/assets/js/gallery.js",

  eleventyComputed: {
    pageDescription: (data) => {
      const text = asPlainText(data.summary);
      if (text.length <= 160) return text;
      return text.slice(0, 157).replace(/\s+\S*$/, "") + "…";
    },
  },
};
