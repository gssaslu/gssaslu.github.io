# GSSA Website

The website for the **Geospatial Science Student Association (GSSA)** at Saint
Louis University.

**Live site:** https://gssa-slu.github.io
**Edit the site:** https://app.pagescms.org — no coding required
**Editor guide:** https://gssa-slu.github.io/admin/

---

## For officers — you do not need this file

Everything on the site is edited through a web form. Go to
[the editor guide](https://gssa-slu.github.io/admin/) and follow it. You never
need to read the rest of this document, install anything, or touch code.

## ⚠️ Never commit private information

This repository is **public**. GSSA Bylaws Art. IX §9.3 restricts records
containing private student information.

The following must **never** appear in this repository:

- the membership roster
- meeting minutes
- officer applications or scoring rubrics
- budgets and financial records
- anything else holding student names, emails or personal details

Those live in the officers' SLU Google Workspace, owned by the Secretary and the
Vice President of Finance. `.gitignore` blocks the common file types as a
backstop, but it is not a substitute for care.

---

## How it works

| Piece | What it does |
|---|---|
| [Eleventy](https://www.11ty.dev) | Turns the content files into static HTML |
| [Pages CMS](https://pagescms.org) | The web form officers use to edit content |
| GitHub Actions | Rebuilds and publishes on every save |
| GitHub Pages | Hosts the finished site |

An officer saves in Pages CMS → that writes a commit → the Action rebuilds →
GitHub Pages serves it. About a minute end to end. Every change is versioned, so
nothing is ever truly lost.

## Content layout

```
src/_data/           Editable page text and settings (Site Settings, Home Page, …)
src/content/news/        One file per announcement
src/content/board/       One file per officer, past and present
src/content/awards/      One file per funding opportunity
src/content/recipients/  One file per award recipient
src/media/           Photos uploaded through the CMS
.pages.yml           Defines the editing screens officers see
```

**All prose lives in data files, not in templates**, so every word on the site is
reachable from the CMS. If you add a field to a template, add it to `.pages.yml`
too — otherwise officers cannot edit it.

## Running locally

Only needed if you are changing the design or templates.

```bash
npm install
npm start          # http://localhost:8080
npm run build      # writes _site/
```

Requires Node 18 or newer.

## Two behaviours worth knowing

**The board archive is automatic.** A board member appears as a current officer
when their `term` matches `currentTerm` in `src/_data/site.json`. Everyone else
is grouped under "Past Boards". Rolling over to a new year means adding the new
officers and changing one field — never deleting anyone.

**The Membership Form button is one field.** It sends people to
`membershipFormUrl` in Site Settings and nowhere else, so the form address is
changed in one place rather than hunted through templates. It ships with a
placeholder address — replace it before sharing the page.

## Things still to fill in

- [ ] `contactEmail` and the social links in Site Settings
- [ ] `membershipFormUrl` once the membership form exists
- [ ] Officer photos, bios, pronunciations and role-based email addresses
- [ ] The Vice President of Communications' name, once confirmed
- [ ] The CaGIS voucher terms — all six disclosure fields, **before** applications
      open (Bylaws Art. VIII §8.13)

## License

MIT for the site code. GSSA name, logo and written content are the property of
the Geospatial Science Student Association at Saint Louis University.
