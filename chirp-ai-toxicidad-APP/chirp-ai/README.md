# 🐦 Chirp AI

Red social tipo Twitter con un **microservicio de IA de moderación** que detecta
**contenido tóxico/ofensivo** en cada publicación y **resalta las palabras
problemáticas** (un "mapa de calor de palabras").

Proyecto Final — **Inteligencia Artificial y MLOps** (UCB, Prof. Jheser Guzmán).

---

## 🎯 Qué hace

- Registro / login con **JWT**.
- Publicar y eliminar *chirps*, dar *likes*, *seguir* usuarios, *timeline*.
- Al publicar, el backend llama al **microservicio de IA** que devuelve un
  **puntaje de toxicidad (0–100)** con un modelo de **clasificación NLP**.
- El chirp se marca como **tóxico ✓/⚠️** y se **resaltan las palabras ofensivas**.
- **Chequeo en vivo**: mientras escribes, el composer te avisa si el texto es tóxico.
- Página **Analizar**: pega cualquier texto y ve el desglose palabra por palabra.

## 🧱 Arquitectura

```
┌────────────┐      REST       ┌──────────────┐      REST      ┌───────────────┐
│  Frontend  │ ───────────────▶│   Backend    │ ──────────────▶│  AI Service   │
│  Next.js   │                 │   NestJS     │  /moderate     │  FastAPI      │
│  (3000)    │◀─────────────── │   (3001)     │                │  (8000)       │
└────────────┘                 └──────┬───────┘                └───────┬───────┘
                                      │                                │
                                 ┌────▼────┐                    ┌──────▼──────┐
                                 │ Postgres│                    │ modelo .pkl │
                                 │  (5432) │                    │ TFIDF+LogReg│
                                 └─────────┘                    └─────────────┘
```

| Capa | Stack | Carpeta |
|------|-------|---------|
| Frontend | Next.js 14 (App Router), React | `frontend/` |
| Backend | NestJS 10, TypeORM, JWT, Swagger | `backend/` |
| IA | FastAPI, scikit-learn (TF-IDF + LogisticRegression) | `ai-service/` |
| Entrenamiento | Jupyter Notebook | `notebook/` |
| Base de datos | PostgreSQL 16 | (docker) |

## 🤖 El modelo de IA (detector de toxicidad)

Es un clasificador de texto: **TF-IDF (unigramas) + Regresión Logística**.
Devuelve la probabilidad de toxicidad y, usando los **coeficientes del modelo**,
un **peso por palabra** para resaltar los términos que empujan hacia "tóxico".
Entrenar e inferir comparten la misma lógica (`ai-service/app/moderation.py`)
para evitar *training/serving skew*.

El notebook (`notebook/toxicity_model_training.ipynb`) hace EDA (balance de
clases, matriz de confusión, palabras más tóxicas), compara modelos y exporta
`ai-service/models/toxicity_model.pkl`.

## 🚀 Puesta en marcha

### Docker (todo junto)

```bash
docker compose up --build
# Frontend  → http://localhost:3000
# Backend   → http://localhost:3001/docs   (Swagger)
# AI        → http://localhost:8000/docs
```

> El microservicio entrena un modelo de respaldo al arrancar si aún no existe el
> `.pkl`, así que funciona out-of-the-box. Para el modelo "oficial", corre el
> notebook (ver `notebook/data/README.md` para el dataset de Kaggle).

### Manual (desarrollo)

```bash
# IA
cd ai-service && pip install -r requirements.txt && python train_fallback.py
uvicorn app.main:app --reload --port 8000
# Backend (Postgres corriendo)
cd backend && cp .env.example .env && npm install && npm run start:dev
# Frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```

## 🔌 Endpoints principales

Backend (NestJS): `/auth/register`, `/auth/login`, `/timeline`,
`/timeline/explore`, `POST /chirps`, `DELETE /chirps/:id`, `/chirps/:id/like`,
`/follows/:id`, y **`POST /ai/moderate`** (chequeo en vivo).

AI Service (FastAPI): `GET /health`, **`POST /moderate`** →
`{ toxicity_score, is_toxic, tokens[], flagged_words[] }`.

## ✅ MLOps

- Lógica de features única y versionada (entrenamiento = inferencia).
- Microservicio con *fallback* automático si aún no hay modelo entrenado.
- Degradación elegante: si la IA está caída, la publicación no se rompe.
- Orquestación reproducible con `docker-compose`.

## 👥 Equipo

Completar con los integrantes del grupo.

## 📄 Licencia

Uso académico — UCB.
