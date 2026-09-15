#!/usr/bin/env python3
"""Repository-wide quality sensor for the BJTU P00 hub."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    file = ROOT / path
    return file.read_text(encoding="utf-8") if file.exists() else ""


def finding(code: str, severity: str, path: str, message: str, fix: str) -> dict:
    return {
        "code": code,
        "severity": severity,
        "path": path,
        "message": message,
        "suggested_fix": fix,
    }


def scan_repo() -> list[dict]:
    findings: list[dict] = []

    root_index = read("index.html")
    shared = read("shared/profile.js")
    p002_app = read("p002/app.js")
    p002_readme = read("p002/README.md")
    p004_app = read("p004/app.js")
    p004_index = read("p004/index.html")
    p005_app = read("p005/app.js")
    p005_index = read("p005/index.html")

    required = [
        "module-registry.json",
        "docs/ARCHITECTURE.md",
        "shared/profile.js",
        "p002/index.html",
        "p002/app.js",
        "p002/experiments.js",
        "p002/study-manifest.json",
        "p004/index.html",
        "p004/app.js",
        "p004/module-manifest.json",
        "p005/index.html",
        "p005/app.js",
        "p005/module-manifest.json",
        "tests/smoke.mjs",
        "tests/structure.mjs",
    ]
    for path in required:
        if not (ROOT / path).exists():
            findings.append(finding(
                "missing-canonical-file", "P0", path,
                "A required hub/module boundary file is missing.",
                "Restore the canonical module file or update the registry and tests intentionally.",
            ))

    obsolete = [
        "experiments.js",
        "study-manifest.json",
        "QUALITY_LOOP.md",
        "scripts/next_quality_target.py",
        ".github/agent-memory/ai-ques-hardening.md",
        ".claude/skills/ai-ques-hardening/SKILL.md",
        ".claude/skills/ai-ques-hardening/references/response-template.md",
    ]
    for path in obsolete:
        if (ROOT / path).exists():
            findings.append(finding(
                "obsolete-root-residue", "P1", path,
                "Obsolete pre-hub or internal agent-control material remains in the public repository.",
                "Delete it or move durable product rules into docs/ARCHITECTURE.md.",
            ))

    legacy_dir = ROOT / "future-me"
    if legacy_dir.exists():
        legacy_files = sorted(x.name for x in legacy_dir.iterdir() if x.is_file())
        if legacy_files != ["index.html"]:
            findings.append(finding(
                "duplicated-p005-legacy", "P1", "future-me/",
                f"Legacy Future Me route contains duplicate assets: {legacy_files}",
                "Keep only a redirect index.html and maintain P005 under p005/.",
            ))

    try:
        registry = json.loads(read("module-registry.json"))
        modules = {item["id"]: item for item in registry.get("modules", [])}
        if registry.get("shared_profile", {}).get("key") != "bjtu.p00.profile.v1":
            findings.append(finding(
                "wrong-shared-profile-key", "P0", "module-registry.json",
                "Module registry does not point to the canonical public profile key.",
                "Use bjtu.p00.profile.v1 through shared/profile.js.",
            ))
        for module_id, expected_path in {"P002": "p002/", "P004": "p004/", "P005": "p005/"}.items():
            if modules.get(module_id, {}).get("path") != expected_path:
                findings.append(finding(
                    "wrong-module-path", "P0", "module-registry.json",
                    f"{module_id} is not registered at {expected_path}.",
                    "Keep canonical numbered module paths consistent across registry, hub and docs.",
                ))
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        findings.append(finding(
            "invalid-module-registry", "P0", "module-registry.json",
            f"Module registry cannot be audited: {exc}",
            "Fix module-registry.json.",
        ))

    if 'href="p002/"' not in root_index or 'href="p004/"' not in root_index or 'href="p005/"' not in root_index:
        findings.append(finding(
            "hub-missing-live-module", "P0", "index.html",
            "Root hub does not link all live modules P002/P004/P005.",
            "Restore canonical module cards on the P00 hub.",
        ))
    if "SIDE EXPERIMENT" in root_index:
        findings.append(finding(
            "legacy-side-experiment-label", "P1", "index.html",
            "P005 is still framed as a side experiment.",
            "Treat numbered modules as peers in the hub.",
        ))

    if "bjtu.p00.profile.v1" not in shared:
        findings.append(finding(
            "shared-profile-missing-canonical-key", "P0", "shared/profile.js",
            "Shared profile adapter does not own the canonical key.",
            "Centralize cross-module public profile access in shared/profile.js.",
        ))

    forbidden_shared_terms = ["clinicalInference", "evidenceQuotes", "safetyState"]
    for term in forbidden_shared_terms:
        if term in shared:
            findings.append(finding(
                "sensitive-field-in-shared-profile", "P0", "shared/profile.js",
                f"Sensitive/admin field appears in public profile adapter: {term}",
                "Keep clinical inference, raw evidence and safety state module-private/admin-side.",
            ))

    misleading_p002 = [
        "标准评分可保留",
        "验证版心理测量金标准",
    ]
    for needle in misleading_p002:
        if needle in p002_app and needle == "标准评分可保留":
            findings.append(finding(
                "p002-overclaims-score-portability", "P0", "p002/app.js",
                f"Prototype UI contains over-strong score portability language: {needle}",
                "Describe response-format preservation without claiming validation transfers to paraphrased items.",
            ))
    if "formal_data_collection_authorized" not in read("p002/study-manifest.json"):
        findings.append(finding(
            "p002-missing-study-state", "P0", "p002/study-manifest.json",
            "P002 study manifest lacks formal data collection state.",
            "Keep explicit prototype/research governance flags.",
        ))

    if "aiques.global.profile.v1" in p004_app:
        findings.append(finding(
            "p004-legacy-global-storage", "P0", "p004/app.js",
            "P004 still writes to the old mixed public/private profile namespace.",
            "Use sessionStorage for private inference and shared/profile.js only for public reusable fields.",
        ))
    if "sessionStorage.setItem(K" not in p004_app or "bjtu.p004.session.v1" not in p004_app:
        findings.append(finding(
            "p004-private-storage-boundary", "P0", "p004/app.js",
            "P004 private inference is not isolated in its session namespace.",
            "Keep research-side inference in bjtu.p004.session.v1 or a protected backend.",
        ))
    if "confidence:" in p004_app:
        findings.append(finding(
            "p004-pseudo-confidence", "P1", "p004/app.js",
            "P004 exposes a heuristic number as confidence.",
            "Use evidence strength/coverage wording unless a calibrated confidence model exists.",
        ))
    if "sessionStorage" not in p004_index or "清除本次画像" not in p004_index:
        findings.append(finding(
            "p004-storage-disclosure", "P0", "p004/index.html",
            "P004 does not accurately disclose or clear its private browser session state.",
            "Explain tab-scoped storage and expose a real clear action.",
        ))

    if "bjtu.p005.state.v1" not in p005_app:
        findings.append(finding(
            "p005-storage-namespace", "P0", "p005/app.js",
            "P005 does not use its canonical module storage namespace.",
            "Use bjtu.p005.state.v1 and migrate legacy keys only.",
        ))
    if "const SHARED_KEYS" in p005_app:
        findings.append(finding(
            "p005-duplicate-shared-profile-logic", "P1", "p005/app.js",
            "P005 still owns a parallel list of global profile keys.",
            "Delegate shared profile access to shared/profile.js.",
        ))
    if "BJTU_PROFILE" not in p005_app:
        findings.append(finding(
            "p005-shared-adapter-missing", "P0", "p005/app.js",
            "P005 is not using the canonical shared profile adapter.",
            "Read/write public cross-module fields through BJTU_PROFILE.",
        ))

    if "关闭页面后仍会保留" not in p005_index or "共用设备" not in p005_index:
        findings.append(finding(
            "p005-storage-disclosure", "P0", "p005/index.html",
            "P005 does not clearly disclose persistent browser storage and shared-device risk.",
            "Disclose persistence before collecting narrative data and expose clearing controls.",
        ))

    if "$('#memorySummary').innerHTML" in p005_app:
        safe_tokens = [
            "escapeHtml(state.memory.summary)",
            "escapeHtml(x.tag)",
            "escapeHtml(x.text)",
        ]
        if not all(token in p005_app for token in safe_tokens):
            findings.append(finding(
                "p005-html-escaping", "P0", "p005/app.js",
                "Dynamic Future Me content reaches innerHTML without the expected escaping.",
                "Escape every dynamic field or build DOM nodes with textContent.",
            ))

    if "P004" not in p004_readme := read("p004/README.md"):
        findings.append(finding(
            "p004-doc-missing", "P1", "p004/README.md",
            "P004 module documentation is incomplete.",
            "Keep module-local architecture/privacy documentation.",
        ))
    if "P005" not in read("p005/README.md"):
        findings.append(finding(
            "p005-doc-missing", "P1", "p005/README.md",
            "P005 module documentation is incomplete.",
            "Keep module-local API/privacy documentation.",
        ))
    if "P002" not in p002_readme:
        findings.append(finding(
            "p002-doc-missing", "P1", "p002/README.md",
            "P002 module documentation is incomplete.",
            "Keep module-local psychometric/research documentation.",
        ))

    order = {"P0": 0, "P1": 1, "P2": 2}
    findings.sort(key=lambda x: (order[x["severity"]], x["path"], x["code"]))
    return findings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--strict", action="store_true", help="fail when a P0 regression exists")
    args = parser.parse_args()

    findings = scan_repo()
    if args.json:
        print(json.dumps({"findings": findings}, ensure_ascii=False, indent=2))
    else:
        if not findings:
            print("P00 quality sensor: no findings")
        for item in findings:
            print(f"[{item['severity']}] {item['code']} · {item['path']}")
            print(f"  {item['message']}")
            print(f"  next: {item['suggested_fix']}")
        counts = {s: sum(x["severity"] == s for x in findings) for s in ("P0", "P1", "P2")}
        print(f"summary: P0={counts['P0']} P1={counts['P1']} P2={counts['P2']}")

    return 1 if args.strict and any(x["severity"] == "P0" for x in findings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
