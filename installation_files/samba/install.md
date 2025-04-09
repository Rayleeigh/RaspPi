# Installing Samba Fileshare in a Docker Container

1. Create Samba folder and got into it:
   ```bash
   mkdir $HOME/lab/samba
   mkdir $HOME/lab/samba/samba-share-data
   cd $HOME/lab/samba
   ```

2. Create the docker compose file for our samba container in $HOME/lab/samba:
   [installation_files/samba/docker-compose.yml](./installation_files/samba/docker-compose.yml)

3. Run the Samba container from $HOME/lab/samba with a dedicated IP:
   ```sh
   docker compose up -d
   ```

4. Configure `samba` to resolve `samba.lab`:
   ```sh
   echo "address=/samba.lab/192.168.100.30" >> $HOME/lab/dnsmasq/config/dnsmasq.conf
   ```

5. Restart the container:
   ```sh
   docker restart dnsmasq
   ```

6. Test if `samba.lab` resolves correctly:
   ```sh
   ping samba.lab
   ```

7. Mount Samba share on Raspberry Pi:
   ```sh
   sudo mkdir /mnt/schnuppi
   sudo mount -t cifs //samba.local/shares/schnuppi_share /mnt/schnuppi -o user=schnuppi,pass=1234
   ```
