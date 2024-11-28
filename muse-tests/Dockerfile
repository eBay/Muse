FROM hub.tess.io/muse/node18:latest
WORKDIR /testspace

# Setup npm and install global packages

# proxy is only necessary for internal network
# RUN export https_proxy=http://den-entbc-001:80
RUN npm install -g zx pnpm@8.15.4 verdaccio

# bash is necessary for zx

RUN apk update && apk add bash && apk add git
# RUN cd ..

RUN apk add --no-cache python3 py3-pip

# RUN npm install -g pnpm@latest --registry=https://npm.corp.ebay.com
RUN pnpm config set store-dir /pnpm-store
# COPY ./package.json ./package.json
# COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

# RUN pnpm i

# COPY ./.env ./.env
# COPY ./src ./src
# COPY ./tmp/muse-repo ./

# RUN cd muse-tests
WORKDIR /testspace/muse-tests
ENV VERDACCIO_STORAGE=/verdaccio-store
# # Execute tests
CMD ["pnpm", "test:local"]
