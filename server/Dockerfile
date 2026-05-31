# Render's Docker build context for this service is the REPO ROOT, and the repo
# root holds the Flutter app's pubspec (name: rawby, depends on flutter_test).
# So copy ONLY the server/ subdir into /app — `COPY . .` would pull the Flutter
# pubspec and make `dart pub get` fail (flutter_test has no Flutter SDK here).
FROM dart:stable AS build
WORKDIR /app
COPY server/ .
RUN dart pub get

FROM dart:stable
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
CMD ["dart", "run", "bin/server.dart"]
