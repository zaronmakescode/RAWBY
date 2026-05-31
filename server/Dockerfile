# Single stage on purpose. The server runs via JIT (`dart run`), which compiles
# at container startup and therefore needs the resolved package cache
# (/root/.pub-cache) available at RUNTIME. The previous multi-stage build ran
# `dart pub get` in a build stage and copied only /app to the final stage —
# dropping the pub cache — so `dart run` found no packages and every symbol from
# shelf/http came back "undefined". Keeping build + run in one stage preserves
# the cache so compilation succeeds.
#
# Build context is the repo root, so COPY only the server/ subdir (the repo-root
# pubspec is the Flutter app's and would break `dart pub get`).
FROM dart:stable
WORKDIR /app
COPY server/ .
RUN dart pub get
EXPOSE 8080
CMD ["dart", "run", "bin/server.dart"]
