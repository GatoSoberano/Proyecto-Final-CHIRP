# 🛡️ Toxicity Model API

Servicio API en Python para probar el modelo de clasificación de toxicidad en español.

## 🚀 Inicio rápido

### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2. Ejecutar el servicio

```bash
python main.py
```

El servicio se iniciará en `http://localhost:8000`

## 📚 Documentación interactiva

Una vez que el servicio esté en ejecución, accede a la documentación interactiva:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 Endpoints disponibles

### GET `/`

Verifica que el servicio está activo.

**Response:**

```json
{
  "status": "online",
  "service": "Toxicity Model API",
  "version": "1.0.0"
}
```

### POST `/predict`

Predice el nivel de toxicidad de un mensaje.

**Request:**

```json
{
  "text": "tu mensaje aquí"
}
```

**Response:**

```json
{
  "text": "tu mensaje aquí",
  "toxicity_score": 0.1234,
  "toxicity_percentage": "12%",
  "is_toxic": false
}
```

### POST `/batch-predict`

Predice la toxicidad de múltiples mensajes.

**Request:**

```json
{
  "texts": ["gracias por el gran trabajo equipo", "eres un idiota, callate"]
}
```

**Response:**

```json
[
  {
    "text": "gracias por el gran trabajo equipo",
    "toxicity_score": 0.0123,
    "toxicity_percentage": "1%",
    "is_toxic": false
  },
  {
    "text": "eres un idiota, callate",
    "toxicity_score": 0.9876,
    "toxicity_percentage": "99%",
    "is_toxic": true
  }
]
```

## 📝 Ejemplos con curl

### Probar un mensaje individual

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "gracias por el gran trabajo equipo"}'
```

### Probar múltiples mensajes

```bash
curl -X POST "http://localhost:8000/batch-predict" \
  -H "Content-Type: application/json" \
  -d '{"texts": ["gracias por el gran trabajo equipo", "eres un idiota, callate"]}'
```

## 🔧 Configuración

- **Host**: 0.0.0.0
- **Puerto**: 8000
- **Umbral de toxicidad**: 0.5 (valores > 0.5 se consideran tóxicos)

## 📦 Dependencias

- **FastAPI**: Framework web moderno y rápido
- **Uvicorn**: Servidor ASGI
- **joblib**: Para cargar el modelo entrenado
- **scikit-learn**: Librería de ML (dependencia del modelo)
- **pydantic**: Validación de datos

## 🎯 Notas importantes

- El modelo se carga una sola vez al iniciar el servicio (en caché)
- El archivo del modelo debe estar en: `TrainedModel/toxicity_model.pkl`
- Los textos deben estar en español
- La puntuación de toxicidad es de 0 a 1, donde 1 es máxima toxicidad

## 📝 Licencia

Proyecto Final - Inteligencia Artificial y MLOps (UCB)
