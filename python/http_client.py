#!/usr/bin/env python3
"""
Simple HTTP client supporting GET/HEAD.
"""
import argparse
import httpx


def main():
    ap = argparse.ArgumentParser(description='HTTP client (GET/HEAD)')
    ap.add_argument('url', help='http(s) URL')
    ap.add_argument('--method', choices=['GET', 'HEAD'], default='GET')
    args = ap.parse_args()

    with httpx.Client(follow_redirects=False, timeout=10.0) as client:
        r = client.request(args.method, args.url)
        print(f'Status: {r.status_code}')
        for k, v in r.headers.items():
            print(f'{k}: {v}')
        if args.method == 'GET':
            print('\n--- Body (first 512 bytes) ---')
            print(r.text[:512])


if __name__ == '__main__':
    main()
