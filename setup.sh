#!/bin/bash

mkdir -p ~/lab
sudo mkdir -p /mnt/schnuppi

sudo apt update && sudo apt upgrade -y

sudo apt install git

curl -sSL https://get.docker.com | sh

sudo usermod -aG docker $USER

docker network create --subnet=192.168.100.0/24 private_lab

git clone https://github.com/Rayleeigh/RaspPi ~/RaspPi

mv ~/RaspPi/installation_files/* ~/lab

rm -rf ~/RaspPi

sed -i "s|<SECRET_ENCRYPTION_KEY>|$(openssl rand -hex 32)|" ~/lab/homarr/docker-compose.yml

rm ~/lab/dnsmasq/config/dnsmasq.conf.initial ~/lab/dnsmasq/config/dnsmasq.conf.template

mv ~/lab/dnsmasq/config/dnsmasq.conf.final ~/lab/dnsmasq/config/dnsmasq.conf
