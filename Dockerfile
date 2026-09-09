# Global arguments
ARG APP_ROOT=/opt/app-root/src \
    APP_PORT=8080 \
    APP_UID=1001
ARG GIT_COMMIT
# Placeholder DATABASE_URL for build-time `prisma generate` steps: generate
# never connects to the database, but prisma.config.ts's env('DATABASE_URL')
# resolves eagerly at config-load time and errors out if the var is unset.
ARG PRISMA_DUMMY_DATABASE_URL="postgresql://user:password@localhost:5432/db"

#
# Stage 1: Build the backend app
#
FROM docker.io/node:24.20.0-alpine AS app-build

ARG APP_ROOT
ARG PRISMA_DUMMY_DATABASE_URL
ENV NPM_CONFIG_FUND=false NPM_CONFIG_UPDATE_NOTIFIER=false
ENV DATABASE_URL=${PRISMA_DUMMY_DATABASE_URL}

WORKDIR ${APP_ROOT}
COPY app/ ./
# Generate the Prisma client before compiling: tsc needs the #prismaClient
# subpath import to resolve, and src/db/generated is gitignored so a clean
# checkout never has it on disk.
RUN npm ci && \
    npx prisma generate && \
    npm run build

#
# Stage 2: Build the frontend
#
FROM docker.io/node:24.20.0-alpine AS frontend-build

ARG APP_ROOT
ENV NPM_CONFIG_FUND=false NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR ${APP_ROOT}
COPY frontend/ ./
RUN npm ci && npm run build

#
# Stage 3: Production Dependencies & Minimal Identity
#
FROM docker.io/node:24.20.0-alpine AS prod-deps

ARG APP_ROOT APP_UID
ARG PRISMA_DUMMY_DATABASE_URL
ENV NPM_CONFIG_FUND=false NPM_CONFIG_UPDATE_NOTIFIER=false
ENV DATABASE_URL=${PRISMA_DUMMY_DATABASE_URL}

WORKDIR ${APP_ROOT}

# Copy package, Prisma config, and Prisma schema files
COPY app/package.json app/package-lock.json app/prisma.config.ts ./
COPY app/src/db/prisma/schema.prisma ./src/db/prisma/schema.prisma

# Install production dependencies and generate the Prisma client directly via
# `npx prisma generate` rather than `npm run prisma:generate`: the latter
# triggers the postprisma:generate hook (regenerates relations.generated.ts),
# which needs the full src/ tree and dev-only deps not present in this stage —
# unnecessary here since that generated file is already committed to git and
# gets picked up by the app-build stage's full source copy.
RUN npm ci --ignore-scripts --omit=dev && \
    npx prisma generate

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
    NODE_ENV=production

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
COPY --from=prod-deps --chown=0:0 ${APP_ROOT}/src/db/generated ./sbin/src/db/generated
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
CMD ["--max-old-space-size=50", "--conditions=sbin", "./sbin/server.js"]
