# RAWBY Server

Dart backend for the RAWBY filmmaking challenge app.

## Tech Stack
- **Dart** + **Shelf** (HTTP framework)
- **shelf_router** for routing
- **dart_jsonwebtoken** for JWT auth
- **JSON file storage** (swap with a DB for production)

## Run Locally

```bash
cd server
dart pub get
dart run bin/server.dart
```

Server starts at `http://localhost:8080`.

## Deploy to Render

1. Push this repo to GitHub
2. Create a new **Web Service** on Render
3. Set **Root Directory** to `server`
4. Set **Runtime** to **Docker**
5. Render will auto-detect the Dockerfile
6. Add a **Disk** mounted at `/app/data` for persistent storage

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/login` | No | Login, returns JWT |
| POST | `/api/register` | No | Register new user |
| GET | `/api/me` | Yes | Get current user + snapshot |
| POST | `/api/generate-prompts` | Yes | Generate AI-style prompts |
| GET | `/api/leaderboard` | Yes | Get ranked leaderboard |
| GET | `/api/profile/:username` | Yes | Get user profile |
| POST | `/api/sync` | Yes | Push session snapshot |
| POST | `/api/sync-scores` | Yes | Sync scores only |
| GET | `/api/instagram-recent` | Yes | Instagram media (placeholder) |
| POST | `/api/fetch-reel-likes` | Yes | Fetch reel stats (placeholder) |
| GET | `/api/feedback` | Yes | Get feedback entries |
| DELETE | `/api/feedback/:id` | Yes | Delete feedback entry |
| POST | `/api/updates` | Yes | Post global update |
| GET | `/api/updates` | Yes | Get all updates |
| GET | `/api/users` | Yes | List all users (admin) |
| POST | `/api/fcm-token` | Yes | Register FCM token |
