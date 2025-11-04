#!/usr/bin/env python3
"""
Simple speed test: download data from a URL and measure throughput.
For upload, it posts random bytes to a URL that discards body.
"""
import argparse
import os
import time
import httpx


def download_test(url: str):
    with httpx.Client(timeout=None) as client:
        start = time.perf_counter()
        bytes_read = 0
        with client.stream('GET', url) as r:
            r.raise_for_status()
            for chunk in r.iter_bytes():
                bytes_read += len(chunk)
        ms = (time.perf_counter() - start) * 1000
        mbps = (bytes_read * 8) / (ms / 1000) / 1_000_000
        return bytes_read, ms, mbps


def upload_test(url: str, size_mb: int = 5):
    bytes_to_send = size_mb * 1024 * 1024
    data = os.urandom(bytes_to_send)
    with httpx.Client(timeout=None) as client:
        start = time.perf_counter()
        r = client.post(url, content=data)
        r.raise_for_status()
        ms = (time.perf_counter() - start) * 1000
        mbps = (bytes_to_send * 8) / (ms / 1000) / 1_000_000
        return bytes_to_send, ms, mbps


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--download', help='URL to download for test (e.g., /api/speedtest/download?mb=5)')
    ap.add_argument('--upload', help='URL to upload test (e.g., /api/speedtest/upload)')
    args = ap.parse_args()

    if args.download:
        b, ms, mbps = download_test(args.download)
        print(f'Downloaded {b} bytes in {ms:.1f} ms → {mbps:.2f} Mbps')
    if args.upload:
        b, ms, mbps = upload_test(args.upload)
        print(f'Uploaded {b} bytes in {ms:.1f} ms → {mbps:.2f} Mbps')


if __name__ == '__main__':
    main()
