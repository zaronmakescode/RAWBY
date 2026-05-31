# render.yaml sets `rootDir: server`, so the Docker build context IS the server/
# directory. Copy its contents directly (the previous `COPY server/ .` looked for
# a nonexistent server/server/ path and failed every deploy).
FROM dart:stable AS build
WORKDIR /app
COPY . .
RUN dart pub get

FROM dart:stable
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
CMD ["dart", "run", "bin/server.dart"]
