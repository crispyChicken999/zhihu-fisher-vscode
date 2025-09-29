import * as vscode from "vscode";
import { Store } from "../stores";
import { TooltipContents } from "./tooltip-contents";

/**
 * 从 disguise-manager 导入的文件类型映射
 * 将文件图标名映射到对应的编程语言类型
 */
const ICON_TO_LANGUAGE_MAP: { [iconFile: string]: string } = {
  "file_type_cheader.svg": "c",
  "file_type_cpp.svg": "cpp",
  "file_type_cppheader.svg": "cpp",
  "file_type_csharp.svg": "csharp",
  "file_type_css.svg": "css",
  "file_type_git.svg": "git",
  "file_type_html.svg": "html",
  "file_type_ini.svg": "config",
  "file_type_java.svg": "java",
  "file_type_js.svg": "javascript",
  "file_type_json.svg": "json",
  "file_type_less.svg": "less",
  "file_type_light_tex.svg": "latex",
  "file_type_light_yaml.svg": "yaml",
  "file_type_log.svg": "log",
  "file_type_lua.svg": "lua",
  "file_type_markdown.svg": "markdown",
  "file_type_php3.svg": "php",
  "file_type_powershell.svg": "powershell",
  "file_type_python.svg": "python",
  "file_type_r.svg": "r",
  "file_type_ruby.svg": "ruby",
  "file_type_rust.svg": "rust",
  "file_type_rust_toolchain.svg": "rust",
  "file_type_scss.svg": "scss",
  "file_type_sql.svg": "sql",
  "file_type_swift.svg": "swift",
  "file_type_typescript.svg": "typescript",
  "file_type_typescriptdef.svg": "typescript",
  "file_type_vue.svg": "vue",
  "file_type_xml.svg": "xml",
  "file_type_xsl.svg": "xml",
};

/**
 * 伪装文件树节点类型
 */
export interface FakeFileItem extends vscode.TreeItem {
  type: "folder" | "file";
  children?: FakeFileItem[];
  extension?: string;
  isRoot?: boolean;
}

/**
 * 文件类型到扩展名的映射
 */
const FILE_TYPE_EXTENSIONS: { [key: string]: string[] } = {
  c: ["h", "c"],
  cpp: ["cpp", "cxx", "cc", "h", "hpp", "hxx", "h++"],
  csharp: ["cs", "csx"],
  css: ["css"],
  git: ["gitignore", "gitattributes", "gitmodules"],
  html: ["html", "htm"],
  config: ["ini", "cfg", "conf"],
  java: ["java"],
  javascript: ["js", "jsx", "mjs", "cjs"],
  json: ["json", "jsonc"],
  less: ["less"],
  latex: ["tex", "latex"],
  yaml: ["yml", "yaml"],
  log: ["log", "txt"],
  lua: ["lua"],
  markdown: ["md", "markdown"],
  php: ["php", "phar"],
  powershell: ["ps1", "psm1", "psd1"],
  python: ["py", "pyw", "pyx", "pyi"],
  r: ["r", "R", "rmd"],
  ruby: ["rb", "rbw", "gemspec"],
  rust: ["rs", "toml"],
  scss: ["scss"],
  sql: ["sql", "sqlite"],
  swift: ["swift"],
  typescript: ["ts", "tsx", "d.ts"],
  vue: ["vue"],
  xml: ["xml", "xsl", "xsd", "xslt"],
  // 为了向后兼容，保留一些旧的类型名
  kotlin: ["kt", "kts"],
  go: ["go", "mod"],
  shell: ["sh", "bash", "zsh"],
  dockerfile: ["dockerfile", ".dockerignore"],
  react: ["jsx", "tsx"],
  angular: ["ts", "html", "scss"],
  nodejs: ["js", "ts", "json"],
  dotnet: ["cs", "csproj", "sln"],
  spring: ["java", "xml", "properties"],
  django: ["py", "html", "css"],
  flask: ["py", "html", "css"],
};

/**
 * 伪装文件列表数据提供者
 * 生成类似真实项目的文件结构，用于侧边栏伪装
 */
export class FakeFileListDataProvider
  implements vscode.TreeDataProvider<FakeFileItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    FakeFileItem | undefined | null | void
  > = new vscode.EventEmitter<FakeFileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    FakeFileItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private fakeFileStructure: FakeFileItem[] = [];
  private treeView?: vscode.TreeView<FakeFileItem>;

  constructor() {
    this.generateRandomFakeFileStructure();
  }

  /**
   * 设置TreeView引用
   */
  public setTreeView(treeView: vscode.TreeView<FakeFileItem>): void {
    this.treeView = treeView;
  }

  /**
   * 获取树节点
   */
  getTreeItem(element: FakeFileItem): vscode.TreeItem {
    return element;
  }

  /**
   * 获取子节点
   */
  getChildren(element?: FakeFileItem): Thenable<FakeFileItem[]> {
    if (!element) {
      return Promise.resolve(this.fakeFileStructure);
    }

    return Promise.resolve(element.children || []);
  }

  /**
   * 刷新文件列表（随机生成新结构）
   */
  public refresh(): void {
    this.generateRandomFakeFileStructure();
    this._onDidChangeTreeData.fire();
  }

  /**
   * 随机生成伪装文件结构
   */
  private generateRandomFakeFileStructure(): void {
    const selectedFileTypes = this.getSelectedFileTypes();
    const extensionsToUse = this.getExtensionsFromFileTypes(selectedFileTypes);

    // 生成基础文件夹结构，在顶部添加tips文件夹
    const baseStructure = [
      // 顶部tips文件夹，包含提示和打赏项
      this.createExpandedFolder("zhihu-fisher", [
        this.createTipsItem(),
        this.createSponsorItem(),
      ]),
      // 主要项目结构
      this.createExpandedFolder("src", [
        this.createExpandedFolder(
          "components",
          this.generateFilesForExtensions(extensionsToUse, 3, 6)
        ),
        this.createExpandedFolder(
          "utils",
          this.generateFilesForExtensions(extensionsToUse, 2, 4)
        ),
        this.createExpandedFolder(
          "services",
          this.generateFilesForExtensions(extensionsToUse, 2, 3)
        ),
        this.createExpandedFolder(
          "hooks",
          this.generateFilesForExtensions(extensionsToUse, 1, 3)
        ),
        this.createExpandedFolder(
          "types",
          this.generateFilesForExtensions(extensionsToUse, 1, 2)
        ),
        ...this.generateMainFiles(extensionsToUse),
      ]),
      this.createExpandedFolder(
        "tests",
        this.generateTestFiles(extensionsToUse)
      ),
      this.createExpandedFolder("docs", [
        this.createFile("README.md", "md"),
        this.createFile("API.md", "md"),
        this.createFile("CHANGELOG.md", "md"),
        this.createFile("TODO.md", "md"),
      ]),
      this.createExpandedFolder("public", [
        this.createFile("index.html", "html"),
        this.createFile("style.css", "css"),
        this.createFile("main.js", "js"),
        this.createExpandedFolder("assets", [
          this.createFile("logo.svg", "svg"),
          this.createFile("icon.png", "png"),
          this.createFile("app.css", "css"),
        ]),
        this.createExpandedFolder("images", [
          this.createFile("banner.jpg", "jpg"),
          this.createFile("avatar.png", "png"),
        ]),
      ]),
      this.createExpandedFolder("config", [
        this.createFile("webpack.config.js", "js"),
        this.createFile("babel.config.js", "js"),
        this.createFile("tsconfig.json", "json"),
        this.createFile(".env.example", "env"),
      ]),
      this.createExpandedFolder("scripts", [
        this.createFile("build.sh", "sh"),
        this.createFile("deploy.js", "js"),
        this.createFile("setup.py", "py"),
      ]),
      ...this.generateOptionalFolders(extensionsToUse),
      ...this.generateConfigFiles(extensionsToUse),
    ];

    this.fakeFileStructure = baseStructure;
  }

  /**
   * 创建默认展开的文件夹
   */
  private createExpandedFolder(
    name: string,
    children: FakeFileItem[] = []
  ): FakeFileItem {
    return {
      label: name,
      type: "folder",
      children: children,
      collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
      iconPath: vscode.ThemeIcon.Folder,
      contextValue: "fakeFolder",
    };
  }

  /**
   * 创建打赏入口项
   */
  private createSponsorItem(): FakeFileItem {
    const item: FakeFileItem = {
      label: "zhihu-fisher.buymecoffee",
      id: "sponsor-item",
      type: "file",
      iconPath: Store.context
        ? vscode.Uri.joinPath(
            Store.context.extensionUri,
            "resources",
            "icon.svg"
          )
        : new vscode.ThemeIcon("coffee"),
      tooltip: TooltipContents.getSponsorTooltip(),
      command: {
        command: "zhihu-fisher.buyMeCoffee",
        title: "打开打赏页面",
        arguments: [],
      },
      contextValue: "sponsorItem",
    };
    return item;
  }

  /**
   * 创建提示项
   */
  private createTipsItem(): FakeFileItem {
    const item: FakeFileItem = {
      label: "zhihu-fisher.tips",
      id: "tips-item",
      type: "file",
      iconPath: Store.context
        ? vscode.Uri.joinPath(
            Store.context.extensionUri,
            "resources",
            "icon.svg"
          )
        : new vscode.ThemeIcon("lightbulb"),
      tooltip: TooltipContents.getDisguiseTipsTooltip(),
      command: {
        command: "zhihu-fisher.onFakeFileClick",
        title: "恢复界面",
        arguments: [""],
      },
      contextValue: "tipsItem",
    };
    return item;
  }

  /**
   * 获取用户选择的文件类型
   */
  private getSelectedFileTypes(): string[] {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    // 读取用户配置的selectedDisguiseTypes（存储的是图标文件名，如 file_type_js.svg）
    const selectedIconFiles = config.get<string[]>("selectedDisguiseTypes", []);

    // 如果用户选择了类型，则转换为语言类型
    if (selectedIconFiles && selectedIconFiles.length > 0) {
      const languageTypes: string[] = [];

      selectedIconFiles.forEach((iconFile) => {
        const languageType = ICON_TO_LANGUAGE_MAP[iconFile];
        if (languageType) {
          languageTypes.push(languageType);
        } else {
          console.warn(`未找到图标文件 ${iconFile} 对应的语言类型`);
        }
      });

      if (languageTypes.length > 0) {
        console.log(`使用用户配置的文件类型: ${languageTypes.join(", ")}`);
        return languageTypes;
      }
    }

    // 如果用户没有选择或选择无效，则随机选择几种常见的类型
    const commonTypes = [
      "javascript",
      "typescript",
      "python",
      "java",
      "cpp",
      "csharp",
      "html",
      "css",
      "json",
      "markdown",
      "vue",
    ];
    const randomSelection = this.shuffleArray(commonTypes).slice(
      0,
      4 + Math.floor(Math.random() * 4) // 选择4-7种类型
    );
    console.log(`使用随机文件类型: ${randomSelection.join(", ")}`);
    return randomSelection;
  }

  /**
   * 根据文件类型获取扩展名列表
   */
  private getExtensionsFromFileTypes(fileTypes: string[]): string[] {
    const extensions: string[] = [];

    fileTypes.forEach((fileType) => {
      const typeExtensions = FILE_TYPE_EXTENSIONS[fileType];
      if (typeExtensions) {
        extensions.push(...typeExtensions);
      }
    });

    // 如果没有扩展名，返回默认的
    if (extensions.length === 0) {
      return ["js", "ts", "css", "json", "md"];
    }

    // 过滤掉不适合作为普通文件扩展名的特殊文件名
    const filteredExtensions = [...new Set(extensions)].filter(
      (ext) =>
        ext !== "dockerfile" && // 过滤掉 dockerfile
        !ext.startsWith(".") // 过滤掉以点开头的
    );

    // 如果过滤后为空，返回默认的
    if (filteredExtensions.length === 0) {
      return ["js", "ts", "css", "json", "md"];
    }

    return filteredExtensions;
  }

  /**
   * 为指定扩展名生成文件
   */
  private generateFilesForExtensions(
    extensions: string[],
    minFiles: number,
    maxFiles: number
  ): FakeFileItem[] {
    const fileCount =
      minFiles + Math.floor(Math.random() * (maxFiles - minFiles + 1));
    const files: FakeFileItem[] = [];

    for (let i = 0; i < fileCount; i++) {
      const ext = extensions[Math.floor(Math.random() * extensions.length)];
      const baseName = this.generateRandomFileName();
      const fileName = `${baseName}.${ext}`;
      files.push(this.createFile(fileName, ext));
    }

    return files;
  }

  /**
   * 生成主要文件
   */
  private generateMainFiles(extensions: string[]): FakeFileItem[] {
    const mainFiles = ["index", "main", "app", "server", "config"];
    const files: FakeFileItem[] = [];

    // 随机选择1-2个主文件
    const selectedMains = this.shuffleArray(mainFiles).slice(
      0,
      1 + Math.floor(Math.random() * 2)
    );

    selectedMains.forEach((baseName) => {
      const ext = extensions[Math.floor(Math.random() * extensions.length)];
      const fileName = `${baseName}.${ext}`;
      files.push(this.createFile(fileName, ext));
    });

    return files;
  }

  /**
   * 生成测试文件
   */
  private generateTestFiles(extensions: string[]): FakeFileItem[] {
    const testExtensions = extensions.filter((ext) =>
      ["js", "ts", "py", "java"].includes(ext)
    );
    if (testExtensions.length === 0) {
      testExtensions.push("js"); // 默认JavaScript测试
    }

    const testFiles: FakeFileItem[] = [];
    const testCount = 1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < testCount; i++) {
      const ext =
        testExtensions[Math.floor(Math.random() * testExtensions.length)];
      const testName = this.generateRandomFileName();
      const fileName = `${testName}.test.${ext}`;
      testFiles.push(this.createFile(fileName, ext));
    }

    return testFiles;
  }

  /**
   * 生成可选文件夹
   */
  private generateOptionalFolders(extensions: string[]): FakeFileItem[] {
    const folders: FakeFileItem[] = [];

    // docs文件夹 (80%概率)
    if (Math.random() > 0.2) {
      folders.push(
        this.createFolder("docs", [
          this.createFile("README.md", "md"),
          this.createFile("API.md", "md"),
        ])
      );
    }

    // public/assets文件夹 (60%概率)
    if (Math.random() > 0.4) {
      const folderName = Math.random() > 0.5 ? "public" : "assets";
      folders.push(
        this.createFolder(folderName, [
          this.createFile("style.css", "css"),
          this.createFile("logo.svg", "svg"),
        ])
      );
    }

    return folders;
  }

  /**
   * 生成配置文件
   */
  private generateConfigFiles(extensions: string[]): FakeFileItem[] {
    const configFiles: FakeFileItem[] = [];

    // 常见配置文件
    const possibleConfigs = [
      "package.json",
      "tsconfig.json",
      "webpack.config.js",
      ".env",
      ".gitignore",
      "README.md",
    ];

    // 随机选择2-4个配置文件
    const selectedConfigs = this.shuffleArray(possibleConfigs).slice(
      0,
      2 + Math.floor(Math.random() * 3)
    );

    selectedConfigs.forEach((fileName) => {
      const ext = this.getFileExtension(fileName) || "txt";
      configFiles.push(this.createFile(fileName, ext));
    });

    return configFiles;
  }

  /**
   * 生成随机文件名
   */
  private generateRandomFileName(): string {
    const names = [
      "auth",
      "user",
      "data",
      "service",
      "helper",
      "util",
      "common",
      "shared",
      "component",
      "layout",
      "header",
      "footer",
      "sidebar",
      "modal",
      "form",
      "button",
      "input",
      "table",
      "list",
      "card",
      "menu",
      "nav",
      "content",
    ];

    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * 创建文件夹
   */
  private createFolder(
    name: string,
    children: FakeFileItem[] = []
  ): FakeFileItem {
    return {
      label: name,
      type: "folder",
      children: children,
      collapsibleState:
        Math.random() > 0.3
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.Collapsed,
      iconPath: vscode.ThemeIcon.Folder,
      contextValue: "fakeFolder",
    };
  }

  /**
   * 创建文件
   */
  private createFile(name: string, extension: string): FakeFileItem {
    return {
      label: name,
      type: "file",
      extension: extension,
      iconPath: this.getFileIcon(name, extension),
      contextValue: "fakeFile",
      command: {
        command: "zhihu-fisher.onFakeFileClick",
        title: "打开文件",
        arguments: [name],
      },
    };
  }

  /**
   * 获取文件图标
   */
  private getFileIcon(
    filename: string,
    extension: string
  ): vscode.ThemeIcon | vscode.Uri {
    const ext = extension || this.getFileExtension(filename);

    // 优先使用fake目录下的svg图标
    const svgIconMap: { [key: string]: string } = {
      // TypeScript
      ts: "file_type_typescript.svg",
      tsx: "file_type_typescript.svg",
      "d.ts": "file_type_typescriptdef.svg",

      // JavaScript
      js: "file_type_js.svg",
      jsx: "file_type_js.svg",
      mjs: "file_type_js.svg",
      cjs: "file_type_js.svg",
      // Vue
      vue: "file_type_vue.svg",
      // Python
      py: "file_type_python.svg",
      pyw: "file_type_python.svg",
      pyi: "file_type_python.svg",
      pyx: "file_type_python.svg",
      phar: "file_type_python.svg",
      // Java
      java: "file_type_java.svg",
      // C#
      cs: "file_type_csharp.svg",
      // HTML
      html: "file_type_html.svg",
      htm: "file_type_html.svg",
      // CSS
      css: "file_type_css.svg",
      scss: "file_type_scss.svg",
      less: "file_type_less.svg",
      // JSON
      json: "file_type_json.svg",
      jsonc: "file_type_json.svg",
      // Markdown
      md: "file_type_markdown.svg",
      markdown: "file_type_markdown.svg",
      // YAML
      yml: "file_type_light_yaml.svg",
      yaml: "file_type_light_yaml.svg",
      // PHP
      php: "file_type_php3.svg",
      // Rust
      rs: "file_type_rust.svg",
      // SQL
      sql: "file_type_sql.svg",
      // XML
      xml: "file_type_xml.svg",
      xsd: "file_type_xml.svg",
      // XSL
      xsl: "file_type_xsl.svg",
      xslt: "file_type_xsl.svg",
      // Lua
      lua: "file_type_lua.svg",
      // PowerShell
      ps1: "file_type_powershell.svg",
      psm1: "file_type_powershell.svg",
      psd1: "file_type_powershell.svg",
      // C/C++
      h: "file_type_cheader.svg",
      hpp: "file_type_cppheader.svg",
      hxx: "file_type_cppheader.svg",
      "h++": "file_type_cppheader.svg",
      cpp: "file_type_cpp.svg",
      cc: "file_type_cpp.svg",
      cxx: "file_type_cpp.svg",
      // Config files
      ini: "file_type_ini.svg",
      cfg: "file_type_ini.svg",
      conf: "file_type_ini.svg",
      env: "file_type_ini.svg",
      example: "file_type_ini.svg",
      // Git
      gitignore: "file_type_git.svg",
      gitattributes: "file_type_git.svg",
      gitmodules: "file_type_git.svg",
      // Log
      log: "file_type_log.svg",
      txt: "file_type_log.svg",
      // LaTeX
      tex: "file_type_light_tex.svg",
      latex: "file_type_light_tex.svg",
      // Ruby
      rb: "file_type_ruby.svg",
      rbw: "file_type_ruby.svg",
      gemspec: "file_type_ruby.svg",
      // sqlite
      sqlite: "file_type_sql.svg",
      // Swift
      swift: "file_type_swift.svg",
      // R
      r: "file_type_r.svg",
      R: "file_type_r.svg",
      rmd: "file_type_r.svg",
      // jpg
      jpg: "file_type_jpg.svg",
      jpeg: "file_type_jpg.svg",
      // png
      png: "file_type_png.svg",
      // svg
      svg: "file_type_svg.svg",
      // sh
      sh: "file_type_powershell.svg",
      // csx
      csx: "file_type_csharp.svg",
    };

    const svgFile = svgIconMap[ext];
    if (svgFile) {
      try {
        // 使用正确的扩展资源路径
        if (Store.context) {
          return vscode.Uri.joinPath(
            Store.context.extensionUri,
            "resources",
            "fake",
            svgFile
          );
        }
      } catch (error) {
        // Fallback to theme icon if file not found
        console.warn("无法获取伪装文件图标:", error);
      }
    }

    // 使用VSCode内置主题图标
    const themeIconMap: { [key: string]: string } = {
      ts: "file-typescript",
      tsx: "file-typescript",
      js: "file-javascript",
      jsx: "file-javascript",
      py: "file-python",
      java: "file-java",
      cs: "file-csharp",
      html: "file-html",
      css: "file-css",
      json: "file-json",
      md: "file-markdown",
      yml: "file-yaml",
      yaml: "file-yaml",
    };

    const iconName = themeIconMap[ext];
    if (iconName) {
      return new vscode.ThemeIcon(iconName);
    }

    // 最终回退到通用文件图标
    return new vscode.ThemeIcon("file");
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filename: string): string {
    // 处理特殊的文件名
    if (filename.startsWith(".git")) {
      return filename.substring(1); // .gitignore -> gitignore
    }
    if (filename.startsWith(".env")) {
      return "env"; // .env.example -> env
    }
    if (filename === "dockerfile" || filename === "Dockerfile") {
      return "dockerfile";
    }

    const lastDot = filename.lastIndexOf(".");
    return lastDot > 0 ? filename.substring(lastDot + 1) : "";
  }

  /**
   * 打乱数组
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
