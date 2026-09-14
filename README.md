# AI-Uni

AI + 心理健康教育的低成本交互原型仓库。

当前版本把同一心理测评做成 **8 种不同完成方式**，重点比较：改编得越有趣，测量形式究竟改变了多少。

> 研究原型，不用于诊断。除“原题”外，任何重写、情景化、自动生成或游戏化版本都应先视为实验测验，不能直接继承原量表的效度、阈值或诊断解释。

## 当前量表

### 1. PCL-5

- PTSD Checklist for DSM-5，20 项。
- VA National Center for PTSD 官方说明为 public domain / not copyrighted。
- 过去一个月，0–4 级评分，总分 0–80。
- 可观察 DSM-5 的 B/C/D/E 症状簇。
- 本仓库保留公开英文来源题用于核对，中文为原型转述；正式部署应替换成合规、验证过的目标语言版本。

### 2. Current CAPE-P15

- 15 项，聚焦过去 3 个月的 psychotic-like experiences。
- 三个维度：Persecutory Ideation (PI, 5)、Bizarre Experiences (BE, 7)、Perceptual Abnormalities (PA, 3)。
- 当前原型按 1–4 编码频率，第一版暂未加入困扰度追问。
- 本仓库不宣称当前中文为正式验证中文版。

## 八种模式

### 1. 原题（baseline）

不加故事、不加 Emoji、不改写题目，作为所有实验模式的对照基线。

### 2. 原题逐题情景化（item-level scenario）

每一个原题都对应一个具体生活情景，保持“一题 ↔ 一情景”的映射。

适合研究：同一参与者完成原题和情景版后，逐题比较相关、均值偏移、回答分布与测量等价性。

### 3. 构念情景化（construct-level SJT）

不要求情景逐题对应，而是围绕 B/C/D/E 或 PI/BE/PA 构念设计多个独立情境。

输出的是构念信号，不是 PCL-5 / CAPE-P15 正式分数。

### 4. AI-SJT（当前为预生成题库）

遵循“构念 → 校园情境 → 梯度行为选项”的自动题目生成思路。

当前 GitHub Pages 版不调用在线 LLM，而是使用预生成并冻结的 AI-style SJT 题库，以保持零后端和可复现实验。后续接 LLM 时应加入：专家审核、去偏差、版本冻结、难度控制、重复题检测和心理测量验证。

### 5. PsychoGAT-lite

参考 Yang et al. (ACL 2024) 的 PsychoGAT（Psychological Game AgenTs）范式：

1. 标准量表提供心理构念和节点；
2. Game Designer 组织故事结构；
3. Game Controller 把当前节点实例化为互动剧情；
4. Critic 检查连贯性、选择偏差和遗漏；
5. Memory 保持长故事连续性；
6. psychometric evaluator 在后台根据选择计分。

当前仓库先实现 **10 回合、预生成内容的 PsychoGAT-lite**：玩家看不到原题，选择会进入故事记忆并影响连续体验，但结果只显示实验性构念信号。

这不是 PsychoGAT 作者官方代码的复现，也不宣称达到论文报告的心理测量性能。

### 6. VASSIP 式

原题和反应格式保持不变，在外面增加 storyfication、immersion 和不计分小游戏。

### 7. Emoji Game 式

原题和评分不变，只加入寻找 Emoji 的轻任务；Emoji 收集与心理得分完全分离。

### 8. HEXACO-RUSH 式

用连续情景决策推进故事，形成维度信号。它代表更深层的 game-based / SJT 路线，需要重新验证。

## 现在最值得比较的四个情景化层次

```text
原题
  ↓
逐题情景化        保留 item-level 对应
  ↓
构念情景化        只保留 construct-level 对应
  ↓
AI-SJT            自动生成大量候选情景
  ↓
PsychoGAT         把量表节点串成连续互动小说
```

越往下体验自由度越高，但越不能直接继承原量表的信效度。

## 运行

纯静态原型：

```bash
python -m http.server 8000
```

打开 `http://localhost:8000`。

线上 Demo：<https://cochranek.github.io/AI-Uni/>

## 推荐验证路线

1. **体验层**：完成率、耗时、漏答、主观负担、趣味性、沉浸感。
2. **逐题层**：原题 vs 逐题情景版，检查 item-level 相关和系统偏差。
3. **构念层**：原题 vs SJT / AI-SJT，检查内部一致性、收敛/区分效度、重测信度、因子结构。
4. **连续游戏层**：PsychoGAT / RUSH 需要单独建立计分模型，并预注册构念映射和验证方案。

## Sources

- PCL-5 official page, VA National Center for PTSD: https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp
- PCL-5 standard form: https://www.ptsd.va.gov/professional/assessment/documents/pcl5_standard_form.pdf
- Capra et al., *Current CAPE-15: a measure of recent psychotic-like experiences and associated distress*: https://doi.org/10.1111/eip.12245
- Ramos-Villagrasa et al. (2024), VASSIP: https://doi.org/10.1371/journal.pone.0302429
- Kleiman et al. (2025), Emoji Game: https://doi.org/10.1037/pas0001371
- Nikolaou & Katsadoraki (2025), HEXACO-RUSH: https://doi.org/10.1016/j.chb.2024.108467
- Yang et al. (2024), *PsychoGAT: A Novel Psychological Measurement Paradigm through Interactive Fiction Games with LLM Agents*: https://doi.org/10.18653/v1/2024.acl-long.779

## Safety / research boundary

本项目是研究与体验设计原型，不是医疗器械，不提供诊断或治疗建议。正式用于学生筛查前，需要完成伦理审批、知情同意、数据治理、目标语言版本授权/验证、风险处置与人工转介流程。