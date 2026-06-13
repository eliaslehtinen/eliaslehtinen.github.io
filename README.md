# Portfolio site

This repo holds a minimal static portfolio site scaffold with dynamically rendered project cards.

## Run locally

```sh
# from repo root
python -m http.server 8000
# then open http://localhost:8000
```

## Structure

- `index.html` — main page
- `styles/main.css` — styles
- `scripts/main.js` — JS for filters, modal, carousel, and card rendering
- `data/projects.json` — project data (cards are rendered from this file)
- `assets/images/` — placeholder and project images

## Adding projects

Edit `data/projects.json` and add a new object to the array. Example:

```json
{
  "id": "my-game",
  "type": "game",
  "title": "My Game Title",
  "year": "2024",
  "tech": "Unity, C#",
  "description": "A brief description.",
  "images": ["assets/images/screenshot1.png", "assets/images/screenshot2.png"],
  "youtube": "https://www.youtube.com/embed/VIDEO_ID"
}
```

**Fields:**

- `id`: unique identifier
- `type`: `game`, `software`, or `experience` (used for filtering)
- `title`: project name
- `year`: year or year range
- `tech`: technologies/role used
- `description`: short description
- `images`: array of image paths (carousel if multiple)
- `youtube` (optional): embedded YouTube URL

## Deployment

This repository is set up as a GitHub user site (`eliaslehtinen.github.io`). Push to the `main` branch and the site will publish automatically at `https://eliaslehtinen.github.io`.
