FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

WORKDIR /src

COPY . .

RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive && \
  yarn build && \
  yarn cache clean

RUN addgroup -g 19001 tor && addgroup node tor

LABEL org.bitcart.image=admin
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=4000

EXPOSE ${NUXT_PORT}
USER node
CMD ["sh"]
