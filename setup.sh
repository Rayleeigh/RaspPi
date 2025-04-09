#!/bin/bash

if [ ! -x "/usr/bin/docker" ]; then
    echo "Docker not found. Installing Docker..."
    sudo curl -sSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
else
    echo "Docker is already installed."
fi


echo "Checking if Docker network 'private_lab' exists..."
if ! sudo docker network inspect private_lab &> /dev/null
then
    echo "Docker network 'private_lab' not found. Creating it..."
    sudo docker network create --subnet=192.168.100.0/24 private_lab
else
    echo "Docker network 'private_lab' already exists."
fi

echo "Creating necessary directories..."
sudo mkdir -p ~/lab
sudo mkdir -p /mnt/schnuppi

echo "Updating and upgrading system packages..."
sudo apt update && sudo apt upgrade -y

echo "Installing Git..."
sudo apt install git -y

echo "Checking if RaspPi repository exists..."
if [ ! -d "~/RaspPi" ]; then
    echo "Cloning the RaspPi repository..."
    sudo git clone https://github.com/Rayleeigh/RaspPi ~/RaspPi
else
    echo "RaspPi repository already exists."
fi

echo "Moving files from the repository to ~/lab..."
sudo mv ~/RaspPi/installation_files/* ~/lab

echo "Cleaning up by removing the cloned repository..."
sudo rm -rf ~/RaspPi

echo "Replacing the encryption key in docker-compose.yml..."
sudo sed -i "s|<SECRET_ENCRYPTION_KEY>|$(openssl rand -hex 32)|" ~/lab/homarr/docker-compose.yml

echo "Cleaning up initial and template dnsmasq configurations..."
sudo rm ~/lab/dnsmasq/config/dnsmasq.conf.initial ~/lab/dnsmasq/config/dnsmasq.conf.template

echo "Moving the final dnsmasq configuration..."
sudo mv ~/lab/dnsmasq/config/dnsmasq.conf.final ~/lab/dnsmasq/config/dnsmasq.conf

echo "Pulling necessary Docker images..."
sudo docker pull ghcr.io/ajnart/homarr:0.15.10
sudo docker pull jasjeev4/rpi-dnsmasq:latest
sudo docker pull nginx:1.27.4
sudo docker pull ghcr.io/servercontainers/samba:latest
sudo docker pull openspeedtest/latest:v2.0.6

echo "Configuring DNS resolver..."
echo "nameserver 192.168.100.10" | sudo tee /etc/resolv.conf

echo "Setting permissions for /mnt/schnuppi..."
sudo chmod -R 755 /mnt/schnuppi
sudo chown -R $USER:$USER /mnt/schnuppi

echo "Setting permissions for files and directories in ~/lab..."
sudo find ~/lab -type f -exec sudo chmod 655 {} +
sudo find ~/lab -type d -exec sudo chmod 755 {} +

echo "Starting Docker containers..."
(cd ~/lab/homarr && sudo docker compose up -d)
(cd ~/lab/samba && sudo docker compose up -d)
(cd ~/lab/nginx && sudo docker compose up -d)
(cd ~/lab/speedtest && sudo docker compose up -d)
(cd ~/lab/dnsmasq && sudo docker compose up -d)

echo "Mounting the Samba share..."
sudo mount -t cifs //samba.lab/shares/schnuppi_share /mnt/schnuppi -o user=schnuppi,pass=1234

echo "Rebooting the system..."
sudo reboot
