import * as vscode from "vscode";
import { Store } from "../stores";

/**
 * 伪装管理器 - 用于在WebView失去焦点时随机生成合理的文件名和图标组合
 */
export class DisguiseManager {
  /** 文件类型映射表 */
  private static readonly FILE_TYPE_MAP = {
    "file_type_cheader.svg": {
      extensions: [".h"],
      names: ["stdio", "stdlib", "string", "math", "time", "ctype", "assert", "errno", "limits", "signal", "stdarg", "stddef", "setjmp", "locale", "float"],
      prefixes: ["", "lib", "sys_", "user_", "app_", "core_", "util_", "helper_"]
    },
    "file_type_cpp.svg": {
      extensions: [".cpp", ".cc", ".cxx"],
      names: ["main", "index", "app", "core", "utils", "helper", "service", "manager", "controller", "model", "view", "test", "demo", "example"],
      prefixes: ["", "my_", "app_", "user_", "system_", "data_", "file_", "net_", "db_", "api_"]
    },
    "file_type_cppheader.svg": {
      extensions: [".hpp", ".hxx", ".h++"],
      names: ["common", "config", "types", "constants", "macros", "utils", "helper", "interface", "abstract", "base", "core", "system"],
      prefixes: ["", "lib", "sys_", "user_", "app_", "core_", "util_", "i_", "abstract_"]
    },
    "file_type_csharp.svg": {
      extensions: [".cs"],
      names: ["Program", "Startup", "Controller", "Service", "Model", "Repository", "Helper", "Manager", "Handler", "Provider", "Factory", "Builder"],
      prefixes: ["", "I", "Base", "Abstract", "User", "System", "Data", "File", "Network", "Database", "Api"]
    },
    "file_type_css.svg": {
      extensions: [".css"],
      names: ["style", "main", "app", "layout", "theme", "component", "global", "reset", "normalize", "responsive", "print", "mobile"],
      prefixes: ["", "base-", "layout-", "component-", "page-", "theme-", "vendor-", "custom-", "responsive-"]
    },
    "file_type_git.svg": {
      extensions: [".gitignore", ".gitattributes", ".gitmodules"],
      names: ["gitignore", "gitattributes", "gitmodules"],
      prefixes: ["", ".", "local-", "global-"]
    },
    "file_type_html.svg": {
      extensions: [".html", ".htm"],
      names: ["index", "home", "about", "contact", "login", "register", "dashboard", "profile", "settings", "help", "404", "500"],
      prefixes: ["", "page-", "template-", "layout-", "partial-", "component-", "widget-", "section-"]
    },
    "file_type_ini.svg": {
      extensions: [".ini", ".cfg", ".conf"],
      names: ["config", "settings", "app.config", "database", "cache", "session", "logging", "security", "api", "system", "user", "default"],
      prefixes: ["", "app.", "system.", "user.", "db.", "cache.", "log.", "auth.", "api.", "service."]
    },
    "file_type_java.svg": {
      extensions: [".java"],
      names: ["Main", "Application", "Controller", "Service", "Repository", "Model", "Entity", "Dto", "Config", "Utils", "Helper", "Manager"],
      prefixes: ["", "Base", "Abstract", "I", "User", "System", "Data", "File", "Network", "Database", "Api", "Test"]
    },
    "file_type_js.svg": {
      extensions: [".js", ".mjs"],
      names: ["index", "main", "app", "config", "utils", "helper", "service", "controller", "model", "router", "middleware", "component", "test"],
      prefixes: ["", "app-", "user-", "admin-", "api-", "db-", "file-", "net-", "util-", "test-", "demo-"]
    },
    "file_type_json.svg": {
      extensions: [".json"],
      names: ["package", "config", "settings", "data", "schema", "manifest", "tsconfig", "babel.config", "webpack.config", "eslint.config"],
      prefixes: ["", "app-", "user-", "system-", "test-", "dev-", "prod-", "local-", "global-"]
    },
    "file_type_less.svg": {
      extensions: [".less"],
      names: ["style", "main", "app", "variables", "mixins", "layout", "components", "theme", "responsive", "utilities"],
      prefixes: ["", "base-", "layout-", "component-", "page-", "theme-", "vendor-", "custom-", "util-"]
    },
    "file_type_light_tex.svg": {
      extensions: [".tex", ".latex"],
      names: ["main", "document", "chapter", "section", "article", "report", "book", "thesis", "presentation", "bibliography", "appendix", "abstract"],
      prefixes: ["", "ch_", "sec_", "fig_", "tab_", "ref_", "bib_", "app_", "doc_", "draft_"]
    },
    "file_type_light_yaml.svg": {
      extensions: [".yaml", ".yml"],
      names: ["config", "docker-compose", "workflow", "pipeline", "database", "server", "deploy", "build", "test", "environment", "secrets"],
      prefixes: ["", "app-", "dev-", "prod-", "test-", "staging-", "local-", "ci-", "cd-", "k8s-"]
    },
    "file_type_log.svg": {
      extensions: [".log", ".txt"],
      names: ["application", "error", "access", "debug", "system", "security", "audit", "performance", "trace", "console", "server", "database"],
      prefixes: ["", "app-", "error-", "access-", "debug-", "sys-", "auth-", "perf-", "trace-", "db-"]
    },
    "file_type_lua.svg": {
      extensions: [".lua"],
      names: ["init", "config", "main", "utils", "helper", "module", "script", "test", "game", "addon", "plugin", "extension"],
      prefixes: ["", "lib_", "mod_", "game_", "ui_", "net_", "db_", "util_", "test_", "addon_", "plugin_"]
    },
    "file_type_markdown.svg": {
      extensions: [".md", ".markdown"],
      names: ["README", "CHANGELOG", "LICENSE", "CONTRIBUTING", "docs", "guide", "tutorial", "api", "install", "usage", "faq", "notes"],
      prefixes: ["", "doc-", "guide-", "tutorial-", "api-", "readme-", "changelog-", "license-", "contrib-"]
    },
    "file_type_php3.svg": {
      extensions: [".php"],
      names: ["index", "config", "functions", "class", "model", "controller", "view", "helper", "service", "repository", "middleware"],
      prefixes: ["", "app_", "user_", "admin_", "api_", "db_", "file_", "mail_", "cache_", "session_", "auth_"]
    },
    "file_type_powershell.svg": {
      extensions: [".ps1", ".psm1", ".psd1"],
      names: ["Install", "Deploy", "Setup", "Config", "Backup", "Restore", "Test", "Build", "Clean", "Update", "Remove", "Get-Info"],
      prefixes: ["", "System-", "User-", "Admin-", "Network-", "File-", "Database-", "Service-", "Process-", "Registry-"]
    },
    "file_type_python.svg": {
      extensions: [".py", ".pyw"],
      names: ["main", "app", "config", "utils", "helper", "model", "view", "controller", "service", "test", "script", "cli", "setup"],
      prefixes: ["", "app_", "user_", "admin_", "api_", "db_", "file_", "net_", "util_", "test_", "cli_", "script_"]
    },
    "file_type_r.svg": {
      extensions: [".r", ".R", ".rmd"],
      names: ["analysis", "plot", "data", "model", "stats", "regression", "clustering", "visualization", "report", "script", "utils", "functions"],
      prefixes: ["", "data_", "plot_", "model_", "stats_", "viz_", "analysis_", "report_", "util_", "test_"]
    },
    "file_type_ruby.svg": {
      extensions: [".rb", ".rbw"],
      names: ["app", "config", "controller", "model", "view", "helper", "service", "spec", "test", "rake", "gem", "script"],
      prefixes: ["", "app_", "user_", "admin_", "api_", "db_", "file_", "net_", "util_", "test_", "spec_", "lib_"]
    },
    "file_type_rust.svg": {
      extensions: [".rs"],
      names: ["main", "lib", "mod", "config", "utils", "helper", "service", "model", "test", "bin", "examples", "bench"],
      prefixes: ["", "app_", "user_", "sys_", "net_", "db_", "file_", "util_", "test_", "bench_", "example_"]
    },
    "file_type_rust_toolchain.svg": {
      extensions: ["rust-toolchain", "rust-toolchain.toml"],
      names: ["rust-toolchain", "toolchain"],
      prefixes: ["", "stable-", "beta-", "nightly-", "custom-"]
    },
    "file_type_scss.svg": {
      extensions: [".scss"],
      names: ["style", "main", "app", "_variables", "_mixins", "_functions", "_base", "_layout", "_components", "_utilities"],
      prefixes: ["", "_", "base-", "layout-", "component-", "page-", "theme-", "vendor-", "util-"]
    },
    "file_type_sql.svg": {
      extensions: [".sql"],
      names: ["schema", "migration", "seed", "query", "procedure", "function", "trigger", "view", "index", "backup", "restore", "data"],
      prefixes: ["", "create_", "drop_", "alter_", "insert_", "update_", "delete_", "select_", "proc_", "func_", "v_"]
    },
    "file_type_swift.svg": {
      extensions: [".swift"],
      names: ["AppDelegate", "ViewController", "Model", "View", "Service", "Manager", "Helper", "Extension", "Protocol", "Enum", "Struct", "Test"],
      prefixes: ["", "UI", "NS", "CG", "CA", "Core", "Foundation", "UIKit", "SwiftUI", "Combine", "Test"]
    },
    "file_type_typescript.svg": {
      extensions: [".ts"],
      names: ["index", "main", "app", "config", "types", "interfaces", "utils", "helper", "service", "controller", "model", "component"],
      prefixes: ["", "app-", "user-", "admin-", "api-", "db-", "file-", "net-", "util-", "test-", "i-", "abstract-"]
    },
    "file_type_typescriptdef.svg": {
      extensions: [".d.ts"],
      names: ["global", "types", "interfaces", "api", "models", "components", "utils", "config", "constants", "enums"],
      prefixes: ["", "global-", "app-", "api-", "component-", "util-", "test-", "@types/"]
    },
    "file_type_vue.svg": {
      extensions: [".vue"],
      names: ["App", "Home", "About", "Contact", "Login", "Register", "Dashboard", "Profile", "Settings", "Header", "Footer", "Sidebar"],
      prefixes: ["", "Base", "Layout", "Page", "Component", "Widget", "Section", "User", "Admin", "Auth"]
    },
    "file_type_xml.svg": {
      extensions: [".xml", ".xsd", ".xsl"],
      names: ["config", "settings", "data", "schema", "stylesheet", "manifest", "sitemap", "feed", "layout", "template"],
      prefixes: ["", "app-", "system-", "user-", "web-", "api-", "db-", "file-", "service-", "component-"]
    },
    "file_type_xsl.svg": {
      extensions: [".xsl", ".xslt"],
      names: ["transform", "stylesheet", "template", "format", "convert", "report", "layout", "presentation", "document", "output"],
      prefixes: ["", "xsl-", "transform-", "template-", "format-", "report-", "doc-", "output-", "convert-"]
    }
  };

  /** 存储每个webview的伪装信息，避免频繁切换时重新生成 */
  private static disguiseCache = new Map<string, { title: string; iconPath: vscode.Uri }>();

  /**
   * 获取随机伪装信息
   * @param webviewId WebView的唯一标识
   * @returns 包含title和iconPath的伪装信息
   */
  public static getRandomDisguise(webviewId: string): { title: string; iconPath: vscode.Uri } {
    // 如果已有缓存且不需要重新生成，直接返回
    if (this.disguiseCache.has(webviewId)) {
      return this.disguiseCache.get(webviewId)!;
    }

    // 获取用户选择的文件类型
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const selectedTypes = config.get<string[]>("selectedDisguiseTypes", []);

    // 如果用户没有选择任何类型，则使用所有类型
    const availableTypes = selectedTypes.length > 0 ? selectedTypes : Object.keys(this.FILE_TYPE_MAP);

    // 过滤掉无效的类型（防止配置文件中存在已删除的类型）
    const validTypes = availableTypes.filter(type => this.FILE_TYPE_MAP.hasOwnProperty(type));

    // 如果没有有效类型，则回退到所有类型
    const finalTypes = validTypes.length > 0 ? validTypes : Object.keys(this.FILE_TYPE_MAP);

    // 随机选择一个文件类型
    const randomIconFile = finalTypes[Math.floor(Math.random() * finalTypes.length)];
    const fileTypeInfo = this.FILE_TYPE_MAP[randomIconFile as keyof typeof this.FILE_TYPE_MAP];

    // 随机生成文件名
    const randomName = fileTypeInfo.names[Math.floor(Math.random() * fileTypeInfo.names.length)];
    const randomPrefix = fileTypeInfo.prefixes[Math.floor(Math.random() * fileTypeInfo.prefixes.length)];
    const randomExtension = fileTypeInfo.extensions[Math.floor(Math.random() * fileTypeInfo.extensions.length)];

    // 组合最终的文件名
    const fileName = `${randomPrefix}${randomName}${randomExtension}`;

    // 构建图标路径
    const iconPath = vscode.Uri.joinPath(
      Store.context!.extensionUri,
      "resources",
      "fake",
      randomIconFile
    );

    const disguiseInfo = {
      title: fileName,
      iconPath: iconPath
    };

    // 缓存结果
    this.disguiseCache.set(webviewId, disguiseInfo);

    console.log(`为WebView ${webviewId} 生成伪装信息: ${fileName} (${randomIconFile})`);
    return disguiseInfo;
  }

  /**
   * 清除指定WebView的伪装缓存
   * @param webviewId WebView的唯一标识
   */
  public static clearDisguiseCache(webviewId: string): void {
    this.disguiseCache.delete(webviewId);
  }

  /**
   * 清除所有伪装缓存
   */
  public static clearAllDisguiseCache(): void {
    this.disguiseCache.clear();
  }

  /**
   * 强制重新生成伪装信息
   * @param webviewId WebView的唯一标识
   * @returns 新的伪装信息
   */
  public static regenerateDisguise(webviewId: string): { title: string; iconPath: vscode.Uri } {
    this.clearDisguiseCache(webviewId);
    return this.getRandomDisguise(webviewId);
  }

  /**
   * 获取支持的文件类型数量
   */
  public static getSupportedFileTypesCount(): number {
    return Object.keys(this.FILE_TYPE_MAP).length;
  }

  /**
   * 获取所有支持的文件类型
   */
  public static getSupportedFileTypes(): string[] {
    return Object.keys(this.FILE_TYPE_MAP);
  }

  /**
   * 检查是否启用了伪装功能
   * @returns 是否启用伪装
   */
  public static isDisguiseEnabled(): boolean {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    return config.get<boolean>("enableDisguise", true);
  }

  /**
   * 根据配置获取伪装信息，如果禁用伪装则返回默认值
   * @param webviewId WebView的唯一标识
   * @param defaultTitle 默认标题
   * @returns 伪装信息或默认信息
   */
  public static getDisguiseOrDefault(
    webviewId: string, 
    defaultTitle: string = "代码文件"
  ): { title: string; iconPath: vscode.Uri } {
    if (!this.isDisguiseEnabled()) {
      return {
        title: defaultTitle,
        iconPath: vscode.Uri.joinPath(
          Store.context!.extensionUri,
          "resources",
          "icon.svg",
        )
      };
    }

    return this.getRandomDisguise(webviewId);
  }

  /**
   * 获取缓存统计信息
   */
  public static getCacheStats(): { totalCached: number; webviewIds: string[] } {
    return {
      totalCached: this.disguiseCache.size,
      webviewIds: Array.from(this.disguiseCache.keys())
    };
  }

  /**
   * 获取文件类型的详细信息（用于前端显示）
   * @param iconFile 图标文件名
   * @returns 文件类型信息
   */
  public static getFileTypeInfo(iconFile: string): any {
    return this.FILE_TYPE_MAP[iconFile as keyof typeof this.FILE_TYPE_MAP];
  }

  /**
   * 获取文件类型的预览示例
   * @param iconFile 图标文件名
   * @returns 预览文件名示例
   */
  public static getFileTypePreview(iconFile: string): string {
    const fileTypeInfo = this.FILE_TYPE_MAP[iconFile as keyof typeof this.FILE_TYPE_MAP];
    if (!fileTypeInfo) {
      return "示例文件";
    }

    // 取第一个名称、第一个前缀、第一个扩展名作为预览
    const name = fileTypeInfo.names[0] || "example";
    const prefix = fileTypeInfo.prefixes[0] || "";
    const extension = fileTypeInfo.extensions[0] || "";

    return `${prefix}${name}${extension}`;
  }

  /**
   * 获取文件类型的显示名称
   * @param iconFile 图标文件名
   * @returns 显示名称
   */
  public static getFileTypeDisplayName(iconFile: string): string {
    const displayNames: { [key: string]: string } = {
      "file_type_cheader.svg": "C 头文件",
      "file_type_cpp.svg": "C++ 源文件",
      "file_type_cppheader.svg": "C++ 头文件",
      "file_type_csharp.svg": "C# 源文件",
      "file_type_css.svg": "CSS 样式文件",
      "file_type_git.svg": "Git 配置文件",
      "file_type_html.svg": "HTML 网页文件",
      "file_type_java.svg": "Java 源文件",
      "file_type_js.svg": "JavaScript 源文件",
      "file_type_json.svg": "JSON 配置文件",
      "file_type_less.svg": "Less 样式文件",
      "file_type_php3.svg": "PHP 源文件",
      "file_type_powershell.svg": "PowerShell 脚本",
      "file_type_scss.svg": "Sass 样式文件",
      "file_type_typescript.svg": "TypeScript 源文件",
      "file_type_typescriptdef.svg": "TypeScript 声明文件",
      "file_type_vue.svg": "Vue 组件文件",
      "file_type_xml.svg": "XML 配置文件"
    };

    return displayNames[iconFile] || iconFile.replace("file_type_", "").replace(".svg", "");
  }

  /**
   * 获取用户当前选择的伪装类型
   * @returns 用户选择的文件类型数组
   */
  public static getSelectedDisguiseTypes(): string[] {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    return config.get<string[]>("selectedDisguiseTypes", []);
  }

  /**
   * 更新用户选择的伪装类型
   * @param selectedTypes 新的选择类型数组
   */
  public static async updateSelectedDisguiseTypes(selectedTypes: string[]): Promise<void> {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    await config.update("selectedDisguiseTypes", selectedTypes, vscode.ConfigurationTarget.Global);
  }
}
