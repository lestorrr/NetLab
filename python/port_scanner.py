#!/usr/bin/env python3
"""
Simple TCP Port Scanner (authorized use only)
- Input: host, port list/range
- Output: open ports with latency
"""
import argparse
import asyncio
from time import perf_counter
import ipaddress
import socket


def parse_ports(s: str) -> list[int]:
    s = (s or '').strip()
    result: set[int] = set()
    for part in s.split(','):
        part = part.strip()
        if not part:
            continue
        if '-' in part:
            a, b = part.split('-', 1)
            try:
                start = max(1, min(int(a), int(b)))
                end = min(65535, max(int(a), int(b)))
            except ValueError:
                continue
            for p in range(start, end + 1):
                result.add(p)
                if len(result) >= 1000:
                    break
        else:
            try:
                p = int(part)
                if 1 <= p <= 65535:
                    result.add(p)
            except ValueError:
                pass
    return sorted(result)


async def probe(host: str, port: int, timeout: float = 0.8) -> float | None:
    start = perf_counter()
    try:
        fut = asyncio.open_connection(host, port)
        reader, writer = await asyncio.wait_for(fut, timeout)
        writer.close()
        with contextlib.suppress(Exception):
            await writer.wait_closed()
        return (perf_counter() - start) * 1000.0
    except Exception:
        return None


async def run_scan(host: str, ports: list[int], concurrency: int = 200):
    sem = asyncio.Semaphore(concurrency)
    open_ports: list[tuple[int, float]] = []

    async def worker(p: int):
        async with sem:
            ms = await probe(host, p)
            if ms is not None:
                open_ports.append((p, ms))

    tasks = [asyncio.create_task(worker(p)) for p in ports]
    await asyncio.gather(*tasks)
    return sorted(open_ports, key=lambda t: t[0])


def main():
    ap = argparse.ArgumentParser(description='TCP port scanner (for authorized use only)')
    ap.add_argument('host', help='Hostname or IP to scan (must be your own or authorized)')
    ap.add_argument('--ports', default='1-1024', help='Comma-separated ports or ranges, e.g., 22,80,443,8000-8100')
    args = ap.parse_args()

    ports = parse_ports(args.ports)
    if not ports:
        print('No valid ports parsed')
        return

    print(f'Scanning {len(ports)} ports on {args.host}...')
    started = perf_counter()
    open_ports = asyncio.run(run_scan(args.host, ports))
    elapsed = (perf_counter() - started) * 1000.0

    if open_ports:
        for p, ms in open_ports:
            print(f'Port {p} open ({ms:.1f} ms)')
    else:
        print('No open ports found in selection')
    print(f'Done in {elapsed:.1f} ms')


if __name__ == '__main__':
    import contextlib
    main()
