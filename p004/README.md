# P004 · 角色世界

P004 v2 不再把“心理访谈”作为用户任务。它是一个 **可自定义 NPC / Character 的长期文字交流空间**，交互方向参考 SillyTavern、AI Town、Second Me、Janitor 等角色聊天产品；心理画像只作为后台 Observer 的研究性输出。

## 产品循环

```text
Character Card
  ↓
可选 NVWA Distill
  ↓
Local Skill Vault (SKILL.md)
  ↓
Character Chat Runtime
  ↓
Long-term Memory
  ↓
Background Observer
  ↓
Admin-only longitudinal portrait
```

### Character Card

用户可以创建和编辑 NPC：

- name / avatar
- identity & relationship
- personality / values / boundaries
- scenario
- expression style
- first message

Character（NPC 是谁）与 Persona（用户是谁）分离。Persona 继续读取 BJTU 项目共用的 `shared/profile.js`。

## NVWA 蒸馏

蒸馏是 **opt-in**，不是每个 NPC 的必经步骤。

- 关闭：直接使用 Character Card + Persona + 检索到的长期记忆聊天。
- 开启：调用 `POST /api/p004/distill`，后端按 [xmg2024/nvwa-skill](https://github.com/xmg2024/nvwa-skill) 的路线生成经验证的 `SKILL.md`。
- 蒸馏结果写入浏览器 IndexedDB 的 `bjtu-p004-skill-vault`，并可导出到本地真实文件。
- 后续 `/api/p004/chat` 会收到完整 Skill markdown，并把它作为角色思维 / 表达指令层，而不是当成普通文档引用。

如果没有配置后端，GitHub Pages 版只生成 **明确标注的 Character Skill 草稿**。它不会伪称已经完成 NVWA 的六路调研、三重验证或质量校验。

详细接口见 `NVWA_CONTRACT.md`。

## 长期记忆

原型按 NPC 分开保存长期记忆。生产版建议参考 AI Town 的做法：

1. 结束或阶段性对话后生成摘要；
2. 把稳定事实、偏好、关系事件、承诺和未完成话题做成 memory blocks；
3. embedding / vector retrieval；
4. 只把当前话题真正相关的少量记忆召回 prompt。

## Background Observer

Observer 与角色聊天解耦。它只读取**用户本人主动表达**的信息，并持续聚合多来源证据。

当前同源可读取：

- **P004**：用户对不同 NPC 的文本消息；
- **P005 / Future You**：开放式人生故事回答 + Future You 对话。

这意味着 Future You 已经问过的开放题不会在 P004 重新问一遍，只会成为统一人物画像的另一组证据。

普通用户界面不展示 Big Five、MBTI、PHQ/GAD/PCL/CAPE-like 或其他消极 / 临床化推断。研究原型的 `?admin=1` 只用于演示后台结构，**不是访问控制**；生产部署必须改为服务端账号、RBAC、审计与最小化数据访问。

## 安全层

角色设定、NVWA Skill 和沉浸式聊天不能覆盖即时安全路径。检测到明确自伤 / 自杀表达时，前台退出角色化回复并进入安全支持；管理员侧可记录事件，但普通用户不会看到临床标签。

## 运行

这是静态 GitHub Pages 原型：

```bash
python -m http.server 8000
```

打开 `/p004/`。如需真实 LLM / NVWA / Observer 后端，可在页面加载前设置：

```js
window.P004_CONFIG = {
  apiBase: "https://your-backend.example"
};
```

正式部署的服务端密钥应只保存在后端。P004 另外提供明确的用户自带密钥（BYOK）例外：用户主动填写的 OpenAI-compatible Key 只保存在当前标签页 sessionStorage，并由浏览器直接调用用户指定的服务。

## Design references

- SillyTavern: Character Cards, Personas and context-specific World Info / Lorebooks.
- AI Town: conversation summaries, memory retrieval and extensible agent runtime.
- Second Me: local-first identity/memory and role switching.
- NVWA Skill: research-driven distillation of thinking patterns rather than a shallow persona prompt.

P004 borrows these interaction patterns selectively; it is not a 1:1 clone of any one product.


## 前端 BYOK（OpenAI-compatible）

P004 支持用户在前端临时输入自己的 OpenAI-compatible 配置：

- Base URL，例如 `https://api.openai.com/v1`
- API Key
- Model
- 请求协议：`POST /chat/completions`
- 认证：`Authorization: Bearer <key>`

API Key 仅写入当前标签页的 `sessionStorage`，关闭标签页后清除；不会进入 GitHub 仓库、共享 profile、P004 Observer 或管理员画像。

这是有意提供的 **BYOK** 模式。它适合个人原型和测试，不等于服务端密钥安全方案。任何运行在同一页面里的前端脚本理论上都能访问该 Key，因此建议使用限额、可撤销、专用于本项目的 Key，并避免在公共设备上使用。

OpenAI 官方仍建议 API Key 不要暴露在浏览器客户端。P004 保留后端模式；若未来用于正式部署，仍建议切回服务端代理。

### BYOK 当前能力

前端 BYOK 当前只负责 **角色聊天**。长期记忆仍由本地逻辑保存，Observer 仍按本地研究原型运行；完整 NVWA 六路调研蒸馏仍需要正式后端。没有 NVWA 后端时，P004 只生成明确标注的 Character Skill 草稿。


## NPC 创建的理论分层

P004 将角色创建中的三个概念分开，避免把不同层次混成“性格标签”：

1. **关系**：用户与 NPC 的主要社会角色。当前按亲密、家庭、朋友、同伴、引导、专业、竞争/对立、陌生/未定八类组织。选择后不会自动跳转，用户点击“下一步”确认。
2. **品质**：使用 P001 同源的 **VIA 24 Character Strengths / 6 Virtues**。VIA 是有理论来源的性格优势分类，但 P004 不把它描述为严格 MECE；优势之间可以相关、共存，并随情境组合表达。
3. **聊天感觉**：使用 **Interpersonal Circumplex (IPC)**。以两条正交双极轴——Agency（主导↔跟随）与 Communion（温暖↔疏离）——划分八个扇区。P004 只让用户选一个主要感觉，避免原先“温柔/毒舌/浪漫/神秘”等不同层次标签互相重叠。

## FreeLLMAPI 本机直连

P004 API 设置提供 **FreeLLMAPI · 本机** preset：

- Base URL: `http://localhost:3001/v1`
- Model: `auto`
- Key: FreeLLMAPI dashboard 中的统一 `freellmapi-...` key

FreeLLMAPI 的浏览器 CORS 默认只允许它自己的 localhost dashboard origins。若从 GitHub Pages 的 P004 直接调用本机 FreeLLMAPI，需要在 FreeLLMAPI 环境中加入当前网页 origin，例如：

```env
DASHBOARD_ORIGINS=https://cochranek.github.io
```

然后重启 FreeLLMAPI。Origin 只包含 scheme + host + port，不包含 `/AI-Ques/p004/` 路径。

P004 的“测试连接”在 localhost:3001 出现 network error 时会显示上述 CORS 提示，并继续区分 HTTP、timeout、provider response 与一般网络错误。若 CORS 已放行但浏览器仍阻止访问 localhost，还应检查浏览器的本地网络访问权限。


## Privacy controls · v2.3

P004 对跨模块数据采用 **opt-in**：

- P004 自己的对话可以进入本模块的本地 Observer；
- P005 / Future You 的开放式回答与本人发言 **默认不会被 P004 读取**；
- 只有用户在 P004 的「数据」面板主动开启后，P005 才进入 P004 evidence pool；
- 用户关闭该开关时，P004 会撤回 P005 evidence，并从 P004 自身对话重新构建本地 Observer，避免 P005 对已有画像数值留下残余影响。

「数据」面板还提供 **清除全部 P004 本地数据**，覆盖：

- Character Cards
- P004 chat threads
- relationship memory
- Observer / safety evidence
- IndexedDB Skill Vault
- 当前标签页 BYOK API Key

它不会清除 P001 / P002 / P005 或全局 Persona。

## Safety boundary

静态 Pages 版本的即时风险识别只是一个 **best-effort keyword fallback**，用于在明显关键词出现时让角色扮演让位于安全支持。它不是经过验证的安全分类器，也不能作为生产级 Safety Agent。正式部署需要独立安全策略/分类层及覆盖率测试。

## Runtime tests

除静态结构检查外，P004 现在有 `tests/p004-runtime.mjs`，实际执行：

- P005 consent default-off / opt-in semantics；
- consent withdrawal evidence stripping core；
- creator step validation；
- local memory normalization；
- keyword safety fallback；
- OpenAI-compatible BYOK success；
- HTTP 401 error path；
- network/CORS failure path；
- temporary connection-test key restoration；
- session key clearing。

## Pinned NVWA protocol

P004 的 NVWA integration contract 固定到：

`xmg2024/nvwa-skill@fdb181f0e057e837e15942707b1ea35845850979`

而不是跟随可漂移的 `@main`。
