# P005 · Future Me / 未来的我

P005 是 BJTU 项目中的“未来自我”交互模块。它参考 MIT **Future You** 的公开研究架构与 **FutureMe** 的时间胶囊机制，但不复制其品牌、受保护素材或界面代码。

当前版本是一个可直接部署到 GitHub Pages 的研究 / 产品原型：没有后端时也能完整体验；配置后端后，可以逐步替换成本地 fallback 之外的 LLM、图像年龄变化、语音与管理员数据同步。

## 当前体验

1. **现在的我**：读取 P001–P004 可能已经写入的共享资料，并允许补充当前照片。
2. **人生线索**：重要的人、骄傲时刻、低谷、转折点。
3. **未来方向**：挑战、长期项目、职业、价值观、关系、财务、地点与日常。
4. **多未来分支**：可选输入一个真实 A/B 决策，同时生成两种可能路径，而不是替用户决定。
5. **Synthetic Memory**：根据前述信息生成一条从现在到 60 岁的“可能人生线”。
6. **Future Me 对话**：默认使用确定性的本地 fallback；接入后端后可使用真实 LLM。
7. **语音模式**：浏览器支持时可语音听写，并自动朗读 Future Me 回复；也可接独立语音 API。
8. **未来头像**：上传当前照片并预留年龄变化 API；未接 API 时明确使用当前照片占位，不伪装成真实年龄化结果。
9. **FutureMe 式时间胶囊**：支持 6 个月、1 年、3 年、5 年或自定义解锁日期；静态版保存在浏览器。
10. **全局 / 管理员桥接**：共享 profile、模块事件与可配置管理员 API。

## UI 方向

P005 不采用“量表 / 后台表单”视觉，而采用“未来来电 + 时间地平线”视觉语言：

- 暖米色纸张背景 + 紫色未来感 + 桃色 / 薄荷绿辅助色；
- 大标题只用于关键过渡，输入区保持紧凑；
- 叙事卡、时间线、对话与时间胶囊分别使用不同信息层级；
- 手机端自动降级为单列布局；
- 支持 prefers-reduced-motion。

## 本地运行

仓库根目录：

~~~bash
python -m http.server 8000
~~~

然后打开：

~~~text
http://localhost:8000/future-me/
~~~

## 前端配置

推荐在部署环境中通过一个不会暴露密钥的配置脚本写入“后端 URL”，而不是把模型 API Key 放进 GitHub Pages。

P005 同时兼容旧式单变量与新的配置对象：

~~~html
<script>
window.P005_FUTURE_ME_CONFIG = {
  chatApi: "https://your-backend.example.com/p005/chat",
  imageApi: "https://your-backend.example.com/p005/age-image",
  voiceApi: "https://your-backend.example.com/p005/voice",
  adminApi: "https://your-backend.example.com/p00/events"
};
</script>
~~~

兼容变量：

- window.FUTURE_ME_API
- window.FUTURE_ME_IMAGE_API
- window.FUTURE_ME_VOICE_API
- window.P00_ADMIN_API

### 1. Chat API

请求：

~~~json
{
  "module": "P005",
  "profile": {},
  "syntheticMemory": {},
  "messages": [],
  "userMessage": "我现在最该关注什么？",
  "instruction": "..."
}
~~~

返回：

~~~json
{ "reply": "..." }
~~~

后端 system prompt 应确保模型：

- 只扮演**一个可能的** 60 岁未来自我；
- 回复必须扎根于用户提供的人生故事与 synthetic memory；
- 不声称预言、确定未来、诊断或治疗；
- 可以表达不确定性、矛盾与人生变化，而不是一味积极。

### 2. Image API

请求：

~~~json
{
  "image": "data:image/jpeg;base64,...",
  "currentAge": 22,
  "targetAge": 60,
  "instruction": "Preserve identity..."
}
~~~

返回任一格式：

~~~json
{ "imageUrl": "https://..." }
~~~

或：

~~~json
{ "imageBase64": "..." }
~~~

正式版本应增加：上传同意、媒体存储策略、删除机制、人脸数据治理与年龄变化结果免责声明。

### 3. Voice API

用于 TTS / 个性化未来声音。请求：

~~~json
{
  "text": "未来自我的回答",
  "voice": "future-self",
  "language": "zh-CN",
  "profile": { "name": "..." , "targetAge": 60 }
}
~~~

返回：

~~~json
{ "audioUrl": "https://..." }
~~~

若不配置，前端自动退回浏览器 speechSynthesis。语音输入默认使用浏览器 SpeechRecognition / webkitSpeechRecognition（如果可用）。

> 不建议无明确同意地克隆用户声音。未来若做“老年版自己的声音”，应单独设计知情同意和删除流程。

### 4. Admin API

P005 在关键事件后可发送：

- future_generated
- future_portrait_generated
- chat_turn
- capsule_saved

请求包含 P005 snapshot，但**不会把 base64 照片塞进管理员事件**；照片应通过独立媒体接口管理。

## P001–P005 共享资料

P005 会尝试读取以下共享入口：

- window.P00_CONTEXT
- localStorage:bjtu_p00_profile_v1
- localStorage:bjtu_profile_v1
- localStorage:aiques_shared_profile_v1

当前只自动复用适合用户体验的非诊断性资料，例如称呼、年龄、城市、当前角色与价值取向。P004 的管理员侧诊断 / 风险推断不应直接展示为 Future Me 对用户的“事实”。

P005 也会触发浏览器事件：

~~~js
window.addEventListener("p00:session", (event) => {
  console.log(event.detail.module, event.detail.type, event.detail.snapshot);
});
~~~

方便未来统一首页 / 管理后台接入。

## 数据与隐私

静态 Demo 默认使用浏览器 localStorage 保存：

- 人生故事与未来目标
- synthetic memory
- 对话历史
- 当前 / 未来头像（若用户添加）
- 时间胶囊

右上角可一键清除，也可导出完整 JSON。共用设备不建议长期保留私人内容。

如果配置远端 API，则实际的数据处理行为取决于你的后端部署，必须在正式收集数据前补齐知情同意、隐私说明、数据保留 / 删除政策和伦理审批。

## 研究 / 产品边界

P005 的目标是提升 future-self continuity、自我反思与长期思考，不用于：

- 预测具体人生事件；
- 诊断心理 / 精神问题；
- 替用户做职业、婚恋、医疗或财务决定；
- 声称“60 岁的真实自己”正在与用户通信。

## 质量检查

仓库已有 GitHub Actions Quality Gate，PR 会执行：

~~~bash
node --check app.js
node --check experiments.js
node --check future-me/app.js
node tests/smoke.mjs
python scripts/quality_sensor.py --strict
python scripts/next_quality_target.py
~~~

## 参考方向

- MIT Future You：life-story questionnaire → future/synthetic memory → future-self conversation。
- FutureMe：给未来自己写信与未来投递的时间胶囊体验。

P005 复刻的是公开描述的**交互机制与研究思路**，不是 MIT / FutureMe 的品牌、原始素材或受保护实现。
