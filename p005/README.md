# P005 · Future Me / 未来的我

P005 是 BJTU P00 项目的未来自我模块。V0.2 以 MIT **Future You** 的公开研究机制为主线，并把 FutureMe 式时间胶囊降为对话后的可选延伸。

详细机制拆解见 [RESEARCH_NOTES.md](RESEARCH_NOTES.md)。

## V0.2 核心流程

```text
共享基础资料
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
语音 / A-B 分支 / 时间胶囊（增强层）
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

最后保留一个可选 A/B 决策问题，对应当前 Future You “Paths” 的探索方向，但不会替用户判断哪条路正确。

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
- optional A/B branch.

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

- 是**一个可能的** 60 岁未来自我；
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

公共跨模块资料只通过：

```text
shared/profile.js
localStorage["bjtu.p00.profile.v1"]
```

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

前端不会直接保存 OpenAI、Anthropic 或其他模型提供商的 secret key。所有 provider key 必须只存在后端。

## 管理员数据

若 `adminApi` 已配置，P005 会发送：

- `session_started`
- `survey_answered`（每一题，含 A/B）
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
- P005 自有、可选扩展：current challenge / A-B decision。
- 为降低不必要敏感数据收集，P005 **没有照论文 prompt 收集 sexual orientation**。

因此它是 **机制级忠实复刻 + 中文/研究伦理适配**，不是声称逐字复制原版问卷。
