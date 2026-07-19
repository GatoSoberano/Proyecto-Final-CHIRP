# Proyecto Final CHIRP

Repositorio del proyecto de red social con moderación de toxicidad usando IA.

## Estructura rápida

- `chirp-ai-toxicidad-APP/chirp-ai/`: aplicación principal (frontend + backend + microservicio IA + docs + notebook).
- `backend_test_model/`: API de prueba para validar el modelo entrenado.
- `frontend_test_model/`: frontend simple de prueba del modelo.
- `COLAB Y MODELO ENTRENADO/`: notebook final y modelos exportados (`.pkl`).

## Qué hace el proyecto

- Permite registrar/login usuarios, publicar chirps, seguir, dar likes y ver timeline.
- Cada chirp se analiza con un modelo de toxicidad.
- El sistema devuelve:
  - `toxicity_score` (0-100)
  - `is_toxic` (true/false)
  - palabras destacadas (`flagged_words`) para mostrar un heatmap de texto.

## Cómo se usa el modelo entrenado

1. El usuario escribe un texto en el frontend.
2. El backend envía el texto al AI Service (`/moderate`).
3. El AI Service carga `models/toxicity_model.pkl` y calcula score + palabras señaladas.
4. El backend guarda el resultado junto al chirp.
5. El frontend muestra alerta visual y resaltado de términos.

Si no existe el `.pkl`, el microservicio entrena un modelo de respaldo para no detener el sistema.

## Modelo y enfoque

- Pipeline: **TF-IDF + Logistic Regression** (scikit-learn).
- Entrenamiento principal: notebook en `notebook/`.
- Servicio de inferencia: FastAPI.

## Ejecución rápida

Desde `chirp-ai-toxicidad-APP/chirp-ai/`:

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:3000`
- Backend (Swagger): `http://localhost:3001/docs`
- AI Service (Docs): `http://localhost:8000/docs`

## Nota

Este repositorio incluye tanto la app principal como carpetas de experimentación/pruebas del modelo para fines académicos y de validación.
