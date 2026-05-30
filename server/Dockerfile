# Build stage. render.yaml sets `rootDir: server`, so the Docker build context
# IS the server/ directory — copy its contents directly (NOT `COPY server/ .`,
# which looked for server/server/ and broke every deploy).
FROM dart:stable AS build
WORKDIR /app

# Cache dependencies: resolve from pubspec before copying the rest of the source.
COPY pubspec.* ./
RUN dart pub get
COPY . .
RUN dart pub get --offline

# Fail the build LOUDLY on any compile error, using the same front-end the JIT
# runtime uses. A broken commit now shows red Dart errors in Render's build log
# instead of producing an image that crash-loops at startup (which previously
# left the old version silently running). Runtime below stays JIT by design.
RUN dart compile kernel bin/server.dart -o /tmp/server.dill && rm /tmp/server.dill

# Runtime stage — JIT (`dart run`), matching the project's chosen setup.
FROM dart:stable
WORKDIR /app
COPY --from=build /app /app
EXPOSE 8080
CMD ["dart", "run", "bin/server.dart"]
