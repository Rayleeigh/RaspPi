FROM python:3.12-alpine

LABEL org.opencontainers.image.source="https://github.com/Rayleeigh/RaspPi"
LABEL org.opencontainers.image.description="Small WebGUI for editing dnsmasq lab records"
LABEL org.opencontainers.image.licenses="MIT"

RUN apk add --no-cache docker-cli

WORKDIR /app
COPY server.py /app/server.py
COPY static /app/static

ENV DNSMASQ_CONFIG=/data/dnsmasq.conf
ENV DNSMASQ_CONTAINER=dnsmasq
ENV PORT=8080

EXPOSE 8080
CMD ["python", "/app/server.py"]
