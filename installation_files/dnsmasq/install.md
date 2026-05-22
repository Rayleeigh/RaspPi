# Installing Dnsmasq in a Docker Container

Our Dnsmasq container will have *192.168.100.10* as ip address. The WebGUI will have *192.168.100.11* and will also be available on the Raspberry Pi at `http://localhost:8080`. The initial configuration will be mounted into the container from the host and can be found here: [dnsmasq.config.initial](/installation_files/dnsmasq/config/dnsmasq.conf.initial)

1. Create Dnsmasq folder and go into it:
   ```bash
   mkdir $HOME/lab/dnsmasq
   mkdir $HOME/lab/dnsmasq/config
   cd $HOME/lab/dnsmasq
   ```

2. Create the docker compose file for our dnsmasq container and WebGUI in $HOME/lab/dnsmasq:
   [installation_files/dnsmasq/docker-compose.yml](/installation_files/dnsmasq/docker-compose.yml)

   The WebGUI image is published as `ghcr.io/rayleeigh/rasppi-dnsmasq-webgui:latest`.
   Build and publishing notes are in [webui/README.md](/installation_files/dnsmasq/webui/README.md).

3. Create Dnsmasq config file in $HOME/lab/dnsmasq/config:
   [dnsmasq.config template](/installation_files/dnsmasq/config/dnsmasq.conf.initial)

4. Run docker compose command from $HOME/lab/dnsmasq to start the dnsmasq container and WebGUI:
   ```bash
   docker compose up -d
   ```

5. Open the WebGUI:
   ```bash
   http://localhost:8080
   ```

   Every save writes `config/dnsmasq.conf` and sends `SIGHUP` to the `dnsmasq` container so changes apply without a full container restart.

6. Adjust the Raspberry Pi DNS settings to use dnsmasq.

   Current Raspberry Pi OS versions use NetworkManager, so configure DNS with `nmcli` instead of editing `dhcpcd.conf`.

   First list the available connections:
   ```bash
   nmcli connection show
   ```

   Choose the connection profile for the Vontobel WLAN. It may look like a netplan-generated connection name.

   Set dnsmasq as the DNS server for that connection:
   ```bash
   nmcli connection modify "<vontobel connection netplan>" ipv4.dns "192.168.100.10"
   ```

   Bring the connection back up so the DNS setting is applied:
   ```bash
   nmcli connection up "<vontobel connection netplan>"
   ```
