from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os

# Crear la aplicación FastAPI
app = FastAPI(
    title="Toxicity Model API",
    description="API para probar el modelo de clasificación de toxicidad en español",
    version="1.0.0"
)

# Esquema de request
class MessageRequest(BaseModel):
    text: str

# Esquema de response
class ToxicityResponse(BaseModel):
    text: str
    toxicity_score: float
    toxicity_percentage: str
    is_toxic: bool

# Cache para el modelo
model_cache = None

def load_model():
    """Carga el modelo si no está en caché"""
    global model_cache
    if model_cache is None:
        # Ruta relativa al archivo del modelo
        model_path = os.path.join(
            os.path.dirname(__file__),
            "TrainedModel",
            "toxicity_model.pkl"
        )
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Modelo no encontrado en: {model_path}")
        
        model_cache = joblib.load(model_path)
        print(f"✅ Modelo cargado desde: {model_path}")
    
    return model_cache

@app.on_event("startup")
async def startup_event():
    """Carga el modelo al iniciar la aplicación"""
    try:
        load_model()
    except FileNotFoundError as e:
        print(f"⚠️ Error al cargar el modelo: {e}")

@app.get("/")
async def root():
    """Endpoint raíz para verificar que el servicio está activo"""
    return {
        "status": "online",
        "service": "Toxicity Model API",
        "version": "1.0.0"
    }

@app.post("/predict", response_model=ToxicityResponse)
async def predict_toxicity(request: MessageRequest):
    """
    Predice el nivel de toxicidad de un mensaje
    
    - **text**: El mensaje a analizar
    
    Retorna:
    - **toxicity_score**: Puntuación de 0 a 1 (0=no tóxico, 1=tóxico)
    - **toxicity_percentage**: Porcentaje formateado
    - **is_toxic**: True si la probabilidad es > 0.5
    """
    
    if not request.text or not request.text.strip():
        raise ValueError("El texto no puede estar vacío")
    
    # Cargar el modelo
    model = load_model()
    
    # Predecir probabilidad de toxicidad
    probability = model.predict_proba([request.text])[0][1]
    
    # Determinar si es tóxico (umbral: 0.5)
    is_toxic = probability > 0.5
    
    return ToxicityResponse(
        text=request.text,
        toxicity_score=round(probability, 4),
        toxicity_percentage=f"{probability:.0%}",
        is_toxic=is_toxic
    )

@app.post("/batch-predict")
async def batch_predict(texts: list[str]):
    """
    Predice la toxicidad de múltiples mensajes
    
    - **texts**: Lista de mensajes a analizar
    
    Retorna una lista con los resultados de cada mensaje
    """
    
    if not texts:
        raise ValueError("La lista de textos no puede estar vacía")
    
    model = load_model()
    results = []
    
    for text in texts:
        if text and text.strip():
            probability = model.predict_proba([text])[0][1]
            results.append({
                "text": text,
                "toxicity_score": round(probability, 4),
                "toxicity_percentage": f"{probability:.0%}",
                "is_toxic": probability > 0.5
            })
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
