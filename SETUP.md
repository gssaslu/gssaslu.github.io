# One-time setup

Do this once. After it, officers only ever use the web editor — nobody touches a
terminal again.

Budget about 15 minutes. Steps 1 and 4 must happen in a browser; steps 2 and 3
are commands.

---

## Step 1 — Create the GSSA GitHub organization (browser)

GitHub has no API for creating organizations, so this one is manual.

1. Go to **https://github.com/organizations/plan**
2. Choose the **Free** plan
3. Organization name: `gssa-slu` (this becomes the web address —
   `gssa-slu.github.io`)
4. Contact email: **use a GSSA address, not a personal one.** Bylaws Art. IX
   §9.7 requires organization-controlled recovery methods. If GSSA does not have
   an address yet, use the President's SLU address and change it as soon as one
   exists.
5. Skip the "invite members" step for now — officers get added in step 5

> **Why an organization and not a personal account?** Bylaws Art. IX §9.6 makes
> the website an organizational asset. On a personal account, the site leaves
> with the person. In an organization, handover is adding and removing members.

## Step 2 — Push the site

From the `gssa-website` folder:

```bash
git init -b main
git add .
git status          # ← STOP. Read the next box before continuing.
```

> ### Check this before you commit
>
> The repository is **public**. Confirm `git status` lists **no** `.docx`,
> `.xlsx`, `.xlsm` or `.pdf` files, and nothing from `docs/`. That folder holds
> seven VP Communications applications with real names, SLU emails and personal
> scheduling details. Bylaws Art. IX §9.3 restricts private student information.
>
> `docs/` sits outside this folder and `.gitignore` blocks those file types, so
> it should be clean — but look anyway.

```bash
git commit -m "Initial GSSA website"
gh repo create gssa-slu/gssa-website --public --source=. --remote=origin --push
```

## Step 3 — Turn on GitHub Pages

```bash
gh api -X POST repos/gssa-slu/gssa-website/pages \
  -f "build_type=workflow"
```

Or in the browser: **Settings → Pages → Source: GitHub Actions**.

Then watch the first build:

```bash
gh run watch --repo gssa-slu/gssa-website
```

When it goes green the site is live at **https://gssa-slu.github.io**.

## Step 4 — Connect the editor (browser)

1. Go to **https://app.pagescms.org**
2. Click **Sign in with GitHub**
3. Authorize Pages CMS, and when asked which repositories it may access, grant
   it **`gssa-slu/gssa-website`**
4. Select the repository

Pages CMS reads [`.pages.yml`](.pages.yml) and builds the editing screens
automatically. You should see News, Board Members, Funding Opportunities, Award
Recipients, Site Settings and the four page-text sections in the left menu.

**Test the round trip before you tell anyone it works:** add a news item, save,
wait a minute, reload `https://gssa-slu.github.io`. If it appears, everything is
wired correctly.

## Step 5 — Add the officers

1. **https://github.com/orgs/gssa-slu/people** → *Invite member*
2. Invite each officer's GitHub account (they need a free GitHub account —
   signing up takes a minute and requires no payment details)
3. Make **at least two** officers **Owner**, so the organization is never one
   graduation away from being locked out
4. Each officer then repeats step 4 once for themselves
5. Send them **https://gssa-slu.github.io/admin/** — the guide written for them

---

## Fill in the content

In the editor, under **Site Settings**:

- [ ] `contactEmail`
- [ ] Instagram / LinkedIn URLs
- [ ] `membershipFormUrl` — the moment you paste this, the Membership page shows
      the form and generates a matching QR code

Under **Board Members**:

- [ ] Photos, bios, pronunciations and emails for all four officers
- [ ] The Vice President of Communications' name

Under **Funding Opportunities → CaGIS 2026 Student Vouchers**:

- [ ] All six fields — eligibility, quantity, how to apply, deadline, decision
      timeline, selection criteria — **before** applications open, per Bylaws
      Art. VIII §8.13. Until then the page publicly shows them as "To be
      published", which is honest but not a good look for long.

## Later: a custom domain

Nothing above needs redoing. Buy a domain, then:

```bash
echo "gssa.org" > CNAME    # your actual domain
git add CNAME && git commit -m "Add custom domain" && git push
```

…and point the DNS at GitHub. Update `url` in Site Settings so links and the
sitemap follow. HTTPS is issued automatically and free.

---

## Troubleshooting

**A save in the editor did not appear on the site.**
Check `https://github.com/gssa-slu/gssa-website/actions`. A red run shows the
error. Re-run it from that page — no code required.

**An officer cannot sign in to the editor.**
They are not in the organization yet (step 5), or they did not grant Pages CMS
access to the repository (step 4, item 3).

**Something was deleted or a page looks wrong.**
Every save is a commit. Open the repository's **History** and restore any earlier
version. Nothing done in the editor is unrecoverable.
