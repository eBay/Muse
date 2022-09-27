FROM node:latest
RUN npm set registry https://npm.corp.ebay.com
RUN npm install -g pnpm zx
# Make the container never stops for debugging
CMD ["tail", "-f", "/dev/null"]
EXPOSE 3000