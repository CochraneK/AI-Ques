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
60 岁可能未来自我揭示
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

Memory API 请求包含 `profile`、`targetAge: 60` 与生成约束。建议返回：

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
