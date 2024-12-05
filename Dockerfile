ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine AS builder

RUN apk add --no-cache git

WORKDIR /usr/src/grave

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /usr/src/grave

COPY --from=builder /usr/src/grave/node_modules ./node_modules
COPY --from=builder /usr/src/grave/dist ./dist
COPY --from=builder /usr/src/grave/package*.json ./
COPY --from=builder /usr/src/grave/.env ./

CMD ["node", "dist/index.js"]