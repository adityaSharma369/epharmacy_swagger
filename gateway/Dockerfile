FROM node:13
WORKDIR /var/app

RUN npm install -g nodemon
COPY package.json /var/app/package.json
RUN npm install \
 && npm cache clean --force \
 && mv /var/app/node_modules /node_modules

COPY . /var/app


