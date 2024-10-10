#!/bin/sh

export DOLLAR="$"

envsubst '$FRONTEND_PORT $BACKEND_PORT $SOCKET_PORT $DOMAIN_NAME $DOLLAR' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf


nginx -g "daemon off;"