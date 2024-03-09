#!/bin/bash

python3 transcendence/manage.py makemigrations pong;
python3 transcendence/manage.py migrate;
python3 transcendence/manage.py runserver 0.0.0.0:8000;