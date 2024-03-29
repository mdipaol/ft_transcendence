#!/bin/sh

python3 transcendence/manage.py makemigrations;
python3 transcendence/manage.py makemigrations pong;
python3 transcendence/manage.py migrate;
python3 transcendence/manage.py createsuperuser --no-input;
python3 transcendence/manage.py runserver 0.0.0.0:8000;
# python3 transcendence/manage.py collectstatic --noinput;
# cd transcendence;
# gunicorn -b 0.0.0.0:8000 transcendence.wsgi:application;