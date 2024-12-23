# Grave

Grave is a music bot developed by Cemetery Studios that integrates with Discord to provide high-quality music streaming. It supports various music sources, including Spotify.

## Table of Contents

- [Features](#features)
- [Setup](#setup)
  - [Node Modules](#node-modules)
  - [Environment Variables](#environment-variables)
  - [Prisma](#prisma)
  - [Docker](#docker)
- [Usage](#usage)
- [Support](#support)
- [Contributing](#contributing)
- [License](#license)

## Features

- Stream music from various sources
- Integrates with Discord
- Automatic deployment with Docker
- Error logging and monitoring through webhooks

## Setup

### Node Modules

First, install the modules used in this code using:

```bash
npm install
```
### Environment Variables
Create a .env file and add the following configurations:

```
# Discord Token
TOKEN=""

# MongoDB
DATABASE_URL=""

# Lavalink
LAVALINK_HOST=
LAVALINK_PORT=
LAVALINK_PASSWORD=

# Webhooks
NODE_ERROR_LOGS_HOOK=""
NODE_DESTROY_LOGS_HOOK=""
NODE_CONNECTION_HOOK=""
NODE_DISCONNECT_LOGS_HOOK=""
NODE_RECONNECT_LOGS_HOOK=""
ERROR_LOGS_HOOK=""
GUILD_JOIN_LOGS_HOOK=""
COMMAND_LOGS_HOOK=""
GUILD_LEAVE_LOGS_HOOK=""
RUNTIME_LOGS_HOOK=""
DM_LOGS_HOOK=""

# Spotify
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
```
### Prisma
Generate the Prisma client:
```bash
npx prisma generate
```
### Docker
Use Docker for deployment as it will automatically start a Redis server too:
```bash
docker compose up --build
```
### Usage
Once everything is set up, you can run the bot using Docker. Make sure your `.env` file is properly configured with all the necessary credentials and settings.

Start the bot in development mode:
```bash
npm run dev
```
Build the project
```bash
npm run build
```

# Support
For support, join our [Discord](https://brogot.space/) or contact us via email at mail@exril.xyz.

# Contributing
We welcome contributions!

# Credits
This code was developed by developers of Cemetery Studios, No credits to anyone

# License
This project is licensed under the Apache License. See the LICENSE file for details.

