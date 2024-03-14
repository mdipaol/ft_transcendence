FROM nginx:stable-alpine3.17

RUN apk update && apk upgrade

RUN apk add openssl

COPY conf/localhost.crt /etc/ssl/certs/localhost.crt

COPY conf/localhost.key /etc/ssl/private/localhost.key

COPY conf/django.conf /etc/nginx/conf.d/django.conf

RUN rm -rf /etc/nginx/conf.d/default.conf