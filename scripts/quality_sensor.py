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
    research_config = read("shared/config.js")
    research_core = read("shared/core.js")
    p002_app = read("p002/app.js")
    p002_readme = read("p002/README.md")
    p002_manifest = read("p002/study-manifest.json")
    p002_index = read("p002/index.html")
    p002_config = read("p002/condition-config.js")
    p002_admin = read("p002/admin.js")
    p004_app = read("p004/app.js")
    p004_core = read("p004/core.js")
    p004_index = read("p004/index.html")
    p005_app = read("p005/app.js")
    p005_index = read("p005/index.html")

    required = [
        "module-registry.json",
        "docs/ARCHITECTURE.md",
        "shared/profile.js",
        "shared/config.js",
        "shared/core.js",
        "p002/index.html",
        "p002/app.js",
        "p002/condition-config.js",
        "p002/admin.html",
        "p002/admin.js",
        "p002/admin.css",
        "p002/study-manifest.json",
        "p002/RESEARCH_NOTES.md",
        "p002/BACKEND_CONTRACT.md",
        "p004/index.html",
        "p004/core.js",
        "p004/app.js",
        "p004/module-manifest.json",
        "p004/NVWA_CONTRACT.md",
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

    for needle, code, message in [
        ("scoreOffset:1", "p002-cape-old-encoding", "P002 still applies the obsolete CAPE +1 score offset."),
        ("高信号", "p002-item-feedback-priming", "P002 participant flow contains item-level signal feedback."),
        ("中等信号", "p002-item-feedback-priming", "P002 participant flow contains item-level signal feedback."),
        ("构念启发", "p002-construct-cue", "P002 participant flow exposes construct-language cues."),
        ("Emoji Game", "p002-emoji-residue", "P002 participant runtime still contains the retired Emoji Game."),
    ]:
        if needle in p002_app:
            findings.append(finding(
                code, "P0", "p002/app.js", message,
                "Keep participant-facing assessment UI low-noise and aligned with the frozen protocol.",
            ))

    if "cape-p15-published-1-4" not in p002_app or "1-4 frequency + conditional 1-4 distress" not in p002_manifest:
        findings.append(finding(
            "p002-cape-scoring-contract", "P0", "p002/",
            "P002 CAPE response coding is not frozen to the published 1-4 questionnaire format.",
            "Keep 1-4 frequency plus conditional 1-4 distress in app and manifest; derive zero-based values only downstream.",
        ))

    for stale in ["current-cape-p15-original-0-3", "0-3 frequency + conditional 0-3 distress", "原始 Current CAPE-15 论文使用 0–3"]:
        if stale in p002_app or stale in p002_manifest or stale in p002_readme:
            findings.append(finding(
                "p002-cape-stale-zero-based-claim", "P0", "p002/",
                f"P002 still contains a stale zero-based CAPE claim: {stale}",
                "Use published 1-4 response codes and keep any zero-based transform explicit and derived.",
            ))

    if "choiceValues:[1,2,3,4]" not in p002_app or "distressValues:[1,2,3,4]" not in p002_app or "score>1" not in p002_app:
        findings.append(finding(
            "p002-cape-runtime-codes", "P0", "p002/app.js",
            "P002 CAPE runtime no longer stores 1-4 response codes or uses the correct endorsement gate.",
            "Keep frequency/distress values at 1-4 and trigger distress only when frequency > 1.",
        ))

    p002_notes = read("p002/RESEARCH_NOTES.md")
    if "10.1016/j.schres.2020.06.003" not in p002_notes or "10.1080/26408066.2019.1676858" not in p002_notes:
        findings.append(finding(
            "p002-instrument-evidence-notes", "P0", "p002/RESEARCH_NOTES.md",
            "P002 instrument evidence notes no longer record the reviewed Chinese CAPE/PCL evidence.",
            "Keep the reviewed evidence references and the explicit non-equivalence of repository paraphrases.",
        ))

    if "同一段最困扰的压力经历" not in p002_app or "困扰到你" not in p002_app:
        findings.append(finding(
            "p002-pcl-anchor", "P0", "p002/app.js",
            "PCL participant instructions do not preserve the single-event bother anchor.",
            "Keep one stressful-event anchor and rate how much each problem bothered the participant in the past month.",
        ))

    if "modeChoices" in p002_index or "data-mode" in p002_index:
        findings.append(finding(
            "p002-participant-condition-picker", "P0", "p002/index.html",
            "Participants can still select an experimental presentation condition.",
            "Keep condition assignment admin-controlled and remove participant mode selectors.",
        ))

    if "bjtu.p002.condition.v1" not in p002_config or "condition:'story'" not in p002_config:
        findings.append(finding(
            "p002-story-default", "P0", "p002/condition-config.js",
            "P002 no longer defaults to the story questionnaire when no admin setting exists.",
            "Keep story as the default and persist admin overrides under bjtu.p002.condition.v1.",
        ))

    if "direct" not in p002_config or "scenario" not in p002_config or "cfg.write(selected)" not in p002_admin:
        findings.append(finding(
            "p002-admin-condition-control", "P0", "p002/",
            "P002 admin control does not expose direct/scenario condition assignment.",
            "Keep direct and scenario assignment available only through the administrator control surface.",
        ))

    try:
        _p002_manifest = json.loads(p002_manifest)
        control = _p002_manifest.get("presentation_control", {})
        if control.get("participant_can_choose_condition") is not False or control.get("default_condition") != "story":
            findings.append(finding(
                "p002-manifest-condition-contract", "P0", "p002/study-manifest.json",
                "P002 manifest no longer matches the admin-controlled story-default protocol.",
                "Freeze participant_can_choose_condition=false and default_condition=story.",
            ))
    except json.JSONDecodeError:
        pass

    for needle, code, message in [
        ("bjtu.p00.runtime.v1", "p00-runtime-config-key", "Shared runtime config key is missing."),
    ]:
        if needle not in research_config:
            findings.append(finding(
                code, "P0", "shared/config.js", message,
                "Keep the canonical runtime config namespace stable.",
            ))

    for needle, code, message in [
        ("bjtu.p00.participant.v1", "p00-participant-id-store", "Stable participant_id storage is missing."),
        ("bjtu.p00.sessions.v1", "p00-session-store", "Shared session history storage is missing."),
        ("bjtu.p00.events.v1", "p00-event-store", "Shared event storage is missing."),
        ("bjtu.p00.pending-sync.v1", "p00-pending-sync-store", "Pending sync queue is missing."),
        ("createSession", "p00-session-runtime", "Shared research core cannot create sessions."),
        ("appendEvent", "p00-event-runtime", "Shared research core cannot append events."),
        ("'/v1/events'", "p00-event-sync-endpoint", "Shared research core no longer targets POST /v1/events."),
    ]:
        if needle not in research_core:
            findings.append(finding(
                code, "P0", "shared/core.js", message,
                "Restore the canonical participant/session/event runtime.",
            ))

    if "RESEARCH.createSession" not in p002_app or "recordEvent('item_response'" not in p002_app:
        findings.append(finding(
            "p002-event-stream", "P0", "p002/app.js",
            "P002 no longer writes item-level research events under participant/session identifiers.",
            "Create a new session per run and append item_response events with condition and timing metadata.",
        ))

    if "session_interrupted" not in p002_app or "session_completed" not in p002_app:
        findings.append(finding(
            "p002-session-lifecycle", "P0", "p002/app.js",
            "P002 session lifecycle completion/interruption events are missing.",
            "Persist explicit completed/interrupted lifecycle events.",
        ))

    if "本地数据说明" not in p002_index or "clearLocalBtn" not in p002_index or "clearProjectData(PROJECT_ID)" not in p002_app:
        findings.append(finding(
            "p002-participant-storage-control", "P0", "p002/",
            "P002 persists sensitive questionnaire events without the expected participant storage disclosure or P002-scoped deletion control.",
            "Disclose browser persistence before start and keep participant-accessible P002-scoped local deletion.",
        ))

    if "clearProjectData" not in research_core:
        findings.append(finding(
            "p00-project-data-clear", "P0", "shared/core.js",
            "Shared research runtime cannot clear one project's sessions/events/pending queue.",
            "Keep project-scoped deletion without deleting the shared participant_id.",
        ))

    if "apiBaseInput" not in read("p002/admin.html") or "runtime.write({apiBase:value})" not in p002_admin:
        findings.append(finding(
            "p002-admin-api-config", "P0", "p002/",
            "P002 admin cannot configure the non-secret research API base through the UI.",
            "Expose apiBase configuration without storing administrator secrets in client code.",
        ))

    if "readinessList" not in read("p002/admin.html") or "renderReadiness" not in p002_admin:
        findings.append(finding(
            "p002-formal-readiness-ui", "P0", "p002/",
            "P002 admin no longer exposes the formal collection readiness gate.",
            "Render the machine-readable manifest blockers in the administrator surface.",
        ))

    backend_contract = read("p002/BACKEND_CONTRACT.md")
    for needle in ["POST /v1/events", "GET /v1/admin/events", "idempotency", "role-based", "withdrawal"]:
        if needle not in backend_contract:
            findings.append(finding(
                "p002-backend-contract", "P0", "p002/BACKEND_CONTRACT.md",
                f"P002 production backend contract is missing: {needle}",
                "Keep ingestion, authenticated admin access, idempotency, withdrawal/deletion and RBAC requirements explicit.",
            ))

    if "exportJsonBtn" not in p002_admin or "exportCsvBtn" not in p002_admin or "flushPending" not in p002_admin:
        findings.append(finding(
            "p002-admin-export-sync", "P0", "p002/admin.js",
            "P002 admin lacks local JSON/CSV export or pending-sync control.",
            "Keep administrator review/export and pending-sync controls wired to the shared research runtime.",
        ))

    try:
        _p002_manifest_data = json.loads(p002_manifest)
        contract = _p002_manifest_data.get("data_contract", {})
        if _p002_manifest_data.get("study_version") != "0.12.0-prototype" or contract.get("sync", {}).get("cross_device_sync_available") is not False:
            findings.append(finding(
                "p002-data-contract-manifest", "P0", "p002/study-manifest.json",
                "P002 data contract version or cross-device boundary is not frozen.",
                "Keep study_version and explicit cross-device=false boundary aligned with the runtime.",
            ))
        gate = _p002_manifest_data.get("formal_collection_gate", {})
        blockers = gate.get("blockers", [])
        if gate.get("ready") is not False or len(blockers) < 6:
            findings.append(finding(
                "p002-formal-collection-gate", "P0", "p002/study-manifest.json",
                "P002 formal collection gate is missing or incorrectly reports readiness.",
                "Keep formal collection blocked until all external/production requirements have recorded evidence.",
            ))
        local_clear = contract.get("local_clear", {})
        if local_clear.get("participant_available") is not True or local_clear.get("admin_available") is not True or local_clear.get("preserves_shared_participant_id") is not True:
            findings.append(finding(
                "p002-local-delete-contract", "P0", "p002/study-manifest.json",
                "P002 local deletion contract is incomplete.",
                "Keep participant/admin project-scoped deletion while preserving the shared participant_id.",
            ))
    except json.JSONDecodeError:
        pass

    if "aiques.global.profile.v1" in p004_app:
        findings.append(finding(
            "p004-legacy-global-storage", "P0", "p004/app.js",
            "P004 still uses the old mixed public/private profile namespace.",
            "Use shared/profile.js only for reusable public Persona fields and keep observer evidence in a P004-only namespace or protected backend.",
        ))
    if "bjtu.p004.observer.v2" not in p004_core or "BJTU_PROFILE.update" in p004_app:
        findings.append(finding(
            "p004-private-storage-boundary", "P0", "p004/app.js",
            "P004 longitudinal observer evidence is not isolated from the shared public profile.",
            "Keep research-side evidence in the P004 observer namespace / protected backend and never write it through BJTU_PROFILE.update.",
        ))
    if "confidence:" in p004_app:
        findings.append(finding(
            "p004-pseudo-confidence", "P1", "p004/app.js",
            "P004 exposes a heuristic number as confidence.",
            "Use evidence strength/coverage wording unless a calibrated confidence model exists.",
        ))
    if "BACKGROUND OBSERVER" not in p004_index or "IndexedDB" not in p004_index:
        findings.append(finding(
            "p004-storage-disclosure", "P0", "p004/index.html",
            "P004 does not disclose its background evidence accumulation and local Skill Vault behavior.",
            "Disclose cross-module observer accumulation and browser-local Skill storage in the public interface.",
        ))
    if "doNotExposeClinicalLabels:true" not in p004_app or "roleplayMustYieldToSafety:true" not in p004_app:
        findings.append(finding(
            "p004-user-safety-boundary", "P0", "p004/app.js",
            "P004 chat runtime is missing the user-facing clinical-label guardrail or safety override.",
            "Keep clinical inference admin-only and make immediate safety override character roleplay.",
        ))

    if "p005Observer:false" not in p004_core or "CORE.canImportP005(consentState())" not in p004_app:
        findings.append(finding(
            "p004-cross-module-consent", "P0", "p004/",
            "P004 P005/Future You observer import is not explicitly opt-in by default.",
            "Default P005 observer import to off and gate import on explicit consent.",
        ))
    if "clearP004LocalData" not in p004_app or "clearP004DataBtn" not in p004_index:
        findings.append(finding(
            "p004-local-data-clearing", "P0", "p004/",
            "P004 lacks a visible all-local-data clearing path.",
            "Expose a control that clears P004 localStorage, Skill Vault and current-tab BYOK key without deleting other modules.",
        ))
    if "xmg2024/nvwa-skill@main" in p004_app or "xmg2024/nvwa-skill@main" in read("p004/NVWA_CONTRACT.md"):
        findings.append(finding(
            "p004-mutable-nvwa-protocol", "P1", "p004/",
            "P004 references the mutable NVWA main branch as its protocol version.",
            "Pin the NVWA protocol to an exact reviewed commit or release.",
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
            "escapeHtml(state.memory.summary",
            "memories.map((x)=>'<p>'+escapeHtml(x)",
        ]
        if not all(token in p005_app for token in safe_tokens):
            findings.append(finding(
                "p005-html-escaping", "P0", "p005/app.js",
                "Dynamic Future Me content reaches innerHTML without the expected escaping.",
                "Escape every dynamic field or build DOM nodes with textContent.",
            ))

    design_principles = read("docs/DESIGN_PRINCIPLES.md")
    if "Less is more" not in design_principles:
        findings.append(finding(
            "missing-design-principle", "P1", "docs/DESIGN_PRINCIPLES.md",
            "The repository no longer records the standing minimalist UI constraint.",
            "Keep Less is more as the default P001–P005 design rule.",
        ))

    if "const QUESTIONS = [" not in p005_app or "surveyIndex" not in p005_app:
        findings.append(finding(
            "p005-nonsequential-intake", "P1", "p005/app.js",
            "P005 no longer implements the Future You-style sequential intake.",
            "Keep life-story intake one question at a time unless the research protocol intentionally changes.",
        ))

    if "exchanged<16" not in p005_app:
        findings.append(finding(
            "p005-chat-finish-threshold", "P1", "p005/app.js",
            "P005 no longer mirrors the non-intrusive chat finish threshold.",
            "Keep the finish control hidden until 16 effective exchanged messages, or document a deliberate protocol change.",
        ))

    p004_readme = read("p004/README.md")
    if "P004" not in p004_readme:
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
