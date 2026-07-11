"""
main.py
-------
Microservicio de IA de Chirp — Detector de toxicidad (FastAPI).

Endpoints:
  GET  /health    -> estado del servicio y versión del modelo
  POST /moderate  -> analiza un texto: toxicity_score (0-100), is_toxic,
                     y tokens con peso para resaltar las palabras problemáticas.

El backend NestJS consume /moderate al publicar un chirp y para el chequeo en vivo.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .model_loader import model_service
from .schemas import HealthResponse, ModerateRequest, ModerateResponse

app = FastAPI(
    title="Chirp AI — Moderación",
    description="Detecta toxicidad en los chirps y resalta las palabras ofensivas.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    model_service.load()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=model_service.is_loaded,
        model_version=model_service.version,
    )


@app.post("/moderate", response_model=ModerateResponse)
def moderate(req: ModerateRequest) -> ModerateResponse:
    result = model_service.moderate(req.text)
    return ModerateResponse(model_version=model_service.version, **result)
