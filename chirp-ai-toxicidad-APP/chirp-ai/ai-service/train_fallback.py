"""
train_fallback.py
-----------------
Entrena un modelo de toxicidad de respaldo con datos sintéticos y lo guarda como
models/toxicity_model.pkl. Permite levantar el sistema completo sin correr el
notebook. El modelo "oficial" sale del notebook con un dataset real.

Uso:  python train_fallback.py
"""
import os
import joblib

from app.model_loader import ModelService

if __name__ == "__main__":
    svc = ModelService()
    pipe = svc._train_fallback()
    os.makedirs("models", exist_ok=True)
    out = "models/toxicity_model.pkl"
    joblib.dump(pipe, out)
    print(f"Modelo de toxicidad de respaldo guardado en {out}")
