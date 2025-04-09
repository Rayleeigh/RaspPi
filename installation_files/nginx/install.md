# Installing Nginx with a Website in a Docker Container

1. Create Nginx folder and got into it:
   ```bash
   mkdir $HOME/lab/nginx
   mkdir $HOME/lab/nginx/config
   mkdir $HOME/lab/nginx/site-content
   cd $HOME/lab/nginx
   ```

2. Create the docker compose file for our homarr container in $HOME/lab/nginx:
   [installation_files/nginx/docker-compose.yml](./installation_files/nginx/docker-compose.yml)

3. Copy nginx config and site files into $HOME/lab/nginx/config and $HOME/lab/nginx/site-content:
   [nginx.conf template](./installation_files/nginx/config/nginx.conf)
   [web site template](./installation_files/nginx/site-content/*)

4. Run the Nginx container from $HOME/lab/nginx with a dedicated IP:
   ```sh
   docker compose up -d
   ```

5. Configure `dnsmasq` to resolve `nginx.lab`:
   ```sh
   echo "address=/nginx.lab/192.168.100.40" >> $HOME/lab/dnsmasq/config/dnsmasq.conf
   ```

6. Restart the container:
   ```sh
   docker restart dnsmasq
   ```

7. Test if `nginx.lab` resolves correctly:
   ```sh
   ping nginx.lab
   ```

8. Access http://nginx.lab:80