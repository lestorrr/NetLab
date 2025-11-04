#!/usr/bin/env python3
"""
Serve the current directory on http://127.0.0.1:8000
"""
import http.server
import socketserver

HOST, PORT = '127.0.0.1', 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return  # be quiet; remove to log

with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
    print(f'Serving {HOST}:{PORT} (Ctrl+C to stop)')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        print('Shutting down…')
        httpd.server_close()
