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

RUN addgroup -g 19001 tor && addgroup node tor

LABEL org.bitcartcc.image=admin
ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 4000

EXPOSE ${NUXT_PORT}
USER node
CMD ["sh"]
