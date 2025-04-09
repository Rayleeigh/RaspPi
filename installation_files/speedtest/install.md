# Installing Speedtest in a Docker Container

1. Create Speedtest folder and got into it:
   ```bash
   mkdir $HOME/lab/speedtest
   cd $HOME/lab/speedtest
   ```


2. Create the docker compose file for our Speedtest container in $HOME/lab/speedtest:
   [installation_files/speedtest/docker-compose.yml](/installation_files/speedtest/docker-compose.yml)


3. Run the Speedtest container from $HOME/lab/speedtest with a dedicated IP:
   ```sh
   docker compose up -d
   ```

4. Configure `dnsmasq` to resolve `speedtest.local`:
   ```sh
   echo "address=/speedtest.lab/192.168.100.50" >> $HOME/lab/dnsmasq/config/dnsmasq.conf
   ```

5. Restart the container:
   ```sh
   docker restart dnsmasq
   ```

6. Test if `speedtest.lab` resolves correctly:
   ```sh
   ping speedtest.lab
   ```

7. Access http://speedtest.lab:3000 and perform a speedtest.
