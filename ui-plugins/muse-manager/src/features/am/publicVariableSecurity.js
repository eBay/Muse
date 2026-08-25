export const PUBLIC_VARIABLES_ALERT_TITLE = 'Security warning';

export const PUBLIC_VARIABLES_ALERT_DESCRIPTION =
  'The variables are exposed to the browser and treated as public information. Do not store sensitive information in environment variables, including credentials, passwords, access tokens, API keys, or other secrets.';

const SENSITIVE_KEY_PATTERN =
  /(^|[._-])(password|passwd|pass|pwd|secret|token|credentials?|oauth|api[._-]?key|access[._-]?key|auth[._-]?key|client[._-]?key|private[._-]?key|signing[._-]?key|db[._-]?pass)([._-]|$)/i;

const NUMERIC_POLICY_KEY_PATTERN =
  /(expir|threshold|timeout|ttl|limit|max|min|count|days|length|size)/i;

const PLACEHOLDER_PATTERN =
  /^(?:\$\{[^}]+\}|\{\{[^}]+\}\}|<[^>]+>|(?:replace|change)[_-]?me|example|dummy|placeholder|redacted|test|todo|x+)$/i;

const KNOWN_SECRET_PATTERNS = [
  /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/,
  /\bghp_[A-Za-z0-9]{36}\b/,
  /\bgho_[A-Za-z0-9]{36}\b/,
  /\bghu_[A-Za-z0-9]{36}\b/,
  /\bghs_[A-Za-z0-9]{36}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{82}\b/,
  /\bpat[A-Za-z0-9]{14}\.[a-f0-9]{64}\b/,
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/,
];

const calculateEntropy = (value) => {
  const frequencies = {};
  for (const character of value) {
    frequencies[character] = (frequencies[character] || 0) + 1;
  }

  return Object.values(frequencies).reduce((entropy, frequency) => {
    const probability = frequency / value.length;
    return entropy - probability * Math.log2(probability);
  }, 0);
};

const looksLikeBooleanOrUrl = (value) =>
  /^(?:true|false|null|undefined|https?:\/\/\S+)$/i.test(value);

const looksLikeNumber = (value) => /^-?\d+(?:\.\d+)?$/.test(value);

const looksLikeNumericPolicySetting = (key, value) =>
  looksLikeNumber(value) && NUMERIC_POLICY_KEY_PATTERN.test(key);

const looksLikeHighEntropySecret = (value) => {
  if (value.length < 32 || /\s/.test(value)) return false;

  const characterClasses = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;

  return characterClasses >= 3 && calculateEntropy(value) >= 4.2;
};

export const isSensitivePublicVariableKey = (key) => {
  const normalizedKey = String(key ?? '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2');
  if (!normalizedKey) return false;
  return SENSITIVE_KEY_PATTERN.test(normalizedKey);
};

const getReason = (key, value) => {
  const trimmedValue = value.trim();
  if (!trimmedValue || PLACEHOLDER_PATTERN.test(trimmedValue)) return null;
  const normalizedKey = key.replace(/([a-z0-9])([A-Z])/g, '$1_$2');

  if (KNOWN_SECRET_PATTERNS.some((pattern) => pattern.test(trimmedValue))) {
    return 'value matches a known credential format';
  }

  if (looksLikeHighEntropySecret(trimmedValue)) {
    return 'value looks like a high-entropy credential';
  }

  if (
    SENSITIVE_KEY_PATTERN.test(normalizedKey) &&
    !looksLikeBooleanOrUrl(trimmedValue) &&
    !looksLikeNumericPolicySetting(normalizedKey, trimmedValue)
  ) {
    return 'name and value look like a credential';
  }

  return null;
};

export const findSensitivePublicVariablePairs = (pairs = []) => {
  const findings = [];

  for (const { key, value } of pairs) {
    if (value == null || value === '') continue;
    const variableKey = String(key ?? '').trim() || '(unnamed)';
    const reason = getReason(variableKey, String(value));
    if (reason) findings.push({ key: variableKey, reason });
  }

  return findings;
};

export const findSensitivePublicVariables = (properties = '') => {
  const findings = [];

  String(properties || '')
    .replace(/\\\n( )*/g, '')
    .split('\n')
    .forEach((line, index) => {
      if (!line.trim()) return;

      const separatorIndex = line.indexOf('=');
      if (separatorIndex < 0) return;

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1);
      const reason = getReason(key, value);
      if (reason) findings.push({ key: key || `line ${index + 1}`, reason });
    });

  return findings;
};

export const getSensitivePublicVariablesWarning = (findings = []) => {
  const keys = [...new Set(findings.map(({ key }) => key))].join(', ');
  return `Potential credentials detected in: ${keys}. Anyone who can open the app URL can read Muse variables in the browser.`;
};

export const SENSITIVE_FINDING_REASON_LABELS = {
  'value matches a known credential format': 'Value matches a known credential format',
  'value looks like a high-entropy credential': 'Value looks like a high-entropy secret',
  'name and value look like a credential': 'Variable name suggests a credential',
};

export const summarizeSensitiveFindings = (findings = []) => {
  const byKey = new Map();

  for (const { key, reason } of findings) {
    if (!byKey.has(key)) byKey.set(key, new Set());
    byKey.get(key).add(reason);
  }

  return [...byKey.entries()].map(([key, reasons]) => ({
    key,
    reasons: [...reasons].map((reason) => SENSITIVE_FINDING_REASON_LABELS[reason] || reason),
  }));
};
