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

  // Members shown publicly on the Membership page. This is NOT the roster —
  // only people who agreed to be listed have a file here.
  eleventyConfig.addCollection("members", (api) =>
    api
      .getFilteredByTag("members")
      .sort(
        (a, b) =>
          (a.data.order ?? 99) - (b.data.order ?? 99) ||
          String(a.data.name).localeCompare(String(b.data.name))
      )
  );

  eleventyConfig.addCollection("recipients", (api) =>
    api.getFilteredByTag("recipients").sort((a, b) => b.date - a.date)
  );

  // Events split themselves on their own date, so nobody has to remember to
  // tick "this one is over now". Both halves are computed against midnight UTC
  // at BUILD time — an event stops being upcoming at the next deploy, not at
  // the moment the clock rolls over. The nightly cron in the Pages workflow is
  // what keeps that gap down to a day.
  const midnightUTC = () => {
    const now = new Date();
    return Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );
  };

  eleventyConfig.addCollection("events", (api) =>
    api.getFilteredByTag("events").sort((a, b) => b.date - a.date)
  );

  // Soonest first: the next thing you can actually turn up to leads the page.
  eleventyConfig.addCollection("eventsUpcoming", (api) => {
    const today = midnightUTC();
    return api
      .getFilteredByTag("events")
      .filter((item) => item.date.getTime() >= today)
      .sort((a, b) => a.date - b.date);
  });

  // Newest first: the archive reads like a feed.
  eleventyConfig.addCollection("eventsPast", (api) => {
    const today = midnightUTC();
    return api
      .getFilteredByTag("events")
      .filter((item) => item.date.getTime() < today)
      .sort((a, b) => b.date - a.date);
  });

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

  // Is the page we are rendering one of this nav group's children? Drives
  // whether the group starts open, so landing on /events/ never shows a
  // collapsed group with the current page hidden inside it.
  eleventyConfig.addFilter("holdsCurrent", (children, url) =>
    (children || []).some(
      (child) =>
        child.url === url || (child.url !== "/" && String(url).startsWith(child.url))
    )
  );

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
  // Renders any URL as an SVG QR code at build time. Currently unused — the
  // Membership page links to the form with a plain button — but kept for
  // printed flyers, where a code built from `membershipFormUrl` cannot point
  // somewhere the site does not.
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
