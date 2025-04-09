# Installing Homarr in a Docker Container

1. Create Homarr folder and got into it:
   ```bash
   mkdir $HOME/lab/homarr
   cd $HOME/lab/homarr
   ```

2. Create the docker compose file for our homarr container in $HOME/lab/homarr:
   [installation_files/homarr/docker-compose.yml](./installation_files/homarr/docker-compose.yml)

3. Generate secret encryption key and set it in docker-compose.yml:
   ```sh
   openssl rand -hex 32
   ```

   Place the generated key in docker-compose.yml instead of <SECRET_ENCRYPTION_KEY>.

4. Copy Homarr config files in $HOME/lab/homarr/homarr:
   [homarr config template](./installation_files/homarr/homarr)

5. Run the Homarr container from $HOME/lab/homarr with a dedicated IP:
   ```sh
   docker compose up -d
   ```

6. Configure `dnsmasq` to resolve `homarr.local`:
   ```sh
   echo "address=/homarr.local/192.168.100.20" >> $HOME/lab/dnsmasq/config/dnsmasq.conf
   ```

7. Restart the container:
   ```sh
   docker restart dnsmasq
   ```

8. Test if `homarr.local` resolves correctly:
   ```sh
   ping homarr.local
   ```

9.  Access http://homarr.local:7575