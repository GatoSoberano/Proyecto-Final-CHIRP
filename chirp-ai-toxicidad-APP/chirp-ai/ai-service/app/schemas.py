"""Modelos Pydantic del microservicio de moderación."""
from __future__ import annotations

from typing import List
from pydantic import BaseModel, Field

# Evita los warnings de pydantic por el prefijo "model_".
_CFG = {"protected_namespaces": ()}


class ModerateRequest(BaseModel):
    text: str = Field(..., description="Contenido del chirp a moderar")

    model_config = {
        **_CFG,
        "json_schema_extra": {"example": {"text": "eres un idiota, callate"}},
    }


class TokenWeight(BaseModel):
    text: str
    weight: float  # 0..1, cuánto empuja hacia "tóxico"


class ModerateResponse(BaseModel):
    toxicity_score: float = Field(..., ge=0, le=100)
    is_toxic: bool
    tokens: List[TokenWeight]
    flagged_words: List[TokenWeight]
    model_version: str

    model_config = _CFG


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str

    model_config = _CFG
