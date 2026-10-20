# Seguimiento de seguridad — issue #5

**Actualizado:** 20 de octubre de 2026 · **Próxima revisión obligatoria:** antes del 20 de noviembre de 2026 (UTC).

## Riesgo residual (NO corregido)

[GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) señala una denegación de servicio por patrones de llaves profundamente anidados en `braces@3.0.3`.

El advisory permanece abierto, sin versión corregida publicada. Los mantenedores cuestionan la explotabilidad y discuten la clasificación, pero **un debate abierto no equivale a un parche ni a la retirada del aviso**. Referencias: [micromatch/braces#70](https://github.com/micromatch/braces/issues/70) y [revisión del advisory](https://github.com/github/advisory-database/pull/10132).

Cadena exacta detectada en Flama Autos:

```
@next/eslint-plugin-next@16.4.2 (dev)
└── fast-glob@3.3.1 (dev)
    └── micromatch@4.0.8 (dev)
        └── braces@3.0.3 (dev)
```

El análisis `npm audit --omit=dev` reportó **cero vulnerabilidades en dependencias de producción**. No hemos demostrado explotación desde entradas públicas del sitio: el uso observado corresponde a las herramientas de ESLint, ejecutadas con patrones del propio repositorio. Este alcance reduce la exposición pero **no autoriza a declarar el advisory resuelto**.

## Control automatizado

`cd web && npm run audit:security` hace **dos auditorías reales de npm** (completa y producción). Compara nombres, rango, severidad, cadena causal, advisory, versiones fijadas en el lockfile y el indicador `dev`, y verifica el alcance de producción. Si encuentra **cualquier** variación inesperada, una nueva vulnerabilidad incluso de menor severidad, un error de npm o una entrada en producción, **falla el CI**.

Sólo acepta temporalmente la excepción exacta ya documentada: `GHSA-vfj7-8cjw-p6xm` propagada por cuatro paquetes específicos; imprime claramente las cuatro alertas y el plazo. **La excepción caduca el 20 de noviembre de 2026 a las 00:00 UTC**: si npm sigue reportando la vulnerabilidad entonces, CI falla hasta que exista una revisión humana explícita o un parche. Si la auditoría completa da cero alertas, pasa sin excepción.

Los tests automáticos comprueban la caducidad, un advisory distinto, vulnerabilidades nuevas, cambio de cadena, cambio de versión y exposición en producción. No se usa `npm audit fix --force`, `--legacy-peer-deps` ni forks sin auditoría.

## Próximos pasos

1. Revisar periódicamente el advisory y la publicación de nuevas versiones de `braces`, `micromatch` y `@next/eslint-plugin-next`.
2. Si aparece una versión corregida, actualizar lockfile, eliminar la excepción y ejecutar `npm audit`, `npm test`, `npm run lint -- --max-warnings=0`, `npm run typecheck` y `npm run build`.
3. Si no existe un parche antes de la expiración, revisar nuevamente riesgo, exposición y posición del mantenedor; **no renovar automáticamente**.
4. Cerrar [issue #5](https://github.com/pereyradiego8/flamaautos/issues/5) sólo después de resolver el hallazgo sin excepciones.
