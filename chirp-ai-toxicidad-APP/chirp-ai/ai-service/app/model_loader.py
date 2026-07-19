"""
model_loader.py
---------------
Carga el modelo de toxicidad (Pipeline TF-IDF + LogisticRegression) y expone
`moderate()`. Si no hay modelo entrenado, entrena un fallback sintético para que
el servicio nunca quede caído. El modelo "oficial" sale del notebook.
"""
from __future__ import annotations

import os

from .moderation import make_synthetic_dataset, word_weights

MODEL_PATH = os.getenv("MODEL_PATH", "models/toxicity_model.pkl")
TOXIC_THRESHOLD = float(os.getenv("TOXIC_THRESHOLD", "0.5"))
FLAG_WEIGHT_MIN = float(os.getenv("FLAG_WEIGHT_MIN", "0.08"))
TOKEN_TOXIC_WEIGHT = float(os.getenv("TOKEN_TOXIC_WEIGHT", "0.12"))


class ModelService:
    def __init__(self) -> None:
        self._pipeline = None
        self._version = "fallback-0.1"

    def load(self) -> None:
        if os.path.exists(MODEL_PATH):
            import joblib

            self._pipeline = joblib.load(MODEL_PATH)
            self._version = os.getenv("MODEL_VERSION", "notebook-1.0")
            print(f"[model_loader] Modelo de toxicidad cargado desde {MODEL_PATH}")
        else:
            print("[model_loader] No hay modelo; entrenando fallback sintético.")
            self._pipeline = self._train_fallback()
            self._version = "fallback-0.1"

    @property
    def version(self) -> str:
        return self._version

    @property
    def is_loaded(self) -> bool:
        return self._pipeline is not None

    def moderate(self, text: str) -> dict:
        """Devuelve score 0-100, is_toxic y tokens con peso para resaltar."""
        proba = float(self._pipeline.predict_proba([text])[0][1])
        tokens = word_weights(self._pipeline, text)
        flagged = [t for t in tokens if t["weight"] >= FLAG_WEIGHT_MIN]
        max_token_weight = max((t["weight"] for t in tokens), default=0.0)
        is_toxic = proba >= TOXIC_THRESHOLD or max_token_weight >= TOKEN_TOXIC_WEIGHT
        return {
            "toxicity_score": round(proba * 100, 2),
            "is_toxic": is_toxic,
            "tokens": tokens,
            "flagged_words": flagged,
        }

    # ------------------------------------------------------------------
    def _train_fallback(self):
        from sklearn.pipeline import Pipeline
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression

        texts, labels = make_synthetic_dataset()
        pipe = Pipeline(
            [
                ("tfidf", TfidfVectorizer(ngram_range=(1, 1), min_df=1)),
                ("clf", LogisticRegression(max_iter=1000, C=4.0)),
            ]
        )
        pipe.fit(texts, labels)
        return pipe


model_service = ModelService()
