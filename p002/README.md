# P002 · PCL × CAPE Interaction Lab

P002 研究 PCL-5 与 Current CAPE-P15 在不同呈现/测量条件下的完成体验。参与者前端**不再选择玩法或实验条件**。

## 当前产品逻辑

参与者只选择量表：

- **PCL-5**
- **Current CAPE-P15**

实验呈现由 P002 管理员控制：

- **故事问卷（默认）**：保留核心题目与原反应格式，用中性故事段落串联。设计参考 VASSIP 的 storyfication / immersion / non-evaluable dynamics，但不把它作为参与者可选“玩法”。
- **直接问卷**：管理员可切换。去除故事段落，直接呈现题目与反应选项。
- **情景选择**：管理员可切换。用叙事情境与选择产生实验性行为信号；参考 HEXACO-RUSH / gamified SJT 路线，不继承 PCL-5 或 CAPE-P15 的标准计分解释。

**Emoji Game 已从产品与实验条件中删除。**

管理员页面：`/p002/admin.html`

当前静态原型把管理员配置保存在同一浏览器的 `bjtu.p002.condition.v1`。默认值是 `story`。这不是正式的多设备研究后台，也没有服务器端管理员鉴权。

## 统一研究数据契约

P002 已接入共享研究 runtime：

- 稳定 `participant_id`：`bjtu.p00.participant.v1`
- 每次开始新建 `session_id`，历史 session 不覆盖
- session 列表：`bjtu.p00.sessions.v1`
- item/event 流：`bjtu.p00.events.v1`
- 待同步队列：`bjtu.p00.pending-sync.v1`
- 事件至少包含 `participant_id / session_id / study_version / scale_id / condition_id / event_type / item_id / cluster / response / distress / response_ms / timestamp`
- 管理员页可查看本浏览器 P002 会话，并导出 JSON / CSV
- `shared/config.js` 中 `apiBase` 为空时只保存在本地；配置后按 `POST /v1/events` 尝试发送 pending events

因此当前版本已经具备**可追溯的本地研究事件流与同步队列**，但仍不把 GitHub Pages/localStorage 冒充正式研究后台。正式跨设备收数仍需服务端、管理员鉴权、数据保留/删除策略与伦理流程。

## 量表边界

### PCL-5

- 20 项
- 0–4 反应格式
- 过去一个月
- 全程围绕同一段最困扰的压力经历
- 回答这些问题在多大程度上“困扰到你”
- 当前中文题干仍是 prototype paraphrase，不声明为正式验证中文版

### Current CAPE-P15

- 15 项
- 过去 3 个月
- PI / BE / PA 三个维度
- 原始 Current CAPE-15 方案：0–3 频率
- 频率至少为“有时”时追加独立 0–3 distress
- 当前中文题干仍是 prototype paraphrase，不声明为正式验证中文版

## 呈现原则

- 参与者看不到实验条件选择器
- 参与者看不到 B/C/D/E 或 PI/BE/PA code
- 默认结果页只显示完成，不显示总分、cluster bar、SJT signal 或风险标签
- `?research=1` 仅用于研究检查视图
- `?source=1` 仅用于 PCL-5 source wording 核对

## 条件质量要求

- **故事问卷**：故事与中性互动不得直接提示目标构念，避免 priming；题目与反应格式保持不变
- **直接问卷**：不加入故事或额外互动
- **情景选择**：一个场景尽量只承载一个主要构念，不把 grounding、沟通技巧等 coping competence 当成症状强度；输出只作为实验信号

## 主要来源

- VA National Center for PTSD, PCL-5: https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp
- Capra et al. (2017), Current CAPE-15: https://doi.org/10.1111/eip.12245
- Ramos-Villagrasa et al. (2024), VASSIP: https://doi.org/10.1371/journal.pone.0302429
- Nikolaou & Katsadoraki (2025), HEXACO-RUSH: https://doi.org/10.1016/j.chb.2024.108467

## 研究状态

- `status = prototype_only`
- `formal_data_collection_authorized = false`
- 正式收数前需要冻结目标语言题干、条件逻辑、session schema、伦理/同意/退出流程和数据治理
