FROM python:3.12-alpine3.19

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
COPY . /app
ENTRYPOINT [ "sh", "script.sh" ]
