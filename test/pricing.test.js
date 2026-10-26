const assert = require('node:assert/strict');
const path = require('node:path');
const { loadPricing, validatePricing } = require('../tools/pricing');
const pricing = loadPricing(path.join(__dirname, '..', 'config', 'pricing.json'));
const copy = () => JSON.parse(JSON.stringify(pricing));
const set = (o, key, value) => {
  const parts = key.split('.');
  const last = parts.pop();
  parts.reduce((node, part) => node[part], o)[last] = value;
};

assert.equal(validatePricing(pricing), pricing);
function checkNumbers(value, prefix = '') {
  for (const [key, child] of Object.entries(value)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object') checkNumbers(child, full);
    else if (typeof child === 'number') {
      for (const invalid of [-1, NaN, Infinity, '10', null]) {
        const bad = copy(); set(bad, full, invalid);
        assert.throws(() => validatePricing(bad), { message: `Invalid config/pricing.json: ${full} must be a finite non-negative number` });
      }
      const missing = copy();
      const parts = full.split('.'); const last = parts.pop();
      delete parts.reduce((o, k) => o[k], missing)[last];
      assert.throws(() => validatePricing(missing), /Invalid config\/pricing.json/);
    }
  }
}
checkNumbers(pricing);
for (const [key, value] of [
  ['meta.fx.EUR', 0], ['meta.fx.GBP', 0], ['meta.fx.USD', 2],
  ['lic.copilot.packCredits', 0], ['lic.copilot.prepaidDiscount', 101],
  ['meta.priceList', ''], ['meta.priceBasis', null],
  ['lic.p.premuim', 195], ['parameters.azure.fabric.F16', 2102]
]) {
  const bad = copy(); set(bad, key, value);
  assert.throws(() => validatePricing(bad), /Invalid config\/pricing.json/);
}
assert.throws(() => validatePricing(null), /Invalid config\/pricing.json/);
assert.throws(() => validatePricing([]), /Invalid config\/pricing.json/);
assert.throws(() => loadPricing(path.join(__dirname, 'missing-pricing.json')), /Cannot read pricing configuration/);
const free = copy();
free.lic.p.premium = 0;
free.parameters.azure.runtime.med = 0;
free.parameters.azure.fabric.F2 = 0;
free.lic.copilot.prepaidDiscount = 100;
assert.equal(validatePricing(free), free);
console.log('PASS pricing configuration validation');
