FROM node:18-alpine
WORKDIR /testspace

# Setup npm and install global packages
RUN npm set registry https://npm.corp.ebay.com
RUN npm install -g pnpm
RUN npm install -g zx
RUN npm install -g @ebay/muse-cli 
RUN npm install -g create-react-app

# dummy-app is used for caching node_modules
RUN mkdir dummy-app
RUN cd dummy-app
RUN npm init -y
RUN npm i @ebay/muse-lib-react @ebay/muse-lib-antd
RUN cd ..

RUN mkdir plugin-projects
RUN cd plugin-projects

# Create empty React projects as plugin templates
RUN npx create-react-app plugin1
RUN npx create-react-app pluing2
RUN npx create-react-app pluing3
RUN npx create-react-app pluing4

RUN cd ..

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm i

COPY ./tests ./tests
COPY ./templates ./templates

# Execute tests
CMD ["zx", "./tests/index.mjs"]
EXPOSE 6080