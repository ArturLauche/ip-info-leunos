# Dependency maintenance

Reviewed on 2026-11-06 against npm and Google/Maven Central stable releases.

## Toolchain compatibility

- Use Node 24 LTS and pnpm 10.34.9 (`packageManager` in `package.json`). Vitest 5
  requires Node >=22.12; CI and deployment configuration use Node 24. Node types
  intentionally follow that runtime instead of Node 26.
- TypeScript 6.0.3 is the latest compatible release: typescript-eslint 8.72.1
  supports TypeScript >=4.8.4 <6.1.0, so TypeScript 7 is deferred.
- ESLint 9.39.5 is retained because the current React, import and JSX accessibility
  plugins do not declare ESLint 10 support. ESLint 9 is deprecated upstream;
  upgrade once those peers support ESLint 10. Do not bypass their peer checks.
- Vitest 5 requires Vite as a peer. Vite 8 is an explicit development dependency
  so frozen installs use a patched stable version. The test config uses `.mts`
  for unambiguous ESM loading and remains included in TypeScript checks.
- Nixpacks 1.41.0's Node 24 archive supplies Node 24.10.0. Its install phase
  bootstraps Node 24.22.2 and pnpm 10.34.9 in `/opt/ip-info-toolchain`; that path
  takes precedence during installation, build and startup. Update these explicit
  pins alongside future toolchain upgrades. Docker pins the Node 24.22.2 Alpine image.

## Temporary security constraints

These select patched packages, without excluding advisories from audits.

- `@typescript-eslint/typescript-estree>minimatch` is constrained to `^11.0.1`
  for [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
  The parser still requests `^10.2.2`. Existing minimatch 3 consumers keep their
  compatible patched branch. Remove the override when the parser adopts a fixed
  range; validate linting after changes.
- AGP 9.5.1 still requests vulnerable Guava, Commons Lang, Bouncy Castle, jose4j
  and JDOM releases. Constraints in `android/build.gradle.kts` patch only the
  plugin classpath; Bouncy Castle modules stay on the same release. Each
  constraint records its security reason. Remove them when the plugins resolve
  safe versions themselves; validate Android unit tests, lint, APK assembly and
  APK signature verification after changes.

## Audit scope

The initial pnpm audit reported 31 findings (5 critical, 10 high, 14 moderate,
2 low), covering Next.js, Sharp, Zod and development tooling. Full and production
pnpm audits are clean after the upgrades. No direct npm dependencies were unused.

Maven auditing uses OSV against the resolved debug/release runtime, unit-test and
instrumentation-test dependency graphs, plus the root Gradle plugin classpath.
The first resolved scan found seven advisories in six plugin dependencies,
addressed by the constraints above. A repeat scan of 224 resolved Maven
coordinates reported no affected packages. This is a package advisory check, not a
security assessment of Android's system WebView or the deployment operating system.

Release and migration references:

- [Next.js October security fixes](https://nextjs.org/blog/nextjs-security-update-october-14-2026)
- [Zod 4 migration guide](https://zod.dev/v4/changelog)
- [Vitest 5 migration guide](https://vitest.dev/guide/migration.html)
