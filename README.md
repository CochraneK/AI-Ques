<div align="center">

# AI-Ques · P00 Lab

**一组共享资料层、彼此隔离敏感状态的心理与未来自我交互研究原型。**

<p>
  <img alt="Research prototype" src="https://img.shields.io/badge/type-research%20prototype-6C63FF">
  <img alt="Static frontend" src="https://img.shields.io/badge/frontend-static%20HTML%20%2F%20CSS%20%2F%20JS-2F80ED">
  <img alt="Modules" src="https://img.shields.io/badge/modules-P001%E2%80%93P005-27AE60">
  <img alt="Privacy boundary" src="https://img.shields.io/badge/privacy-local%20%2F%20session%20scoped-F2994A">
</p>

[**在线体验**](https://cochranek.github.io/AI-Ques/) · [**架构说明**](docs/ARCHITECTURE.md) · [**Agent handoff**](HANDOFF.md) · [**当前状态**](STATUS.md) · [**质量检查**](#质量检查) · [**研究边界**](#研究与产品边界)

</div>

---

## 这是什么

AI-Ques 是 **P001–P005 的统一入口与静态研究原型壳**。它把多个心理、自我概念与未来自我方向的实验模块放进同一套前端工作台，同时明确区分：

- **可跨模块复用的低敏感资料**；
- **只属于单个模块的实验状态**；
- **用户可见的交互体验**；
- **研究侧或临床样启发式信息**。

> [!IMPORTANT]
> 这个仓库是研究与产品原型，不是诊断工具，也不会让改写题项、启发式画像或 Future Me 自动继承原量表、临床系统或预测模型的效度。

## 模块地图

| 模块 | 方向 | 当前入口 | 状态 |
| --- | --- | --- | --- |
| **P001** | 现在的我 / 理想的我 / 未来的我 | [`/p001/`](https://cochranek.github.io/AI-Ques/p001/) | 已接入 |
| **P002** | PCL-5 × Current CAPE-P15 交互实验 | [`/p002/`](https://cochranek.github.io/AI-Ques/p002/) | 已接入 |
| **P003** | 人生模拟器 | 独立推进 | 待接入 |
| **P004** | 对话式人物画像 | [`/p004/`](https://cochranek.github.io/AI-Ques/p004/) | 已接入 |
| **P005** | Future Me / 未来自我 | [`/p005/`](https://cochranek.github.io/AI-Ques/p005/) | 已接入 |

## 统一资料层

`shared/profile.js` 是唯一公共 profile adapter。

Canonical key：

```text
localStorage["bjtu.p00.profile.v1"]
```

公共 profile 只允许跨模块复用低敏感字段：

- `name`
- `age`
- `origin`
- `location`
- `currentWork`
- `values`

> [!CAUTION]
> **禁止**把 P004 的 clinical-like inference、evidence quotes、安全状态等写进公共 profile。P004 的研究侧快照只保存在当前标签页的 `sessionStorage`；P005 的人生故事、对话、照片和时间胶囊保存在自己的模块状态中。

## 项目结构

```text
AI-Ques/
├── index.html               # P00 总入口
├── app.js                   # 总入口 + 公共资料编辑
├── styles.css
├── module-registry.json
├── p001/                    # 自我概念 / 理想自我 / 未来自我交互原型
├── shared/
│   └── profile.js           # 唯一公共 profile adapter
├── p002/                    # PCL / CAPE 交互实验
├── p004/                    # 对话式人物画像
├── p005/                    # Future Me
├── future-me/               # 仅兼容旧 URL 的跳转页
├── docs/
│   └── ARCHITECTURE.md
├── scripts/
│   └── quality_sensor.py
└── tests/
```

## Agent / 跨对话连续性

新的 Agent、账号、电脑或对话优先读取：

```text
AGENTS.md
→ HANDOFF.md
→ STATUS.md
→ DECISIONS.md
→ docs/ARCHITECTURE.md
→ 目标模块自己的 canonical files
```

Git 是长期 canonical state；这些 handoff 文件只负责把当前状态、边界和下一步说清楚，不替代 `module-registry.json` 或模块原生实现。

## 研究与产品边界

| 模块 | 当前边界 |
| --- | --- |
| **P002** | 当前中文题干仍是原型转述，不能把原量表的验证结论自动继承给改写版本。 |
| **P004** | 用户端只展示趣味 / 中性人物画像；临床样信号只属于研究侧启发式观察，不是标准化分数或诊断。 |
| **P005** | Future Me 是一种可能未来，不是预测、占卜或治疗建议。 |
| **GitHub Pages** | 静态原型不构成正式的管理员权限或敏感数据治理方案。 |

## 本地运行

```bash
python -m http.server 8000
```

然后访问：

- `http://localhost:8000/`
- `http://localhost:8000/p001/`
- `http://localhost:8000/p002/`
- `http://localhost:8000/p004/`
- `http://localhost:8000/p005/`

## 质量检查

```bash
node --check app.js
node --check p001/report.js
node --check p001/static-api.js
node --check shared/profile.js
node --check p002/app.js
node --check p002/experiments.js
node --check p004/app.js
node --check p004/api-client.js
node --check p005/app.js
node tests/smoke.mjs
node tests/structure.mjs
python scripts/quality_sensor.py --strict
```

> [!NOTE]
> 正式数据收集前仍需伦理审批、知情同意、目标语言验证 / 授权、版本冻结、风险处置和后端数据治理。
