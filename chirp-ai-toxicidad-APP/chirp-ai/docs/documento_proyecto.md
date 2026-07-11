# Chirp AI — Documento del Proyecto Final

**Materia:** Inteligencia Artificial y MLOps · **Profesor:** Jheser Guzmán Ph.D.
**Entrega:** Proyecto Final (Aplicación Web con AI y MLOps)
**Integrantes:** _(completar — grupo de 4-5)_

> Máximo 20 páginas. Este archivo es el esqueleto; conviértelo a PDF para el envío.

---

## 1. Resumen ejecutivo

Chirp AI es una red social tipo Twitter que integra un microservicio de
inteligencia artificial para **moderar contenido**: detecta si una publicación es
tóxica u ofensiva y resalta las palabras problemáticas. El proyecto demuestra un
ciclo de MLOps completo: entrenamiento reproducible, versionado del modelo,
despliegue como microservicio y consumo desde la aplicación web.

## 2. Definición del problema

- **Problema de negocio:** mantener la comunidad sana moderando automáticamente
  el contenido ofensivo antes/después de publicarlo.
- **Problema de ML:** clasificación binaria de texto (tóxico vs. no tóxico) — NLP.
- **Variable objetivo:** etiqueta `toxic` (0/1). La salida se expresa como un
  puntaje 0–100 (probabilidad de toxicidad).

## 3. Datos

- **Fuente:** *Jigsaw Toxic Comment Classification* (Kaggle) u otro dataset de
  toxicidad con texto + etiqueta. _(indicar el dataset exacto usado)._
- **Controles de calidad:** nulos, duplicados, textos vacíos, binarización de la
  etiqueta, balance de clases.
- **Representación:** TF-IDF de unigramas.

## 4. Análisis exploratorio (EDA)

- Distribución/balance de clases.
- Longitud del texto por clase.
- Palabras con mayor peso hacia "tóxico" (interpretabilidad).
- _(Insertar figuras del notebook.)_

## 5. Modelado

- Vectorización: **TF-IDF**.
- Comparación: **Logistic Regression**, LinearSVC, MultinomialNB.
- Métricas: accuracy, precision, recall, **F1** y matriz de confusión.
- Modelo elegido: _(nombre)_ con F1 = _(valor)_.

## 6. Interpretación

- Palabras más tóxicas y menos tóxicas según los coeficientes del modelo.
- Estas mismas ponderaciones se usan para **resaltar** términos en la app.

## 7. Arquitectura de la aplicación (MLOps)

- Frontend Next.js, Backend NestJS, Microservicio FastAPI, PostgreSQL.
- Diagrama de arquitectura (ver README).
- **Training/serving consistency:** misma lógica (`moderation.py`) al entrenar y servir.
- Despliegue con `docker-compose`; health checks; degradación elegante.

## 8. Demo / Funcionalidades

- Registro, login, publicar, likes, follow, timeline.
- **Moderación al publicar** (badge tóxico/OK + palabras resaltadas).
- **Chequeo en vivo** en el composer.
- Página **Analizar toxicidad** con desglose palabra por palabra.
- _(Capturas de pantalla.)_

## 9. Conclusiones y trabajo futuro

- Resultados y limitaciones (sarcasmo, ofuscación de palabras, multilingüe).
- Trabajo futuro: reentrenamiento con reportes de usuarios, monitoreo de drift,
  modelos contextuales (transformers), moderación de imágenes.

## 10. Referencias

- Bibliografía científica (Google Scholar), documentación de scikit-learn,
  NestJS, Next.js, FastAPI, dataset Jigsaw.

---

### Anexos

- URL del repositorio GitHub: _(completar)_
- URL de la presentación grabada (20 min): _(completar)_
