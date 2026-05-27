# dnsmasq control client

Small maintenance container for testing DNS from inside the same Docker network as dnsmasq.

Start it with the rest of the stack:

```sh
docker compose up -d control-client
```

Open a shell:

```sh
docker exec -it dnsmasq-control-client sh
```

Useful checks:

```sh
nslookup dns.lab 192.168.100.10
nslookup homarr.lab 192.168.100.10
nslookup 192.168.100.20 192.168.100.10
ping dnsmasq
```

The container uses `192.168.100.10` as its DNS server and is attached to the `private_lab` network.
