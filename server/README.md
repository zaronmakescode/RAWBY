# RAWBY Server

Dart backend for the RAWBY filmmaking challenge app.

## Tech Stack
- **Dart** + **Shelf** (HTTP framework)
- **shelf_router** for routing
- **dart_jsonwebtoken** for JWT auth
- **MongoDB Atlas** (free 512 MB cluster) for persistent storage
- **mongo_dart** for database connectivity

## Run Locally

```bash
cd server
dart pub get

# Option A: Local MongoDB
dart run bin/server.dart

# Option B: Use Atlas connection string
set MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/rawby
dart run bin/server.dart
```

Server starts at `http://localhost:8080`.

## MongoDB Atlas Setup (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a **FREE Shared Cluster** (M0 — 512 MB, free forever)
3. Under **Database Access**, create a database user with read/write permissions
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere (required for Render)
5. Click **Connect** → **Drivers** → copy the connection string
6. Replace `<password>` with your database user's password
7. Add `/rawby` at the end as the database name

Your URI will look like:
```
mongodb+srv://rawbyuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rawby?retryWrites=true&w=majority
```

## Deploy to Render (Free)

1. Push this repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `server`
4. Set **Runtime** to **Docker**
5. Under **Environment Variables**, add:
   - `PORT` = `8080`
   - `MONGO_URI` = your MongoDB Atlas connection string from above
6. Deploy — that's it!

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
