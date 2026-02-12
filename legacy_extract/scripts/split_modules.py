#!/usr/bin/env python3
"""
split_modules.py - Split auto_feed.user.js into logical modules

Usage:
    python split_modules.py [input_file] [output_dir]

Default:
    input_file: ../auto_feed.user.js
    output_dir: ./modules/
"""

import os
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Module:
    """Defines a code module with line range"""
    name: str
    filename: str
    start_line: int
    end_line: int
    description: str

# Complete module coverage (30912 lines total)
# Designed for coarse-grained splitting first, can be refined later
MODULES = [
    # === Part 1: Header & Configuration (1-1900) ===
    Module("Header", "01_header.js", 1, 150, 
           "UserScript metadata, @match rules, @grant permissions"),
    Module("CoreUtilities", "02_core_utilities.js", 151, 916, 
           "wait(), mutation_observer(), getReactFiberNode(), file/image helpers"),
    Module("Configuration", "03_configuration.js", 917, 1340, 
           "APIs, user settings, default_site_info (100+ sites)"),
    Module("OriginSiteConfig", "04_origin_site_config.js", 1341, 1550, 
           "o_site_info dictionary, source site URLs"),
    Module("TemplatesAndConstants", "05_templates_constants.js", 1551, 1900, 
           "BBCode templates (iTS, KG), region constants"),
    
    # === Part 2: Detection & Parsing Functions (1901-3600) ===
    Module("SiteDetection", "06_site_detection.js", 1901, 2200, 
           "find_origin_site(), add_thanks(), reg_team_name"),
    Module("DOMWalkers", "07_dom_walkers.js", 2201, 2430, 
           "walkDOM(), walk_cmct(), walk_ptp(), domToString()"),
    Module("EncodingParsers", "08_encoding_parsers.js", 2431, 2700, 
           "String.prototype: medium_sel, codec_sel, audiocodec_sel, standard_sel"),
    Module("DataProcessing", "09_data_processing.js", 2701, 3600, 
           "fill_raw_info(), get_mediainfo_picture_from_descr()"),
    
    # === Part 3: UI Components (3601-5000) ===
    Module("UIButtonsAndForms", "10_ui_buttons_forms.js", 3601, 4500, 
           "init_buttons_for_transfer(), button creation logic"),
    Module("DownloadClients", "11_download_clients.js", 4501, 5000, 
           "transmissionRequest(), qbittorrentRequest(), get_torrentfile()"),
    
    # === Part 4: Site-Specific UI Helpers (5001-8998) ===
    Module("SiteUIHelpers", "12_site_ui_helpers.js", 5001, 7000, 
           "Site-specific UI translations, search filters, popups"),
    Module("SiteUIHelpers2", "13_site_ui_helpers2.js", 7001, 8998, 
           "More site-specific UI: tooltips, table enhancements"),
    
    # === Part 5: Origin Site Parsing Logic (8999-14313) ===
    Module("OriginSiteParsing1", "14_origin_site_parsing1.js", 8999, 11000, 
           "origin_site blocks: digitalcore, HDSpace, HUDBT, BYR, 影, U2..."),
    Module("OriginSiteParsing2", "15_origin_site_parsing2.js", 11001, 13000, 
           "origin_site blocks: BTN, MTV, Red, OpenCD, MTeam, BHD..."),
    Module("OriginSiteParsing3", "16_origin_site_parsing3.js", 13001, 14313, 
           "origin_site blocks: exclusivity checks, FRDS, HDB, CMCT..."),
    
    # === Part 6: Forward Site Filling Logic (14314-23000) ===
    Module("ForwardSiteFilling1", "17_forward_site_filling1.js", 14314, 16000, 
           "forward_site blocks: CMCT, PTer, HDSky, OpenCD, OPS..."),
    Module("ForwardSiteFilling2", "18_forward_site_filling2.js", 16001, 18000, 
           "forward_site blocks: TTG, CHDBits, PTer, PThome..."),
    Module("ForwardSiteFilling3", "19_forward_site_filling3.js", 18001, 21000, 
           "forward_site blocks: form population, category selection..."),
    Module("ForwardSiteFilling4", "20_forward_site_filling4.js", 21001, 23000, 
           "forward_site blocks: BLU, ACM, Tik, image handling..."),
    
    # === Part 7: Additional Handlers (23001-30912) ===
    Module("AdditionalHandlers1", "21_additional_handlers1.js", 23001, 26000, 
           "Extended site handlers, special pages"),
    Module("AdditionalHandlers2", "22_additional_handlers2.js", 26001, 29000, 
           "More site handlers, list pages"),
    Module("FinalHandlers", "23_final_handlers.js", 29001, 30912, 
           "Final origin_site handlers: ZHUQUE, MTeam detail pages"),
]


def read_source_file(filepath: str) -> List[str]:
    """Read source file and return lines"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.readlines()


def extract_module(lines: List[str], start: int, end: int) -> str:
    """Extract lines from source (1-indexed to 0-indexed)"""
    start_idx = max(0, start - 1)
    end_idx = min(len(lines), end)
    return ''.join(lines[start_idx:end_idx])


def write_module(output_dir: Path, filename: str, content: str, description: str, 
                 start_line: int, end_line: int):
    """Write module file with header comment"""
    header = f"""/**
 * @module {filename.replace('.js', '')}
 * @description {description}
 * @lines {start_line}-{end_line}
 * 
 * Extracted from auto_feed.user.js
 * DO NOT EDIT - Auto-generated by split_modules.py
 */

"""
    filepath = output_dir / filename
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(header + content)
    return filepath


def generate_index(output_dir: Path, modules: List[Module], stats: dict):
    """Generate index.md for the modules directory"""
    content = f"""# Module Index

> Auto-generated from `auto_feed.user.js` ({stats['total_lines']:,} lines)

## Overview

| Metric | Value |
|--------|-------|
| Total Lines | {stats['total_lines']:,} |
| Modules | {len(modules)} |
| Coverage | {stats['coverage']:.1f}% |

## Modules

### Part 1: Header & Configuration
| # | Module | Lines | Description |
|---|--------|-------|-------------|
"""
    
    sections = [
        ("Part 1: Header & Configuration", 1, 5),
        ("Part 2: Detection & Parsing", 6, 9),
        ("Part 3: UI Components", 10, 11),
        ("Part 4: Site-Specific UI Helpers", 12, 13),
        ("Part 5: Origin Site Parsing", 14, 16),
        ("Part 6: Forward Site Filling", 17, 20),
        ("Part 7: Additional Handlers", 21, 23),
    ]
    
    current_section = 0
    for i, mod in enumerate(modules, 1):
        # Check if we need a new section header
        if current_section < len(sections) - 1:
            if i > sections[current_section][2]:
                current_section += 1
                content += f"\n### {sections[current_section][0]}\n"
                content += "| # | Module | Lines | Description |\n"
                content += "|---|--------|-------|-------------|\n"
        
        line_count = mod.end_line - mod.start_line + 1
        content += f"| {i} | [{mod.filename}](./{mod.filename}) | {mod.start_line:,}-{mod.end_line:,} ({line_count:,}) | {mod.description} |\n"
    
    content += f"""

## Usage

```bash
# Re-run extraction
python3 ../split_modules.py

# View a specific module
cat modules/14_origin_site_parsing1.js
```

## Notes

- Modules are numbered for logical ordering
- Site-specific logic is in modules 12-23
- Refine by editing `MODULES` list in `split_modules.py`
"""
    
    with open(output_dir / "index.md", 'w', encoding='utf-8') as f:
        f.write(content)


def main():
    script_dir = Path(__file__).parent
    input_file = sys.argv[1] if len(sys.argv) > 1 else str(script_dir.parent / "auto_feed.user.js")
    output_dir = Path(sys.argv[2] if len(sys.argv) > 2 else str(script_dir / "modules"))
    
    print(f"Input: {input_file}")
    print(f"Output: {output_dir}")
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if not os.path.exists(input_file):
        print(f"Error: Input file not found: {input_file}")
        sys.exit(1)
    
    lines = read_source_file(input_file)
    total_lines = len(lines)
    print(f"Total lines: {total_lines:,}")
    
    # Extract all modules
    print(f"\n=== Extracting {len(MODULES)} Modules ===")
    covered_lines = 0
    
    for mod in MODULES:
        actual_end = min(mod.end_line, total_lines)
        content = extract_module(lines, mod.start_line, actual_end)
        line_count = actual_end - mod.start_line + 1
        covered_lines += line_count
        
        write_module(output_dir, mod.filename, content, mod.description, 
                    mod.start_line, actual_end)
        print(f"  ✓ {mod.filename}: {mod.start_line:,}-{actual_end:,} ({line_count:,} lines)")
    
    # Stats
    coverage = (covered_lines / total_lines) * 100 if total_lines > 0 else 0
    stats = {'total_lines': total_lines, 'coverage': coverage, 'covered': covered_lines}
    
    generate_index(output_dir, MODULES, stats)
    print(f"\n✓ Generated index.md")
    
    print(f"\n=== Summary ===")
    print(f"Modules: {len(MODULES)} files")
    print(f"Coverage: {covered_lines:,}/{total_lines:,} lines ({coverage:.1f}%)")
    print(f"Output: {output_dir}")


if __name__ == '__main__':
    main()
