# AI-Uni

AI + 心理健康教育的低成本交互原型仓库。

当前版本先做一件事：**把传统量表的完成体验变得更有参与感，同时明确区分“标准量表计分”和“实验性游戏推断”。**

## 当前量表

### 1. PCL-5

- PTSD Checklist for DSM-5，20 项。
- 官方页面明确说明该量表由 VA National Center for PTSD 开发，**public domain / not copyrighted**。
- 过去一个月，0–4 级评分，总分 0–80。
- 可计算 DSM-5 的 B/C/D/E 症状簇；正式筛查/解释应由合格专业人员结合使用目的与人群完成。
- 本仓库保留公开英文原题作为来源核对，并提供**非验证的中文原型转述**用于 UI 演示。

### 2. Current CAPE-P15

- 15 项，聚焦过去 3 个月的 psychotic-like experiences。
- 三个维度：Persecutory Ideation (PI, 5)、Bizarre Experiences (BE, 7)、Perceptual Abnormalities (PA, 3)。
- 文献版本常用 1–4 的 4 级频率，并可对出现的体验追加困扰度；当前原型按 1–4 编码频率，第一版暂未加入困扰度追问。
- 本仓库暂不复制/宣称任何“正式中文版”；UI 使用**基于公开构念与项目内容的原型中文转述**，正式研究必须替换成有授权/合规、经过验证的目标语言版本。

## 三种玩法

### VASSIP 式（推荐第一版）

VASSIP 的关键不是重写量表，而是：

1. 原题与反应格式保持不变；
2. 增加 storyfication（故事化）；
3. 增加 immersion（视觉/环境沉浸）；
4. 穿插不参与测评计分的 puzzles / decisions。

本仓库把 PCL-5 的 B/C/D/E，以及 CAPE-P15 的 PI/BE/PA 分别包装成章节。真正计分的仍是量表回答。

### Emoji Game 式（成本最低）

保持题目和评分完全不变，只随机出现可寻找的小 emoji。Emoji 收集数量与量表分数完全分离。

适合做 A/B 测试：传统版 vs Emoji 版，对比完成率、时长、漏答、主观负担与回答分布。

### HEXACO-RUSH 式（实验版）

把目标构念转成连续校园情景，让用户通过选择推进故事，形成维度“信号”。

**这一版本不是 PCL-5/CAPE-P15 的替代计分方式。** 在重新完成心理测量学验证前，不输出正式量表分数、风险标签或诊断结论。

## 运行

这是纯静态原型：

```bash
python -m http.server 8000
```

打开 `http://localhost:8000`。

也可以直接部署到 GitHub Pages。

## 推荐的验证路线

第一阶段只验证体验：完成率、耗时、漏答率、主观吸引力、舒适度。

第二阶段做同被试对照：标准量表 + 游戏化版本，检查均值差异、相关、内部一致性、顺序效应。

第三阶段才验证 HEXACO-RUSH 式版本：预注册构念映射，扩大样本，做因子结构、收敛/区分效度、重测信度与必要的分类性能。

## Sources

- PCL-5 official page, VA National Center for PTSD: https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp
- PCL-5 standard form: https://www.ptsd.va.gov/professional/assessment/documents/pcl5_standard_form.pdf
- Capra et al., *Current CAPE-15: a measure of recent psychotic-like experiences and associated distress*: https://doi.org/10.1111/eip.12245
- Ramos-Villagrasa et al. (2024), VASSIP: https://doi.org/10.1371/journal.pone.0302429
- Kleiman et al. (2025), Emoji Game: https://doi.org/10.1037/pas0001371
- Nikolaou & Katsadoraki (2025), HEXACO-RUSH: https://doi.org/10.1016/j.chb.2024.108467

## Safety / research boundary

本项目是研究与体验设计原型，不是医疗器械，不提供诊断或治疗建议。正式用于学生筛查前，需要完成伦理审批、知情同意、数据治理、目标语言版本授权/验证、风险处置与人工转介流程。
