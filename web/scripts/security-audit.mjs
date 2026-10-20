import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { evaluateAudit, EXPIRES_AT, ADVISORY } from './security-audit-policy.mjs';

const cwd = fileURLToPath(new URL('../', import.meta.url));

function runAudit(args) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npm, ['audit', '--json', ...args], {
    cwd, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error || ![0, 1].includes(result.status)) {
    throw new Error('npm audit no pudo completarse: ' +
      (result.error?.message || result.stderr || String(result.status)));
  }
  const report = JSON.parse(result.stdout);
  if (report.error) throw new Error('npm audit devolvió un error: ' + JSON.stringify(report.error));
  return report;
}

try {
  const full = runAudit([]);
  const production = runAudit(['--omit=dev']);
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  const result = evaluateAudit(full, production, lock);
  console.log('Auditoría completa: ' + JSON.stringify(full.metadata?.vulnerabilities));
  console.log('Auditoría de producción: ' + JSON.stringify(production.metadata?.vulnerabilities));
  if (!result.ok) {
    console.error('CONTROL DE SEGURIDAD FALLÓ: ' + result.reason);
    process.exitCode = 1;
  } else if (result.exceptionUsed) {
    console.warn('EXCEPCIÓN TEMPORAL VISIBLE: ' + result.reason);
    console.warn('No es una remediación. ' + ADVISORY + ' sigue abierto; reevaluar antes de ' + EXPIRES_AT);
  } else {
    console.log('CONTROL DE SEGURIDAD OK: ' + result.reason);
  }
} catch (error) {
  console.error('CONTROL DE SEGURIDAD FALLÓ: ' + error.message);
  process.exitCode = 1;
}
