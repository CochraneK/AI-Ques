window.P005_FUTURE_ME_CONFIG = Object.assign({
  // Future horizon. Allowed: "1y", "2y", "3y", "4y", "10y", "age60".
  targetHorizon: "4y",

  // Public backend endpoint URLs only. Never put provider API keys in GitHub Pages.
  memoryApi: "",
  chatApi: "",
  imageApi: "",
  voiceApi: "",
  adminApi: ""
}, window.P005_FUTURE_ME_CONFIG || {});
