FROM python:3.12-alpine3.19

WORKDIR /app

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN apk update && \
    apk add --no-cache \
    netcat-openbsd \
    build-base \
    libffi-dev \
    python3-dev \
    gcc \
    musl-dev

RUN rm -rf /var/lib/apt/lists/*


RUN pip install --no-cache --upgrade pip
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache -r requirements.txt
COPY . /app
ENTRYPOINT [ "sh", "script.sh" ]
