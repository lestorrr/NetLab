#!/usr/bin/env python3
"""
TCP Ping: measure TCP handshake RTT to a host:port
"""
import argparse
import socket
import time


def tcp_ping(host: str, port: int, attempts: int = 3, timeout: float = 1.0):
    rtts = []
    for _ in range(attempts):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        start = time.perf_counter()
        try:
            s.connect((host, port))
            rtts.append((time.perf_counter() - start) * 1000.0)
        except Exception:
            pass
        finally:
            s.close()
    return rtts


def main():
    ap = argparse.ArgumentParser(description='TCP ping (connect time)')
    ap.add_argument('host')
    ap.add_argument('port', type=int)
    ap.add_argument('--attempts', type=int, default=3)
    args = ap.parse_args()

    rtts = tcp_ping(args.host, args.port, args.attempts)
    if not rtts:
        print('No responses')
        return
    print('RTTs (ms):', ', '.join(f'{x:.1f}' for x in rtts))
    print(f'Min {min(rtts):.1f}  Avg {sum(rtts)/len(rtts):.1f}  Max {max(rtts):.1f}')


if __name__ == '__main__':
    main()
