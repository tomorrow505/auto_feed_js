#!/usr/bin/env python3
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE_FILE = ROOT.parent / "auto_feed.user.js"
SITES_DIR = ROOT / "out" / "sites"
OUTPUT_FILE = ROOT / "auto_feed_common_core.js"

def parse_site_ranges():
    ranges = []
    if not SITES_DIR.exists():
        return ranges
    
    for f in SITES_DIR.glob("*.js"):
        content = f.read_text(encoding='utf-8')
        # Pattern: // --- [1] kind=origin lines=8999-9045 ---
        matches = re.finditer(r"// --- \[\d+\] kind=([\w\-]+) lines=(\d+)-(\d+) ---", content)
        for m in matches:
            ranges.append({
                'start': int(m.group(2)),
                'end': int(m.group(3)),
                'site': f.stem,
                'kind': m.group(1)
            })
    return ranges

def main():
    if not SOURCE_FILE.exists():
        print(f"Source file not found: {SOURCE_FILE}")
        return

    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    site_ranges = parse_site_ranges()
    # Sort by start line descending to avoid index shift if we were deleting, 
    # but we are just replacing line content, so ascending is fine.
    # Actually, we'll mark lines to be replaced.
    
    line_map = {} # line_no -> comment
    for r in site_ranges:
        comment = f"// [Site Logic: {r['site']} ({r['kind']}) L{r['start']}-{r['end']}]"
        # Mark the first line of the block
        line_map[r['start']] = comment
        # Mark subsequent lines to be "removed"
        for i in range(r['start'] + 1, r['end'] + 1):
            line_map[i] = None

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("// ==================================================================================\n")
        f.write("// AUTO FEED COMMON CORE (Extracted from auto_feed.user.js)\n")
        f.write("// Site-specific blocks have been removed based on legacy_extract/out/sites/*.js\n")
        f.write("// ==================================================================================\n\n")
        
        for i, line in enumerate(lines, 1):
            if i in line_map:
                marker = line_map[i]
                if marker: # First line of block
                    f.write(marker + "\n")
                else: # Intermediate line of block
                    pass
            else:
                f.write(line)

    print(f"Common core extracted to: {OUTPUT_FILE}")
    print(f"Reduced from {len(lines)} to approximately {len(lines) - len([k for k,v in line_map.items() if v is None])} lines.")

if __name__ == "__main__":
    main()
