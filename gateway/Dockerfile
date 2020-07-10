FROM node:10
WORKDIR /node/epharmacy/app

RUN npm install -g nodemon
COPY package.json  /node/epharmacy/app/package.json
RUN npm install \
 && npm cache clean --force \
 && mv  /node/epharmacy/app/node_modules /node_modules
COPY . /node/epharmacy/app

