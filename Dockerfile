FROM node:16 as builder

WORKDIR /src

COPY . .

RUN yarn install \
    --prefer-offline \
    --frozen-lockfile \
    --non-interactive \
    --production=false

RUN yarn build

RUN rm -rf node_modules && \
    NODE_ENV=production yarn install \
    --prefer-offline \
    --pure-lockfile \
    --non-interactive \
    --production=true

FROM node:16-alpine

WORKDIR /src

COPY --from=builder /src  .
COPY --from=builder /src/docker-entrypoint.sh /usr/local/bin/

ENV GOSU_VERSION 1.14
RUN apk add --no-cache ca-certificates dpkg && \
    dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')" && \
    wget -qO /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch" && \
    apk del --no-network dpkg && \
    chmod +x /usr/local/bin/gosu

LABEL org.bitcartcc.image=admin
ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 4000

EXPOSE ${NUXT_PORT}
USER node
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["sh"]
