#!/bin/sh

python3 transcendence/manage.py makemigrations;
python3 transcendence/manage.py makemigrations pong;
python3 transcendence/manage.py migrate;
python3 transcendence/manage.py createsuperuser --no-input;
python3 transcendence/manage.py collectstatic --noinput;
cd transcendence;
daphne -b 0.0.0.0 transcendence.asgi:application;
# python3 transcendence/manage.py runserver 0.0.0.0:8000;
# uvicorn transcendence.asgi:application --host 0.0.0.0 --port 8000 --workers 4;