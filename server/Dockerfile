FROM dart:stable AS build

WORKDIR /app

# Copy dependency files first
COPY pubspec.yaml pubspec.lock ./

# Create expected directory structure
RUN mkdir -p bin lib/handlers

# Copy source
COPY bin/ bin/
COPY lib/ lib/

# Show SDK version and resolve deps
RUN dart --version
RUN dart pub get --verbose

# Compile to native executable
RUN dart compile exe bin/server.dart -o bin/server

# Minimal runtime image
FROM scratch
COPY --from=build /runtime/ /
COPY --from=build /app/bin/server /app/bin/server

EXPOSE 8080
CMD ["/app/bin/server"]
