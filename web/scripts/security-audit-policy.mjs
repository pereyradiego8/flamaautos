// Scoped, expiring exception for https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
// The scanner finding remains visible; all other vulnerabilities block CI.
export const ADVISORY = 'GHSA-vfj7-8cjw-p6xm';
export const EXPIRES_AT = '2027-01-18T00:00:00.000Z';

const expected = new Map([
  ['@next/eslint-plugin-next', { version: '16.4.2', via: 'fast-glob', direct: true }],
  ['fast-glob', { version: '3.3.1', via: 'micromatch', direct: false }],
  ['micromatch', { version: '4.0.8', via: 'braces', direct: false }],
  ['braces', { version: '3.0.3', via: ADVISORY, direct: false }],
]);

const fail = reason => ({ ok: false, reason, exceptionUsed: false });

export function evaluateAudit(full, production, lock, now = new Date()) {
  if (!full || !production || !lock || typeof lock.packages !== 'object') {
    return fail('Informe npm o lockfile ausente o inválido');
  }
  if (full.error || production.error || !full.metadata?.vulnerabilities ||
      !production.metadata?.vulnerabilities ||
      typeof full.vulnerabilities !== 'object' ||
      typeof production.vulnerabilities !== 'object') {
    return fail('Auditoría incompleta o error de npm: NO se admite una excepción');
  }

  const pv = production.metadata.vulnerabilities;
  if (pv.total !== 0 || Object.keys(production.vulnerabilities).length !== 0) {
    return fail('Existen vulnerabilidades en las dependencias de producción');
  }

  const entries = Object.entries(full.vulnerabilities);
  const counts = full.metadata.vulnerabilities;
  if (entries.length === 0 && counts.total === 0) {
    return { ok: true, exceptionUsed: false, reason: 'Auditoría completa limpia' };
  }

  if (!Number.isFinite(now.getTime()) || now.getTime() >= Date.parse(EXPIRES_AT)) {
    return fail('Excepción caducada; requiere nueva revisión de seguridad');
  }

  if (entries.length !== expected.size || counts.total !== expected.size ||
      counts.high !== expected.size || counts.critical !== 0 ||
      counts.moderate !== 0 || counts.low !== 0 || counts.info !== 0) {
    return fail('El número o severidad de vulnerabilidades cambió');
  }

  for (const [name, entry] of entries) {
    const allowed = expected.get(name);
    if (!allowed || !entry || entry.severity !== 'high' ||
        entry.isDirect !== allowed.direct ||
        !Array.isArray(entry.via) || entry.via.length !== 1) {
      return fail('Hallazgo nuevo o estructura inesperada: ' + name);
    }
    const pkg = lock.packages['node_modules/' + name];
    if (!pkg || pkg.version !== allowed.version || pkg.dev !== true) {
      return fail('Versión o alcance no aprobado: ' + name);
    }
    const onlyVia = entry.via[0];
    if (name === 'braces') {
      if (!onlyVia || typeof onlyVia !== 'object' ||
          onlyVia.name !== 'braces' || onlyVia.severity !== 'high' ||
          onlyVia.url !== 'https://github.com/advisories/' + ADVISORY ||
          onlyVia.range !== '<=3.0.3') {
        return fail('Advisory raíz distinto del documentado');
      }
    } else if (onlyVia !== allowed.via) {
      return fail('Cadena de dependencias distinta: ' + name);
    }
  }

  return { ok: true, exceptionUsed: true,
    reason: 'Únicamente ' + ADVISORY + ' en herramientas de desarrollo. Vence ' + EXPIRES_AT };
}
