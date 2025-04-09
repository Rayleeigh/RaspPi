#!/bin/bash

mkdir -p ~/lab

sudo apt update && sudo apt upgrade -y

sudo apt install git

curl -sSL https://get.docker.com | sh

sudo usermod -aG docker $USER

docker network create --subnet=192.168.100.0/24 private_lab

git clone https://github.com/Rayleeigh/RaspPi ~/

mv ~/RaspPi/installation_files/* ~/lab

sed -i "s|<SECRET_ENCRYPTION_KEY>|$(openssl rand -base64 32)|" ~/lab/homarr/docker-compose.yml
