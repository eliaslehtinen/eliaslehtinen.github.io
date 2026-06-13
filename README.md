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
- `tech`: technologies used
- `role` (optional): your role or responsibilities for the project
- `description`: short description
- `tasks` (optional): array of tasks or accomplishments
- `links` (optional): array of links, each with `label` and `url`
- `images`: array of image paths (carousel if multiple)
- `youtube` (optional): embedded YouTube URL

## Deployment

This repository is set up as a GitHub user site (`eliaslehtinen.github.io`).

**Automatic deployment:**
A GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys the site when you push to the `main` branch. The workflow:

1. Checks out the repo
2. Uploads static files to GitHub Pages
3. Deploys to `https://eliaslehtinen.github.io`

**Manual deployment:**
After pushing changes to `main`, you can manually trigger the workflow from the Actions tab in your GitHub repository settings if needed.

**Configuration:**
Ensure GitHub Pages is configured to deploy from the GitHub Actions workflow:

- Go to Settings > Pages
- Source: Deploy from a branch
- Select the `main` branch and `/root` folder, OR set "Build and deployment" to "GitHub Actions"
