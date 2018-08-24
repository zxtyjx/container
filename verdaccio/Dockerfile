FROM verdaccio/verdaccio
LABEL maintainer="https://github.com/verdaccio/verdaccio"

ENV APPDIR /usr/local/app

WORKDIR $APPDIR

ENV NODE_ENV=production

# RUN npm config set registry http://registry.npm.taobao.org/ && \
#     yarn global add -s flow-bin@0.69.0 && \
#     yarn install --production=false && \
#     yarn lint && \
#     yarn code:docker-build && \
#     yarn build:webui && \
#     yarn cache clean && \
#     yarn install --production=true --pure-lockfile

# RUN mkdir -p /verdaccio/storage /verdaccio/plugins /verdaccio/conf

COPY conf/docker.yaml /verdaccio/conf/config.yaml

# RUN addgroup -S verdaccio && adduser -S -G verdaccio verdaccio && \
#     chown -R verdaccio:verdaccio "$APPDIR" && \
#     chown -R verdaccio:verdaccio /verdaccio

USER verdaccio

ENV PORT 4873
ENV PROTOCOL http

EXPOSE $PORT

VOLUME ["/verdaccio"]

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

CMD $APPDIR/bin/verdaccio --config /verdaccio/conf/config.yaml --listen $PROTOCOL://0.0.0.0:${PORT}
