#!/usr/bin/env python3
"""Sum visitor counts and show percent per line and per browser.

Input lines: NUMBER BROWSER [VERSION]
  1234 Chrome 150
  1000 UnknownBrowser

Usage: python3 visitors.py visitors.txt
"""
import sys
from collections import defaultdict


def main(path):
    rows = []
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        line = line.strip()
        if not line:
            continue
        parts = line.split(maxsplit=1)
        try:
            count = int(parts[0])
        except ValueError:
            print(f"skip line {n}: {line!r}", file=sys.stderr)
            continue
        label = parts[1] if len(parts) > 1 else "(none)"
        rows.append((count, label))

    total = sum(c for c, _ in rows)
    if total == 0:
        sys.exit("no visits found")

    # per line
    width = max(len(l) for _, l in rows)
    print("Per line:")
    for count, label in sorted(rows, reverse=True):
        print(f"  {label:<{width}}  {count:>10,}  {count / total:7.2%}")

    # per browser (first word of label)
    by_browser = defaultdict(int)
    for count, label in rows:
        by_browser[label.split()[0]] += count
    width = max(len(b) for b in by_browser)
    print("\nPer browser:")
    for browser, count in sorted(by_browser.items(), key=lambda x: -x[1]):
        print(f"  {browser:<{width}}  {count:>10,}  {count / total:7.2%}")

    print(f"\nTotal: {total:,}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: visitors.py FILE")
    main(sys.argv[1])
