# Carmichael Henderson

Production static landing page for Carmichael Henderson (Carmichael Henderson Pty Ltd, ABN 54 702 126 627) — exclusive lead generation. We win demand your sales team can monetize. One client. One mandate.

This repository is the public site. Exclusive inbound, six signature sectors plus Other, a five-step “How we work” strip, Craig and Leona Henderson, FAQ, and a consultation form that starts with vertical, volume, and the pipeline constraint. Client results and dollar figures are not invented. Verified references are available on private request.

## Public URL

The live custom domain is:

**https://hendersongroup.com.au/**

GitHub Pages still builds from `main`. The `github.io` origin redirects to the custom domain.

## Verify after merge

1. Wait for **Actions → Deploy GitHub Pages** on `main` to finish.
2. Open [https://hendersongroup.com.au/](https://hendersongroup.com.au/).
3. Confirm the hero reads **Exclusive lead generation** / **We win you the demand**, the trust strip shows **ABN 54 702 126 627**, and **Private consultation** stays visible on a phone-width viewport.
4. Click a signature sector — the consult form should open with that industry selected.
5. View-source: `rel="canonical"` should be `https://hendersongroup.com.au/`.

## One-click go-live (GitHub Pages)

The repo is currently private. Free GitHub Pages needs a public repository (or GitHub Pro).

1. Merge this pull request into `main`.
2. On GitHub: **Settings → General → Danger Zone → Change repository visibility → Public** (skip if the repo is already public or you have Pages on a private plan).
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open **Actions → Deploy GitHub Pages → Run workflow** on `main`, or push any commit to `main`. The workflow in `.github/workflows/pages.yml` publishes the site.
5. Open [https://craighenderson69ch-pixel.github.io/henderson-group/](https://craighenderson69ch-pixel.github.io/henderson-group/).

Custom domain is already attached (`CNAME` → `hendersongroup.com.au`). Do not change DNS or mailbox records from this repository.

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

1. The four-step wizard (Business → Where → Mandate → Contact) posts through [FormSubmit](https://formsubmit.co/) to that mailbox. Step 03 is the brief: desk capacity (200–10,000 / month), optional constraint and current CPL, buyer who, buyer market, qualification rules, optional hard rejects.
2. The **first** live submission sends Craig a one-time confirmation email from FormSubmit. Click it once so later enquiries arrive automatically.
3. If the relay cannot be confirmed, the browser opens a `mailto:` draft to the same address so the request is not lost.

There is no live calendar, Calendly placeholder, or discovery-call booking widget.

## What this page will not do

- No invented client results or dollar figures
- No US$12k (or any) guarantee language
- Leadership uses Craig Henderson’s actual portrait and Leona Henderson’s Slack profile photo (not generated or stock faces)
- No public testimonials attributed to unnamed clients

Operator-scale figures (for example 600+ network operators) are marked as illustrative / Insider Group published network figures, not Carmichael Henderson client results.

## Site map

| Path | Purpose |
| --- | --- |
| `index.html` | Live homepage (Quieter English) |
| `variants/index.html` | Gallery so Craig can click between versions |
| `variants/en-quiet.html` | Quieter English (same as homepage) |
| `variants/en-bright.html` | Brighter English, stronger CTA |
| `variants/en-simple.html` | Shortest English: hero, industries, verticals, consult |
| `variants/pt-br.html` | Full Brazilian Portuguese page for Leona |
| `privacy.html` | Enquiry privacy |
| `terms.html` | Site terms |
| `404.html` | GitHub Pages not-found |
| `css/styles.css` | Design system |
| `css/variants.css` | Brighter / simple / gallery styles |
| `js/form.js` | Consultation wizard + email |
| `js/animations.js` | Reveal, nav, map |
| `js/countries.js` | Region combobox |
| `assets/` | Compressed photography |

Public URLs:

- https://hendersongroup.com.au/
- https://hendersongroup.com.au/privacy.html
- https://hendersongroup.com.au/terms.html
- https://hendersongroup.com.au/variants/
- https://hendersongroup.com.au/variants/pt-br.html

## Contact

Craig Henderson · Founder & CEO  
[craig@hendersongroup.com.au](mailto:craig@hendersongroup.com.au)
