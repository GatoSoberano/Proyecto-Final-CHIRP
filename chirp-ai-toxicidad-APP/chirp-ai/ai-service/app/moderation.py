"""
moderation.py
-------------
Lógica COMPARTIDA entre el notebook de entrenamiento y el microservicio para el
detector de toxicidad. Mantenerla en un solo lugar evita el training/serving skew.

El modelo es un Pipeline scikit-learn: TfidfVectorizer (unigramas) + Logistic
Regression. Además de la probabilidad de toxicidad del texto completo, usamos los
coeficientes del modelo para dar un PESO por palabra y así resaltar los términos
que empujan hacia "tóxico" (el "heatmap de palabras").
"""
from __future__ import annotations

import re
from typing import Dict, List

# Semilla de términos ofensivos (ES/EN) para generar datos sintéticos de respaldo
# y para reforzar el resaltado. El modelo real se entrena en el notebook con un
# dataset de Kaggle; esta lista es solo un plan B reproducible.
TOXIC_SEED = [
    "idiota", "estupido", "estúpido", "imbecil", "imbécil", "tonto", "basura",
    "asqueroso", "inutil", "inútil", "maldito", "odio", "callate", "cállate",
    "perdedor", "fracasado", "ridiculo", "ridículo", "payaso", "muerete",
    "idiot", "stupid", "dumb", "trash", "garbage", "hate", "loser", "ugly",
    "shut up", "moron", "pathetic", "disgusting", "kill", "worthless",
]

NEUTRAL_SEED = [
    "hola", "gracias", "excelente", "proyecto", "equipo", "aprender", "genial",
    "café", "trabajo", "código", "modelo", "datos", "feliz", "buena", "idea",
    "hello", "thanks", "great", "project", "team", "learn", "awesome", "coffee",
    "today", "release", "update", "nice", "love", "cool", "amazing",
]

_TOKEN_RE = re.compile(r"\S+")
_CLEAN_RE = re.compile(r"[^\w#@áéíóúñü]", re.IGNORECASE)


def clean_token(tok: str) -> str:
    """Normaliza un token para buscarlo en el vocabulario del modelo."""
    return _CLEAN_RE.sub("", tok).lower()


def tokenize_display(text: str) -> List[str]:
    """Divide el texto conservando las palabras tal como se muestran."""
    return _TOKEN_RE.findall(text or "")


def make_synthetic_dataset(n: int = 4000, seed: int = 42):
    """Genera un dataset sintético balanceado (texto, label 0/1) para el fallback."""
    import random

    rng = random.Random(seed)
    rows = []
    for _ in range(n // 2):
        k = rng.randint(3, 12)
        base = [rng.choice(NEUTRAL_SEED) for _ in range(k)]
        rows.append((" ".join(base), 0))
        # tóxico: mezcla de neutrales + 1-3 términos ofensivos
        toxic = [rng.choice(NEUTRAL_SEED) for _ in range(rng.randint(2, 8))]
        for _ in range(rng.randint(1, 3)):
            toxic.insert(rng.randint(0, len(toxic)), rng.choice(TOXIC_SEED))
        rng.shuffle(toxic)
        rows.append((" ".join(toxic), 1))
    rng.shuffle(rows)
    texts = [r[0] for r in rows]
    labels = [r[1] for r in rows]
    return texts, labels


def word_weights(pipeline, text: str) -> List[Dict]:
    """
    Devuelve, para cada palabra del texto, un peso 0..1 según cuánto empuja hacia
    "tóxico" según los coeficientes del modelo. Se usa para el resaltado.
    """
    tfidf = pipeline.named_steps["tfidf"]
    clf = pipeline.named_steps["clf"]
    vocab = tfidf.vocabulary_
    coef = clf.coef_[0]
    pos = coef[coef > 0]
    max_pos = float(pos.max()) if pos.size else 1.0

    tokens = []
    for tok in tokenize_display(text):
        key = clean_token(tok)
        w = 0.0
        if key in vocab:
            c = float(coef[vocab[key]])
            if c > 0:
                w = min(1.0, c / max_pos)
        tokens.append({"text": tok, "weight": round(w, 3)})
    return tokens
