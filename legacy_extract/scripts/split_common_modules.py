#!/usr/bin/env python3
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COMMON_CORE = ROOT / "auto_feed_common_core.js"
OUT_DIR = ROOT / "common_modules"

def split_functionally():
    if not COMMON_CORE.exists():
        print("Common core not found.")
        return

    lines = COMMON_CORE.read_text(encoding='utf-8').splitlines()
    
    modules = {
        "01_meta_header.js": [],
        "02_core_utils.js": [],
        "03_config_data.js": [],
        "04_string_extensions.js": [],
        "05_data_processing.js": [],
        "06_ui_injectors.js": [],
        "07_bbcode_walkers.js": [],
        "08_networking.js": [],
        "09_download_clients.js": [],
        "10_site_ui_patches.js": [],
    }

    current_module = "02_core_utils.js" # Default after header
    
    for i, line in enumerate(lines, 1):
        if i <= 155:
            modules["01_meta_header.js"].append(line)
            continue
            
        # UI Patches (early logic)
        if "if (site_url" in line or "mutation_observer(document" in line:
            if i < 2000:
                current_module = "10_site_ui_patches.js"
        
        # Core Utils
        if any(f in line for f in ["function wait", "function mutation_observer", "function getReact", "function getDoc", "function getJson", "function postData", "function page_parser"]):
            current_module = "02_core_utils.js"
        
        # Config
        elif any(v in line for v in ["var used_site_info", "var default_site_info", "var o_site_info", "var reg_team_name"]):
            current_module = "03_config_data.js"
            
        # Prototypes
        elif "String.prototype." in line:
            current_module = "04_string_extensions.js"
            
        # Data Processing
        elif any(f in line for f in ["function get_group_name", "function deal_with_title", "function numTo", "function find_origin_site", "function get_search_name", "function get_size_from_descr"]):
            current_module = "05_data_processing.js"
            
        # UI Helpers
        elif any(f in line for f in ["function add_search_urls", "function init_buttons", "function add_button", "function set_jump_href"]):
            current_module = "06_ui_injectors.js"
            
        # Walkers
        elif any(f in line for f in ["function walkDOM", "function walk_cmct", "function walk_ptp", "function add_thanks"]):
            current_module = "07_bbcode_walkers.js"
            
        # Networking (Images/IMDb)
        elif any(f in line for f in ["function getImage", "function getBlob", "function ptp_send", "function uploadToPtpimg", "function getData", "function get_bgmdata"]):
            current_module = "08_networking.js"
            
        # Download Clients
        elif any(f in line for f in ["function transmissionRequest", "function qbittorrentRequest", "function get_torrentfile", "function download_to_server", "function init_remote_server"]):
            current_module = "09_download_clients.js"

        modules[current_module].append(line)

    OUT_DIR.mkdir(exist_ok=True)
    for name, content_lines in modules.items():
        if content_lines:
            # Automatic overflow splitting for < 3000 lines
            if len(content_lines) > 3000:
                print(f"Splitting {name} ({len(content_lines)} lines)")
                for idx in range(0, len(content_lines), 2500):
                    part_num = idx // 2500 + 1
                    part_name = name.replace(".js", f"_part{part_num}.js")
                    (OUT_DIR / part_name).write_text("\n".join(content_lines[idx:idx+2500]), encoding='utf-8')
                    print(f"  -> Created {part_name}")
            else:
                (OUT_DIR / name).write_text("\n".join(content_lines), encoding='utf-8')
                print(f"Created {name} ({len(content_lines)} lines)")

if __name__ == "__main__":
    split_functionally()
