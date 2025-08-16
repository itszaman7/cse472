## Crime News Crawler – Setup and Usage

This document explains how to run, preview, throttle, and stop the news crawler that imports crime articles as posts into MongoDB, with optional AI analysis.

### What it does

- Crawls Bangladeshi crime news sites and builds posts matching user-submitted posts
  - Fields include: `title`, `description`/content, `attachments` (images), `sourceUrl`, and `aiAnalysis` (if enabled)
- Dedupe by `externalId` (URL hash)
- Optional AI: generates `aiAnalysis` (badges, threat level, certainty, etc.) via Gemini
- Scheduler runs every 12 hours (00:00 and 12:00 Asia/Dhaka)

### Prerequisites

- Node.js 18+
- MongoDB Atlas credentials (used by the server)
- Gemini API key

Create a `.env` file in `server/` with:

```
DB_USER=your_mongodb_user
DB_PASS=your_mongodb_password
AI_STUDIO=your_gemini_api_key
PORT=5000
```

### Install and run

```
cd server
npm i

# Dev (auto-reload)
npm run dev

# OR production
npm run start
```

Backend will be available at `http://localhost:5000`.

### API endpoints

- Start/trigger crawl (manual)

  - `POST /api/crawler/run`
  - `GET /api/crawler/run`
  - Query params:
    - `source` (optional): filter to one source, e.g. `The Daily Star`, `Dhaka Tribune`, `New Age`
    - `limit` (optional): cap number of items (applies to both per-source and total caps)
    - `ai` (optional): `true` or `false` to enable/disable AI for the run
    - `debug` (optional): `true` to include a per-source debug report

  Examples:

  - `GET http://localhost:5000/api/crawler/run?debug=true&limit=2`
  - `GET http://localhost:5000/api/crawler/run?source=The%20Daily%20Star&limit=3`
  - `POST http://localhost:5000/api/crawler/run?ai=false` (creates posts without AI to avoid quota)

- Preview extraction (no DB writes, no AI)

  - `GET /api/crawler/preview`
  - Query params: `source`, `limit`
  - Example: `GET http://localhost:5000/api/crawler/preview?source=Dhaka%20Tribune&limit=2`

  Response contains `items` with `title`, `originalTitle`, `contentText`, `images`, `source`, `sourceUrl`, and a `debugReport` per source.

- Stop crawl (graceful)

  - `POST /api/crawler/stop`
  - Signals the crawler to stop after finishing the current article; any posts built so far will be inserted.

- Crawl status
  - `GET /api/crawler/status`
  - Shows: running flag, start time, built/inserted/skipped counters, last error.

### Scheduler

- Defined in `server/index.js` using node-cron
- Default: runs at 00:00 and 12:00 Asia/Dhaka (`"0 0,12 * * *"`)
- To change: edit the cron expression and/or timezone

### Throttling and quotas

- Location: `server/services/newsCrawler.js` (`CRAWL_CONFIG` and pacing logic)
- Defaults (subject to change):
  - Per-source max articles per run (e.g., 3)
  - Max total posts per run (e.g., 6)
  - Serializes builds and waits between AI calls (e.g., 12s)
- You can disable AI for a run with `?ai=false` to avoid Gemini rate limits; posts still insert with `aiAnalysis = null`.

### Data model and destination

- DB: MongoDB Atlas database `CSE472`
- Collection: `incidentReports`
- Each crawler-created document mirrors user posts and includes:
  - `title`, `description` (translated if needed), `attachments` (image URLs), `attachmentCount`
  - `source`, `sourceUrl`, `externalId` (hash of URL)
  - `category: "News"`, `userEmail: "newsbot@system"`, `location: "Bangladesh"`
  - `aiAnalysis` (if AI enabled), `threatLevel` (consolidated), `sentiment`, timestamps

### Common tasks

- Quick manual crawl (no AI, safe):

  - `GET http://localhost:5000/api/crawler/run?ai=false&limit=2&debug=true`

- Inspect extraction quality before inserting:

  - `GET http://localhost:5000/api/crawler/preview?source=New%20Age&limit=2`

- Gracefully stop an ongoing crawl:
  - `POST http://localhost:5000/api/crawler/stop`
  - `GET http://localhost:5000/api/crawler/status`

### Windows and EC2 notes

- Windows PowerShell examples:
  - `Invoke-RestMethod -UseBasicParsing 'http://localhost:5000/api/crawler/run?debug=true'`
  - `Invoke-RestMethod -UseBasicParsing -Method Post 'http://localhost:5000/api/crawler/stop'`
- EC2
  - Open the server port (e.g., 5000) in the instance Security Group, or front with Nginx on 80/443
  - Use a process manager like `pm2` to keep the server running so cron triggers fire
  - Timezone is set to `Asia/Dhaka` in the cron; adjust if required

### Troubleshooting

- AI 429 (rate limit):
  - Re-run with `?ai=false`, or lower `limit`
  - Increase `CRAWL_CONFIG.aiDelayMs` in `newsCrawler.js`
- Bad/irrelevant images:
  - The crawler filters logos/ads/app-store badges and prefers article containers, but some sites may need domain-specific selectors. Share the `sourceUrl` to refine.
- 403/404 when fetching:
  - We use browser-like headers; some pages still block bots. Try different sources or run preview to validate per-site extraction.
