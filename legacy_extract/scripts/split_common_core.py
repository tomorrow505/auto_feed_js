#!/usr/bin/env python3
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COMMON_CORE = ROOT / "auto_feed_common_core.js"
OUT_DIR = ROOT / "common_modules"

# Define line ranges for auto_feed_common_core.js
# Note: These are based on a manual scan of the generated file
MODULE_RANGES = [
    ("01_header_meta.js", 1, 155),
    ("02_core_utilities.js", 156, 300),
    ("03_config_data.js", 1000, 1580), # Need to check exact lines for d_site_info
    ("04_string_extensions.js", 2430, 2700),
    ("05_data_processing.js", 330, 440),
    ("06_ui_helpers.js", 1740, 1830),
    ("07_bbcode_walkers.js", 1950, 2210),
    ("08_image_management.js", 1600, 1740),
    ("09_download_clients.js", 3550, 4500),
]

# Better approach: Scan for function definitions and global variables
def split_functionally():
    if not COMMON_CORE.exists():
        print("Common core not found.")
        return

    content = COMMON_CORE.read_text(encoding='utf-8')
    lines = content.splitlines()
    
    modules = {
        "01_header_meta.js": [],
        "02_core_utilities.js": [],
        "03_string_extensions.js": [],
        "04_data_parsers.js": [],
        "05_image_networking.js": [],
        "06_ui_injectors.js": [],
        "07_bbcode_walkers.js": [],
        "08_site_classification.js": [],
        "09_download_clients.js": [],
        "10_unclassified.js": [],
        "11_site_configs.js": [],
    }

    # Helper to route functions
    def get_target(line_no, line):
        if line_no < 155: return "01_header_meta.js"
        
        # Site Configs (Grepping original ranges)
        if "default_site_info" in line or "o_site_info" in line: return "11_site_configs.js"
        
        # Prototypes
        if ".prototype." in line: return "03_string_extensions.js"
        
        # Networking/Clients
        if "GM_xmlhttpRequest" in line or "uploadToPtpimg" in line or "send_images" in line: return "05_image_networking.js"
        if "transmissionRequest" in line or "qbittorrentRequest" in line or "get_torrentfile" in line: return "09_download_clients.js"
        
        # Walkers
        if "walkDOM" in line or "walk_cmct" in line or "walk_ptp" in line or "add_thanks" in line: return "07_bbcode_walkers.js"
        
        # UI
        if "add_search_urls" in line or "init_buttons" in line: return "06_ui_injectors.js"
        
        # Utilities
        if "wait =" in line or "mutation_observer" in line or "getDoc" in line: return "02_core_utilities.js"
        
        # Data
        if "get_group_name" in line or "deal_with_title" in line or "numTo" in line or "find_origin_site" in line: return "04_data_parsers.js"
        if "judge_if_the_site" in line: return "08_site_classification.js"
        
        return None

    # This is a bit complex to do line-by-line without a proper parser.
    # Let's use established line-range buckets for the generated common core.
    
    current_module = "01_header_meta.js"
    
    for i, line in enumerate(lines, 1):
        # Heuristic to switch modules based on function signatures
        if "function wait" in line: current_module = "02_core_utilities.js"
        elif "String.prototype.medium_sel" in line: current_module = "03_string_extensions.js"
        elif "function get_group_name" in line: current_module = "04_data_parsers.js"
        elif "function getImage" in line: current_module = "05_image_networking.js"
        elif "function add_search_urls" in line: current_module = "06_ui_injectors.js"
        elif "function add_thanks" in line: current_module = "07_bbcode_walkers.js"
        elif "function find_origin_site" in line: current_module = "04_data_parsers.js" # belongs to Parsers
        elif "function judge_if_the_site" in line: current_module = "08_site_classification.js"
        elif "function transmissionRequest" in line: current_module = "09_download_clients.js"
        elif "var default_site_info" in line: current_module = "11_site_configs.js"
        elif "var o_site_info" in line: current_module = "11_site_configs.js"
        
        modules[current_module].append(line)

    OUT_DIR.mkdir(exist_ok=True)
    for name, content_lines in modules.items():
        if content_lines:
            (OUT_DIR / name).write_text("\n".join(content_lines), encoding='utf-8')
            print(f"Created {name} ({len(content_lines)} lines)")

split_functionally()
