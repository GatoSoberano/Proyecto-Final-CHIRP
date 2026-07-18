# 🚀 Guía Completa de Deploy: Backend + Frontend en AWS

## 📋 Tabla de Contenidos

1. [Preparación Previa](#preparación-previa)
2. [Deploy Backend API (FastAPI) a AWS](#deploy-backend-api-fastapi-a-aws)
3. [Deploy Frontend a AWS](#deploy-frontend-a-aws)
4. [Conectar Backend y Frontend](#conectar-backend-y-frontend)
5. [Verificación y Testing](#verificación-y-testing)
6. [Troubleshooting](#troubleshooting)

---

## Preparación Previa

### 1. Instala AWS CLI (en tu máquina local)

**Windows (PowerShell como Admin):**

```powershell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

**Mac/Linux:**

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

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

## Deploy Backend API (FastAPI) a AWS

### Opción A: AWS Elastic Beanstalk (Recomendado - Más Fácil)

#### Paso 1: Instala EB CLI

**Windows (PowerShell como Admin):**

```powershell
pip install awsebcli
```

**Mac/Linux:**

```bash
pip install awsebcli --user
```

#### Paso 2: Crea archivo `wsgi.py` en `backend_test_model/`

En `backend_test_model/wsgi.py`:

```python
from main import app

if __name__ == "__main__":
    app.run()
```

#### Paso 3: Crea archivo `.ebextensions/python.config`

Crea la carpeta `.ebextensions` en `backend_test_model/` y dentro un archivo `python.config`:

```yaml
option_settings:
  aws:autoscaling:launchconfiguration:
    IamInstanceProfile: aws-elasticbeanstalk-ec2-role
  aws:elasticbeanstalk:container:python:
    WSGIPath: wsgi:app
  aws:elasticbeanstalk:environment:proxy:
    ProxyServer: nginx
    GzipCompression: true
  aws:elasticbeanstalk:cloudwatch:logs:
    StreamLogs: true
    DeleteOnTerminate: false

packages:
  yum:
    gcc-c++: []
    zlib-devel: []
```

#### Paso 4: Inicializa Elastic Beanstalk

En la carpeta `backend_test_model/`:

```bash
eb init -p python-3.9 toxicity-api --region us-east-1
```

Responde las preguntas:

- ¿Usar CodeCommit? → `N`
- ¿SSH a instancias? → `Y`
- ¿Seleccionar key pair? → Crea uno nuevo o selecciona uno existente

#### Paso 5: Crea el entorno y deploya

```bash
eb create toxicity-api-env --instance-type t3.small
```

Esto tardará 5-10 minutos. Espera hasta que el entorno esté listo.

Cuando esté listo, verás algo como:

```
Environment details for: toxicity-api-env
  Environment URL: toxicity-api-env.elasticbeanstalk.com
```

#### Paso 6: Verifica que funciona

```bash
curl https://toxicity-api-env.elasticbeanstalk.com/
```

Deberías ver:

```json
{
  "status": "online",
  "service": "Toxicity Model API",
  "version": "1.0.0"
}
```

#### Paso 7: Obtén la URL del Backend

Tu URL será: `https://toxicity-api-env.elasticbeanstalk.com`

**Guárdala para el siguiente paso.**

---

### Opción B: AWS Lambda + API Gateway (Sin Servidor - Más Económico)

#### Paso 1: Prepara el código

Modifica `main.py` para que funcione con AWS Lambda:

En `backend_test_model/lambda_handler.py`:

```python
from main import app
from mangum import Mangum

# Envuelve la app FastAPI para que funcione con Lambda
handler = Mangum(app)
```

#### Paso 2: Actualiza `requirements.txt`

Agrega `mangum`:

```
fastapi==0.104.1
uvicorn==0.24.0
joblib==1.3.2
scikit-learn==1.3.2
pydantic==2.5.0
mangum==0.17.0
```

#### Paso 3: Crea el paquete ZIP

```bash
pip install -r requirements.txt -t package/
Copy-Item -Path "." -Destination "package/" -Exclude @(".git", ".gitignore", ".venv", "*.pyc")
cd package
Compress-Archive -Path "." -DestinationPath "../lambda-deployment.zip"
cd ..
```

#### Paso 4: Crea la función Lambda en AWS Console

1. Ve a **AWS Lambda** en la consola
2. Click **Create function**
3. Rellena:
   - **Function name**: `toxicity-api-function`
   - **Runtime**: `Python 3.9`
   - **Architecture**: `x86_64`
4. Click **Create function**

#### Paso 5: Sube el código

1. En la función Lambda, scroll hasta **Code source**
2. Click **Upload from** → **ZIP file**
3. Sube `lambda-deployment.zip`
4. Click **Deploy**

#### Paso 6: Configura API Gateway

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

#### Paso 7: Deploya el API

1. Click **Deploy API**
2. **Stage name**: `prod`
3. Click **Deploy**

Tu URL será algo como: `https://abcd1234.execute-api.us-east-1.amazonaws.com/prod`

---

## Deploy Frontend a AWS

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
  "https://toxicity-api-env.elasticbeanstalk.com/predict";
```

Reemplaza con tu URL real del backend.

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

### Paso 3: Re-deploya el Backend (si cambiaste CORS)

**Con Elastic Beanstalk:**

```bash
cd backend_test_model
eb deploy
```

**Con Lambda:**

1. Modifica el código
2. Haz ZIP nuevo
3. Sube a Lambda
4. Click **Deploy**

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

## Verificación y Testing

### Paso 1: Prueba el Backend directamente

```bash
curl -X POST "https://toxicity-api-env.elasticbeanstalk.com/predict" \
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

**Con Elastic Beanstalk:**

```bash
cd backend_test_model
eb logs
```

**Con Lambda:**

1. Ve a **AWS Lambda** → Tu función
2. Abre la pestaña **Monitor**
3. Click **View CloudWatch logs**

---

## Troubleshooting

### ❌ Error: "El backend no responde"

**Causas comunes:**

1. CORS no habilitado → Verifica `main.py`
2. URL incorrecta → Copia la URL exacta de AWS
3. Backend no está corriendo → Revisa logs con `eb logs`

**Soluciones:**

```bash
# Reinicia el ambiente Elastic Beanstalk
cd backend_test_model
eb restart

# Revisa estado
eb status
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

### ❌ Frontend se carga pero no conecta con Backend

1. Abre DevTools del navegador (F12)
2. Ve a la pestaña **Console**
3. Busca errores CORS
4. Verifica la URL en el formulario
5. Intenta cambiar puerto o protocolo (http vs https)

---

## Costos Estimados en AWS

| Servicio                         | Uso Ligero          | Costo Aproximado      |
| -------------------------------- | ------------------- | --------------------- |
| **Elastic Beanstalk** (t3.small) | 720 horas/mes       | $20-30/mes            |
| **Lambda**                       | <1M requests/mes    | <$1/mes (gratis)      |
| **S3**                           | <1GB + 10K requests | <$1/mes               |
| **CloudFront**                   | <10GB/mes           | Incluido en free tier |
| **Total**                        | Típico              | $20-35/mes            |

---

## Pasos Finales de Mantenimiento

### Actualizar el Backend

```bash
cd backend_test_model

# Haz cambios...
git add .
git commit -m "Actualización"

# Deploya
eb deploy
```

### Actualizar el Frontend

```bash
cd frontend_test_model

# Haz cambios...
aws s3 sync . s3://toxicity-model-frontend-1689123456 --delete
```

### Monitoreo

- **Elastic Beanstalk**: Ve a AWS Console → Elastic Beanstalk → Tu app
- **Lambda**: CloudWatch Logs
- **S3**: CloudWatch Metrics

---

## Resumen Rápido

| Paso | Comando                                     | Resultado                     |
| ---- | ------------------------------------------- | ----------------------------- |
| 1    | `aws configure`                             | Credenciales AWS configuradas |
| 2    | `eb init -p python-3.9 toxicity-api`        | Backend preparado             |
| 3    | `eb create toxicity-api-env`                | Backend en vivo en AWS        |
| 4    | `aws s3 mb s3://toxicity-frontend-xxx`      | Bucket S3 creado              |
| 5    | `aws s3 sync frontend_test_model/ s3://...` | Frontend desplegado           |
| 6    | Actualiza URL en `app.js`                   | Frontend conectado al backend |
| 7    | Visita tu URL en navegador                  | ✅ Listo para usar            |

---

**¡Tu aplicación está lista en AWS! 🚀**

Para más ayuda, contacta con soporte de AWS o revisa:

- [AWS Elastic Beanstalk Docs](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)
