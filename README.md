# Henderson Group

Production static landing page for Henderson Group — exclusive, done-for-you client acquisition. One client. One mandate.

This repository is the public site. Copy matches the Henderson Group source page (exclusive DFY lead gen, nine verticals, four-step approach, Craig Henderson biography, FAQ, private consultation). Client results and dollar figures are not invented. Verified references are available on private request.

## Public URL

After this branch is merged to `main` and GitHub Pages is switched on, the site is served at:

**https://craighenderson69ch-pixel.github.io/henderson-group/**

Until Pages is enabled, that URL will 404. The one-click path is below.

## One-click go-live (GitHub Pages)

The repo is currently private. Free GitHub Pages needs a public repository (or GitHub Pro).

1. Merge this pull request into `main`.
2. On GitHub: **Settings → General → Danger Zone → Change repository visibility → Public** (skip if the repo is already public or you have Pages on a private plan).
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open **Actions → Deploy GitHub Pages → Run workflow** on `main`, or push any commit to `main`. The workflow in `.github/workflows/pages.yml` publishes the site.
5. Open [https://craighenderson69ch-pixel.github.io/henderson-group/](https://craighenderson69ch-pixel.github.io/henderson-group/).

Custom domain (optional): in Pages settings add `hendersongroup.com.au` (or `www`), then point DNS. Do not add a `CNAME` file until DNS is ready.

## One-click alternative (Netlify)

If GitHub Pages is blocked on a private repo, deploy the root of this repository as a static site:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/craighenderson69ch-pixel/henderson-group)

`netlify.toml` publishes the repo root. Cloudflare Pages works the same way: connect the repo, output directory `.`, no build command.

## Local preview

```bash
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/

No build step. Static HTML, CSS, and JavaScript only.

## Consultation form

Enquiries go to **craig@hendersongroup.com.au**.

1. The wizard posts through [FormSubmit](https://formsubmit.co/) to that mailbox.
2. The **first** live submission sends Craig a one-time confirmation email from FormSubmit. Click it once so later enquiries arrive automatically.
3. If the relay cannot be confirmed, the browser opens a `mailto:` draft to the same address so the request is not lost.

There is no live calendar, Calendly placeholder, or discovery-call booking widget.

## What this page will not do

- No invented client results or dollar figures
- No US$12k (or any) guarantee language
- Leadership uses Craig Henderson’s actual portrait from the high-res landing source (not a generated or stock face)
- No public testimonials attributed to unnamed clients

Operator-scale figures (for example 600+ network operators) are marked as illustrative / Insider Group published network figures, not Henderson client results.

## Site map

| Path | Purpose |
| --- | --- |
| `index.html` | Landing page |
| `privacy.html` | Enquiry privacy |
| `terms.html` | Site terms |
| `404.html` | GitHub Pages not-found |
| `css/styles.css` | Design system |
| `js/form.js` | Consultation wizard + email |
| `js/animations.js` | Reveal, nav, map |
| `js/countries.js` | Region combobox |
| `assets/` | Compressed photography |

## Contact

Craig Henderson · Founder & CEO  
[craig@hendersongroup.com.au](mailto:craig@hendersongroup.com.au)
