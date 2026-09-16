export const PROTOCOL_VERSION = 'p005-prod-1.0.0';
export const CONSENT_VERSION = 'p005-consent-1.0.0';

const allowedHorizons = new Set(['1y','2y','3y','4y','10y','age60']);
const allowedProtocols = new Set(['guided','replication']);

export function protocolFromEnv(env = process.env) {
  const targetHorizon = allowedHorizons.has(env.P005_TARGET_HORIZON) ? env.P005_TARGET_HORIZON : '4y';
  const intakeProtocol = allowedProtocols.has(env.P005_INTAKE_PROTOCOL) ? env.P005_INTAKE_PROTOCOL : 'guided';
  return Object.freeze({
    protocolVersion: PROTOCOL_VERSION,
    consentVersion: CONSENT_VERSION,
    module: 'P005',
    targetHorizon,
    intakeProtocol,
    originalFutureYouAge60: targetHorizon === 'age60',
    chatCompletionThresholdMessages: 16,
    p001ProfileEnrichment: intakeProtocol === 'guided',
    p004ContextOptional: true,
    voiceExtension: true,
    imageExtension: true
  });
}

export function consentDefinition() {
  return {
    version: CONSENT_VERSION,
    required: [
      'futureNotPrediction',
      'researchData',
      'privacy'
    ],
    optional: [
      'media',
      'voice',
      'p004Context'
    ]
  };
}

export function validateConsent(consent = {}) {
  const missing = consentDefinition().required.filter((key) => consent[key] !== true);
  return { ok: missing.length === 0, missing };
}
