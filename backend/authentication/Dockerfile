FROM python:3.12-alpine3.19

RUN apk update && \
    apk add --no-cache \
    build-base \
    libffi-dev \
    python3-dev \
    gcc \
    musl-dev

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
COPY . /app
RUN chmod -R 644 /app
ENTRYPOINT [ "sh", "script.sh" ]
