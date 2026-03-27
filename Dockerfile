# Global arguments
ARG APP_ROOT=/opt/app-root/src \
    APP_PORT=8080 \
    APP_UID=1001
ARG GIT_COMMIT

#
# Stage 1: Build the backend app
#
FROM docker.io/node:24.14.0-alpine AS app-build

ARG APP_ROOT
ENV NPM_CONFIG_FUND=false NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR ${APP_ROOT}
COPY app/ ./
RUN npm ci && npm run build

#
# Stage 2: Build the frontend
#
FROM docker.io/node:24.14.0-alpine AS frontend-build

ARG APP_ROOT
ENV NPM_CONFIG_FUND=false NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR ${APP_ROOT}
COPY frontend/ ./
RUN npm ci && npm run build

#
# Stage 3: Production Dependencies & Minimal Identity
#
FROM docker.io/node:24.14.0-alpine AS prod-deps

ARG APP_ROOT APP_UID
ENV NPM_CONFIG_FUND=false NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR ${APP_ROOT}

# Copy package and Prisma schema files
COPY app/package.json app/package-lock.json ./
COPY app/src/db/prisma/schema.prisma ./src/db/prisma/schema.prisma

# Install production dependencies and generate Prisma client
RUN npm ci --ignore-scripts --omit=dev && \
    npm run prisma:generate

# Platform-agnostic physical move of the prisma engine to a static name
RUN find node_modules/@prisma/engines/ -name "*.so.node" | head -n 1 | \
    xargs -I {} mv {} node_modules/@prisma/engines/query-engine.node

# Create minimal user and group files for the final image
RUN echo "appuser:x:${APP_UID}:${APP_UID}:appuser:/:/sbin/nologin" > /etc/passwd_min && \
    echo "appgroup:x:${APP_UID}:" > /etc/group_min

# Check node dynamic dependencies
# RUN ldd /usr/local/bin/node
# RUN ldd node_modules/@prisma/engines/*.node

#
# Stage 4: Final Distroless Image
#
FROM scratch

ARG APP_ROOT APP_PORT APP_UID GIT_COMMIT
ENV GIT_COMMIT=${GIT_COMMIT} \
    LD_LIBRARY_PATH=/usr/lib:/lib \
    NODE_ENV=production \
    PRISMA_QUERY_ENGINE_LIBRARY=${APP_ROOT}/node_modules/@prisma/engines/query-engine.node

# Copy minimal identity and SSL certs (required for HTTPS requests)
COPY --from=prod-deps /etc/passwd_min /etc/passwd
COPY --from=prod-deps /etc/group_min /etc/group
COPY --from=prod-deps /etc/os-release /etc/os-release
COPY --from=prod-deps /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy required Alpine musl shared libraries and Node.js binary
COPY --from=prod-deps /lib/ld-musl-*.so.1 /lib/
COPY --from=prod-deps /usr/lib/libgcc_s.so.* /usr/lib/
COPY --from=prod-deps /usr/lib/libstdc++.so.* /usr/lib/
COPY --from=prod-deps /usr/local/bin/node /usr/local/bin/node

# Copy Prisma and OpenSSL required native libraries
COPY --from=prod-deps /usr/lib/libcrypto.so.* /usr/lib/
COPY --from=prod-deps /usr/lib/libssl.so.* /usr/lib/

# Set working directory
WORKDIR ${APP_ROOT}

# Copy production dependencies and Prisma client
COPY --from=prod-deps --chown=0:0 ${APP_ROOT}/node_modules ./node_modules
COPY --from=prod-deps --chown=0:0 ${APP_ROOT}/src/db/prisma ./src/db/prisma
COPY --from=prod-deps --chown=0:0 ${APP_ROOT}/package.json ./package.json

# Copy compiled backend and configurations
COPY --from=app-build --chown=0:0 ${APP_ROOT}/sbin ./sbin
COPY --from=app-build --chown=0:0 ${APP_ROOT}/config ./config
COPY --from=app-build --chown=0:0 ${APP_ROOT}/config ./sbin/config

# Copy compiled frontend
COPY --from=frontend-build --chown=0:0 ${APP_ROOT}/dist ./dist

# Security and port configuration
USER ${APP_UID}
EXPOSE ${APP_PORT}

# Enter using the binary directly
ENTRYPOINT ["/usr/local/bin/node"]
CMD ["--max-old-space-size=50", "./sbin/server.js"]
