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

所有 API key 都应只保存在后端。