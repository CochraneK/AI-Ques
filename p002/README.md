# P002 · 情绪天气站

P002 聚焦 PCL-5 与 Current CAPE-P15 的研究型数字测量。

## v0.1

- PCL-5：过去 1 个月、20 项、0–4。
- Current CAPE-P15：过去 3 个月、15 项；本原型默认遵循原始 Current CAPE-P15 论文的 0–3 编码。
- CAPE-P15 在频率至少为“有时”时追问困扰度，并将频率与困扰分开保存。
- 两套量表共用 participant/session schema。
- 保存 item-level response、cluster、response time、study version。
- 提供完整 JSON 与逐题 CSV 下载。
- 当前页面不自动上传敏感答案。
- 参与者页面不显示诊断阈值或“风险等级”。

## 正式收数前必须冻结

1. 教授/医生确认目标语言量表版本与题干。
2. 确认 PCL-5 的 Criterion A / LEC-5 是否在其他环节完成。
3. 确认 CAPE-P15 研究采用的频率、困扰度和统计口径。
4. 完成伦理、知情同意、退出机制、风险处置与人工转介流程。
5. 冻结 study version 与数据字典。
6. 完成 participant_id / session 后端与隐私治理后，再接自动上传。

## 当前定位

这是 prototype-only 研究界面，不是医疗器械，也不提供诊断或治疗建议。

## Phase 1 presentation conditions

P002 currently supports two low-transformation conditions:

- `standard`: baseline-like presentation. No construct/cluster hints are shown during item answering.
- `guided`: same item wording, response options and scoring, with dimension cards and visual chapter guidance.

`condition_id` is stored at session and item level so engagement/completion differences can be tested without changing the measurement content.


## CAPE-P15 scoring scheme

当前默认 `current-cape-p15-original-0-3`：
- frequency: 0 never / 1 sometimes / 2 often / 3 nearly always
- distress: 0 not distressed / 1 a bit / 2 quite / 3 very distressed
- frequency >= 1 时追问 distress

部分后续研究把相同四档重编码为 1–4 并计算 weighted mean。正式研究必须在 manifest 中冻结 scoring scheme，不能把两套编码混用。
