# dnsmasq WebGUI image

This folder contains the source for the dnsmasq WebGUI container used by the lab compose stack.

## Published image

```bash
ghcr.io/rayleeigh/rasppi-dnsmasq-webgui:latest
```

The compose file in `installation_files/dnsmasq/docker-compose.yml` uses this image directly, so the Schnupperlehrlinge do not need to build it on the Raspberry Pi.

## Build locally

Run this from the repository root:

```bash
docker build -t ghcr.io/rayleeigh/rasppi-dnsmasq-webgui:local installation_files/dnsmasq/webui
```

## Push manually to GitHub Container Registry

Create a GitHub personal access token with package write access, then log in:

```bash
echo "<YOUR_GITHUB_TOKEN>" | docker login ghcr.io -u "<YOUR_GITHUB_USERNAME>" --password-stdin
```

Build and push:

```bash
docker build -t ghcr.io/rayleeigh/rasppi-dnsmasq-webgui:latest installation_files/dnsmasq/webui
docker push ghcr.io/rayleeigh/rasppi-dnsmasq-webgui:latest
```

## Automatic publishing

The repository includes `.github/workflows/publish-dnsmasq-webgui.yml`.

It publishes a multi-architecture image for `linux/amd64` and `linux/arm64` when:

- changes are pushed to `main` under `installation_files/dnsmasq/webui`
- the workflow is started manually from GitHub Actions

The workflow uses GitHub's built-in `GITHUB_TOKEN`, so no Docker Hub account is needed.

After the first publish, check the package settings on GitHub. If the repository is public and the Raspberry Pi should pull without logging in, set the package visibility to public or explicitly connect the package to this repository with read access.
