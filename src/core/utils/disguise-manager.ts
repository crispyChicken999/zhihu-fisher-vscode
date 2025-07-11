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
    "file_type_scss.svg": {
      extensions: [".scss"],
      names: ["style", "main", "app", "_variables", "_mixins", "_functions", "_base", "_layout", "_components", "_utilities"],
      prefixes: ["", "_", "base-", "layout-", "component-", "page-", "theme-", "vendor-", "util-"]
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

    // 随机选择一个文件类型
    const iconFiles = Object.keys(this.FILE_TYPE_MAP);
    const randomIconFile = iconFiles[Math.floor(Math.random() * iconFiles.length)];
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
}
