# React IA

Plateforme centralisée pour interroger plusieurs LLMs (Gemini, DeepSeek, Groq) depuis une seule interface, avec gestion intelligente des quotas, historique des conversations, upload de fichiers et mode sombre/clair.

## Liens

- **Frontend** : https://react-ia-4.onrender.com
- **Backend API** : https://react-ia-3.onrender.com

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Django 4+ + Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Base de données | SQLite (local) / PostgreSQL (production) |
| LLMs | Gemini 2.5 Flash · DeepSeek Chat · Groq Llama 3.1 |
| Déploiement | Render (backend + frontend static) |

## Fonctionnalités

- Interroger Gemini, DeepSeek et Groq depuis une seule interface
- Basculement automatique vers un autre modèle si quota dépassé (429)
- Historique des conversations persisté en base
- Upload de fichiers PDF, Word, images (contexte injecté dans le prompt)
- Text-to-Speech et Speech-to-Text (Web Speech API)
- Mode sombre / clair
- Interface en français et anglais (i18n)
- Dashboard admin avec graphiques de monitoring (requêtes, tokens, erreurs 429)
- Export des conversations en JSON ou TXT

## Installation locale

### Prérequis

- Python 3.12+ (recommandé) ou 3.14
- Node.js 18+
- Git

### Backend

```bash
git clone https://github.com/Ibrahima75/React.ia
cd React.ia/backend

python -m venv venv
# Windows :
.\venv\Scripts\activate
# Linux/Mac :
source venv/bin/activate

pip install -r requirements.txt
```

Crée un fichier `.env` dans `backend/` :

```env
SECRET_KEY=une-cle-secrete-longue-et-aleatoire
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
GEMINI_API_KEY=AIza...
DEEPSEEK_API_KEY=sk-...
GROQ_API_KEY=gsk_...
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd React.ia/frontend
```

Crée un fichier `.env` dans `frontend/` :

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173

## Obtenir les clés API gratuites

| Service | URL | Limite gratuite |
|---------|-----|-----------------|
| Gemini | https://aistudio.google.com | 1500 req/jour |
| DeepSeek | https://platform.deepseek.com | Crédits offerts |
| Groq | https://console.groq.com | 1000 req/jour |

## Variables d'environnement (production)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Clé secrète Django (générer avec `python -c "import secrets; print(secrets.token_urlsafe(50))"`) |
| `DEBUG` | `False` en production |
| `DATABASE_URL` | URL PostgreSQL (ex: `postgres://...`) |
| `GEMINI_API_KEY` | Clé API Google Gemini |
| `DEEPSEEK_API_KEY` | Clé API DeepSeek |
| `GROQ_API_KEY` | Clé API Groq |
| `CORS_ALLOWED_ORIGINS` | URL du frontend (ex: `https://react-ia-4.onrender.com`) |
| `VITE_API_URL` | URL du backend (ex: `https://react-ia-3.onrender.com`) |

## Déploiement Render

### Backend (Web Service)
- **Branch** : `main`
- **Build command** : `pip install -r backend/requirements.txt && cd backend && python manage.py migrate --noinput && python manage.py collectstatic --noinput`
- **Start command** : `cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2`

### Frontend (Static Site)
- **Branch** : `main`
- **Build command** : `cd frontend && npm install && npm run build`
- **Publish directory** : `frontend/dist`

## Structure du projet

```
React.ia/
├── backend/
│   ├── apps/
│   │   ├── authentication/   # Modèle User custom, JWT
│   │   ├── chat/             # Conversations, messages
│   │   ├── models_config/    # Configuration des LLMs
│   │   ├── monitoring/       # Dashboard admin
│   │   ├── preferences/      # Préférences utilisateur
│   │   └── upload/           # Traitement PDF/Word/images
│   ├── services/
│   │   ├── llm/              # Adaptateurs Gemini, DeepSeek, Groq + Router
│   │   └── quota_manager.py  # Gestion RPM/RPD
│   └── config/               # Settings Django, URLs
└── frontend/
    └── src/
        ├── components/        # ModelSelector, MessageList, etc.
        ├── pages/             # Chat, Login, Settings, Dashboard
        ├── services/          # Axios + intercepteurs JWT
        ├── context/           # Auth, Theme, Language
        └── i18n/              # Traductions FR/EN
```
