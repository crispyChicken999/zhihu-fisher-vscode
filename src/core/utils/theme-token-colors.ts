import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

/**
 * 主题令牌色解析（扩展侧 / Node）
 *
 * 背景：
 * 伪装界面里的代码片段用的是 VSCode 的 .mtk* 类名，但那些类名是 VSCode 在主窗口
 * document 里动态生成的（`style.vscode-tokens-styles`），webview 是跨源沙箱 iframe，
 * 既拿不到父窗口 DOM，VSCode 也不会把 token 颜色下发到 webview（webview 只拿到
 * --vscode-* 变量和 body 上的 vscode-light/dark 类名）。
 *
 * 所以这里换个思路：在扩展侧（有文件系统权限）自己解析「当前激活主题」的主题文件，
 * 按 VSCode 的 scope 匹配规则算出每种 token 语义的真实颜色，再生成一段 CSS 注入 webview。
 *
 * 数据来源（按优先级从低到高）：
 *   1. 主题文件本身：contributes.themes 指向的 JSON，按 include 链逐层合并；
 *   2. 用户在 editor.tokenColorCustomizations 里的 textMateRules；
 *   3. 同一设置里的快捷分组（comments / strings / numbers / keywords / types /
 *      functions / variables）；
 *   4. 上述全部内容中带 [主题名] / [*] 前缀的「主题作用域」覆盖。
 *
 * 没解析出来（主题文件读不到、第三方主题结构特殊等）的类不输出规则，
 * 由 styles/disguise.ts 里按 vscode-light/dark/high-contrast 类名写的兜底调色板接管。
 *
 * 说明：这里不处理 semanticTokenColors —— 伪装出来的代码块并不是真正被语言服务
 * 解析过的文档，真实编辑器里对这类文本生效的也是 TextMate 规则，语义高亮只会影响
 * 真实文件；而且内置主题（Dark Modern / Dark 2026 等）本身也基本只定义 tokenColors。
 */

/** 伪装界面里实际会用到的 .mtk* 类 → 它想表达的 token 语义（候选 scope 从具体到宽泛） */
interface MtkTokenSpec {
  /** 类名，如 mtk4 */
  cls: string;
  /** 候选 TextMate scope，按「具体 → 宽泛」排列，先命中的先用 */
  scopes: string[];
  /** scope 都没命中时，退回主题 colors 里的这些键（如 editor.foreground） */
  colorKeys?: string[];
}

/**
 * code-generator.ts 里实际用到的类（mtk2/3/7/22 没用到，交给兜底样式）
 * 语义参考：
 *   mtk1 标点/普通文本、mtk4 注释、mtk5 关键字、mtk6/mtk10 数字、mtk8 字面量、
 *   mtk9 变量、mtk11 字符串、mtk12/13 CSS 选择符、mtk14 CSS 属性、
 *   mtk15 函数、mtk16 类型、mtk17 预处理/注解、mtk18 标签名、mtk19 属性名、
 *   mtk20 JSON 键、mtk21 Markdown 强调
 */
const MTK_TOKENS: MtkTokenSpec[] = [
  {
    cls: "mtk1",
    // 注意：这里不要放 source / text 这类「根 scope」，它们会被带父级的选择器
    // （如 "string punctuation.section.embedded source"）误命中，拿到错误的颜色
    scopes: ["punctuation.separator", "punctuation.definition"],
    colorKeys: ["editor.foreground"],
  },
  {
    cls: "mtk4",
    scopes: [
      "comment.block.documentation",
      "comment.block",
      "comment.line",
      "comment",
    ],
  },
  {
    cls: "mtk5",
    // keyword 放最前：它是「关键字」这一类最标准的 scope，也让用户的 keywords 自定义能命中；
    // storage.* 作为主题侧的补充。注意别放 keyword.other.using 这种过细的 scope，
    // 它会被主题里针对 C++ using 之类的特例规则命中，拿到不适合当前语言的颜色
    scopes: ["keyword", "storage.type", "storage.modifier", "storage"],
  },
  {
    cls: "mtk6",
    scopes: ["constant.numeric", "constant.language", "constant"],
  },
  {
    cls: "mtk8",
    scopes: ["constant.language", "support.constant", "constant"],
  },
  {
    cls: "mtk9",
    scopes: [
      "variable.other.readwrite",
      "variable.other",
      "meta.definition.variable.name",
      "variable",
    ],
  },
  {
    cls: "mtk10",
    scopes: ["constant.numeric.decimal", "constant.numeric", "constant.language"],
  },
  {
    cls: "mtk11",
    scopes: ["string.quoted.double", "string.quoted", "string"],
  },
  {
    cls: "mtk12",
    scopes: [
      "punctuation.definition.entity.css",
      "punctuation.definition.entity",
      "punctuation.separator",
    ],
    colorKeys: ["editor.foreground"],
  },
  {
    cls: "mtk13",
    scopes: [
      "entity.other.attribute-name.class.css",
      "entity.other.attribute-name.class",
      "entity.name.selector",
    ],
  },
  {
    cls: "mtk14",
    scopes: [
      "meta.property-name.css",
      "meta.property-name",
      "support.type.property-name.css",
      "support.type.property-name",
    ],
  },
  {
    cls: "mtk15",
    scopes: ["entity.name.function", "support.function", "entity.name.function.member"],
  },
  {
    cls: "mtk16",
    scopes: [
      "entity.name.type",
      "entity.name.class",
      "support.class",
      "support.type",
      "entity.name.namespace",
    ],
  },
  {
    cls: "mtk17",
    scopes: [
      "meta.preprocessor",
      "keyword.control.at-rule",
      "keyword.control",
      "keyword",
    ],
  },
  {
    cls: "mtk18",
    scopes: ["entity.name.tag.localname", "entity.name.tag", "punctuation.definition.tag"],
  },
  {
    cls: "mtk19",
    scopes: [
      "entity.other.attribute-name.html",
      "entity.other.attribute-name",
      "meta.attribute",
    ],
  },
  {
    cls: "mtk20",
    scopes: [
      "support.type.property-name.json",
      "meta.object-literal.key",
      "meta.structure.dictionary.key",
    ],
  },
  {
    cls: "mtk21",
    scopes: ["markup.bold", "markup.italic", "markup.heading", "markup"],
  },
];

/** 一条可参与匹配的规则（已展开成单 scope + 顺序号） */
interface FlatRule {
  /** 单段或带父级的 scope 选择器，如 "constant.numeric"、"source.css entity.name.tag" */
  scope: string;
  /** scope 的段数（用于算匹配精度，段数越多越具体） */
  depth: number;
  /** 父级 scope 提示（选择器里除最后一段外的部分） */
  parents: string[];
  foreground?: string;
  fontStyle?: string;
  /** 在规则列表里的位置，越大越晚（同精度时后者胜） */
  order: number;
}

/** 主题文件解析结果 */
interface ParsedTheme {
  colors: Record<string, string>;
  rules: FlatRule[];
  /** 主题显示名，用于日志/注释 */
  label: string;
  /** 主题在设置里的 id */
  settingsId: string;
}

/** 候选项：一个主题贡献点 */
interface ThemeCandidate {
  /** 所有可能出现在 workbench.colorTheme / data-vscode-theme-id 里的字符串 */
  keys: string[];
  file: string;
  uiTheme?: string;
  label: string;
  settingsId: string;
}

/** 旧版本 VSCode 里主题 id 带 Default/Experimental 前缀，做一次等价映射 */
function migrateThemeSettingsId(settingsId: string): string {
  switch (settingsId) {
    case "Default Dark Modern":
      return "Dark Modern";
    case "Default Light Modern":
      return "Light Modern";
    case "Default Dark+":
      return "Dark+";
    case "Default Light+":
      return "Light+";
    case "Experimental Dark":
    case "VS Code Dark":
      return "Dark 2026";
    case "Experimental Light":
    case "VS Code Light":
      return "Light 2026";
    default:
      return settingsId;
  }
}

/** 解析 %key% 形式的本地化 label（内置主题的 label 基本都是这种） */
function resolveNlsLabel(
  extensionPath: string,
  label: string,
  language: string,
): string {
  const match = /^%(.*)%$/.exec(label);
  if (!match) {
    return label;
  }
  const key = match[1];
  const candidates = [
    path.join(extensionPath, `package.nls.${language.toLowerCase()}.json`),
    path.join(extensionPath, "package.nls.json"),
  ];
  for (const file of candidates) {
    try {
      const map = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
        string,
        string
      >;
      if (map && typeof map[key] === "string") {
        return map[key];
      }
    } catch {
      // 忽略：读不到就用占位符本身
    }
  }
  return label;
}

/** 把选择器（可能是 "a, b" 或 "a b"）拆成可匹配的规则数组 */
function expandSelectors(
  scope: string | string[] | undefined,
): string[][] {
  if (!scope) {
    return [];
  }
  const list = Array.isArray(scope) ? scope : [scope];
  const out: string[][] = [];
  for (const item of list) {
    if (typeof item !== "string") {
      continue;
    }
    for (const one of item.split(",")) {
      const parts = one
        .trim()
        .split(/\s+/)
        .filter((p) => p.length > 0);
      if (parts.length > 0) {
        out.push(parts);
      }
    }
  }
  return out;
}

/** 单条 tokenColors 规则 → FlatRule（一条规则带多个 scope 时会展开成多条） */
function toFlatRules(
  themeRule: {
    scope?: string | string[];
    settings?: { foreground?: string; fontStyle?: string };
  },
  orderStart: number,
): FlatRule[] {
  const settings = themeRule.settings || {};
  const result: FlatRule[] = [];
  let order = orderStart;
  for (const parts of expandSelectors(themeRule.scope)) {
    result.push({
      scope: parts[parts.length - 1],
      depth: parts.length,
      parents: parts.slice(0, -1),
      foreground: normalizeColor(settings.foreground),
      fontStyle: settings.fontStyle,
      order: order++,
    });
  }
  return result;
}

/** 只接受 #rgb/#rrggbb/#rrggbbaa 这类颜色，其它（如 null）视为无色 */
function normalizeColor(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const v = value.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) {
    return v;
  }
  return undefined;
}

/**
 * 主题名来自插件 package.json，会写进 <style> 里的注释。
 * 去掉可能破坏 HTML/CSS 的字符（尖括号、注释结束符等），避免被恶意主题名注入
 */
function sanitizeLabelForCss(label: string): string {
  return label
    .replace(/[<>*\/\\"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 主题令牌色解析器（进程内缓存）
 */
export class ThemeTokenColors {
  /** 主题文件内容缓存：文件路径 → { colors, rules } */
  private static fileCache = new Map<
    string,
    { colors: Record<string, string>; rules: FlatRule[] }
  >();

  /** 生成好的 CSS 缓存 */
  private static cssCache: { key: string; css: string } | null = null;

  /** 清空缓存（主题或相关配置变化时调用） */
  public static invalidate(): void {
    this.fileCache.clear();
    this.cssCache = null;
  }

  /**
   * 生成注入 webview 的 .mtk* 样式
   * @param themeIdHint webview 上报的主题 id（document.body.dataset.vscodeThemeId），
   *                    比读配置更准，可作为兜底
   */
  public static getMtkCss(themeIdHint?: string): string {
    try {
      const customizations = vscode.workspace
        .getConfiguration("editor")
        .get<Record<string, unknown>>("tokenColorCustomizations", {});
      const key = `${themeIdHint || ""}::${vscode.window.activeColorTheme.kind}::${JSON.stringify(
        customizations,
      )}`;
      if (this.cssCache && this.cssCache.key === key) {
        return this.cssCache.css;
      }

      const theme = this.resolveActiveTheme(themeIdHint);
      if (!theme) {
        return "";
      }

      const parsed = this.loadTheme(theme);
      if (!parsed) {
        return "";
      }

      const themeRules = parsed.rules;
      // 用户自定义单独一组：只要用户在 tokenColorCustomizations 里为某一类给了颜色，
      // 就对这一类生效（和 VSCode 里用户覆盖优先于主题的直觉一致）
      const customRules = this.buildCustomizationRules(customizations, parsed);

      const declarations: string[] = [];
      for (const spec of MTK_TOKENS) {
        const hit =
          this.resolveToken(spec, customRules) ||
          this.resolveToken(spec, themeRules, parsed.colors);
        if (!hit) {
          continue;
        }
        const styles = [`color:${hit.foreground}`];
        if (hit.fontStyle && /\bitalic\b/.test(hit.fontStyle)) {
          styles.push("font-style:italic");
        }
        if (hit.fontStyle && /\bbold\b/.test(hit.fontStyle)) {
          styles.push("font-weight:bold");
        }
        // 用 id 选择器保证优先级高于 styles/disguise.ts 里的兜底类选择器
        declarations.push(
          `#disguise-code-interface .${spec.cls}{${styles.join(";")}}`,
        );
      }

      const css = declarations.length
        ? `/* zhihu-fisher: 当前主题(${sanitizeLabelForCss(
            parsed.label,
          )})的真实令牌色 */\n${declarations.join("\n")}\n`
        : "";

      this.cssCache = { key, css };
      return css;
    } catch (error) {
      console.warn("[伪装界面] 解析主题令牌色失败，回退到内置兜底调色板:", error);
      return "";
    }
  }

  /** 找出「当前真正生效」的主题贡献点 */
  private static resolveActiveTheme(
    themeIdHint?: string,
  ): ThemeCandidate | null {
    const candidates = this.listColorThemes();
    if (candidates.length === 0) {
      return null;
    }

    const wanted: string[] = [];
    const settingValue = this.getEffectiveThemeSetting();
    if (settingValue) {
      wanted.push(migrateThemeSettingsId(settingValue));
    }
    if (themeIdHint) {
      wanted.push(migrateThemeSettingsId(themeIdHint));
      wanted.push(themeIdHint);
    }

    for (const target of wanted) {
      const hit =
        candidates.find((c) => c.keys.includes(target)) ||
        candidates.find((c) =>
          c.keys.some((k) => k.toLowerCase() === target.toLowerCase()),
        ) ||
        // 有些版本/插件的 settingsId 形如 "<publisher>.<ext>.<label>"，
        // 这里做一次后缀匹配兜底
        candidates.find((c) =>
          c.keys.some(
            (k) =>
              k.length > 3 &&
              (target.endsWith(`.${k}`) || target.endsWith(k)),
          ),
        );
      if (hit) {
        return hit;
      }
    }

    // 实在匹配不上：退回到「与当前主题类型一致」的内置主题
    const kind = vscode.window.activeColorTheme.kind;
    const wantedUiTheme =
      kind === vscode.ColorThemeKind.Light
        ? "vs"
        : kind === vscode.ColorThemeKind.HighContrastLight
          ? "hc-light"
          : kind === vscode.ColorThemeKind.HighContrast
            ? "hc-black"
            : "vs-dark";
    const fallback =
      candidates.find((c) => c.uiTheme === wantedUiTheme && c.file.includes("theme-defaults")) ||
      candidates.find((c) => c.uiTheme === wantedUiTheme);
    if (fallback) {
      console.warn(
        `[伪装界面] 未能匹配主题 "${settingValue}"，改用 ${fallback.label} 的令牌色`,
      );
    }
    return fallback || null;
  }

  /**
   * 读设置判断当前生效的主题 id
   * 注意 window.autoDetectColorScheme / autoDetectHighContrast 打开时，
   * workbench.colorTheme 并不是生效的那个
   */
  private static getEffectiveThemeSetting(): string {
    const workbench = vscode.workspace.getConfiguration("workbench");
    const windowCfg = vscode.workspace.getConfiguration("window");
    const kind = vscode.window.activeColorTheme.kind;

    if (
      windowCfg.get<boolean>("autoDetectHighContrast", false) &&
      (kind === vscode.ColorThemeKind.HighContrast ||
        kind === vscode.ColorThemeKind.HighContrastLight)
    ) {
      return kind === vscode.ColorThemeKind.HighContrastLight
        ? workbench.get<string>(
            "preferredHighContrastLightColorTheme",
            "Default High Contrast Light",
          )
        : workbench.get<string>(
            "preferredHighContrastColorTheme",
            "Default High Contrast",
          );
    }

    if (windowCfg.get<boolean>("autoDetectColorScheme", false)) {
      return kind === vscode.ColorThemeKind.Light
        ? workbench.get<string>("preferredLightColorTheme", "Light 2026")
        : workbench.get<string>("preferredDarkColorTheme", "Dark 2026");
    }

    return workbench.get<string>("colorTheme", "");
  }

  /** 枚举所有主题贡献点（内置 + 插件），算出它们可能对应的设置值 */
  private static listColorThemes(): ThemeCandidate[] {
    const result: ThemeCandidate[] = [];
    const language = vscode.env.language || "en";

    for (const extension of vscode.extensions.all) {
      const contributes = extension.packageJSON?.contributes as
        | { themes?: Array<{ id?: string; label?: string; path?: string; uiTheme?: string }> }
        | undefined;
      const themes = contributes?.themes;
      if (!Array.isArray(themes)) {
        continue;
      }

      for (const theme of themes) {
        if (!theme || !theme.path) {
          continue;
        }
        const label = resolveNlsLabel(
          extension.extensionPath,
          theme.label || theme.id || "",
          language,
        );
        const settingsId = theme.id || `${extension.id}.${label}`;
        const keys = [
          theme.id,
          label,
          settingsId,
          `${extension.id}.${theme.id || label}`,
        ].filter((k): k is string => typeof k === "string" && k.length > 0);

        result.push({
          keys: Array.from(new Set(keys)),
          file: path.join(extension.extensionPath, theme.path),
          uiTheme: theme.uiTheme,
          label: label || theme.id || theme.path,
          settingsId,
        });
      }
    }

    return result;
  }

  /** 读取主题文件（含 include 链）并缓存 */
  private static loadTheme(
    theme: ThemeCandidate,
  ): {
    colors: Record<string, string>;
    rules: FlatRule[];
    label: string;
    settingsId: string;
  } | null {
    const parsed = this.loadThemeFile(theme.file, new Set<string>(), 0);
    if (!parsed) {
      return null;
    }
    return {
      colors: parsed.colors,
      rules: parsed.rules,
      label: theme.label,
      settingsId: theme.settingsId,
    };
  }

  private static loadThemeFile(
    file: string,
    visited: Set<string>,
    depth: number,
  ): { colors: Record<string, string>; rules: FlatRule[] } | null {
    const resolved = path.resolve(file);
    const cached = this.fileCache.get(resolved);
    if (cached) {
      return cached;
    }
    // include 链防环 + 深度保护
    if (depth > 10 || visited.has(resolved)) {
      return null;
    }
    visited.add(resolved);

    let raw: {
      include?: string;
      colors?: Record<string, string>;
      tokenColors?: Array<{
        scope?: string | string[];
        settings?: { foreground?: string; fontStyle?: string };
      }>;
    };
    try {
      raw = JSON.parse(fs.readFileSync(resolved, "utf8"));
    } catch (error) {
      console.warn(`[伪装界面] 读取主题文件失败: ${resolved}`, error);
      return null;
    }

    // 先加载被 include 的基础主题，再用自己的内容覆盖/追加
    let colors: Record<string, string> = {};
    let rules: FlatRule[] = [];
    if (raw.include) {
      const base = this.loadThemeFile(
        path.resolve(path.dirname(resolved), raw.include),
        visited,
        depth + 1,
      );
      if (base) {
        colors = { ...base.colors };
        rules = base.rules.slice();
      }
    }

    if (raw.colors && typeof raw.colors === "object") {
      colors = { ...colors, ...raw.colors };
    }

    if (Array.isArray(raw.tokenColors)) {
      for (const themeRule of raw.tokenColors) {
        rules = rules.concat(toFlatRules(themeRule, rules.length));
      }
    }

    // order 统一重排，保证「后定义的胜出」这个规则在合并后仍然成立
    rules = rules.map((rule, index) => ({ ...rule, order: index }));

    const result = { colors, rules };
    this.fileCache.set(resolved, result);
    return result;
  }

  /** 把用户的 editor.tokenColorCustomizations 展开成规则（追加在主题规则之后） */
  private static buildCustomizationRules(
    customizations: Record<string, unknown>,
    theme: { label: string; settingsId: string },
  ): FlatRule[] {
    const result: FlatRule[] = [];

    const appendSection = (section: Record<string, unknown> | undefined) => {
      if (!section || typeof section !== "object") {
        return;
      }

      // 快捷分组：comments / strings / numbers / keywords / types / functions / variables
      const groups: Array<{ name: string; scopes: string[] }> = [
        { name: "comments", scopes: ["comment"] },
        { name: "strings", scopes: ["string"] },
        { name: "numbers", scopes: ["constant.numeric"] },
        { name: "keywords", scopes: ["keyword", "storage"] },
        {
          name: "types",
          scopes: ["entity.name.type", "entity.name.class", "support.class", "support.type"],
        },
        { name: "functions", scopes: ["entity.name.function", "support.function"] },
        { name: "variables", scopes: ["variable"] },
      ];

      for (const group of groups) {
        const value = section[group.name];
        if (!value) {
          continue;
        }
        const setting =
          typeof value === "string" ? { foreground: value } : (value as { foreground?: string; fontStyle?: string });
        for (const scope of group.scopes) {
          result.push({
            scope,
            depth: scope.split(".").length,
            parents: [],
            foreground: normalizeColor(setting.foreground),
            fontStyle: setting.fontStyle,
            order: Number.MAX_SAFE_INTEGER,
          });
        }
      }

      // textMateRules：最精确的一层
      const textMateRules = section["textMateRules"];
      if (Array.isArray(textMateRules)) {
        for (const rule of textMateRules) {
          result.push(...toFlatRules(rule, Number.MAX_SAFE_INTEGER));
        }
      }
    };

    // 全局段
    appendSection(customizations);

    // 主题作用域段：[Dark Modern] / [*]
    for (const key of Object.keys(customizations)) {
      if (!/^\[.+\]$/.test(key)) {
        continue;
      }
      const scopeName = key.slice(1, -1).trim();
      if (
        scopeName !== "*" &&
        scopeName !== theme.label &&
        scopeName !== theme.settingsId
      ) {
        continue;
      }
      const section = customizations[key];
      if (section && typeof section === "object" && !Array.isArray(section)) {
        appendSection(section as Record<string, unknown>);
      }
    }

    return result.map((rule, index) => ({ ...rule, order: index }));
  }

  /**
   * 按 VSCode 的规则选出一条生效规则：
   * scope 前缀命中 → 取匹配段数最多的 → 同段数取后定义的
   */
  private static resolveToken(
    spec: MtkTokenSpec,
    rules: FlatRule[],
    colors?: Record<string, string>,
  ): { foreground: string; fontStyle?: string } | undefined {
    if (rules.length > 0) {
      for (const scope of spec.scopes) {
        const hit = this.findRule(scope, rules);
        if (hit && hit.foreground) {
          return { foreground: hit.foreground, fontStyle: hit.fontStyle };
        }
      }
    }

    // colorKeys 只在主题规则里兜底（用户自定义不讲这个）
    for (const colorKey of spec.colorKeys || []) {
      const color = normalizeColor(colors?.[colorKey]);
      if (color) {
        return { foreground: color };
      }
    }

    return undefined;
  }

  private static findRule(
    scope: string,
    rules: FlatRule[],
  ): FlatRule | undefined {
    // 第一轮：只看单段选择器（最贴近「已知一个 scope」的情形）
    let best: FlatRule | undefined;
    let bestDepth = 0;
    for (const rule of rules) {
      if (rule.parents.length > 0) {
        continue;
      }
      if (!this.scopeMatches(scope, rule.scope)) {
        continue;
      }
      const depth = rule.scope.split(".").length;
      // 精度更高者胜；精度相同时后定义的胜（>= 保证后者覆盖）
      if (depth >= bestDepth) {
        best = rule;
        bestDepth = depth;
      }
    }
    if (best) {
      return best;
    }

    // 第二轮：允许带父级的复杂选择器（如 "source.css entity.other.attribute-name.class.css"）。
    // 我们没有父级 scope 栈，所以分两档近似：
    //   档 0：最后一段与候选 scope 完全一致（最可信，如 CSS 类名选择器）
    //   档 1：最后一段是候选 scope 的前缀（规则比候选更宽泛）
    // 同档内优先父级更少、scope 更长、定义更晚的规则
    let bestComplex: FlatRule | undefined;
    let bestComplexKey: [number, number, number, number] | undefined;
    for (const rule of rules) {
      if (rule.parents.length === 0) {
        continue;
      }
      const tier = rule.scope === scope ? 0 : this.scopeMatches(scope, rule.scope) ? 1 : -1;
      if (tier < 0) {
        continue;
      }
      const key: [number, number, number, number] = [
        tier,
        -rule.parents.length,
        rule.scope.length,
        rule.order,
      ];
      if (
        !bestComplexKey ||
        key[0] < bestComplexKey[0] ||
        (key[0] === bestComplexKey[0] &&
          (key[1] > bestComplexKey[1] ||
            (key[1] === bestComplexKey[1] &&
              (key[2] > bestComplexKey[2] ||
                (key[2] === bestComplexKey[2] && key[3] > bestComplexKey[3])))))
      ) {
        bestComplex = rule;
        bestComplexKey = key;
      }
    }
    return bestComplex;
  }

  /** scope 前缀匹配：完全相等，或 token scope 以 "选择器." 开头 */
  private static scopeMatches(tokenScope: string, selector: string): boolean {
    return (
      tokenScope === selector || tokenScope.startsWith(`${selector}.`)
    );
  }
}
