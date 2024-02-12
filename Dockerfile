FROM node:20-alpine

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
ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 4000

EXPOSE ${NUXT_PORT}
USER node
CMD ["sh"]
