# 🚀 Guía Completa de Deploy: Backend + Frontend en AWS

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Deploy Backend (Lambda con Docker + ECR)](#deploy-backend-api-fastapi--lambda-con-docker)
3. [Deploy Frontend (S3)](#deploy-frontend-s3--cloudfront)
4. [Conectar Backend y Frontend](#conectar-backend-y-frontend)
5. [Testing y Verificación](#testing-y-verificación)
6. [Alternativas de Tamaño](#-alternativas-por-qué-docker-en-vez-de-zip--layers)
7. [Troubleshooting](#troubleshooting)
8. [Costos y Mantenimiento](#costos-y-mantenimiento)

---

## Requisitos Previos

### 1. Instala AWS CLI y Docker (en tu máquina local)

**AWS CLI - Windows (PowerShell como Admin):**

```powershell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

**AWS CLI - Mac/Linux:**

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Docker Desktop (necesario para construir la imagen del backend):**

Descarga desde: https://www.docker.com/products/docker-desktop/

### 2. Configura AWS CLI con tus credenciales

```bash
aws configure
```

Necesitarás:

- **AWS Access Key ID**: Obtén del panel de AWS IAM
- **AWS Secret Access Key**: Obtén del panel de AWS IAM
- **Default region**: `us-east-1` (o tu región preferida)
- **Default output format**: `json`

### 3. Crea un archivo `.gitignore` en el proyecto (opcional pero recomendado)

En `backend_test_model/.gitignore`:

```
.venv/
__pycache__/
*.pyc
.env
```

En `frontend_test_model/.gitignore`:

```
node_modules/
dist/
.env
```

---

## Deploy Backend API (FastAPI + Lambda con Docker)

> ⚠️ **Historial del problema:** Con el enfoque de ZIP + Lambda Layers, el paquete descomprimido (código + dependencias) superó el límite de **250 MB (262,144,000 bytes)** que Lambda impone a los despliegues tipo ZIP. Ese límite es fijo y no se puede aumentar agregando más layers.
>
> **Solución elegida:** Empaquetar el backend como **imagen de contenedor Docker** y subirla a **Amazon ECR**. Lambda con imágenes de contenedor admite hasta **10 GB**, y no aplica el límite de 250 MB descomprimido porque no es un despliegue ZIP.

#### Paso 1: Instala Docker Desktop (si no lo tienes)

Descarga desde: https://www.docker.com/products/docker-desktop/

Verifica la instalación:

```powershell
docker --version
```

#### Paso 2: El código ya está preparado

El archivo `main.py` ya tiene lo necesario:

- ✅ `from mangum import Mangum` - Convierte FastAPI a Lambda handler
- ✅ `handler = Mangum(app)` - AWS Lambda usará esta línea
- ✅ CORS habilitado
- ✅ Python 3.10+ compatible

También existe `backend_test_model/Dockerfile`:

```dockerfile
FROM public.ecr.aws/lambda/python:3.10

COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

COPY main.py ${LAMBDA_TASK_ROOT}/
COPY TrainedModel ${LAMBDA_TASK_ROOT}/TrainedModel

CMD [ "main.handler" ]
```

#### Paso 3: Construye la imagen localmente

```powershell
cd backend_test_model
docker build -t toxicity-api:latest .
```

Verifica que la imagen se creó:

```powershell
docker images toxicity-api
```

#### Paso 4: Crea un repositorio en Amazon ECR

```powershell
aws ecr create-repository --repository-name toxicity-api --region us-east-1
```

Guarda el `repositoryUri` que devuelve, tendrá esta forma:

```
123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api
```

#### Paso 5: Autentica Docker contra ECR

```powershell
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
```

Reemplaza `123456789012` con tu Account ID real de AWS.

#### Paso 6: Etiqueta y sube la imagen a ECR

```powershell
docker tag toxicity-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest
```

Esto puede tardar unos minutos dependiendo de tu conexión (la imagen incluye scikit-learn, ~500 MB-1 GB sin comprimir, muy por debajo del límite de 10 GB).

#### Paso 7: Crea la función Lambda desde la imagen de contenedor

1. Ve a **AWS Lambda** (https://console.aws.amazon.com/lambda/)
2. Click **Create function**
3. Selecciona **Container image** (no "Author from scratch")
4. Rellena:
   - **Function name**: `toxicity-api-function`
   - **Container image URI**: Click **Browse images** → selecciona el repositorio `toxicity-api` → tag `latest`
   - **Architecture**: `x86_64`
5. Click **Create function**

#### Paso 8: Configura Memory y Timeout

1. En **Configuration** → **General configuration**, click **Edit**
2. **Memory**: `1024 MB` (necesario para scikit-learn)
3. **Timeout**: `60 segundos`
4. Click **Save**

#### Paso 9: Configura API Gateway

1. Ve a **API Gateway** en AWS Console
2. Click **Create API** → **REST API**
3. Rellena:
   - **API name**: `toxicity-api`
   - Click **Create API**
4. En **Resources**, selecciona el recurso raíz `/`
5. Click **Create Method** → **POST**
6. Configura:
   - **Integration type**: `Lambda Function`
   - **Lambda Function**: `toxicity-api-function`
7. Click **Save**
8. Repite para **GET** también

#### Paso 10: Deploya el API

1. Click **Deploy API**
2. **Stage name**: `prod`
3. Click **Deploy**

Tu URL será algo como: `https://abcd1234.execute-api.us-east-1.amazonaws.com/prod`

---

## Deploy Frontend (S3 + CloudFront)

### Opción A: S3 + CloudFront (Recomendado)

#### Paso 1: Crea un bucket S3

```bash
aws s3 mb s3://toxicity-model-frontend-$(date +%s) --region us-east-1
```

Guarda el nombre del bucket. Ejemplo: `toxicity-model-frontend-1689123456`

#### Paso 2: Habilita hosting estático

```bash
aws s3 website s3://toxicity-model-frontend-1689123456 --index-document index.html --error-document index.html
```

#### Paso 3: Sube los archivos del frontend

```bash
cd frontend_test_model
aws s3 sync . s3://toxicity-model-frontend-1689123456 --delete
```

#### Paso 4: Habilita acceso público al bucket

Crea archivo `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::toxicity-model-frontend-1689123456/*"
    }
  ]
}
```

Aplica la política:

```bash
aws s3api put-bucket-policy --bucket toxicity-model-frontend-1689123456 --policy file://bucket-policy.json
```

#### Paso 5: (Opcional) Crea CloudFront Distribution para CDN

1. Ve a **CloudFront** en AWS Console
2. Click **Create distribution**
3. **Origin domain**: Selecciona tu bucket S3
4. **Origin path**: `/` (vacío)
5. **Viewer protocol policy**: `Redirect HTTP to HTTPS`
6. **Default root object**: `index.html`
7. **Error responses**:
   - Crea uno para `404 Not Found` → `index.html` (para SPA routing)
8. Click **Create distribution**

Tu URL será: `https://d123456789.cloudfront.net`

#### Paso 6: Obtén la URL pública del Frontend

- **Sin CloudFront**: `http://toxicity-model-frontend-1689123456.s3-website-us-east-1.amazonaws.com`
- **Con CloudFront**: `https://d123456789.cloudfront.net`

**Guárdala para el siguiente paso.**

---

### Opción B: Amplify (Todo en Uno)

#### Paso 1: Sube el frontend a GitHub

```bash
cd frontend_test_model
git init
git add .
git commit -m "Initial frontend deploy"
git remote add origin https://github.com/tuusuario/toxicity-frontend.git
git push -u origin main
```

#### Paso 2: En AWS Amplify Console

1. Ve a **AWS Amplify**
2. Click **New app** → **Host web app**
3. Selecciona tu repositorio de GitHub
4. Autoriza Amplify
5. Selecciona el repo y rama
6. Click **Save and deploy**

Amplify desplegará automáticamente en cada push.

---

## Conectar Backend y Frontend

### Paso 1: Actualiza la URL del Backend en el Frontend

En `frontend_test_model/app.js`, cambia la línea:

```javascript
const apiUrl = apiUrlInput.value.trim() || "http://localhost:8000/predict";
```

Por:

```javascript
const apiUrl =
  apiUrlInput.value.trim() ||
  "https://abc123def.execute-api.us-east-1.amazonaws.com/prod/predict";
```

Reemplaza con tu URL real de API Gateway.

### Paso 2: Asegúrate que CORS esté habilitado en el Backend

En `backend_test_model/main.py`, verifica que esté presente:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, cámbialo a tu dominio del frontend
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Para mayor seguridad en producción, reemplaza `"*"` por:

```python
allow_origins=[
    "https://toxicity-model-frontend-1689123456.s3-website-us-east-1.amazonaws.com",
    "https://d123456789.cloudfront.net"  # Si usas CloudFront
],
```

### Paso 3: Re-deploya el Backend (si cambiaste código o CORS)

Con Docker + ECR, cualquier cambio (código o dependencias) requiere reconstruir y volver a subir la imagen:

```powershell
cd backend_test_model

# 1. Reconstruye la imagen
docker build -t toxicity-api:latest .

# 2. Etiqueta y sube a ECR (reemplaza con tu Account ID)
docker tag toxicity-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest

# 3. Actualiza la función Lambda para usar la nueva imagen
aws lambda update-function-code `
  --function-name toxicity-api-function `
  --image-uri 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest
```

### Paso 4: Re-sube el Frontend

**Con S3:**

```bash
cd frontend_test_model
aws s3 sync . s3://toxicity-model-frontend-1689123456 --delete
```

**Con Amplify:**

```bash
git add .
git commit -m "Update API URL"
git push
```

---

## Testing y Verificación

### Paso 1: Prueba el Backend directamente

```bash
curl -X POST "https://abc123def.execute-api.us-east-1.amazonaws.com/prod/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "gracias por el gran trabajo equipo"}'
```

Deberías ver:

```json
{
  "text": "gracias por el gran trabajo equipo",
  "toxicity_score": 0.0123,
  "toxicity_percentage": "1%",
  "is_toxic": false
}
```

### Paso 2: Abre el Frontend en navegador

Ve a tu URL del frontend:

- `https://toxicity-model-frontend-1689123456.s3-website-us-east-1.amazonaws.com`

Deberías ver un formulario donde:

1. Ingresa un mensaje
2. Click **Probar modelo**
3. Ver el resultado

### Paso 3: Revisa los logs del Backend

1. Ve a **AWS Lambda** → Tu función
2. Abre la pestaña **Monitor**
3. Click **View CloudWatch logs**

---

## 🔧 Alternativas: ¿Por qué Docker en vez de ZIP + Layers?

El enfoque original con **ZIP + Lambda Layers** funciona bien para dependencias livianas, pero en este proyecto el paquete descomprimido (scikit-learn + numpy + scipy + el modelo `.pkl`) superó el límite fijo de **250 MB descomprimidos** que Lambda impone a los despliegues tipo ZIP (con o sin Layers). Ese límite **no se puede aumentar**, sin importar cuántos Layers uses.

### Opción 1: Docker Image en ECR (RECOMENDADO ✅ - la que usamos)

**Ventajas:**

- Permite hasta 10 GB (muy por encima del límite de 250 MB de los ZIP)
- No aplica el límite de tamaño descomprimido de los despliegues ZIP
- Máximo control sobre el entorno (versiones exactas de librerías del sistema)

**Desventaja:** Requiere Docker instalado localmente y un poco más de tiempo de build/push.

_Ya está explicado arriba en los pasos 1-10._

### Opción 2: ZIP + Lambda Layers (Descartada para este proyecto)

**Por qué no funciona aquí:** El límite de 250 MB descomprimido se supera con scikit-learn + numpy + scipy + el modelo entrenado. Es una buena opción solo si tus dependencias son livianas.

### Opción 3: EC2 / Lightsail / App Runner (Fuera de Lambda)

Si en el futuro Docker no fuera viable, otras alternativas sin límite de tamaño de Lambda son:

- **EC2**: instancia virtual donde corres `uvicorn` directamente. Sin límites de tamaño, pero requiere mantener el servidor encendido.
- **AWS App Runner**: despliega la misma imagen de contenedor (ECR) sin pasar por Lambda, con autoescalado incluido.
- **AWS Lightsail**: la opción más simple y económica (~$3.50-5/mes) para correr un contenedor o VM pequeña.

---

### Resumen: ¿Cuál elegir?

| Opción                       | Tamaño máx.          | Dificultad | Recomendación                               |
| ---------------------------- | -------------------- | ---------- | ------------------------------------------- |
| Docker + ECR (Lambda)        | Hasta 10 GB          | ⭐⭐ Media | ✅ ELEGIDA para este proyecto               |
| ZIP + Layers                 | 250 MB total         | ⭐ Fácil   | Solo si las dependencias son livianas       |
| EC2 / App Runner / Lightsail | Sin límite de Lambda | ⭐⭐ Media | Si se necesita salir de Lambda por completo |

**Recomendación:** Con scikit-learn en el proyecto, Docker + ECR es la solución estándar en AWS para evitar el límite de 250 MB. 🎯

---

## Troubleshooting

### ❌ Error: "El backend no responde"

**Causas comunes:**

1. CORS no habilitado → Verifica `main.py` y la configuración de API Gateway
2. URL incorrecta → Copia la URL exacta de API Gateway (incluye `/prod` al final)
3. Lambda no responde → Revisa CloudWatch Logs
4. Imagen de contenedor desactualizada → Verifica que subiste la imagen más reciente a ECR y actualizaste la función

**Soluciones:**

```bash
# Revisa el estado y configuración de la función
aws lambda get-function --function-name toxicity-api-function

# Revisa los logs recientes
aws logs tail /aws/lambda/toxicity-api-function --follow
```

### ❌ Error: "ModuleNotFoundError: No module named 'scikit_learn'"

El modelo no se cargó correctamente. Verifica:

```bash
# Revisa que el archivo .pkl exista en el servidor
cd backend_test_model
ls -la TrainedModel/

# Si falta, sube el archivo manualmente
aws s3 cp TrainedModel/toxicity_model.pkl s3://mi-bucket-privado/
```

### ❌ Error: "405 Method Not Allowed"

El frontend está usando el método HTTP incorrecto. Verifica en `app.js`:

```javascript
const response = await fetch(apiUrl, {
  method: "POST", // Debe ser POST
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: message }),
});
```

### ❌ Error: "Request entity too large", "File too large" o límite de 250 MB descomprimido superado

**Causa:** Estás usando despliegue tipo ZIP (con o sin Lambda Layers) y el total descomprimido (código + dependencias) supera el límite fijo de **250 MB** de Lambda. Este límite no se puede aumentar agregando más layers.

**Solución:** Usa **Docker + ECR** en vez de ZIP. Lambda con imágenes de contenedor admite hasta 10 GB y no aplica este límite.

```powershell
cd backend_test_model
docker build -t toxicity-api:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker tag toxicity-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest
```

Luego crea (o actualiza) la función Lambda seleccionando **Container image** en vez de subir un ZIP.

Ver sección "[🔧 Alternativas: ¿Por qué Docker en vez de ZIP + Layers?](#-alternativas-por-qué-docker-en-vez-de-zip--layers)" para más detalles.

### ❌ Frontend se carga pero no conecta con Backend

1. Abre DevTools del navegador (F12)
2. Ve a la pestaña **Console**
3. Busca errores CORS
4. Verifica la URL en el formulario
5. Intenta cambiar puerto o protocolo (http vs https)

---

## Costos Estimados en AWS

| Servicio        | Uso Ligero          | Costo Aproximado      |
| --------------- | ------------------- | --------------------- |
| **Lambda**      | <1M requests/mes    | <$1/mes (gratis)      |
| **API Gateway** | <1M requests/mes    | <$1/mes (gratis)      |
| **ECR**         | <1GB almacenado     | <$0.10/mes            |
| **S3**          | <1GB + 10K requests | <$1/mes               |
| **CloudFront**  | <10GB/mes           | Incluido en free tier |
| **Total**       | Típico              | <$3/mes               |

---

## Pasos Finales de Mantenimiento

### Actualizar el Backend

```powershell
cd backend_test_model

# 1. Reconstruye la imagen con tus cambios
docker build -t toxicity-api:latest .

# 2. Autentica, etiqueta y sube a ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker tag toxicity-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest

# 3. Actualiza la función Lambda para usar la nueva imagen
aws lambda update-function-code `
  --function-name toxicity-api-function `
  --image-uri 123456789012.dkr.ecr.us-east-1.amazonaws.com/toxicity-api:latest
```

### Actualizar el Frontend

```bash
cd frontend_test_model

# Haz cambios...
aws s3 sync . s3://toxicity-model-frontend-1689123456 --delete
```

### Monitoreo

- **Lambda**: CloudWatch Logs
- **API Gateway**: CloudWatch Metrics y Logs de la stage `prod`
- **ECR**: Consola de ECR para ver tags/versiones de la imagen
- **S3**: CloudWatch Metrics

---

## Resumen Rápido

| Paso | Comando                                             | Resultado                     |
| ---- | --------------------------------------------------- | ----------------------------- |
| 1    | `aws configure`                                     | Credenciales AWS configuradas |
| 2    | `docker build -t toxicity-api .`                    | Imagen construida localmente  |
| 3    | `aws ecr create-repository ...`                     | Repositorio ECR creado        |
| 4    | `docker push ...`                                   | Imagen subida a ECR           |
| 5    | Crea función Lambda (Container image) + API Gateway | Backend en vivo en AWS        |
| 6    | `aws s3 mb s3://toxicity-frontend-xxx`              | Bucket S3 creado              |
| 7    | `aws s3 sync frontend_test_model/ s3://...`         | Frontend desplegado           |
| 8    | Actualiza URL en `app.js`                           | Frontend conectado al backend |
| 9    | Visita tu URL en navegador                          | ✅ Listo para usar            |

---

**¡Tu aplicación está lista en AWS! 🚀**

Para más ayuda, contacta con soporte de AWS o revisa:

- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [AWS Lambda Container Images Docs](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)
- [Amazon ECR Docs](https://docs.aws.amazon.com/AmazonECR/latest/userguide/)
- [API Gateway Docs](https://docs.aws.amazon.com/apigateway/)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)
