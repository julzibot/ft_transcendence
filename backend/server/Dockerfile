FROM nginx:1.27.1-alpine

RUN apk update 
RUN apk upgrade
RUN apk add --no-cache openssl

RUN mkdir -p /etc/ssl/certs 

RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
					-out /etc/ssl/certs/server_cert.pem\
					-keyout /etc/ssl/certs/server_key.pem\
					-subj "/C=FR/ST=PACA/L=Nice/O=42/OU=Student/CN='${DOMAIN_NAME}'/UID=anloisea@student.42nice.fr"

COPY ./default.conf /etc/nginx/conf.d/default.conf


