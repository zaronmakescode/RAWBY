FROM dart:stable AS build

WORKDIR /app

# Copy full source (pubspec + lib + bin)
COPY . .

# Resolve dependencies and compile
RUN dart pub get
RUN dart compile exe bin/server.dart -o bin/server

# Minimal runtime image
FROM scratch
COPY --from=build /runtime/ /
COPY --from=build /app/bin/server /app/bin/server

EXPOSE 8080
CMD ["/app/bin/server"]
