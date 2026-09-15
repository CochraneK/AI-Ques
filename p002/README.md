# P002 · PCL × CAPE Interaction Lab

P002 专注于 **PCL-5** 与 **Current CAPE-P15** 的交互形式研究。当前仓库实现 8 种完成方式，用于比较体验变化与测量变化，不把任何未经验证的改写版本当作正式临床工具。

## 量表边界

- **PCL-5**：原始英文量表为 20 项、0–4 反应格式、过去一个月；官方版本可计算 0–80 总分与 B/C/D/E 聚类。本仓库中文题干是原型转述，因此本页数值仅用于原型内部比较，不直接继承验证版临床解释。
- **Current CAPE-P15**：15 项、过去 3 个月、三个维度（PI / BE / PA）。保留核心题干的模式使用原始 Current CAPE-15 论文的 0–3 频率编码；频率 ≥ 1（至少“有时”）时追加独立 0–3 困扰度。情景化/SJT 路径仍只输出实验信号，不继承该计分。
- 当前中文内容均不是仓库所声明的正式验证中文版。

## 8 种交互模式

1. 直接问卷
2. VASSIP 式
3. Emoji Game 式
4. 逐题情景化
5. 构念情景化
6. AI-SJT
7. PsychoGAT-lite
8. HEXACO-RUSH 式

越偏离直接呈现，越不能默认继承原量表的心理测量属性。

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

仓库 CI 会检查 JS 语法、2 个量表 × 8 种模式的 smoke path、目录结构和研究边界。

## 主要来源

- VA National Center for PTSD, PCL-5: https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp
- Capra et al. (2017), Current CAPE-15: https://doi.org/10.1111/eip.12245
- Ramos-Villagrasa et al. (2024), VASSIP: https://doi.org/10.1371/journal.pone.0302429
- Kleiman et al. (2025), Emoji Game: https://doi.org/10.1037/pas0001371
- Nikolaou & Katsadoraki (2025), HEXACO-RUSH: https://doi.org/10.1016/j.chb.2024.108467
- Yang et al. (2024), PsychoGAT: https://doi.org/10.18653/v1/2024.acl-long.779

## 安全

P002 不是诊断工具、医疗器械或临床筛查服务。正式研究需要伦理审批、知情同意、退出机制、数据治理和风险转介方案。


## 参与者呈现边界

直接问卷与 Emoji 等 baseline-like 路径默认不显示 B/C/D/E 或 PI/BE/PA code，也不把英文 source item 放在参与者题面。开发/核对时可使用 `?source=1` 显示 PCL-5 英文 source item。

这不是为了隐藏研究信息，而是为了避免 baseline 条件被构念标签或双语文本额外提示。
