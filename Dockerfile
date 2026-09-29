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
# Stage 1: Build the frontend
#
FROM docker.io/node:24.20.0-alpine AS frontend-build

ARG APP_ROOT
ENV NPM_CONFIG_FUND=false NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR ${APP_ROOT}
COPY frontend/ ./
RUN npm ci && npm run build

#
# Stage 2: Production Dependencies & Minimal Identity
#
FROM docker.io/node:24.20.0-alpine AS prod-deps

ARG APP_ROOT APP_UID
ARG PRISMA_DUMMY_DATABASE_URL
ENV NPM_CONFIG_FUND=false NPM_CONFIG_UPDATE_NOTIFIER=false
ENV DATABASE_URL=${PRISMA_DUMMY_DATABASE_URL}

WORKDIR ${APP_ROOT}
COPY app/ ./

# `prisma generate` runs the zod and relations generators (prisma-zod-generator,
# and the tsx-based relationsGenerator.ts under src/db/generators/), which need
# dev-only deps (prisma-zod-generator, @prisma/generator-helper, prettier) and
# the full src/ tree to run. Install everything, generate, then prune back to
# production-only node_modules for the final image.
RUN npm ci && \
    npx prisma generate && \
    npm prune --omit=dev

# Create minimal user and group files for the final image
RUN echo "appuser:x:${APP_UID}:${APP_UID}:appuser:/:/sbin/nologin" > /etc/passwd_min && \
    echo "appgroup:x:${APP_UID}:" > /etc/group_min

# Check node dynamic dependencies
# RUN ldd /usr/local/bin/node
# RUN ldd node_modules/@prisma/engines/*.node

#
# Stage 3: Final Distroless Image
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

# Set working directory
WORKDIR ${APP_ROOT}

# Copy app code, run directly by Node's native type stripping
COPY --chown=0:0 app/package.json app/server.ts app/app.ts app/state.ts app/knexfile.ts app/peachSync.ts ./
COPY --chown=0:0 app/config ./config
COPY --chown=0:0 app/src ./src

# Copy production dependencies and generated Prisma code (gitignored, so absent from app/src)
COPY --from=prod-deps --chown=0:0 ${APP_ROOT}/node_modules ./node_modules
COPY --from=prod-deps --chown=0:0 ${APP_ROOT}/src/db/generated ./src/db/generated

# Copy compiled frontend
COPY --from=frontend-build --chown=0:0 ${APP_ROOT}/dist ./dist

# Security and port configuration
USER ${APP_UID}
EXPOSE ${APP_PORT}

# Enter using the binary directly
ENTRYPOINT ["/usr/local/bin/node"]
CMD ["./server.ts"]
