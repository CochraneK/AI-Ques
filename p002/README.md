# P002 · PCL × CAPE Interaction Lab

P002 专注于 **PCL-5** 与 **Current CAPE-P15** 的交互形式研究。当前前台只保留 **3 个一级测量形式**，避免把自创工程变体当成独立科学范式。

## 量表边界

- **PCL-5**：原始英文量表为 20 项、0–4 反应格式、过去一个月；官方版本可计算 0–80 总分与 B/C/D/E 聚类。本仓库中文题干是原型转述，因此本页数值仅用于原型内部比较，不直接继承验证版临床解释。
- **Current CAPE-P15**：15 项、过去 3 个月、三个维度（PI / BE / PA）。保留核心题干的模式使用原始 Current CAPE-15 论文的 0–3 频率编码；频率 ≥ 1（至少“有时”）时追加独立 0–3 困扰度。情景化/SJT 路径仍只输出实验信号，不继承该计分。
- 当前中文内容均不是仓库所声明的正式验证中文版。

## 3 种当前启用的一级研究条件

这 3 种按同一个轴分类：**测量形式被改变到什么程度**。在这个限定范围内它们互斥且覆盖完整：不改变 → 保留题目的游戏化 → 改写为情境/行为选择。

1. **直接问卷**：不改变测量形式，作为 baseline。
2. **故事化问卷（VASSIP-inspired）**：仍然是原题目 + 原反应格式，只在外层增加 storyfication / immersion / non-evaluable dynamics。直接论文：Ramos-Villagrasa et al. (2024)。
3. **情境选择（HEXACO-RUSH / gamified-SJT inspired）**：核心测量方法改变为情境判断与行为选择。直接论文：Nikolaou & Katsadoraki (2025)；更一般的 gamified SJT 文献也支持这一类。

**Emoji Game 不再是一级条件。** Kleiman et al. (2025) 研究的是 EMA adherence：把 Emoji 随机嵌入某个 survey question，提高完成率。它更适合定义为可跨条件叠加的 engagement/adherence mechanic，而不是与“问卷 / 游戏化问卷 / 情境测量”同层级的测量形式。

### 已删除的独立玩法

- **逐题情景化**：没有找到直接验证这一具体 P002 玩法的论文；与 SJT / storification 范式重叠，因此不单列。
- **构念情景化**：SJT 的 construct-level 文献存在，但当前实现是我们自定义的中间态，与 HEXACO-RUSH/SJT 重叠，因此不单列。
- **AI-SJT**：LLM 生成 SJT 已有论文支持，但“AI”描述的是题目生成方法，不是独立参与者体验机制；因此从前台玩法删除，未来作为 HEXACO-RUSH/SJT 的 **authoring pipeline** 使用。
- **PsychoGAT 静态版**：PsychoGAT 本身有论文支持，但固定节点实现没有其关键 agent 机制，而且落在“情境/互动式测量”大类内部，因此当前禁用。
- **Emoji Game 作为独立玩法**：有论文支持，但论文主要针对 EMA adherence；它属于 engagement mechanic，不是独立测量形式。未来如研究完成率，可作为跨条件 modifier 重新启用。

因此，P002 的分类按“主要交互/测量机制”分组，而不是按实现技术分组。

## 研究版本

机器可读研究边界见 `study-manifest.json`。当前：

- `status = prototype_only`
- `formal_data_collection_authorized = false`
- 正式收数前必须冻结题干、模式、评分逻辑、版本和参与者 session schema。

## 运行与检查

从仓库根目录运行：

~~~bash
python -m http.server 8000
~~~

访问 `http://localhost:8000/p002/`。

仓库 CI 会检查 JS 语法、2 个量表 × 3 种模式的 smoke path、目录结构和研究边界。

## 主要来源

- VA National Center for PTSD, PCL-5: https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp
- Capra et al. (2017), Current CAPE-15: https://doi.org/10.1111/eip.12245
- Ramos-Villagrasa et al. (2024), VASSIP: https://doi.org/10.1371/journal.pone.0302429
- Kleiman et al. (2025), Emoji Game: https://doi.org/10.1037/pas0001371
- Nikolaou & Katsadoraki (2025), HEXACO-RUSH: https://doi.org/10.1016/j.chb.2024.108467
- Yang et al. (2024), PsychoGAT: https://doi.org/10.18653/v1/2024.acl-long.779
- Jiang et al. (2025), LLM-generated SJT authoring: https://doi.org/10.1186/s40359-025-03613-z
- Personality SJT automatic item generation with LLMs (2026): https://doi.org/10.1016/j.chbr.2026.100964

## 安全

P002 不是诊断工具、医疗器械或临床筛查服务。正式研究需要伦理审批、知情同意、退出机制、数据治理和风险转介方案。


## 参与者呈现边界

直接问卷等 baseline-like 路径默认不显示 B/C/D/E 或 PI/BE/PA code，也不把英文 source item 放在参与者题面。开发/核对时可使用 `?source=1` 显示 PCL-5 英文 source item。

这不是为了隐藏研究信息，而是为了避免 baseline 条件被构念标签或双语文本额外提示。


## 质量审计规则

当前原型增加以下硬约束：

- PCL-5：始终以同一段最困扰的压力经历为参照，并按“过去一个月被困扰的程度”作答；不把 0–4 误写成频率。
- CAPE-P15：过去 3 个月，0–3 频率；至少“有时”后追加独立 0–3 distress。
- VASSIP：不计分互动必须与 B/C/D/E 或 PI/BE/PA 构念无关，避免先行 priming。
- HEXACO-RUSH / SJT：情景一次只承载一个主要构念，不把 grounding、沟通技巧等 coping competence 当成症状强度。
- PsychoGAT：当前不作为参与者条件启用；只有实现论文范式的关键 agent 机制后才可重新进入 mode registry。
- 默认结果页只显示“完成”，不向参与者显示总分、cluster bars、SJT signal 或风险解释；研究检查可使用 `?research=1`。
- 正式 mode comparison 应由研究协议分配条件；`?mode=<mode_id>` 可锁定单一条件，避免参与者在正式研究中自选玩法。
