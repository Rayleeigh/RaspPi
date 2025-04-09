#!/bin/bash

echo "Stopping Docker containers..."
docker ps -q | xargs -r docker stop

echo "Removing Docker containers..."
docker ps -aq | xargs -r docker rm

echo "Removing Docker images..."
docker rmi ghcr.io/ajnart/homarr:0.15.10 \
           jasjeev4/rpi-dnsmasq:latest \
           nginx:1.27.4 \
           ghcr.io/servercontainers/samba:latest \
           openspeedtest/latest:v2.0.6 || true

echo "Removing Docker network..."
docker network rm private_lab || true

echo "Removing lab directory..."
rm -rf ~/lab

echo "Removing mounted schnuppi directory..."
rm -rf /mnt/schnuppi

echo "Restoring default resolv.conf (DNS)..."
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

echo "Resetting permissions (if needed)..."
sudo chown -R $USER:$USER ~/

# echo "Optionally removing Docker and Git (comment out if not needed)..."
# sudo apt purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git
# sudo apt autoremove -y

echo "Purge complete. Reboot recommended."
