FROM nginx:latest

# Add your custom RUN command
RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /etc/ssl/certs

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/certs/key.pem \
  -out /etc/ssl/certs/cert.pem \
  -subj "/C=FR/ST=PACA/L=Nice/O=42nice/OU=student/CN=anloisea@student.42nice.fr"
