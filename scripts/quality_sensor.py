#!/usr/bin/env python3
"""Stable, local quality sensor for AI-Ques."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    p = ROOT / path
    return p.read_text(encoding="utf-8") if p.exists() else ""


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
    app = read("app.js")
    experiments = read("experiments.js")
    readme = read("README.md")
    future_app = read("future-me/app.js")
    future_index = read("future-me/index.html")

    misleading = [
        ("app.js", "name:'原题'"),
        ("app.js", "tag:'对照基线'"),
        ("app.js", "故事中的真实量表题"),
        ("README.md", "原题（baseline）"),
    ]
    for path, needle in misleading:
        content = app if path == "app.js" else readme
        if needle in content:
            findings.append(finding(
                "misleading-baseline", "P0", path,
                f"Found misleading baseline language: {needle}",
                "Use direct-question / baseline-like wording until a validated target-language instrument is installed.",
            ))

    for path, content in [
        ("app.js", app),
        ("experiments.js", experiments),
        ("README.md", readme),
    ]:
        if "AI-Uni" in content:
            findings.append(finding(
                "legacy-brand", "P0", path,
                "Legacy AI-Uni branding remains.",
                "Rename the residue to AI-Ques.",
            ))

    if "关闭页面后仍会保留" not in future_index or "共用设备" not in future_index:
        findings.append(finding(
            "future-me-storage-disclosure", "P0", "future-me/index.html",
            "Future Me does not clearly disclose persistent browser storage and shared-device risk.",
            "Explain localStorage persistence before collection and expose a clear local-data reset action.",
        ))

    if "$('#memorySummary').innerHTML" in future_app:
        safe_tokens = [
            "escapeHtml(state.memory.summary)",
            "escapeHtml(x.tag)",
            "escapeHtml(x.text)",
        ]
        if not all(token in future_app for token in safe_tokens):
            findings.append(finding(
                "future-me-html-escaping", "P0", "future-me/app.js",
                "Dynamic Future Me memory content reaches innerHTML without consistent escaping.",
                "Escape every dynamic field or construct the DOM with textContent.",
            ))

    if "resetRun = function" in experiments or "renderStep = function" in experiments:
        findings.append(finding(
            "runtime-monkey-patch", "P1", "experiments.js",
            "Experimental modes replace core runtime functions at load time.",
            "Move modes behind a single explicit mode registry/interface instead of monkey-patching resetRun/renderStep.",
        ))
    elif "const MODE_HANDLERS = {}" not in app or "registerMode(" not in experiments:
        findings.append(finding(
            "missing-mode-registry", "P1", "app.js / experiments.js",
            "Experimental modes do not use the explicit core mode registry.",
            "Register experimental renderers through registerMode() and keep core dispatch ownership in app.js.",
        ))

    smoke_test = ROOT / "tests" / "smoke.mjs"
    if not smoke_test.exists():
        findings.append(finding(
            "missing-behavior-tests", "P1", "tests/smoke.mjs",
            "No executable behavior/smoke test exists.",
            "Add tests for mode registration, item counts, score ranges, and complete-run smoke paths.",
        ))

    manifest_path = ROOT / "study-manifest.json"
    if not manifest_path.exists():
        findings.append(finding(
            "missing-study-manifest", "P1", "study-manifest.json",
            "No frozen study/version manifest exists.",
            "Record study, scale, language, mode and item-bank versions before research data collection.",
        ))
    else:
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            required = {
                "schema_version", "study_id", "study_version", "status",
                "formal_data_collection_authorized", "language", "scales",
                "modes", "versioning_policy", "safety",
            }
            missing = sorted(required - manifest.keys())
            if missing:
                findings.append(finding(
                    "invalid-study-manifest", "P1", "study-manifest.json",
                    f"Study manifest is missing required keys: {missing}",
                    "Complete the manifest before treating the study version as frozen.",
                ))
            elif manifest.get("status") == "prototype_only" and manifest.get("formal_data_collection_authorized") is not False:
                findings.append(finding(
                    "unsafe-study-manifest-state", "P0", "study-manifest.json",
                    "Prototype-only manifest must not authorize formal data collection.",
                    "Keep formal_data_collection_authorized=false until research governance and version freezing are complete.",
                ))
        except json.JSONDecodeError as exc:
            findings.append(finding(
                "invalid-study-manifest-json", "P1", "study-manifest.json",
                f"Study manifest is not valid JSON: {exc}",
                "Fix the JSON so the manifest can be audited deterministically.",
            ))

    if (ROOT / "future-me").exists():
        findings.append(finding(
            "future-me-scope", "P2", "future-me/",
            "Future Me is still colocated with the assessment comparison product.",
            "Treat it as an independent lab/module or move it to a separate repository when convenient.",
        ))

    order = {"P0": 0, "P1": 1, "P2": 2}
    findings.sort(key=lambda x: (order[x["severity"]], x["path"], x["code"]))
    return findings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--strict", action="store_true", help="fail only when a P0 regression exists")
    args = parser.parse_args()

    findings = scan_repo()
    if args.json:
        print(json.dumps({"findings": findings}, ensure_ascii=False, indent=2))
    else:
        if not findings:
            print("AI-Ques quality sensor: no findings")
        for item in findings:
            print(f"[{item['severity']}] {item['code']} · {item['path']}")
            print(f"  {item['message']}")
            print(f"  next: {item['suggested_fix']}")
        counts = {s: sum(x["severity"] == s for x in findings) for s in ("P0", "P1", "P2")}
        print(f"summary: P0={counts['P0']} P1={counts['P1']} P2={counts['P2']}")

    return 1 if args.strict and any(x["severity"] == "P0" for x in findings) else 0


if __name__ == "__main__":
    raise SystemExit(main())