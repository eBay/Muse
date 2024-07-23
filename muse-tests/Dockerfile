FROM node:18-alpine
WORKDIR /testspace

# Setup npm and install global packages
RUN npm set registry https://npm.corp.ebay.com
RUN npm install -g pnpm@8.15.4
RUN npm install -g zx

RUN cd ..

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm i

COPY ./tests ./tests

# Execute tests
CMD ["zx", "./tests/index.js"]
