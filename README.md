# FlickBiz 🎬

A vault for movies and TV series. Track what you watch, discover new content, and share reviews.

## Project Structure

```
flickbiz/
├── flickbiz-back/       # Django REST API
├── flickbiz-front/      # React SPA
└── render.yaml          # Render deployment config
```

## Local Development

### Backend

```bash
cd flickbiz-back
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Fill in your values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd flickbiz-front
cp .env.example .env
npm install
npm start
```

## Environment Variables

### Backend (.env)
| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | True for dev, False for prod |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `DATABASE_URL` | SQLite (dev) or PostgreSQL URL (prod) |
| `TMDB_API_KEY` | TMDB API key (free at themoviedb.org) |
| `FRONTEND_URL` | Frontend origin for CORS |

### Frontend (.env)
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |

## Deployment (Render)

1. Push the full repo to GitHub
2. Go to render.com → New → Blueprint
3. Connect your repo — Render reads `render.yaml` automatically
4. Add `TMDB_API_KEY` as a secret env var in the dashboard
5. Deploy
