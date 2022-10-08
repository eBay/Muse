FROM node:latest
RUN npm set registry https://npm.corp.ebay.com
RUN npm install -g pnpm zx @ebay/muse-cli create-react-app
WORKDIR /tests
RUN npx create-react-app plugin1
RUN npx create-react-app plugin2 --template typescript
COPY ./tests /tests
CMD ["zx", "/tests/getStarted.mjs"]
EXPOSE 3000