#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
High-performance site-logic extraction script for modules.
Consolidates origin_site, forward_site, and URL-match logic for each site.
"""
import os
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent
MODULES_DIR = ROOT / "modules"
OUT_DIR = ROOT / "out" / "sites"

# Comprehensive list of site codes from default_site_info and code audit
SITE_CODES = {
    'HDB', 'PTP', 'BTN', 'MTeam', 'GPW', 'ZHUQUE', 'UHD', 'BHD', 'BLU', 
    'HDOnly', 'CHDBits', 'OurBits', 'HDChina', 'PTer', 'TTG', 'HDSky', 
    'FileList', 'Springer', 'OpenCD', 'TJUPT', 'PThome', 'U2', 'Audiences', 
    'HDHome', 'NexusPHP', 'HDCity', 'NanYang', 'PuTao', 'TLFbits', 'HDDolby',
    'HUDBT', 'HDU', 'HDArea', 'HDBAO', 'HDOli', 'HDRoute', 
    'BTSchool', 'BYR', 'CDFile', 'CMCT', 'CNZ', 'Dragon', 'ECUST', 'HITPT',
    'ICC', 'IPT', 'KG', 'LemonHD', 'NBL', 'NPUPT', 'NZBS', 'OPS', 
    'RED', 'SC', 'Tik', 'Tokyo', 'YDY', 'ZMPT', 'BaoZi', 'CarPt', 'CrabPt', 
    'DarkLand', 'FreeFarm', 'GTK', 'HHClub', 'JoyHD', 'KuFei', 'LaJiDui', 
    'LongPT', 'LuckPT', 'Mv', 'MyPT', 'OKPT', 'PigGo', 'QingWa', 'RS', 
    'SoulVoice', 'TCCF', 'YemaPT', 'Aither', 'Monika', 'OnlyEncodes', 'ReelFliX'
}

SITE_LOWER_MAP = {s.lower(): s for s in SITE_CODES}

DOMAIN_MAP = {
    'hdbits.org': 'HDB', 'passthepopcorn.me': 'PTP', 'broadcasthe.net': 'BTN',
    'kp.m-team.cc': 'MTeam', 'm-team.cc': 'MTeam', 'greatposterwall.com': 'GPW',
    'zhuque.in': 'ZHUQUE', 'uhdbits.org': 'UHD', 'beyond-hd.me': 'BHD',
    'blutopia.cc': 'BLU', 'hd-only.org': 'HDOnly', 'chdbits.org': 'CHDBits',
    'ourbits.club': 'OurBits', 'hdchina.org': 'HDChina', 'pterclub.com': 'PTer',
    'totheglory.im': 'TTG', 'hdsky.me': 'HDSky', 'filelist.io': 'FileList',
    'springer.com': 'Springer', 'open.cd': 'OpenCD', 'tjupt.org': 'TJUPT',
    'pthome.net': 'PThome', 'u2.dmhy.org': 'U2', 'audiences.me': 'Audiences',
    'hdhome.org': 'HDHome', 'nexusphp.org': 'NexusPHP', 'hdcity.city': 'HDCity'
}

def extract_brace_block(content: str, start_idx: int) -> int:
    idx = content.find("{", start_idx)
    if idx == -1: return -1
    stack = 0
    # Search limit for safety
    for i in range(idx, min(idx + 10000, len(content))):
        char = content[i]
        if char == "{": stack += 1
        elif char == "}":
            stack -= 1
            if stack == 0: return i + 1
    return -1

def main():
    if not MODULES_DIR.exists():
        print(f"Modules directory {MODULES_DIR} not found.")
        return
    
    site_to_logic = defaultdict(list)
    js_files = sorted(MODULES_DIR.glob("*.js"))
    
    # Pre-compile triggers
    # Match site codes even if they have minor variation in quotes
    header_re = re.compile(r"(?:if|else\s+if)\s*\(([^)]{1,500})\)")
    case_re = re.compile(r"case\s*['\"]([\w.\-]+)['\"]\s*:", re.I)

    print(f"Processing {len(js_files)} modules...")

    for js_file in js_files:
        content = js_file.read_text(encoding='utf-8')
        
        # 1. if blocks
        for m in header_re.finditer(content):
            cond = m.group(1)
            cond_lower = cond.lower()
            target_sites = set()
            
            # Fast check: does this condition contain 'origin_site' or 'forward_site' or a site domain?
            if 'site' in cond_lower:
                for s_lower, s_code in SITE_LOWER_MAP.items():
                    if f"'{s_lower}'" in cond_lower or f'"{s_lower}"' in cond_lower:
                        target_sites.add(s_code)
            
            for domain, site_code in DOMAIN_MAP.items():
                if domain in cond_lower:
                    target_sites.add(site_code)
            
            if target_sites:
                end = extract_brace_block(content, m.end())
                if end != -1:
                    chunk = content[m.start():end]
                    for site in target_sites:
                        site_to_logic[site].append((js_file.name, chunk))

        # 2. case blocks
        for m in case_re.finditer(content):
            val_lower = m.group(1).lower()
            matched_site = None
            if val_lower in SITE_LOWER_MAP: matched_site = SITE_LOWER_MAP[val_lower]
            elif val_lower in DOMAIN_MAP: matched_site = DOMAIN_MAP[val_lower]
            
            if matched_site:
                next_stop = content.find("break;", m.end())
                if next_stop != -1:
                    site_to_logic[matched_site].append((js_file.name, content[m.start():next_stop+6]))

    # Output
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Clear old
    for f in OUT_DIR.glob("*.js"): f.unlink()
    
    total_sites = 0
    for site in sorted(site_to_logic.keys()):
        entries = site_to_logic[site]
        # Sort by module name to keep some order
        entries.sort(key=lambda x: x[0])
        
        out_file = OUT_DIR / f"{site}.js"
        formatted = f"/** Consolidated Logic for: {site} **/\n\n"
        for i, (fname, chunk) in enumerate(entries):
            formatted += f"// --- From Module: {fname} (Snippet {i+1}) ---\n{chunk}\n\n"
        
        out_file.write_text(formatted, encoding='utf-8')
        total_sites += 1

    print(f"Success. Consolidated {total_sites} sites in out/sites/")

if __name__ == "__main__":
    main()
