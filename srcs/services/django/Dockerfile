FROM python:slim-bullseye

RUN apt update && apt upgrade -y

WORKDIR /app

COPY ./conf/requirements.txt ./

RUN pip install --no-cache -r requirements.txt && \
	rm requirements.txt

CMD ["python3", "./transcendence/manage.py", "runserver", "0.0.0.0:8000"]