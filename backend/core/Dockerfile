FROM python:3.12-alpine3.19 AS builder

WORKDIR /app

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN apk update && \
    apk add --no-cache \
    build-base \
    libffi-dev \
    python3-dev \
    gcc \
    musl-dev

RUN pip install --no-cache --upgrade pip
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache -r requirements.txt

FROM python:3.12-alpine3.19

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . /app
ENTRYPOINT ["sh", "script.sh"]
