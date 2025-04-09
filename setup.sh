#!/bin/bash

sudo mkdir -p ~/lab
sudo mkdir -p /mnt/schnuppi

sudo apt update && sudo apt upgrade -y

sudo apt install git

sudo curl -sSL https://get.docker.com | sh

sudo usermod -aG docker $USER

sudo docker network create --subnet=192.168.100.0/24 private_lab

sudo git clone https://github.com/Rayleeigh/RaspPi ~/RaspPi

sudo mv ~/RaspPi/installation_files/* ~/lab

sudo rm -rf ~/RaspPi

sudo sed -i "s|<SECRET_ENCRYPTION_KEY>|$(openssl rand -hex 32)|" ~/lab/homarr/docker-compose.yml

sudo rm ~/lab/dnsmasq/config/dnsmasq.conf.initial ~/lab/dnsmasq/config/dnsmasq.conf.template

sudo mv ~/lab/dnsmasq/config/dnsmasq.conf.final ~/lab/dnsmasq/config/dnsmasq.conf

sudo docker pull ghcr.io/ajnart/homarr:0.15.10
sudo docker pull jasjeev4/rpi-dnsmasq:latest
sudo docker pull nginx:1.27.4
sudo docker pull ghcr.io/servercontainers/samba:latest
sudo docker pull openspeedtest/latest:v2.0.6

echo "nameserver 192.168.100.10" | sudo tee /etc/resolv.conf

sudo chmod -R 755 /mnt/schnuppi
sudo chown -R $USER:$USER /mnt/schnuppi

sudo find . -type f -exec sudo chmod 655 {} +
sudo find . -type d -exec sudo chmod 755 {} +

(cd ~/lab/homarr && sudo docker compose up -d)
(cd ~/lab/samba && sudo docker compose up -d)
(cd ~/lab/nginx && sudo docker compose up -d)
(cd ~/lab/speedtest && sudo docker compose up -d)
(cd ~/lab/dnsmasq && sudo docker compose up -d)

sudo mount -t cifs //samba.local/shares/schnuppi_share /mnt/schnuppi -o user=schnuppi,pass=1234

sudo reboot
