#!/usr/bin/env python3
"""
Proof that capture.py's secret redaction actually fires, at two levels:

  1. Unit-level: redact_secrets() directly, against real-shaped secrets
     (including the exact Neon URL shape that leaked on 2026-09-14) and
     against ordinary prose that must NOT be touched.

  2. End-to-end: invoke capture.py exactly as Claude Code's hook runner
     does - JSON on stdin, CAPTURE_LOG_DIR pointed at a scratch temp dir -
     for both the UserPromptSubmit and Stop events, then read the log
     file capture.py wrote and confirm the secret never reached disk.

Run: python3 .claude/hooks/test_capture_redaction.py
Exits 0 and prints "ALL PASSED" iff every case holds; otherwise prints
the failing case and exits 1.
"""

import json
import os
import subprocess
import sys
import tempfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CAPTURE_PY = os.path.join(SCRIPT_DIR, "capture.py")

sys.path.insert(0, SCRIPT_DIR)
from capture import redact_secrets  # noqa: E402

failures = []


def check(label, condition):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        failures.append(label)


# --- 1. Unit-level: redact_secrets() -------------------------------------

leaked_shape = (
    "postgresql://neondb_owner:npg_DGQVE31AhIkH@ep-restless-firefly-a5jn3441"
    "-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
)
redacted = redact_secrets(leaked_shape)
check("exact leaked-shape Neon URL is fully redacted", "npg_DGQVE31AhIkH" not in redacted)
check("exact leaked-shape Neon URL leaves the placeholder", "[REDACTED-DB-URL]" in redacted)

check(
    "bare postgres:// URL (no npg_ prefix) is redacted",
    "hunter2pass" not in redact_secrets("connect via postgres://admin:hunter2pass@db.example.com:5432/app"),
)
check(
    "mysql:// URL is redacted",
    "s3cr3t" not in redact_secrets("mysql://root:s3cr3t@127.0.0.1/db"),
)
check(
    "bare npg_ token outside a URL is redacted",
    "npg_anotherRealLookingSecret1" not in redact_secrets("the password is npg_anotherRealLookingSecret1 apparently"),
)
check(
    "OpenAI/Anthropic-style sk- key is redacted",
    "sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789" not in
    redact_secrets("ANTHROPIC_API_KEY=sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789"),
)
check(
    "AWS access key id is redacted",
    "AKIAABCDEFGHIJKLMNOP" not in redact_secrets("key id AKIAABCDEFGHIJKLMNOP in the config"),
)
check(
    "GitHub PAT is redacted",
    "ghp_1234567890abcdefghijklmnopqrstuvwx" not in
    redact_secrets("token: ghp_1234567890abcdefghijklmnopqrstuvwx"),
)
check(
    "JWT-looking string is redacted",
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
    not in redact_secrets(
        "Authorization: Bearer "
        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
    ),
)
check(
    "generic PASSWORD= assignment with a digit is redacted",
    "correcthorse42" not in redact_secrets("PASSWORD=correcthorse42"),
)
check(
    "generic api_key: assignment with a digit is redacted",
    "abc123def456" not in redact_secrets('config = { api_key: "abc123def456" }'),
)

# --- Negative cases: ordinary text must survive untouched -----------------

prose = (
    "Sessions are opaque random-token sessions stored in a DB table, not "
    "JWT, so there's no SESSION_SECRET to configure. Passwords are "
    "bcrypt-hashed before they touch the database."
)
check("ordinary prose about tokens/passwords is left untouched", redact_secrets(prose) == prose)

code_passthrough = 'body: JSON.stringify({ email: email.trim(), password: password })'
check(
    "variable passthrough (no literal secret) is left untouched",
    redact_secrets(code_passthrough) == code_passthrough,
)

# --- 2. End-to-end: run the real hook binary, prove the file on disk is clean --

SECRET_URL = (
    "postgresql://neondb_owner:npg_ThisIsATestSecretNotReal99@"
    "ep-example-test-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
)


def run_hook(event_payload, env_overrides):
    env = dict(os.environ)
    env.update(env_overrides)
    result = subprocess.run(
        [sys.executable, CAPTURE_PY],
        input=json.dumps(event_payload),
        capture_output=True,
        text=True,
        env=env,
        timeout=15,
    )
    return result


with tempfile.TemporaryDirectory() as scratch_log_dir, tempfile.TemporaryDirectory() as scratch_transcript_dir:
    session_id = "redaction-selftest-0000"
    transcript_path = os.path.join(scratch_transcript_dir, "transcript.jsonl")

    # UserPromptSubmit: simulate the user pasting the secret as a prompt,
    # exactly how the real 2026-09-14 leak happened.
    prompt_payload = {
        "hook_event_name": "UserPromptSubmit",
        "session_id": session_id,
        "transcript_path": transcript_path,
        "prompt": f"Here's the connection string: {SECRET_URL}",
    }
    r1 = run_hook(prompt_payload, {"CAPTURE_LOG_DIR": scratch_log_dir})
    check("hook process exits 0 on UserPromptSubmit", r1.returncode == 0)

    log_files = os.listdir(scratch_log_dir)
    check("hook wrote exactly one log file", len(log_files) == 1)
    log_path = os.path.join(scratch_log_dir, log_files[0]) if log_files else None
    prompt_log_text = open(log_path).read() if log_path else ""

    check(
        "written log file does NOT contain the secret (PROMPT path)",
        "npg_ThisIsATestSecretNotReal99" not in prompt_log_text,
    )
    check(
        "written log file DOES contain the redaction placeholder (PROMPT path)",
        "[REDACTED-DB-URL]" in prompt_log_text,
    )

    # Stop: simulate a final assistant response that echoes a secret back.
    with open(transcript_path, "w") as f:
        f.write(json.dumps({
            "type": "assistant",
            "message": {
                "model": "claude-sonnet-5",
                "content": [{"type": "text", "text": f"Done - I used {SECRET_URL} to connect."}],
            },
        }) + "\n")

    stop_payload = {
        "hook_event_name": "Stop",
        "session_id": session_id,
        "transcript_path": transcript_path,
    }
    r2 = run_hook(stop_payload, {"CAPTURE_LOG_DIR": scratch_log_dir})
    check("hook process exits 0 on Stop", r2.returncode == 0)

    full_log_text = open(log_path).read() if log_path else ""
    check(
        "written log file does NOT contain the secret (RESPONSE path)",
        "npg_ThisIsATestSecretNotReal99" not in full_log_text,
    )
    check(
        "written log file DOES contain the redaction placeholder (RESPONSE path)",
        full_log_text.count("[REDACTED-DB-URL]") == 2,
    )


print()
if failures:
    print(f"{len(failures)} CHECK(S) FAILED:")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("ALL PASSED")
sys.exit(0)
