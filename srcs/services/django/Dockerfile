FROM python:3.9.19-alpine3.19

RUN apk update && apk upgrade

WORKDIR /app

COPY ./scripts/entrypoint.sh /
COPY ./conf/requirements.txt /

RUN pip install --no-cache -r /requirements.txt && \
	rm /requirements.txt

CMD ["sh", "/entrypoint.sh"]