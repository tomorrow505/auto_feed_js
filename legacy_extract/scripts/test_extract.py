#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MODULES_DIR = ROOT / "modules"
TEST_FILE = MODULES_DIR / "17_forward_site_filling1.js"

SITE_CODES = {'HDSky', 'CHDBits', 'HUDBT', 'CMCT', 'TTG', 'PTer'}

def extract_brace_block(content: str, start_idx: int) -> int:
    idx = content.find("{", start_idx)
    if idx == -1: return -1
    stack = 0
    # Search limit for safety
    for i in range(idx, min(idx + 5000, len(content))):
        char = content[i]
        if char == "{": stack += 1
        elif char == "}":
            stack -= 1
            if stack == 0: return i + 1
    return -1

def main():
    if not TEST_FILE.exists():
        print("Test file not found")
        return
    content = TEST_FILE.read_text(encoding='utf-8')
    # Safer regex: no DOTALL, limit length inside ()
    header_re = re.compile(r"(if|else\s+if)\s*\(([^)]{1,500})\)")
    
    found = 0
    for m in header_re.finditer(content):
        cond = m.group(2)
        for site in SITE_CODES:
            if site in cond:
                end = extract_brace_block(content, m.end())
                if end != -1:
                    found += 1
                    print(f"Found logic for {site} at {m.start()}")
                break
    print(f"Total found: {found}")

if __name__ == "__main__":
    main()
