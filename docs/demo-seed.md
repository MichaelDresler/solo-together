# Demo Seed Guide

This repo includes a deterministic local demo seeder for users, events, and going-solo attendance.

## What it does

- Creates or reuses 12 demo users through the existing auth API
- Creates or reuses 36 demo events through the existing events API
- Creates or reuses a spread of going-solo attendance across seeded events
- Uses stable usernames, event titles, and a shared password so you can rerun the command safely

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
- Events are matched by seeded title plus owner username
- Going-solo links are checked before creating new ones
- Rerunning the command refreshes the same demo dataset instead of endlessly duplicating it

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
- If you want a different dataset size later, update [`scripts/seed-demo-data.mjs`](/Users/michael/para/projects/solo-together/scripts/seed-demo-data.mjs)
