#!/usr/bin/env python3
"""
generate_srd_from_md_repo.py

Clone/update a Markdown SRD repo and produce a single JSON entry per .md file.

Output: backend/src/main/resources/srd-combined.json

This version fixes cases where files include BOM/zero-width characters so the
first title is properly removed from content and excerpt.
"""

import os
import re
import json
import subprocess
import unicodedata
from pathlib import Path

# Config
REPO_URL = "https://github.com/seansbox/daggerheart-srd.git"
LOCAL_DIR = Path("temp_dhsrd_repo")
OUTPUT_FILE = Path("backend/src/main/resources/srd-combined.json")

# Optional mapping (folder -> normalized type)
TYPE_MAP = {
    "blade": "abilities",
    "mystic": "abilities",
    # add more if desired
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def run_cmd(cmd):
    subprocess.run(cmd, check=True)

def clone_or_update(repo_url=REPO_URL, local_dir=LOCAL_DIR):
    if local_dir.exists():
        print(f"[git] Updating {local_dir}...")
        run_cmd(["git", "-C", str(local_dir), "pull"])
    else:
        print(f"[git] Cloning {repo_url} → {local_dir} ...")
        run_cmd(["git", "clone", repo_url, str(local_dir)])

def install_if_missing(package):
    try:
        __import__(package)
    except ImportError:
        print(f"[pip] Installing {package} ...")
        run_cmd(["pip3", "install", package])

def slugify(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", str(text))
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:100]

def camel_case(s: str) -> str:
    parts = re.sub(r"[^a-zA-Z0-9]+", " ", s).strip().split()
    if not parts:
        return ""
    return parts[0].lower() + "".join(p.capitalize() for p in parts[1:])

# ---------------------------------------------------------------------------
# Markdown parsing helpers
# ---------------------------------------------------------------------------

def extract_frontmatter(text: str):
    if text.startswith("---"):
        matches = list(re.finditer(r"^---\s*$", text, flags=re.MULTILINE))
        if len(matches) >= 2:
            start = matches[0].end()
            end = matches[1].start()
            fm_text = text[start:end].strip()
            remaining = text[matches[1].end():].lstrip("\r\n")
            try:
                import yaml
                fm = yaml.safe_load(fm_text) or {}
                return fm, remaining
            except Exception:
                return None, remaining
    return None, text

def remove_bom_and_invisibles(text: str) -> str:
    # Remove common BOM and zero-width characters from start of string
    # \ufeff BOM, \u200b zero-width space, \u200e left-to-right mark, \u200f right-to-left mark
    return re.sub(r'^[\ufeff\u200b\u200e\u200f]+', '', text)

def remove_first_heading(text: str):
    """
    Remove the first heading (ATX '# ...' or Setext style 'Title\\n===') from the text.
    Returns (title_or_None, remaining_text).
    """
    lines = text.splitlines()
    # find index of first non-empty line
    start_idx = 0
    while start_idx < len(lines) and lines[start_idx].strip() == "":
        start_idx += 1

    # check ATX heading at or after start_idx
    for idx in range(start_idx, len(lines)):
        line = lines[idx]
        # ATX heading (allow up to 3 leading spaces)
        m_atx = re.match(r'^\s{0,3}(#{1,6})\s*(.+?)\s*(?:#+\s*)?$', line)
        if m_atx:
            title = m_atx.group(2).strip()
            # remove only that heading line
            del lines[idx]
            remaining = "\n".join(lines).lstrip("\r\n")
            return title, remaining
        # Setext-style: check next line exists and is === or ---
        if idx + 1 < len(lines):
            next_line = lines[idx + 1]
            if re.match(r'^\s{0,3}={2,}\s*$', next_line) or re.match(r'^\s{0,3}-{2,}\s*$', next_line):
                title = line.strip()
                del lines[idx:idx+2]
                remaining = "\n".join(lines).lstrip("\r\n")
                return title, remaining
        # If the first non-empty line isn't a heading, stop; don't remove later headings
        break

    # Fallback: try to find any ATX heading anywhere (less preferred)
    m_any_atx = re.search(r'^\s{0,3}(#{1,6})\s*(.+?)\s*(?:#+\s*)?$', text, flags=re.MULTILINE)
    if m_any_atx:
        title = m_any_atx.group(2).strip()
        start, end = m_any_atx.span()
        before = text[:start]
        after = text[end:]
        after = after.lstrip("\r\n")
        remaining = (before + after).lstrip("\r\n")
        return title, remaining

    return None, text

def parse_top_blockquote_lines(text: str):
    metadata = {}
    lines = text.splitlines()
    i = 0
    block_lines = []
    while i < len(lines):
        line = lines[i]
        if line.lstrip().startswith(">"):
            block_lines.append(re.sub(r"^\s*>\s*", "", line).rstrip())
            i += 1
            continue
        if line.strip() == "" and block_lines:
            block_lines.append("")
            i += 1
            continue
        break

    if not block_lines:
        return {}, text

    for raw in block_lines:
        s = re.sub(r"[\*\_]+", "", raw).strip()
        if not s:
            continue
        m = re.search(r"Level\s+(\d+)(?:\s+([A-Za-z0-9\-\s]+?)\s*(?:Ability)?)?$", s, flags=re.IGNORECASE)
        if m:
            metadata["level"] = int(m.group(1))
            subtype = m.group(2)
            if subtype:
                metadata["subtype"] = subtype.strip()
            continue
        kv = re.match(r"^\s*([^:]+):\s*(.+)$", s)
        if kv:
            k = camel_case(kv.group(1))
            v = kv.group(2).strip()
            if re.fullmatch(r"\d+", v):
                v = int(v)
            metadata[k] = v
            continue
        metadata.setdefault("notes", []).append(s)

    remaining = "\n".join(lines[i:]).lstrip("\r\n")
    return metadata, remaining

def extract_excerpt_from_markdown(text: str):
    lines = text.splitlines()
    para = []
    started = False
    for line in lines:
        s = line.strip()
        if not s:
            if started:
                break
            else:
                continue
        if s.startswith("#") or s.startswith(">"):
            continue
        para.append(s)
        started = True
    if not para:
        return ""
    ex = " ".join(para)
    ex = re.sub(r"[\*_]{1,3}", "", ex)
    ex = re.sub(r"\s+", " ", ex).strip()
    return ex[:400]

# ---------------------------------------------------------------------------
# File processing
# ---------------------------------------------------------------------------

def process_markdown_file(path: Path, local_dir: Path):
    # Skip README files
    if path.name.lower().startswith("readme"):
        return None

    raw = path.read_text(encoding="utf-8")
    # Normalize newlines and strip leading BOM / zero-width chars
    raw = raw.replace("\r\n", "\n").replace("\r", "\n")
    raw = remove_bom_and_invisibles(raw)

    # Extract frontmatter if present
    fm, raw = extract_frontmatter(raw)
    frontmatter = fm or {}

    # Remove first heading (title) robustly
    title, raw = remove_first_heading(raw)
    if not title:
        title = path.stem.replace("-", " ").replace("_", " ").strip()

    # Parse leading blockquote metadata and remove it
    meta_from_block, raw = parse_top_blockquote_lines(raw)

    # Merge metadata: blockquote first, frontmatter overrides
    metadata = {}
    if meta_from_block:
        metadata.update(meta_from_block)
    if frontmatter:
        for k, v in frontmatter.items():
            metadata[camel_case(str(k))] = v

    # Extract excerpt (after title removed)
    excerpt = extract_excerpt_from_markdown(raw)

    # Convert remaining Markdown to HTML
    import markdown as md
    html = md.markdown(raw.strip(), extensions=["extra", "sane_lists", "smarty"])

    # Derive type from top-level folder
    try:
        rel = path.relative_to(local_dir)
        top = rel.parts[0]
    except Exception:
        top = "unknown"
    top_lower = TYPE_MAP.get(top.lower(), top.lower())

    item = {
        "type": top_lower.upper(),
        "title": title.title(),
        "slug": slugify(title),
        "excerpt": excerpt,
        "content": html,
        "tags": metadata.get("tags") or [],
        "sourceRef": str(path.relative_to(local_dir)),
    }

    for mk, mv in metadata.items():
        if mk != "tags":
            item[mk] = mv

    return item

def collect_md_files(local_dir: Path):
    items = []
    for root, dirs, files in os.walk(local_dir):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for fname in files:
            if not fname.lower().endswith(".md"):
                continue
            path = Path(root) / fname
            it = process_markdown_file(path, local_dir)
            if it:
                items.append(it)
    return items

def dedupe_slugs(items):
    seen = {}
    for it in items:
        slug = it.get("slug") or slugify(it.get("title", ""))
        if slug in seen:
            seen[slug] += 1
            it["slug"] = f"{slug}-{seen[slug]}"
        else:
            seen[slug] = 1
    return items

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    install_if_missing("markdown")
    try:
        import yaml  # optional
    except Exception:
        pass

    clone_or_update()

    print("[scan] Collecting markdown files ...")
    items = collect_md_files(LOCAL_DIR)
    print(f"[scan] Processed {len(items)} markdown files → {len(items)} items")

    items = dedupe_slugs(items)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"[done] Wrote {len(items)} items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
