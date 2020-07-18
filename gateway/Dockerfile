FROM epharmacy/common as builder
FROM node:10
WORKDIR /node/epharmacy/app
COPY --from=builder /node/epharmacy/common /node/epharmacy/common

RUN npm install -g nodemon
COPY package.json  /node/epharmacy/app/package.json
RUN npm install \
 && npm cache clean --force \
 && mv  /node/epharmacy/app/node_modules /node_modules
COPY . /node/epharmacy/app

