FROM node:11.13.0-alpine
RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY . /usr/src/nuxt-app/
RUN apk add --virtual build-deps git build-base python2 && npm install && npm run build && apk del build-deps
EXPOSE 4000
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=4000