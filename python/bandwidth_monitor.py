#!/usr/bin/env python3
"""
Bandwidth monitor using psutil. Prints bytes/sec in and out.
"""
import time
try:
    import psutil
except ImportError:
    raise SystemExit('Please install psutil: pip install psutil')


def main():
    print('Monitoring network I/O. Press Ctrl+C to stop.')
    last = psutil.net_io_counters()
    last_ts = time.time()
    while True:
        time.sleep(1.0)
        now = psutil.net_io_counters()
        now_ts = time.time()
        dt = max(1e-6, now_ts - last_ts)
        rx = (now.bytes_recv - last.bytes_recv) / dt
        tx = (now.bytes_sent - last.bytes_sent) / dt
        print(f'Down: {rx/1_000_000:.2f} MB/s   Up: {tx/1_000_000:.2f} MB/s')
        last, last_ts = now, now_ts


if __name__ == '__main__':
    main()
