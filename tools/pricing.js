const fs = require('fs');

function validatePricing(pricing) {
  const fail = (key, rule) => { throw new Error(`Invalid config/pricing.json: ${key} ${rule}`); };
  const at = key => key.split('.').reduce((o, k) => o && o[k], pricing);
  const groups = {
    'meta.fx': 'USD EUR GBP',
    'lic.p': 'premium cse ccFull ccDigital ccVoice ccAddFull ccAddDigital ccAddVoice teamMember csAttach',
    'lic.copilot': 'includedPerPremium voicebotPerUser callIntelligencePerUser classicVoiceRate genaiVoiceRate packCredits packPrice paygPerCredit prepaidDiscount',
    'lic.tel': 'teamsPhone paygRA tfIn outLandline outMobile ocNumber ocIn ocOut sbcMonthly',
    'lic.dv': 'inclDb inclDbPerUser inclFile inclFilePerUser inclFileVoice inclLog pDb pFile pLog',
    'parameters.copilotText': 'classicAnswer generativeAnswer agentAction graphGrounding',
    'parameters.d365ai': 'reasoning knowledge action intentMining basicPrompt standardPrompt premiumPrompt premiumVoice flowAction',
    'parameters.skuPrices': 'powerBiPro powerBiPremium powerAutomatePremium powerAutomateProcess powerAppsPremium customerVoice unifiedRouting teamsEnterprise m365Copilot dataverseDatabase managedEnvironments',
    'parameters.azure': 'nonProdFactor apim storagePerGB logsPerGB monitoringBase privateNetworking',
    'parameters.azure.runtime': 'low med high',
    'parameters.azure.fabric': 'F2 F4 F8'
  };
  const numericKeys = ['otherRunMonthly'];
  for (const [prefix, keys] of Object.entries(groups)) {
    numericKeys.push(...keys.split(' ').map(key => `${prefix}.${key}`));
  }
  for (const key of numericKeys) {
    const value = at(key);
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) fail(key, 'must be a finite non-negative number');
  }
  for (const key of ['meta.priceList', 'meta.priceBasis']) {
    if (typeof at(key) !== 'string' || !at(key).trim()) fail(key, 'must be a non-empty string');
  }
  for (const key of ['meta.fx.USD', 'meta.fx.EUR', 'meta.fx.GBP', 'lic.copilot.packCredits']) {
    if (at(key) <= 0) fail(key, 'must be greater than zero');
  }
  if (at('meta.fx.USD') !== 1) fail('meta.fx.USD', 'must be 1 (all monetary values use a USD basis)');
  if (at('lic.copilot.prepaidDiscount') > 100) fail('lic.copilot.prepaidDiscount', 'must not exceed 100');

  // Reject misspelled or misplaced settings instead of silently ignoring them.
  const allowed = new Set([...numericKeys, 'meta.priceList', 'meta.priceBasis']);
  for (const key of [...allowed]) {
    const parts = key.split('.');
    while (parts.length > 1) { parts.pop(); allowed.add(parts.join('.')); }
  }
  function checkKeys(value, prefix = '') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(prefix || 'root', 'must be an object');
    for (const [key, child] of Object.entries(value)) {
      const full = prefix ? `${prefix}.${key}` : key;
      if (!allowed.has(full)) fail(full, 'is not a recognised setting');
      if (child && typeof child === 'object') checkKeys(child, full);
    }
  }
  checkKeys(pricing);
  return pricing;
}

function loadPricing(file) {
  let pricing;
  try { pricing = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { throw new Error(`Cannot read pricing configuration ${file}: ${error.message}`); }
  return validatePricing(pricing);
}

module.exports = { loadPricing, validatePricing };
