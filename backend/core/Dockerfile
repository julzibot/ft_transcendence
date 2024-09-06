FROM python:3.12-alpine3.19

WORKDIR /app

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN apk update && \
    apk add --no-cache \
    openssl \
    netcat-openbsd \
    build-base \
    libffi-dev \
    python3-dev \
    gcc \
    musl-dev

RUN rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/ssl/certs

RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
					-out /etc/ssl/certs/server_cert.pem\
					-keyout /etc/ssl/certs/server_key.pem\
					-subj "/C=FR/ST=PACA/L=Nice/O=42/OU=Student/CN='${DOMAIN_NAME}'/UID=anloisea@student.42nice.fr"

RUN pip install --no-cache --upgrade pip
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache -r requirements.txt
COPY . /app
ENTRYPOINT [ "sh", "script.sh" ]
