# BJTU · P00 Lab

这个仓库现在是 **P001–P005 的统一入口与静态研究原型壳**，不再把 P002 当成整个仓库首页，也不再把 P005 叫作 side experiment。

## 模块

| 模块 | 方向 | 当前仓库状态 |
| --- | --- | --- |
| P001 | 现在的我 / 未来的我 / 理想的我 | 独立推进，待接入 |
| P002 | PCL-5 × Current CAPE-P15 交互实验 | `/p002/` |
| P003 | 人生模拟器 | 独立推进，待接入 |
| P004 | 对话式人物画像 | `/p004/` |
| P005 | Future Me / 未来自我 | `/p005/` |

线上入口：<https://cochranek.github.io/AI-Ques/>

## 统一资料

`shared/profile.js` 是唯一公共 profile adapter。

Canonical key：

~~~text
localStorage["bjtu.p00.profile.v1"]
~~~

公共 profile 只允许跨模块复用低敏感字段：

- name
- age
- origin
- location
- currentWork
- values

**禁止**把 P004 的 clinical-like inference、evidence quotes、安全状态等写进公共 profile。P004 的研究侧快照只保存在当前标签页的 `sessionStorage`；P005 的人生故事、对话、照片和时间胶囊保存在自己的模块状态中。

## 目录

~~~text
AI-Ques/
├── index.html               # P00 总入口
├── app.js                   # 总入口 + 公共资料编辑
├── styles.css
├── module-registry.json
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
~~~

## 研究与产品边界

- P002 的当前中文题干仍是原型转述，不能把原量表的验证结论自动继承给改写版本。
- P004 用户端只展示趣味 / 中性人物画像；临床样信号只属于研究侧启发式观察，不是标准化分数或诊断。
- P005 的 Future Me 是一种可能未来，不是预测、占卜或治疗建议。
- GitHub Pages 是静态原型，不构成正式的管理员权限或敏感数据治理方案。

## 本地运行

~~~bash
python -m http.server 8000
~~~

访问：

- `http://localhost:8000/`
- `http://localhost:8000/p002/`
- `http://localhost:8000/p004/`
- `http://localhost:8000/p005/`

## 质量检查

~~~bash
node --check app.js
node --check shared/profile.js
node --check p002/app.js
node --check p002/experiments.js
node --check p004/app.js
node --check p004/api-client.js
node --check p005/app.js
node tests/smoke.mjs
node tests/structure.mjs
python scripts/quality_sensor.py --strict
~~~

正式数据收集前仍需伦理审批、知情同意、目标语言验证/授权、版本冻结、风险处置和后端数据治理。
