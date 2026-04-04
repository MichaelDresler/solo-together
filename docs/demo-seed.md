# Demo Seed Guide

This repo includes a local demo seeder for users, events, and going-solo attendance.

## What it does

- Creates or reuses 12 demo users through the existing auth API and refreshes their avatar URLs
- Deletes all current events and existing going-solo attendance, then recreates 36 demo events
- Rebuilds the scripted going-solo attendance set from scratch
- Uses stable usernames, event titles, image URLs, and a shared password so reruns converge to the same demo dataset

The seeded event titles begin with `[Seed Demo]` so they are easy to recognize in the UI and database.

## Prerequisites

- MongoDB must be configured in [`server/.env`](/Users/michael/para/projects/solo-together/server/.env)
- The backend server must be running locally on `http://localhost:5001`
- Dependencies must already be installed

Start the app stack from the repo root if needed:

```bash
npm run dev
```

## Run the seed

From the repo root:

```bash
npm run seed:demo
```

Optional custom API base URL:

```bash
SEED_API_BASE_URL=http://localhost:5001 npm run seed:demo
```

## Rerun behavior

- Users are created once and then logged into on later runs
- User names and avatar URLs are refreshed on each run
- All current events are deleted on each run before the demo events are recreated
- All going-solo links are deleted and then recreated from the scripted attendance plan

## Demo login credentials

All demo accounts use the same password:

```text
solotogether-demo-2026
```

Accounts:

| Username | Name |
| --- | --- |
| `avery.demo` | Avery Cole |
| `jordan.demo` | Jordan Nguyen |
| `morgan.demo` | Morgan Patel |
| `sydney.demo` | Sydney Lopez |
| `cameron.demo` | Cameron Brooks |
| `riley.demo` | Riley Kim |
| `taylor.demo` | Taylor James |
| `quinn.demo` | Quinn Rivera |
| `blake.demo` | Blake Foster |
| `devon.demo` | Devon Murphy |
| `harper.demo` | Harper Diaz |
| `logan.demo` | Logan Reed |

## Notes

- This is intended for local/demo environments only
- The script uses the existing app API instead of writing directly to MongoDB
- Event reset is disabled when the backend is running in `production`
- If you want a different dataset size later, update [`scripts/seed-demo-data.mjs`](/Users/michael/para/projects/solo-together/scripts/seed-demo-data.mjs)
