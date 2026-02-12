#!/usr/bin/env python3
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE_FILE = ROOT.parent / "auto_feed.user.js"
SITES_DIR = ROOT / "out" / "sites"

def parse_site_ranges():
    ranges = []
    if not SITES_DIR.exists():
        return ranges
    
    for f in SITES_DIR.glob("*.js"):
        content = f.read_text(encoding='utf-8')
        # Pattern: // --- [1] kind=origin lines=8999-9045 ---
        matches = re.finditer(r"// --- \[\d+\] kind=[\w\-]+ lines=(\d+)-(\d+) ---", content)
        for m in matches:
            ranges.append((int(m.group(1)), int(m.group(2)), f.name))
    return ranges

def main():
    if not SOURCE_FILE.exists():
        print(f"Source file not found: {SOURCE_FILE}")
        return

    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        total_lines = len(f.readlines())

    site_ranges = parse_site_ranges()
    covered = [False] * (total_lines + 1)
    
    for start, end, filename in site_ranges:
        for i in range(start, min(end + 1, total_lines + 1)):
            covered[i] = True

    print(f"Total lines: {total_lines}")
    print(f"Covered by sites/: {sum(covered)} ({sum(covered)/total_lines*100:.1f}%)")

    # Group uncovered lines into chunks
    gaps = []
    in_gap = False
    gap_start = 0
    for i in range(1, total_lines + 1):
        if not covered[i]:
            if not in_gap:
                in_gap = True
                gap_start = i
        else:
            if in_gap:
                gaps.append((gap_start, i - 1))
                in_gap = False
    if in_gap:
        gaps.append((gap_start, total_lines))

    print(f"\nFound {len(gaps)} uncovered gaps:")
    # Print large gaps
    for start, end in gaps:
        size = end - start + 1
        if size > 10:
            print(f"Lines {start}-{end} (Size: {size})")

if __name__ == "__main__":
    main()
