# Portfolio site

This repo holds a minimal static portfolio site scaffold.

Run locally:

```sh
# from repo root
python -m http.server 8000
# then open http://localhost:8000
```

Deployment:

- This repository appears to be a GitHub user site (`eliaslehtinen.github.io`). Pushing the `main` branch will publish the site at `https://eliaslehtinen.github.io`.
- Optionally add a GitHub Action to build and deploy if you introduce a build step.

Files of interest:

- `index.html` — main page
- `styles/main.css` — styles
- `scripts/main.js` — JS for filters and modal
- `assets/images/placeholder.svg` — placeholder image
