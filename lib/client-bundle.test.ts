import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Architecture guard for the client bundle. Every locale catalog is tens of
 * kilobytes; a single value import of one from a client module ships all 26
 * languages to every visitor (measured: ~780 KB raw / ~200 KB gzip). Client
 * code must read the negotiated locale through `useI18n()` instead.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIRECTORIES = ["app", "components", "hooks", "lib"];

/** Modules that embed, or transitively load, per-locale catalogs. */
const SERVER_ONLY_MODULES = [
  "lib/i18n.ts",
  "lib/tool-i18n.ts",
  "lib/ui-copy.ts",
  "lib/i18n-dictionaries.ts",
  "lib/privacy.ts",
  "lib/terms.ts",
  "lib/seo.ts",
  "lib/request-locale.ts",
];
const SERVER_ONLY_PREFIXES = ["lib/translations/"];

/** Every module path in this test is repo-relative with forward slashes, on any OS. */
const toPosix = (path: string) => path.split(sep).join("/");

function listSources(directory: string): string[] {
  return readdirSync(join(ROOT, directory), { withFileTypes: true }).flatMap(
    (entry) => {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) return listSources(path);
      return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
        ? [path]
        : [];
    },
  );
}

function parse(path: string): ts.SourceFile {
  return ts.createSourceFile(
    path,
    readFileSync(join(ROOT, path), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function isClientModule(source: ts.SourceFile): boolean {
  for (const statement of source.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) {
      return false;
    }
    if (statement.expression.text === "use client") return true;
  }
  return false;
}

/** Imports that survive compilation; `import type` and all-`type` specifiers are erased. */
function runtimeSpecifiers(source: ts.SourceFile): string[] {
  const specifiers: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const erased =
        clause !== undefined &&
        (clause.isTypeOnly ||
          (!clause.name &&
            bindings !== undefined &&
            ts.isNamedImports(bindings) &&
            bindings.elements.length > 0 &&
            bindings.elements.every((element) => element.isTypeOnly)));
      if (!erased) specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !node.isTypeOnly
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return specifiers;
}

function resolveSpecifier(from: string, specifier: string): string | null {
  const base = specifier.startsWith("@/")
    ? specifier.slice(2)
    : specifier.startsWith(".")
      ? toPosix(relative(ROOT, resolve(ROOT, dirname(from), specifier)))
      : null;
  if (base === null) return null;
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
  return candidates.find((candidate) => /\.tsx?$/.test(candidate) && existsSync(join(ROOT, candidate))) ?? null;
}

function isServerOnly(path: string): boolean {
  return (
    SERVER_ONLY_MODULES.includes(path) ||
    SERVER_ONLY_PREFIXES.some((prefix) => path.startsWith(prefix))
  );
}

describe("client bundle", () => {
  const files = SOURCE_DIRECTORIES.flatMap(listSources);
  // Parsed on demand: an import can reach a module outside the scanned folders.
  const parsed = new Map<string, ts.SourceFile>();
  const sourceOf = (path: string) => {
    let source = parsed.get(path);
    if (!source) {
      source = parse(path);
      parsed.set(path, source);
    }
    return source;
  };

  it("identifies modules by forward-slash paths on every platform", () => {
    expect(files.length).toBeGreaterThan(50);
    expect(files.filter((path) => path.includes("\\"))).toEqual([]);
  });

  it("names only server-only modules that still exist", () => {
    for (const path of SERVER_ONLY_MODULES) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
  });

  it("keeps every locale catalog out of client-reachable modules", () => {
    const clientModules = files.filter((path) => isClientModule(sourceOf(path)));
    expect(clientModules.length).toBeGreaterThan(20);

    const via = new Map<string, string | null>(clientModules.map((path) => [path, null]));
    const queue = [...clientModules];
    const violations: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const specifier of runtimeSpecifiers(sourceOf(current))) {
        const target = resolveSpecifier(current, specifier);
        if (!target || via.has(target)) continue;
        via.set(target, current);
        if (isServerOnly(target)) {
          const chain = [target];
          for (let step = current as string | null; step; step = via.get(step) ?? null) chain.unshift(step);
          violations.push(chain.join(" -> "));
          continue;
        }
        queue.push(target);
      }
    }

    expect(violations).toEqual([]);
  });
});
