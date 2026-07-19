# Imagen base oficial de AWS para funciones Lambda con Python 3.10
FROM public.ecr.aws/lambda/python:3.10

# Copia e instala dependencias primero (aprovecha cache de Docker)
COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Copia el código y el modelo entrenado
COPY main.py ${LAMBDA_TASK_ROOT}/
COPY TrainedModel ${LAMBDA_TASK_ROOT}/TrainedModel

# Handler: archivo main.py, variable "handler" (Mangum)
CMD [ "main.handler" ]
