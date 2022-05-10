FROM node:14-slim

ENV KRATOS_PUBLIC_URL=https://auth.innovationwithin.services/

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG LINK=no

COPY package.json .
COPY package-lock.json .

RUN npm ci --fetch-timeout=600000

COPY . /usr/src/app

RUN if [ "$LINK" == "true" ]; then (cd ./contrib/sdk/generated; rm -rf node_modules; npm ci; npm run build); \
    cp -r ./contrib/sdk/generated/* node_modules/@ory/kratos-client/; \
    fi

RUN npm run build

ENTRYPOINT npm run serve

EXPOSE 3000
