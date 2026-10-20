import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAudit, EXPIRES_AT } from '../scripts/security-audit-policy.mjs';

const date = new Date('2026-10-20T15:00:00Z');
function fixture() {
  const lock = { packages: {} };
  for (const [name, version] of Object.entries({
    '@next/eslint-plugin-next': '16.4.2', 'fast-glob': '3.3.1',
    micromatch: '4.0.8', braces: '3.0.3',
  })) lock.packages['node_modules/' + name] = { version, dev: true };
  const full = {
    metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 4, critical: 0, total: 4 } },
    vulnerabilities: {
      '@next/eslint-plugin-next': { severity: 'high', isDirect: true, via: ['fast-glob'] },
      'fast-glob': { severity: 'high', isDirect: false, via: ['micromatch'] },
      micromatch: { severity: 'high', isDirect: false, via: ['braces'] },
      braces: { severity: 'high', isDirect: false, via: [{
        name: 'braces', severity: 'high', range: '<=3.0.3',
        url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
      }] },
    },
  };
  const prod = { metadata: { vulnerabilities: { total: 0 } }, vulnerabilities: {} };
  return { full, prod, lock };
}

test('únicamente la excepción documentada y vigente pasa con alerta visible', () => {
  const { full, prod, lock } = fixture();
  assert.deepEqual(evaluateAudit(full, prod, lock, date).ok, true);
  assert.equal(evaluateAudit(full, prod, lock, date).exceptionUsed, true);
});
test('una auditoría completamente limpia pasa aunque la excepción haya vencido', () => {
  const { full, prod, lock } = fixture();
  full.vulnerabilities = {};
  full.metadata.vulnerabilities = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };
  assert.equal(evaluateAudit(full, prod, lock, new Date('2027-01-01')).ok, true);
});
test('la excepción continúa vigente el día 89 y caduca al cumplir 90 días', () => {
  const { full, prod, lock } = fixture();
  assert.equal(evaluateAudit(full, prod, lock, new Date('2027-01-17T23:59:59.999Z')).ok, true);
  assert.equal(evaluateAudit(full, prod, lock, new Date('2027-01-18T00:00:00.000Z')).ok, false);
});
test('excepción vencida bloquea el CI', () => {
  const { full, prod, lock } = fixture();
  assert.equal(evaluateAudit(full, prod, lock, new Date(EXPIRES_AT)).ok, false);
});
test('vulnerabilidad alta nueva bloquea el CI', () => {
  const { full, prod, lock } = fixture();
  full.vulnerabilities.other = { severity: 'high', via: [] };
  full.metadata.vulnerabilities.high++;
  full.metadata.vulnerabilities.total++;
  assert.equal(evaluateAudit(full, prod, lock, date).ok, false);
});
test('una vulnerabilidad de severidad baja también bloquea el CI', () => {
  const { full, prod, lock } = fixture();
  full.metadata.vulnerabilities.low = 1;
  full.metadata.vulnerabilities.total++;
  assert.equal(evaluateAudit(full, prod, lock, date).ok, false);
});
test('un advisory distinto en braces bloquea el CI', () => {
  const { full, prod, lock } = fixture();
  full.vulnerabilities.braces.via[0].url = 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc';
  assert.equal(evaluateAudit(full, prod, lock, date).ok, false);
});
test('cambio de cadena transitiva bloquea el CI', () => {
  const { full, prod, lock } = fixture();
  full.vulnerabilities.micromatch.via = ['other'];
  assert.equal(evaluateAudit(full, prod, lock, date).ok, false);
});
test('si braces pasa a producción se bloquea', () => {
  const { full, prod, lock } = fixture();
  lock.packages['node_modules/braces'].dev = false;
  assert.equal(evaluateAudit(full, prod, lock, date).ok, false);
});
test('si la auditoría de producción detecta problemas se bloquea', () => {
  const { full, prod, lock } = fixture();
  prod.metadata.vulnerabilities.total = 1;
  assert.equal(evaluateAudit(full, prod, lock, date).ok, false);
});
test('si npm audit devuelve errores se bloquea', () => {
  const { full, prod, lock } = fixture();
  full.error = { code: 'ENOAUDIT' };
  assert.equal(evaluateAudit(full, prod, lock, date).ok, false);
});
