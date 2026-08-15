# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **static marketing site** for Henderson Group — plain HTML/CSS/vanilla JS with **no build step, no package manager, no dependencies, no backend, and no database**. There is nothing to install; the only runtime needed is `python3` (already present on the VM).

### Run (development)
Serve the repo root with any static file server, per `README.md`:

```bash
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080/`. Editing any HTML/CSS/JS file is picked up on the next browser refresh (no hot reload, no restart of the server needed).

### Lint / test / build
- **Build:** none. The site is served as-is; deployment (`.github/workflows/pages.yml`, `netlify.toml`) just uploads the repo root.
- **Automated tests:** none are configured in this repo.
- **Lint:** no linter is configured.

To validate changes, run the static server and exercise the page in a browser.

### Consultation form gotchas
- `js/form.js` drives the 4-step consultation wizard (Industry → Region → Firm details → Contact) and persists progress to `localStorage`.
- On submit it POSTs to the external [FormSubmit](https://formsubmit.co/) endpoint (`craig@hendersongroup.com.au`). This external call typically **fails from the cloud VM / a fresh browser** (network + one-time email confirmation), which is expected. The code has a `mailto:` fallback and **still shows the success screen with an `HG-...` reference ID either way**, so the end-to-end UI flow can be verified locally without the external service.
