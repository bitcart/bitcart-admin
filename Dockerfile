FROM node:10-alpine
LABEL org.bitcartcc.image=admin
RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY . /usr/src/nuxt-app/
RUN apk add --virtual build-deps git build-base python2 && apk add yarn && yarn && yarn cache clean && yarn build && apk del build-deps
EXPOSE 4000
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=4000
COPY docker-entrypoint.sh /usr/local/bin/
CMD ["sh"]