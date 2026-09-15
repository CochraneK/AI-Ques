window.P005_FUTURE_ME_CONFIG = Object.assign({
  // Future horizon. Allowed: "1y", "2y", "3y", "4y", "10y", "age60".
  targetHorizon: "4y",

  // Intake protocol:
  // "guided" = Chinese low-burden MECE options + optional detail.
  // "replication" = paper-aligned sequential free-text for the 2024 Future You fields.
  intakeProtocol: "guided",

  // Voice defaults. The actual provider key belongs on your backend, never here.
  voiceId: "marin",
  ttsInstructions: "自然、平静、像熟悉自己的真人，不要播音腔；中文语速略慢。",

  // Public backend endpoint URLs only.
  memoryApi: "",
  chatApi: "",
  imageApi: "",
  voiceApi: "",
  transcribeApi: "",
  realtimeSessionApi: "",
  adminApi: ""
}, window.P005_FUTURE_ME_CONFIG || {});
