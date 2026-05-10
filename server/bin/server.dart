import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_cors_headers/shelf_cors_headers.dart';
import 'package:args/args.dart';
import '../lib/router.dart';
import '../lib/store.dart';

Future<void> main(List<String> args) async {
  final parser = ArgParser()..addOption('port', abbr: 'p', defaultsTo: '8080');
  final result = parser.parse(args);
  final port = int.parse(Platform.environment['PORT'] ?? result['port'] as String);

  // Initialize in-memory store
  Store.instance.initialize();

  final app = buildRouter();

  final handler = const Pipeline()
      .addMiddleware(logRequests())
      .addMiddleware(corsHeaders())
      .addHandler(app);

  final server = await shelf_io.serve(handler, InternetAddress.anyIPv4, port);
  print('✅ RAWBY Server running on http://${server.address.host}:${server.port}');
}
