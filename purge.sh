#!/bin/bash

echo "Stopping Docker stacks..."
(cd ~/lab/homarr && sudo docker compose down)
(cd ~/lab/samba && sudo docker compose down)
(cd ~/lab/nginx && sudo docker compose down)
(cd ~/lab/speedtest && sudo docker compose down)
(cd ~/lab/dnsmasq && sudo docker compose down)

echo "Pruning Docker..."
sudo docker system prune --all --volumes -f

echo "Removing lab directory..."
sudo rm -rf ~/lab

echo "Removing mounted schnuppi directory..."
sudo umount /mnt/schnuppi
sudo rm -rf /mnt/schnuppi

echo "Restoring default resolv.conf (DNS)..."
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

echo "Purge complete. Reboot recommended."
