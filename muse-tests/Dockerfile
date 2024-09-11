FROM hub.tess.io/muse/node18:latest
WORKDIR /testspace

# Setup npm and install global packages

# proxy is only necessary for internal network
# RUN export https_proxy=http://den-entbc-001:80
RUN npm install -g zx pnpm@8.15.4 verdaccio

# bash is necessary for zx

RUN apk update && apk add bash
RUN cd ..


COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm i

COPY ./.env ./.env
COPY ./src ./src

# Execute tests
CMD ["node", "./src/index.js"]
