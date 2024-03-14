FROM python:slim-bullseye

RUN apt update && apt upgrade -y

WORKDIR /app

COPY ./scripts/entrypoint.sh /
COPY ./conf/requirements.txt /

RUN pip install --no-cache -r /requirements.txt && \
	rm /requirements.txt

CMD ["bash", "/entrypoint.sh"]