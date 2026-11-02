FROM node:20-alpine
RUN apk add --no-cache curl unzip ca-certificates
WORKDIR /app
COPY package.json index.js ./
ENV PORT=8080
CMD ["node", "index.js"]
