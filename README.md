# Grave

Grave is a muisc bot developed by cemetery studios

# How to Run
### Node Modules
- First install the modules used in this code using:
```bash
npm i
```
### ENV 
- make a `.env` file and add the configs there 
```bash
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
- generate the prisma 
```bash
npx prisma generate
```

### How to Run
- Use docker for deployment as it will automatically start a redis server too
```bash
docker compose up --build
```


# Support: 
For support join our Discord: https://brogot.space/
Mail: mail@exril.xyz