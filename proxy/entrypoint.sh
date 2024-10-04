#!/bin/sh

export DOLLAR="$"
# Substitute environment variables into the NGINX configuration
envsubst '$FRONTEND_PORT $BACKEND_PORT $SOCKET_PORT $DOMAIN_NAME $DOLLAR' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf

# Start NGINX
nginx -g "daemon off;"