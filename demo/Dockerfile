FROM node:alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./

# Install dependencies.
RUN yarn install --production && yarn cache clean

# Copy local code to the container image.
COPY src/ ./

# Run the web service on container startup.
ENTRYPOINT [ "node", "index.js" ]
