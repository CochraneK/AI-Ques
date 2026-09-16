# P005 · Future Me / 未来的我

> V0.7: true standalone runtime, explicit P004↔P005 consent, isolated peer context, and independent multimodal BYOK capabilities.

P005 是 BJTU P00 项目的未来自我模块。V0.2 以 MIT **Future You** 的公开研究机制为主线，并把 FutureMe 式时间胶囊降为对话后的可选延伸。

详细机制拆解见 [RESEARCH_NOTES.md](RESEARCH_NOTES.md)。

## V0.2 核心流程

```text
本模块基础资料
  ↓
一题一屏的人生故事访谈
  ↓
当前照片（可选）
  ↓
年龄变化 API（可选）
  ↓
Future / Synthetic Memory
  ↓
管理员设定时间点的可能未来自我揭示
  ↓
文本对话
  ↓
语音 / 分享卡 / 时间胶囊（增强层）
```

这对应 Future You 论文公开描述的四个核心模块：

1. Life Story Interface
2. Age-Progressed AI
3. Future Memory Architecture
4. Chat Interface

## UI 原则

P005 是 P00 “Less is more” 的参考实现。

- 一屏只做一件事；
- 一次只问一个问题；
- 白底、黑字、单一 Future Violet；
- 不用卡片墙表达信息架构；
- 不用玻璃拟态、霓虹、发光球体和无意义渐变制造“AI 感”；
- 高级功能采用 progressive disclosure；
- 文字、留白、节奏、头像与对话本身承担体验。

全局 UI 约束见 `docs/DESIGN_PRINCIPLES.md`。

## Life Story 输入

V0.2 按 Future You 的公开研究机制采用顺序式开放问题，覆盖：

- name / age / pronouns / location;
- current life;
- important people;
- proud point;
- low point;
- turning point;
- current challenge;
- long-term life project;
- future career;
- future financial situation;
- future family / relationships;
- future location;
- future daily life;
- values.


## Future Memory

P005 支持两层：

### 静态 fallback

没有后端时，使用确定性的本地生成逻辑，把用户输入组织成：

- summary;
- future vignette;
- rewarding / memorable memory;
- challenge / struggle memory;
- unexpected-outcome memory;
- timeline;

它只是架构演示，不等同于论文里的 LLM synthetic memory。

### Memory API

可配置：

```js
window.P005_FUTURE_ME_CONFIG = {
  memoryApi: "https://your-backend.example.com/p005/memory",
  chatApi: "https://your-backend.example.com/p005/chat",
  imageApi: "https://your-backend.example.com/p005/age-image",
  voiceApi: "https://your-backend.example.com/p005/voice",
  adminApi: "https://your-backend.example.com/p00/events"
};
```

Memory API 请求包含 `profile`、管理员设定的 `target`（1/2/3/4/10 年后或 60 岁时）与生成约束。默认是 **4 年后**。建议返回：

```json
{
  "summary": "...",
  "futureVignette": "...",
  "memories": ["...", "...", "..."],
  "timeline": [],
  "branch": null
}
```

## Chat

Future Me 的对话原则：

- 是管理员设定时间点的**一个可能未来自我**；
- 必须扎根于用户的 life story 与 future memory；
- 可以自然使用 “when I was your age...” 一类连续性语言；
- 同时讲预期内与预期外的人生结果；
- 更像 autobiographical mirror，而不是 counselor；
- 回答后可以反问，促进用户自己反思；
- 不声称预测、诊断、治疗或确定未来。

V0.2 按原 Future You 论文机制：累计 16 条有效交换消息后，才出现不抢注意力的“结束这次对话”入口。

## 图像与语音

- 图像年龄变化是可选 API，不连接时不伪造 aged result。
- 语音是增强层，默认核心体验仍是文本。
- 浏览器支持时可用 SpeechRecognition 与 speechSynthesis fallback。
- 个性化 / 克隆声音必须单独取得明确同意并设计删除机制。

2025 的 Future You 多模态研究提示：文本、语音、avatar 都可产生效果，交互质量、真实感和参与感比单纯增加视觉复杂度更重要。因此 P005 优先保证 autobiographical grounding 与对话质量，而不是堆多媒体。

## 数据

P005 V0.7 不再读取 P001–P003 的 shared profile、localStorage 或运行时对象。姓名、年龄、快速画像等需要的数据都由 P005 自己收集。

P005 自身状态：

```text
localStorage["bjtu.p005.state.v1"]
```

其中可能包含：
- life-story responses;
- future goals;
- future memory;
- conversation;
- current/future portraits;
- time capsules.

静态 GitHub Pages 仅用于原型。正式研究需要知情同意、伦理审批、数据保留 / 删除政策、媒体治理与服务端权限控制。

## 研究边界

P005 不用于：
- 预测具体人生事件；
- 临床诊断；
- 治疗；
- 替用户做职业、婚恋、医疗或财务决定；
- 声称生成内容就是用户真正的未来。

## 本地运行

```bash
python -m http.server 8000
```

访问：

```text
http://localhost:8000/p005/
```

## 质量检查

仓库 CI 会运行：

```bash
node --check p005/app.js
node --check p005/api-client.js
node tests/p005-runtime.mjs
node tests/structure.mjs
python scripts/quality_sensor.py --strict
```

## 主要公开资料

- MIT Future You project: https://www.media.mit.edu/projects/future-you/overview/
- Current Future You: https://futureyou.media.mit.edu/
- Future You 2024 paper: https://arxiv.org/abs/2405.12514
- Future You 2025 multimodal paper: https://arxiv.org/abs/2512.06106


## Future horizon / 管理员设置

默认 Future Me = **4 年后的自己**。

允许的管理员选项：

```text
1y / 2y / 3y / 4y / 10y / age60
```

静态原型的管理员入口：

```text
/p005/admin.html
```

它会写入：

```text
localStorage["bjtu.p005.admin.v1"]
```

正式部署不应依赖用户浏览器作为管理员权限来源；应由服务端或部署环境注入同名配置。

公开运行时配置在：

```text
p005/runtime-config.js
```

这里只放**后端 URL 和非敏感配置**，绝不能放模型厂商 API Key。

## API 最小集合

真实复刻建议至少提供 4 类后端能力：

1. **memoryApi**：把 life-story + goals 生成结构化 future memory。
2. **chatApi**：让 Future Me 基于 memory 持续对话。
3. **imageApi**：把当前照片自然年龄变化到目标年龄。
4. **adminApi**：接收完整文字填写记录、future memory、聊天与时间胶囊事件。

可选：

5. **voiceApi**：TTS / 实时语音；不接时浏览器可做基础朗读与听写。

正式研究仍推荐所有 provider key 只存在后端。为了 P004/P005 未来可独立演示，V0.6 另外提供 **BYOK 原型模式**：用户可在“模型”对话框中手动输入 OpenAI-compatible Base URL / Key / 模型名；Key 只写入当前标签页的 `sessionStorage`，关闭标签页即清除，不进入 P005 localStorage、导出文件或管理员 snapshot。

## 管理员数据

若 `adminApi` 已配置，P005 会发送：

- `session_started`
- `survey_answered`（每一题）
- `portrait_added`（只发送文件类型/大小/是否存在，不发送 base64 照片）
- `future_generated`
- `future_portrait_generated`
- `chat_turn`
- `capsule_saved`
- `export`
- `session_reset`

每个事件都附带当前 snapshot，因此服务端可以重建该 session 的全部**文字填写与对话记录**。

照片原文件如需管理员留存，应另做受保护的 media upload endpoint、知情同意、删除与保留策略；不要塞进通用事件 API。

## 与 MIT Future You 问题的一致性

**不是逐字 1:1。**

公开论文明确给出了问题类别和部分 prompt，但没有公开完整逐字 survey 文案。当前 P005 的题目按下列方式处理：

- 核心一致：name / age / pronouns / location / important people / proud point / low point / turning point / career / financial / family / personal-life future。
- 来自论文 future-memory prompt 的扩展：life project / future location / daily life。
- 来自当前 Future You 官网方向的扩展：values / goals。
- P005 自有扩展：current challenge，以及低负担中文版快速画像。
- 为降低不必要敏感数据收集，P005 **没有照论文 prompt 收集 sexual orientation**。

因此它是 **机制级忠实复刻 + 中文/研究伦理适配**，不是声称逐字复制原版问卷。


## V0.4 · 研究协议与低负担输入

管理员可以选择：

- `guided`（默认）：结构化低负担版。单选题尽量使用 MECE 分类；多维构念使用有限多选；每题只保留一个可选短补充。
- `replication`：论文对齐版。只显示 `paper-core` / `paper-prompt` 字段，并保持 sequential free-text。

这两个条件必须在论文中分开报告，不能把 guided 描述为原 Future You 问卷的直接复刻。

字段来源与偏差清单见：

`p005/METHODS_MAPPING.md`

## V0.4 · 语音

当前前端支持三层能力：

1. **voiceApi**：Future Me 文本 → 自然 TTS。请求会发送 `voiceId` 和中文风格 instructions。
2. **transcribeApi**：浏览器 MediaRecorder → 后端 STT → 文本回填到输入框。
3. **浏览器 fallback**：未配置后端时，用 SpeechRecognition / speechSynthesis（浏览器支持时）。

预留：

`realtimeSessionApi`

用于后续 WebRTC / full-duplex Realtime 会话。它需要后端签发临时会话凭证，不能把模型 API key 放到 GitHub Pages。

如果使用真实人物的 custom / cloned voice，必须使用该说话人的明确授权和同意流程，并记录 voice provenance / consent；默认产品不做未经授权的仿声。

## V0.4 · Future Me 个性化

Chat API 现在同时接收：

- `profile`
- `structuredAnswers`
- `personaBrief`
- `syntheticMemory`
- 对话历史
- future target

`personaBrief` 只包含用户侧安全信息：身份背景、重要关系、高光/低谷/转折、价值与长期目标，以及未来可接入的 P001 非临床画像。

P004 clinical-like inference 不进入 Future Me 用户侧人格事实。

## V0.4 · 结束与分享

聊天顶部始终提供“结束”按钮，确保用户可退出。

- replication 模式若不足 16 条有效交换，会明确提示，并记录 `endedEarly=true`；
- 达到 16 条时仍会出现与原论文机制一致的非侵入式完成入口。

结束后进入一张 1080×1440 的竖版分享卡片，内容包括：
- 现在的我 × N 年后的我；
- 最想守住的 3 个关键词；
- 一个 future memory 片段；
- Future Me 留下的一句话。

支持保存 PNG；浏览器支持 Web Share + files 时可直接调系统分享面板。


## V0.5 / V0.7 · 24 + 16 快速画像

P005 的低负担版保留两张极简矩阵：

- 24 个积极品质：最多选 6 个。
- 16 个重要价值：最多选 4 个。

V0.7 起，这两组内容是 **P005 自己拥有的 standalone asset**。内容研究脉络与项目里先前的 P001 设计同源，但运行时不会读取 P001 的结果、localStorage、`P00_CONTEXT`、`BJTU_PROFILE` 或任何共享资料。

因此把 P005 单独拆成仓库后，快速画像仍然完整可用。

## V0.5 · 中国背景低负担输入

guided 模式进一步收敛：

- 性别直接为“男 / 女”单选；
- “现在什么占据大部分时间”改为单一主要身份，覆盖本科、硕士、博士、其他学习、备考、全职、兼职、自由职业、创业、求职、照顾家庭、休学或间隔期、暂无固定安排等；
- 选项文案不使用斜杠拼接多个概念；
- “最重要的人”允许多选；
- 不再收集 A/B 决策题。

replication 模式仍保留论文公开字段的 sequential free-text，不受上述 guided 产品化改写影响。

## V0.5 · 分享卡片

分享页提供四种极简主题，使用同一份研究结果而不改变数据：

- 留白
- 暖纸
- 夜航
- 青简

卡片会优先展示 P001 复用/选择出的积极品质和重要价值，再加入 Future Memory 与 Future Me 的一句话。


## V0.6 · 页面内模型设置

P005 顶栏新增“模型”按钮。可在当前标签页内配置：

- Base URL
- API Key
- 文字对话模型
- 图像编辑/生成年龄化模型
- TTS 模型
- 语音转文字模型
- TTS voice

BYOK 使用 `p005/api-client.js`，目前按 OpenAI-compatible 路径调用：

- `/chat/completions`
- `/images/edits`
- `/audio/speech`
- `/audio/transcriptions`

模型名由用户或部署方填写，不属于研究协议的一部分。生产环境应优先改用服务端代理。

四种能力现在彼此独立：只配图像模型也能生成年龄化头像，只配 TTS/STT 也能使用语音，不再强制先配置文字模型。若文字模型已配置，它会优先用于 Future Memory JSON 与 Future Me 对话；失败后再降级到部署方 API 或本地 deterministic fallback。

## V0.6 · P004 ↔ P005

领导已决定 P004 与 P005 后续要能够**单独拿出去用**。

因此：

- P005 不读取 P001/P002/P003 的运行时数据；
- 24+16 快速画像由 P005 自带；
- 如果检测到 P004，P005 只展示一个**默认关闭**的“使用已有角色对话”选项；用户明确勾选后，才读取 P004 的用户发言与长期记忆文本；
- P005 永远不读取 `bjtu.p004.observer.v2`，也不把 PHQ/GAD/PCL/CAPE 或其他管理员推断当作用户事实；
- P004 读取 P005 同样要求 P004 侧用户显式授权；
- P004 原始对话在 P005 中属于 **model-only context**：不会复制进 P005 导出 JSON 或 admin snapshot，snapshot 只记录 consent 状态与条目计数。

所以 P004/P005 是**双向可互用、双向显式同意、各自可独立启动**。


## V0.7 · Self-audit fixes

V0.7 是一次架构清理而不是功能堆叠：

1. 移除 P005 对 `../shared/profile.js` 的页面依赖，首页标识也不再跳到父级 P00。
2. 删除 P001–P003 运行时读取；旧版 `p001Qualities / p001Values` 只做一次字段迁移，迁移后立即删除旧键。
3. P004 → P005 改成用户显式 opt-in；默认不读取。
4. P004 peer raw text 只注入生成/聊天模型，不进入 P005 export/admin snapshot。
5. P004 自身也不再读取全局 shared profile；只有在 P004 的 P005 授权开启时，才取 P005 的少量用户侧 profile。
6. BYOK chat / image / TTS / STT 改为独立能力。
7. 新增 `tests/p005-runtime.mjs`，CI 验证 image-only、voice-only、chat-only 配置和 session-only key 生命周期。
