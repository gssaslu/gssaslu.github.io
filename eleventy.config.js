import QRCode from "qrcode";
import markdownIt from "markdown-it";

const md = markdownIt({ html: true, linkify: true, typographer: true });

export default function (eleventyConfig) {
  // ---- Static assets -------------------------------------------------------
  // `media` is where Pages CMS drops officer photos and award recipient
  // photos. It is copied verbatim so the CMS `output: /media` path resolves.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/media": "media" });
  eleventyConfig.addPassthroughCopy({ "src/root": "." });

  eleventyConfig.setServerOptions({ showAllHosts: true });

  // ---- Collections ---------------------------------------------------------
  // Tags are applied by directory data files (src/content/*/*.json) so that
  // officers never see or have to set a "tags" field in the CMS.
  eleventyConfig.addCollection("news", (api) =>
    api.getFilteredByTag("news").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("board", (api) =>
    api
      .getFilteredByTag("board")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );

  eleventyConfig.addCollection("awards", (api) => {
    // Open opportunities first, then upcoming, then closed.
    const rank = { open: 0, upcoming: 1, closed: 2 };
    return api
      .getFilteredByTag("awards")
      .sort(
        (a, b) =>
          (rank[a.data.status] ?? 3) - (rank[b.data.status] ?? 3) ||
          (a.data.order ?? 99) - (b.data.order ?? 99)
      );
  });

  eleventyConfig.addCollection("recipients", (api) =>
    api.getFilteredByTag("recipients").sort((a, b) => b.date - a.date)
  );

  // Every distinct board term, newest first — drives the "Past Boards" section.
  eleventyConfig.addCollection("boardTerms", (api) => {
    const terms = new Set(
      api.getFilteredByTag("board").map((item) => item.data.term)
    );
    return [...terms].filter(Boolean).sort().reverse();
  });

  // ---- Filters -------------------------------------------------------------
  // "Aug 2026" — the compact stamp used down the left of the news feed.
  eleventyConfig.addFilter("newsDate", (value) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
  );

  // "August 19, 2026" — used for datetime tooltips and award deadlines.
  eleventyConfig.addFilter("longDate", (value) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  );

  eleventyConfig.addFilter("isoDate", (value) =>
    new Date(value).toISOString().slice(0, 10)
  );

  eleventyConfig.addFilter("where", (array, key, value) =>
    (array || []).filter((item) => item.data[key] === value)
  );

  eleventyConfig.addFilter("reject", (array, key, value) =>
    (array || []).filter((item) => item.data[key] !== value)
  );

  // First n items of a collection — the home page shows only the newest news
  // and links to the full archive for the rest.
  eleventyConfig.addFilter("limit", (array, n) => (array || []).slice(0, n));

  // Drop a plain value from an array of plain values (used to strip the
  // current term out of the list of all board terms).
  eleventyConfig.addFilter("without", (array, value) =>
    (array || []).filter((item) => item !== value)
  );

  // "Ashutosh Pawar" -> "AP". Used for the monogram shown when an officer has
  // not uploaded a headshot yet.
  eleventyConfig.addFilter("initials", (value) =>
    String(value || "")
      .replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("")
  );

  // Renders a markdown string coming out of a CMS rich-text box. Every block of
  // prose on this site lives in a data file so officers can edit it in the CMS
  // rather than in a template.
  eleventyConfig.addFilter("md", (value) => (value ? md.render(value) : ""));

  // Same, but without the wrapping <p> — for headings and single-line fields.
  eleventyConfig.addFilter("mdInline", (value) =>
    value ? md.renderInline(value) : ""
  );

  // Google Forms renders a lot of extra chrome unless asked to embed. Officers
  // paste whatever share link they have; this normalises it.
  eleventyConfig.addFilter("embedUrl", (url) => {
    if (!url) return "";
    if (!url.includes("docs.google.com/forms")) return url;
    if (url.includes("embedded=true")) return url;
    return url + (url.includes("?") ? "&" : "?") + "embedded=true";
  });

  // ---- Shortcodes ----------------------------------------------------------
  // The membership QR code is generated at BUILD TIME from the same
  // `membershipFormUrl` field that drives the embed, so a printed QR code can
  // never point somewhere the site does not.
  eleventyConfig.addAsyncShortcode("qrcode", async (url) => {
    if (!url) return "";
    return QRCode.toString(url, {
      type: "svg",
      margin: 1,
      width: 220,
      color: { dark: "#012757", light: "#ffffff" },
    });
  });

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
