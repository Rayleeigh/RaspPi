# Installing Dnsmasq in a Docker Container

Our Dnsmasq container will have *192.168.100.10* as ip address. The initial configuration will be mounted into the container from the host and can be found here: [dnsmasq.config.initial](/installation_files/dnsmasq/config/dnsmasq.conf.initial)

1. Create Dnsmasq folder and got into it:
   ```bash
   mkdir $HOME/lab/dnsmasq
   mdkir $HOME/lab/dnsmasq/config
   cd $HOME/lab/dnsmasq
   ```

2. Create the docker compose file for our dnsmasq container in $HOME/lab/dnsmasq:
   [installation_files/dnsmasq/docker-compose.yml](/installation_files/dnsmasq/docker-compose.yml)

3. Create Dnsmasq config file in $HOME/lab/dnsmasq/config:
   [dnsmasq.config template](/installation_files/dnsmasq/config/dnsmasq.conf.initial)

4. Run docker compose command from $HOME/lab/dnsmasq to start the dnsmasq container:
   ```bash
   docker compose up -d
   ```

5. Adjust local dns config to use dnsmasq
   ```bash
   sudo nano /etc/dhcpcd.conf
   ```

   Add the following

   ```bash
   # Log DNS queries
   log-queries
   # Listen on fixed ip address
   listen-address=*192.168.100.10*
   # Configure DNS caching
   cache-size=1000
   # Set DNS forwarders to Google DNS servers
   server=*8.8.8.8*
   server=*8.8.4.4*
   # Custom DNS entries
   ```

6. Reboot
   ```bash
   reboot
   ```
