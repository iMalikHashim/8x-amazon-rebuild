#!/usr/bin/env python3
"""
8x assignment - automatic prompt/response capture hook for Claude Code.

Wired to two hook events in .claude/settings.json:
  - UserPromptSubmit: fires the moment a prompt is submitted -> logs the PROMPT.
  - Stop: fires at end-of-turn, receives a transcript path on stdin -> logs the
    final RESPONSE text for that turn (no thinking, no tool calls, no retries).

Never raises out to the caller: any internal failure is written to
capture-debug.log next to this script and the hook still exits 0, so a bug
here can never block or corrupt the interactive session.
"""

import sys
import os
import re
import json
import glob
import time
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
LOG_DIR = os.environ.get("CAPTURE_LOG_DIR", os.path.join(REPO_ROOT, ".agent-logs"))
DEBUG_LOG = os.path.join(SCRIPT_DIR, "capture-debug.log")

AUTHOR = "iMalikHashim"
PROJECT = "8x-amazon-rebuild"
TOOL = "claude-code"
DEFAULT_MODEL = "claude-sonnet-5"

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
FIELD_ORDER = [
    "session_id", "date", "author", "model", "tool", "project",
    "total_exchanges", "first_prompt_time", "last_prompt_time",
]


def debug(msg):
    try:
        with open(DEBUG_LOG, "a") as f:
            f.write(f"{datetime.now(timezone.utc).isoformat()} {msg}\n")
    except Exception:
        pass


def utc_now_iso():
    now = datetime.now(timezone.utc)
    return now.strftime("%Y-%m-%dT%H:%M:%S.") + f"{now.microsecond // 1000:03d}Z"


def read_stdin_json():
    try:
        raw = sys.stdin.read()
        return json.loads(raw) if raw.strip() else {}
    except Exception as e:
        debug(f"failed to parse stdin: {e}")
        return {}


def get_model_from_transcript(transcript_path, fallback=DEFAULT_MODEL):
    if not transcript_path or not os.path.exists(transcript_path):
        return fallback
    try:
        with open(transcript_path, "r") as f:
            lines = f.readlines()
        for line in reversed(lines):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            model = obj.get("message", {}).get("model")
            # "<synthetic>" marks harness-injected entries that are not real
            # model turns (e.g. a rate-limit notice) - skip past these to
            # find the last *real* model name instead of reporting them.
            if model and not (model.startswith("<") and model.endswith(">")):
                return model
    except Exception as e:
        debug(f"get_model_from_transcript error: {e}")
    return fallback


def _scan_transcript_for_final_text(transcript_path):
    """Return the last assistant text block in the transcript, or None if
    none is present yet. None (not an error) means "not written yet" -
    the caller retries; it is never mistaken for a real empty response."""
    with open(transcript_path, "r") as f:
        lines = f.readlines()
    for line in reversed(lines):
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if obj.get("type") == "assistant":
            content = obj.get("message", {}).get("content", [])
            texts = [
                c.get("text", "") for c in content
                if isinstance(c, dict) and c.get("type") == "text"
            ]
            text = "\n".join(t for t in texts if t.strip())
            if text.strip():
                return text
    return None


def get_final_response_text(transcript_path, retries=20, delay=0.25):
    """Poll the transcript for the final response text.

    The Stop hook can fire slightly before Claude Code finishes flushing
    the last assistant message to the transcript file on disk (observed:
    ~12s gap during the 8x capture-test verification on 2026-09-14, session
    835d9d63 - the hook read the file before line 34, the real final text,
    had been written, and correctly logged "not found" rather than
    guessing). Retrying for a few seconds closes that race instead of
    silently losing the response.
    """
    if not transcript_path or not os.path.exists(transcript_path):
        return "[no transcript available]"
    last_error = None
    for attempt in range(retries):
        try:
            text = _scan_transcript_for_final_text(transcript_path)
            if text is not None:
                return text
        except Exception as e:
            last_error = e
            debug(f"get_final_response_text attempt {attempt} error: {e}")
        time.sleep(delay)
    if last_error is not None:
        return f"[capture error reading transcript: {last_error}]"
    return "[no text response found in transcript after retrying]"


def find_log_path(session_id, ts):
    os.makedirs(LOG_DIR, exist_ok=True)
    matches = glob.glob(os.path.join(LOG_DIR, f"*_{session_id}.md"))
    if matches:
        return matches[0], False
    date_part = ts[:10]
    time_part = ts[11:19].replace(":", "-")
    fname = f"{date_part}_{time_part}_{session_id}.md"
    return os.path.join(LOG_DIR, fname), True


def parse_frontmatter(text):
    m = FRONTMATTER_RE.match(text)
    fm = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip()
    body = text[m.end():] if m else text
    return fm, body


def render_frontmatter(fm):
    lines = ["---"]
    for k in FIELD_ORDER:
        lines.append(f"{k}: {fm.get(k, '')}")
    lines.append("---")
    return "\n".join(lines) + "\n"


def load_or_init(path, session_id, ts, model):
    if os.path.exists(path):
        with open(path, "r") as f:
            text = f.read()
        return parse_frontmatter(text)
    fm = {
        "session_id": session_id,
        "date": ts[:10],
        "author": AUTHOR,
        "model": model,
        "tool": TOOL,
        "project": PROJECT,
        "total_exchanges": "0",
        "first_prompt_time": ts,
        "last_prompt_time": ts,
    }
    short = session_id[:8] if len(session_id) >= 8 else session_id
    body = (
        f"\n# Session Log - {ts[:10]}\n\n"
        f"Session: `{short}` | Project: `{PROJECT}` | Author: `{AUTHOR}`\n\n"
        "---\n"
    )
    return fm, body


def write_file(path, fm, body):
    with open(path, "w") as f:
        f.write(render_frontmatter(fm))
        f.write(body)


def handle_prompt(data):
    session_id = data.get("session_id", "unknown-session")
    transcript_path = data.get("transcript_path")
    prompt = data.get("prompt", "")
    ts = utc_now_iso()
    model = get_model_from_transcript(transcript_path)

    path, _ = find_log_path(session_id, ts)
    fm, body = load_or_init(path, session_id, ts, model)

    num = int(fm.get("total_exchanges", "0") or "0") + 1
    fm["model"] = model
    fm["last_prompt_time"] = ts
    if not fm.get("first_prompt_time"):
        fm["first_prompt_time"] = ts
    fm["total_exchanges"] = str(num)

    entry = (
        f"\n[LOG_ENTRY type=PROMPT num={num} session={session_id}]\n"
        f"timestamp: {ts}\n"
        f"model: {model}\n\n"
        f"{prompt}\n\n"
    )
    body += entry
    write_file(path, fm, body)


def handle_stop(data):
    session_id = data.get("session_id", "unknown-session")
    transcript_path = data.get("transcript_path")
    ts = utc_now_iso()
    model = get_model_from_transcript(transcript_path)

    path, is_new = find_log_path(session_id, ts)
    if is_new:
        # A response arrived with no matching prompt entry on disk yet.
        fm, body = load_or_init(path, session_id, ts, model)
        num = 1
        fm["total_exchanges"] = "1"
    else:
        with open(path, "r") as f:
            text = f.read()
        fm, body = parse_frontmatter(text)
        num = int(fm.get("total_exchanges", "1") or "1")
        fm["model"] = model

    response_text = get_final_response_text(transcript_path)
    entry = (
        f"\n[LOG_ENTRY type=RESPONSE num={num} session={session_id}]\n"
        f"timestamp: {ts}\n"
        f"model: {model}\n\n"
        f"{response_text}\n\n"
    )
    body += entry
    write_file(path, fm, body)


def main():
    try:
        data = read_stdin_json()
        event = data.get("hook_event_name", "")
        if event == "UserPromptSubmit":
            handle_prompt(data)
        elif event == "Stop":
            handle_stop(data)
        else:
            debug(f"ignored event: {event!r}")
    except Exception as e:
        debug(f"top-level failure: {e}")
    sys.exit(0)


if __name__ == "__main__":
    main()
