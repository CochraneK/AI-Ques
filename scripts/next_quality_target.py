#!/usr/bin/env python3
"""Select the next small, reviewable AI-Ques hardening target."""
from __future__ import annotations

import json
from quality_sensor import scan_repo


def main() -> int:
    findings = scan_repo()
    if not findings:
        print(json.dumps({"status": "at-set-point"}, ensure_ascii=False, indent=2))
        return 0

    severity = findings[0]["severity"]
    same_band = [f for f in findings if f["severity"] == severity]
    selected = same_band[0]
    print(json.dumps({
        "status": "target-selected",
        "policy": "one reviewable target per iteration",
        "target": selected,
        "remaining_in_same_band": max(0, len(same_band) - 1),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
