/**
 * 代码生成器 - 动态生成各种编程语言的伪装代码
 */

export class CodeGenerator {
  // 为每种文件类型保存当前模式索引，实现循环生成
  private static patternIndexes: Map<string, number> = new Map();

  /**
   * 生成指定类型的代码行
   */
  static generateCode(fileType: string, lineCount: number = 50): string[] {
    const generator = CodeGenerator.getCodeGenerator(fileType);
    const lines: string[] = [];

    for (let i = 0; i < lineCount; i++) {
      const line = generator();
      if (line) {
        // 对生成的代码行进行特殊字符转换
        lines.push((line));
      }
    }

    return lines;
  }

  /**
   * 获取下一个模式（按顺序循环）
   */
  private static getNextPattern<T>(fileType: string, patterns: T[]): T {
    if (!this.patternIndexes.has(fileType)) {
      this.patternIndexes.set(fileType, 0);
    }

    const currentIndex = this.patternIndexes.get(fileType)!;
    const pattern = patterns[currentIndex];

    // 循环到下一个模式
    this.patternIndexes.set(fileType, (currentIndex + 1) % patterns.length);

    return pattern;
  }


  /**
   * 生成随机辅助方法
   */
  private static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static randomVariableName(): string {
    const names = ['data', 'result', 'value', 'item', 'element', 'obj', 'config', 'options', 'params', 'response', 'request', 'user', 'id', 'name', 'type', 'status', 'count', 'index', 'key', 'flag'];
    return CodeGenerator.randomChoice(names);
  }

  private static randomFunctionName(): string {
    const names = ['getData', 'setData', 'handleClick', 'processItem', 'validate', 'initialize', 'update', 'create', 'delete', 'fetch', 'parse', 'format', 'transform', 'calculate', 'generate'];
    return CodeGenerator.randomChoice(names);
  }

  private static randomClassName(): string {
    const names = ['UserManager', 'DataService', 'ApiClient', 'ConfigHandler', 'BaseController', 'ModelValidator', 'FileProcessor', 'EventEmitter', 'CacheManager', 'Logger'];
    return CodeGenerator.randomChoice(names);
  }

  private static randomValue(): string {
    const values = ['null', 'true', 'false', '0', '1', '""', '[]', '{}', 'undefined'];
    return CodeGenerator.randomChoice(values);
  }

  private static randomString(): string {
    const strings = ['"Hello World"', '"Success"', '"Error"', '"Loading..."', '"Data loaded"', '"Invalid input"', '"Processing"', '"Complete"'];
    return CodeGenerator.randomChoice(strings);
  }

  private static randomComment(): string {
    const comments = ['TODO: Implement this method', 'FIXME: Handle edge case', 'NOTE: this is a temporary solution', 'BUG: Memory leak possible', 'REVIEW: Optimize performance'];
    return CodeGenerator.randomChoice(comments);
  }

  private static randomParameters(): string {
    const params = ['', 'data', 'options', 'callback', 'data, options', 'id, data', 'params, callback'];
    return CodeGenerator.randomChoice(params);
  }

  private static randomCondition(): string {
    const conditions = ['data', 'result', 'status === "success"', 'count > 0', 'user !== null', 'config.enabled'];
    return CodeGenerator.randomChoice(conditions);
  }

  private static randomMethod(): string {
    const methods = ['get', 'set', 'update', 'delete', 'create', 'process', 'handle', 'validate', 'parse', 'format'];
    return CodeGenerator.randomChoice(methods);
  }

  private static randomProperty(): string {
    const properties = ['id', 'name', 'value', 'data', 'config', 'status', 'type', 'count', 'index', 'key'];
    return CodeGenerator.randomChoice(properties);
  }

  private static randomModuleName(): string {
    const modules = ['utils', 'config', 'api', 'services', 'components', 'helpers', 'validators', 'models', 'controllers'];
    return CodeGenerator.randomChoice(modules);
  }

  private static randomAsyncCall(): string {
    const calls = ['fetch(url)', 'api.getData()', 'database.query()', 'service.process()', 'client.request()'];
    return CodeGenerator.randomChoice(calls);
  }

  private static randomType(): string {
    const types = ['string', 'number', 'boolean', 'object', 'array', 'Date', 'Promise<string>', 'void', 'any'];
    return CodeGenerator.randomChoice(types);
  }

  private static randomInterfaceName(): string {
    const names = ['IUser', 'IData', 'IConfig', 'IResponse', 'IRequest', 'IModel', 'IService', 'IHandler'];
    return CodeGenerator.randomChoice(names);
  }

  private static randomTypeName(): string {
    const names = ['UserType', 'DataType', 'StatusType', 'ConfigType', 'ResponseType'];
    return CodeGenerator.randomChoice(names);
  }

  private static randomEnumName(): string {
    const names = ['Status', 'Type', 'Mode', 'State', 'Level', 'Priority'];
    return CodeGenerator.randomChoice(names);
  }

  private static randomEnumValue(): string {
    const values = ['SUCCESS', 'ERROR', 'LOADING', 'PENDING', 'ACTIVE', 'INACTIVE'];
    return CodeGenerator.randomChoice(values);
  }

  private static randomFileName(): string {
    const names = ['index', 'main', 'config', 'utils', 'helper', 'service', 'model', 'controller'];
    return CodeGenerator.randomChoice(names);
  }

  private static randomPythonParameters(): string {
    const params = ['', 'data', 'options=None', 'callback=None', 'data, options=None', '*args, **kwargs'];
    return CodeGenerator.randomChoice(params);
  }

  private static randomJavaParameters(): string {
    const params = ['', 'String data', 'int count', 'Object options', 'String data, int count', 'List<String> items'];
    return CodeGenerator.randomChoice(params);
  }

  private static randomCppParameters(): string {
    const params = ['', 'int data', 'string name', 'const Object& obj', 'int data, string name'];
    return CodeGenerator.randomChoice(params);
  }

  private static randomCSharpParameters(): string {
    const params = ['', 'string data', 'int count', 'object options', 'string data, int count'];
    return CodeGenerator.randomChoice(params);
  }

  private static randomCppType(): string {
    const types = ['int', 'string', 'double', 'bool', 'char', 'float', 'void', 'auto'];
    return CodeGenerator.randomChoice(types);
  }

  private static randomCSharpType(): string {
    const types = ['string', 'int', 'double', 'bool', 'object', 'List<string>', 'Dictionary<string, object>'];
    return CodeGenerator.randomChoice(types);
  }

  private static randomHeaderName(): string {
    const headers = ['iostream', 'vector', 'string', 'map', 'algorithm', 'memory', 'functional'];
    return CodeGenerator.randomChoice(headers);
  }

  private static randomCssClass(): string {
    const classes = ['container', 'header', 'footer', 'nav', 'content', 'sidebar', 'button', 'form', 'input', 'card'];
    return CodeGenerator.randomChoice(classes);
  }

  private static randomCssProperty(): string {
    const properties = ['color', 'background-color', 'font-size', 'margin', 'padding', 'width', 'height', 'display', 'position', 'border'];
    return CodeGenerator.randomChoice(properties);
  }

  private static randomCssValue(): string {
    const values = ['#fff', '#000', '10px', '1rem', '100%', 'center', 'flex', 'none', 'auto', 'solid 1px #ccc'];
    return CodeGenerator.randomChoice(values);
  }

  private static randomJsonValue(): string {
    const values = ['"string"', '123', 'true', 'false', 'null'];
    return CodeGenerator.randomChoice(values);
  }

  private static randomNumber(): number {
    return Math.floor(Math.random() * 1000) + 1;
  }

  /**
   * 获取对应文件类型的代码生成器
   */
  private static getCodeGenerator(fileType: string): () => string {
    switch (fileType) {
      case 'file_type_javascript.svg':
      case 'file_type_js.svg':
        return () => CodeGenerator.generateJavaScriptLine(fileType);
      case 'file_type_typescript.svg':
        return () => CodeGenerator.generateTypeScriptLine(fileType);
      case 'file_type_typescriptdef.svg':
        return () => CodeGenerator.generateTypeScriptDefLine(fileType);
      case 'file_type_python.svg':
        return () => CodeGenerator.generatePythonLine(fileType);
      case 'file_type_java.svg':
        return () => CodeGenerator.generateJavaLine(fileType);
      case 'file_type_cpp.svg':
        return () => CodeGenerator.generateCppLine(fileType);
      case 'file_type_cheader.svg':
        return () => CodeGenerator.generateCHeaderLine(fileType);
      case 'file_type_cppheader.svg':
        return () => CodeGenerator.generateCppHeaderLine(fileType);
      case 'file_type_csharp.svg':
        return () => CodeGenerator.generateCSharpLine(fileType);
      case 'file_type_css.svg':
        return () => CodeGenerator.generateCssLine(fileType);
      case 'file_type_scss.svg':
        return () => CodeGenerator.generateScssLine(fileType);
      case 'file_type_less.svg':
        return () => CodeGenerator.generateLessLine(fileType);
      case 'file_type_html.svg':
        return () => CodeGenerator.generateHtmlLine(fileType);
      case 'file_type_vue.svg':
        return () => CodeGenerator.generateVueLine(fileType);
      case 'file_type_json.svg':
        return () => CodeGenerator.generateJsonLine(fileType);
      case 'file_type_xml.svg':
        return () => CodeGenerator.generateXmlLine(fileType);
      case 'file_type_xsl.svg':
        return () => CodeGenerator.generateXslLine(fileType);
      case 'file_type_yaml.svg':
      case 'file_type_light_yaml.svg':
        return () => CodeGenerator.generateYamlLine(fileType);
      case 'file_type_markdown.svg':
        return () => CodeGenerator.generateMarkdownLine(fileType);
      case 'file_type_light_tex.svg':
        return () => CodeGenerator.generateTexLine(fileType);
      case 'file_type_sql.svg':
        return () => CodeGenerator.generateSqlLine(fileType);
      case 'file_type_php3.svg':
        return () => CodeGenerator.generatePhpLine(fileType);
      case 'file_type_ruby.svg':
        return () => CodeGenerator.generateRubyLine(fileType);
      case 'file_type_rust.svg':
        return () => CodeGenerator.generateRustLine(fileType);
      case 'file_type_rust_toolchain.svg':
        return () => CodeGenerator.generateRustToolchainLine(fileType);
      case 'file_type_swift.svg':
        return () => CodeGenerator.generateSwiftLine(fileType);
      case 'file_type_lua.svg':
        return () => CodeGenerator.generateLuaLine(fileType);
      case 'file_type_r.svg':
        return () => CodeGenerator.generateRLine(fileType);
      case 'file_type_powershell.svg':
        return () => CodeGenerator.generatePowerShellLine(fileType);
      case 'file_type_ini.svg':
        return () => CodeGenerator.generateIniLine(fileType);
      case 'file_type_log.svg':
        return () => CodeGenerator.generateLogLine(fileType);
      case 'file_type_git.svg':
        return () => CodeGenerator.generateGitLine(fileType);
      default:
        return () => CodeGenerator.generateJavaScriptLine(fileType);
    }
  }

  /**
   * JavaScript 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateJavaScriptLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">const</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">let</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">var</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">function</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomParameters()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">${CodeGenerator.randomCondition()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">.</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;;</span>`,
      () => `<span class="mtk1">&#125;&nbsp;</span><span class="mtk5">else</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">console</span><span class="mtk1">.</span><span class="mtk15">log</span><span class="mtk1">&#40;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">import</span><span class="mtk1">&nbsp;&#123;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;&#125;&nbsp;</span><span class="mtk5">from</span><span class="mtk1">&nbsp;</span><span class="mtk11">'${CodeGenerator.randomModuleName()}'</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">export</span><span class="mtk1">&nbsp;</span><span class="mtk5">default</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">const</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk5">async</span><span class="mtk1">&nbsp;&#40;&#41;&nbsp;=>&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">try</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">const</span><span class="mtk1">&nbsp;</span><span class="mtk9">result</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk5">await</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomAsyncCall()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">result</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;&nbsp;</span><span class="mtk5">catch</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">error</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">console</span><span class="mtk1">.</span><span class="mtk15">error</span><span class="mtk1">&#40;</span><span class="mtk9">error</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk15">constructor</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomParameters()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">this</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk5">this</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * TypeScript 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateTypeScriptLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">interface</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomInterfaceName()}</span><span class="mtk1">&nbsp;</span><span class="mtk1">&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomParameters()}</span><span class="mtk1">&#41;:&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">type</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomTypeName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">&nbsp;|&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">const</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk1">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">function</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&lt;</span><span class="mtk16">T</span><span class="mtk1">&gt;&#40;</span><span class="mtk9">param</span><span class="mtk1">:&nbsp;</span><span class="mtk16">T</span><span class="mtk1">&#41;:&nbsp;</span><span class="mtk16">T</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">param</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&lt;</span><span class="mtk16">T</span><span class="mtk1">&gt;&nbsp;</span><span class="mtk5">implements</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomInterfaceName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">private</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk16">T</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;:&nbsp;</span><span class="mtk16">T</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk5">this</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk5">enum</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomEnumName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomEnumValue()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">'${CodeGenerator.randomString().replace(/"/g, '')}'</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomEnumValue()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">'${CodeGenerator.randomString().replace(/"/g, '')}'</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">import</span><span class="mtk1">&nbsp;</span><span class="mtk5">type</span><span class="mtk1">&nbsp;&#123;&nbsp;</span><span class="mtk16">${CodeGenerator.randomInterfaceName()}</span><span class="mtk1">&nbsp;&#125;&nbsp;</span><span class="mtk5">from</span><span class="mtk1">&nbsp;</span><span class="mtk11">'${CodeGenerator.randomModuleName()}'</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">export</span><span class="mtk1">&nbsp;&#123;&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#125;&nbsp;</span><span class="mtk5">from</span><span class="mtk1">&nbsp;</span><span class="mtk11">'./${CodeGenerator.randomFileName()}'</span><span class="mtk1">;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Python 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generatePythonLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">import</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomModuleName()}</span>`,
      () => `<span class="mtk5">from</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomModuleName()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">import</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span>`,
      () => `<span class="mtk5">def</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomPythonParameters()}</span><span class="mtk1">&#41;:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk11">"""${CodeGenerator.randomComment()}"""</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span>`,
      () => `<span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">def</span><span class="mtk1">&nbsp;</span><span class="mtk15">__init__</span><span class="mtk1">&#40;</span><span class="mtk9">self</span><span class="mtk1">,&nbsp;</span><span class="mtk9">${CodeGenerator.randomPythonParameters()}</span><span class="mtk1">&#41;:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">self</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">def</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;</span><span class="mtk9">self</span><span class="mtk1">&#41;:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">self</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomCondition()}</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span>`,
      () => `<span class="mtk5">elif</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomCondition()}</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">pass</span>`,
      () => `<span class="mtk5">else</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">print</span><span class="mtk1">&#40;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk4">#&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">try</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span>`,
      () => `<span class="mtk5">except</span><span class="mtk1">&nbsp;</span><span class="mtk16">Exception</span><span class="mtk1">&nbsp;</span><span class="mtk5">as</span><span class="mtk1">&nbsp;</span><span class="mtk9">e</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">print</span><span class="mtk1">&#40;</span><span class="mtk11">f"Error:&nbsp;&#123;e&#125;"</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk5">for</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">in</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">.</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Java 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateJavaLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">package</span><span class="mtk1">&nbsp;</span><span class="mtk9">com.${CodeGenerator.randomModuleName()}.${CodeGenerator.randomModuleName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">import</span><span class="mtk1">&nbsp;</span><span class="mtk9">java.util.${CodeGenerator.randomClassName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">import</span><span class="mtk1">&nbsp;</span><span class="mtk9">java.io.${CodeGenerator.randomClassName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">private</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomClassName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomJavaParameters()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">this</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk16">void</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomJavaParameters()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">this</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk17">@Override</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk16">String</span><span class="mtk1">&nbsp;</span><span class="mtk15">toString</span><span class="mtk1">&#40;&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk11">"Object:&nbsp;"</span><span class="mtk1">&nbsp;+&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">${CodeGenerator.randomCondition()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk16">System</span><span class="mtk1">.</span><span class="mtk9">out</span><span class="mtk1">.</span><span class="mtk15">println</span><span class="mtk1">&#40;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk1">&#125;&nbsp;</span><span class="mtk5">else</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">.</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;;</span>`,
      () => `<span class="mtk1">&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * C++ 代码生成器
   */
  private static generateCppLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk17">#include</span><span class="mtk1">&nbsp;</span><span class="mtk5">&lt;</span><span class="mtk11">${CodeGenerator.randomHeaderName()}</span><span class="mtk5">&gt;</span>`,
      () => `<span class="mtk17">#include</span><span class="mtk1">&nbsp;</span><span class="mtk11">"${CodeGenerator.randomFileName()}.h"</span>`,
      () => `<span class="mtk5">using</span><span class="mtk1">&nbsp;</span><span class="mtk5">namespace</span><span class="mtk1">&nbsp;</span><span class="mtk9">std</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk5">private</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk16">${CodeGenerator.randomCppType()}</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">public</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomCppParameters()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;~</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&#40;&#41;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk16">${CodeGenerator.randomCppType()}</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">void</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomCppParameters()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk1">&#125;;</span>`,
      () => `<span class="mtk16">${CodeGenerator.randomCppType()}</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">${CodeGenerator.randomCondition()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">cout</span><span class="mtk1">&nbsp;&lt;&lt;&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&nbsp;&lt;&lt;&nbsp;</span><span class="mtk9">endl</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;&nbsp;</span><span class="mtk5">else</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">.</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">for</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk5">int</span><span class="mtk1">&nbsp;</span><span class="mtk9">i</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk10">0</span><span class="mtk1">;&nbsp;</span><span class="mtk9">i</span><span class="mtk1">&nbsp;&lt;&nbsp;</span><span class="mtk10">${CodeGenerator.randomNumber()}</span><span class="mtk1">;&nbsp;</span><span class="mtk9">i</span><span class="mtk1">++&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#91;</span><span class="mtk9">i</span><span class="mtk1">&#93;&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">template</span><span class="mtk1">&nbsp;&lt;</span><span class="mtk5">typename</span><span class="mtk1">&nbsp;</span><span class="mtk16">T</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk16">T</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk16">T</span><span class="mtk1">&nbsp;</span><span class="mtk9">param</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">param</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * C# 代码生成器
   */
  private static generateCSharpLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">using</span><span class="mtk1">&nbsp;</span><span class="mtk9">System</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">using</span><span class="mtk1">&nbsp;</span><span class="mtk9">System.Collections.Generic</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">using</span><span class="mtk1">&nbsp;</span><span class="mtk9">System.Linq</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">namespace</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomModuleName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">private</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomCSharpType()}</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;&#123;&nbsp;</span><span class="mtk5">get</span><span class="mtk1">;&nbsp;</span><span class="mtk5">set</span><span class="mtk1">;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomCSharpParameters()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomCSharpType()}</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk5">void</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomCSharpParameters()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">this</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">if</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">${CodeGenerator.randomCondition()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">Console</span><span class="mtk1">.</span><span class="mtk15">WriteLine</span><span class="mtk1">&#40;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;&nbsp;</span><span class="mtk5">else</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">.</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">var</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk5">new</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&#40;&#41;;</span>`,
      () => `<span class="mtk16">List</span><span class="mtk1">&lt;</span><span class="mtk16">${CodeGenerator.randomCSharpType()}</span><span class="mtk1">&gt;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk5">new</span><span class="mtk1">&nbsp;</span><span class="mtk16">List</span><span class="mtk1">&lt;</span><span class="mtk16">${CodeGenerator.randomCSharpType()}</span><span class="mtk1">&gt;&#40;&#41;;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * CSS 代码生成器
   */
  private static generateCssLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk12">.</span><span class="mtk13">${CodeGenerator.randomCssClass()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk14">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk14">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk12">#</span><span class="mtk13">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk14">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk4">/*&nbsp;${CodeGenerator.randomComment()}&nbsp;*/</span>`,
      () => `<span class="mtk17">@media</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk14">max-width</span><span class="mtk1">:&nbsp;</span><span class="mtk10">${CodeGenerator.randomNumber()}px</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk12">.</span><span class="mtk13">${CodeGenerator.randomCssClass()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk14">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk17">@keyframes</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk10">0%</span><span class="mtk1">&nbsp;&#123;&nbsp;</span><span class="mtk14">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk10">100%</span><span class="mtk1">&nbsp;&#123;&nbsp;</span><span class="mtk14">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk12">:root</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk14">--${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk12">.</span><span class="mtk13">${CodeGenerator.randomCssClass()}</span><span class="mtk12">:hover</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk14">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * HTML 代码生成器
   */
  private static generateHtmlLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk1">&lt;!</span><span class="mtk18">DOCTYPE</span><span class="mtk1">&nbsp;</span><span class="mtk9">html</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;</span><span class="mtk18">html</span><span class="mtk1">&nbsp;</span><span class="mtk19">lang</span><span class="mtk1">=</span><span class="mtk11">"en"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;</span><span class="mtk18">head</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">meta</span><span class="mtk1">&nbsp;</span><span class="mtk19">charset</span><span class="mtk1">=</span><span class="mtk11">"UTF-8"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">meta</span><span class="mtk1">&nbsp;</span><span class="mtk19">name</span><span class="mtk1">=</span><span class="mtk11">"viewport"</span><span class="mtk1">&nbsp;</span><span class="mtk19">content</span><span class="mtk1">=</span><span class="mtk11">"width=device-width,&nbsp;initial-scale=1.0"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">title</span><span class="mtk1">&gt;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&lt;/</span><span class="mtk18">title</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">link</span><span class="mtk1">&nbsp;</span><span class="mtk19">rel</span><span class="mtk1">=</span><span class="mtk11">"stylesheet"</span><span class="mtk1">&nbsp;</span><span class="mtk19">href</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomFileName()}.css"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;/</span><span class="mtk18">head</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;</span><span class="mtk18">body</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">div</span><span class="mtk1">&nbsp;</span><span class="mtk19">class</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomCssClass()}"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">h1</span><span class="mtk1">&gt;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&lt;/</span><span class="mtk18">h1</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">p</span><span class="mtk1">&gt;</span><span class="mtk11">${CodeGenerator.randomComment()}</span><span class="mtk1">&lt;/</span><span class="mtk18">p</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">button</span><span class="mtk1">&nbsp;</span><span class="mtk19">onclick</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomFunctionName()}()"</span><span class="mtk1">&gt;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&lt;/</span><span class="mtk18">button</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;/</span><span class="mtk18">div</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">script</span><span class="mtk1">&nbsp;</span><span class="mtk19">src</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomFileName()}.js"</span><span class="mtk1">&gt;&lt;/</span><span class="mtk18">script</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;/</span><span class="mtk18">body</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;/</span><span class="mtk18">html</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk4">&lt;!--&nbsp;${CodeGenerator.randomComment()}&nbsp;--&gt;</span>`,
      () => `<span class="mtk1">&lt;</span><span class="mtk18">nav</span><span class="mtk1">&nbsp;</span><span class="mtk19">class</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomCssClass()}"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">ul</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk18">li</span><span class="mtk1">&gt;&lt;</span><span class="mtk18">a</span><span class="mtk1">&nbsp;</span><span class="mtk19">href</span><span class="mtk1">=</span><span class="mtk11">"#${CodeGenerator.randomVariableName()}"</span><span class="mtk1">&gt;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&lt;/</span><span class="mtk18">a</span><span class="mtk1">&gt;&lt;/</span><span class="mtk18">li</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;/</span><span class="mtk18">ul</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;/</span><span class="mtk18">nav</span><span class="mtk1">&gt;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * JSON 代码生成器
   */
  private static generateJsonLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk1">&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk20">"${CodeGenerator.randomProperty()}"</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomJsonValue()}</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk20">"${CodeGenerator.randomProperty()}"</span><span class="mtk1">:&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk20">"${CodeGenerator.randomProperty()}"</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomJsonValue()}</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk20">"${CodeGenerator.randomProperty()}"</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomJsonValue()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk20">"${CodeGenerator.randomProperty()}"</span><span class="mtk1">:&nbsp;&#91;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk11">${CodeGenerator.randomJsonValue()}</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk11">${CodeGenerator.randomJsonValue()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#93;</span>`,
      () => `<span class="mtk1">&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

    /**
   * XML 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateXmlLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk1">&lt;</span><span class="mtk17">?xml</span><span class="mtk1">&nbsp;</span><span class="mtk19">version</span><span class="mtk1">=</span><span class="mtk11">"1.0"</span><span class="mtk1">&nbsp;</span><span class="mtk19">encoding</span><span class="mtk1">=</span><span class="mtk11">"UTF-8"</span><span class="mtk1">?&gt;</span>`,
      () => `<span class="mtk1">&lt;</span><span class="mtk18">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&lt;</span><span class="mtk18">${CodeGenerator.randomProperty()}</span><span class="mtk1">&gt;</span><span class="mtk11">${CodeGenerator.randomString().replace(/"/g, '')}</span><span class="mtk1">&lt;/</span><span class="mtk18">${CodeGenerator.randomProperty()}</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&lt;</span><span class="mtk18">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;</span><span class="mtk19">${CodeGenerator.randomProperty()}</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomString().replace(/"/g, '')}"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk11">${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&lt;/</span><span class="mtk18">${CodeGenerator.randomProperty()}</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;/</span><span class="mtk18">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk4">&lt;!--&nbsp;${CodeGenerator.randomComment()}&nbsp;--&gt;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * YAML 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateYamlLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;-&nbsp;</span><span class="mtk11">${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;-&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk4">#&nbsp;${CodeGenerator.randomComment()}</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Markdown 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateMarkdownLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk18">#&nbsp;${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk18">##&nbsp;${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk18">###&nbsp;${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk1">${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk21">**${CodeGenerator.randomString().replace(/"/g, '')}**</span>`,
      () => `<span class="mtk21">*${CodeGenerator.randomString().replace(/"/g, '')}*</span>`,
      () => `<span class="mtk1">-&nbsp;</span><span class="mtk1">${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk6">1.</span><span class="mtk1">&nbsp;${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk14">\`${CodeGenerator.randomVariableName()}\`</span>`,
      () => `<span class="mtk20">[${CodeGenerator.randomString().replace(/"/g, '')}]</span><span class="mtk1">&#40;</span><span class="mtk12">https://example.com</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk4">&gt;&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk1">---</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * SQL 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateSqlLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">SELECT</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">,&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">FROM</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">INSERT&nbsp;INTO</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">,&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&#41;&nbsp;</span><span class="mtk5">VALUES</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">,&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk5">UPDATE</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">SET</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">WHERE</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">DELETE&nbsp;FROM</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">WHERE</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">CREATE&nbsp;TABLE</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;&#40;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">VARCHAR</span><span class="mtk1">&#40;</span><span class="mtk6">255</span><span class="mtk1">&#41;&nbsp;</span><span class="mtk5">NOT&nbsp;NULL</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">INT&nbsp;AUTO_INCREMENT</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">PRIMARY&nbsp;KEY</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk4">--&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">DROP&nbsp;TABLE&nbsp;IF&nbsp;EXISTS</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">ALTER&nbsp;TABLE</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">ADD&nbsp;COLUMN</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">VARCHAR</span><span class="mtk1">&#40;</span><span class="mtk6">255</span><span class="mtk1">&#41;;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * PHP 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generatePhpLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk18">&lt;?php</span>`,
      () => `<span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">function</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk18">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">private</span><span class="mtk1">&nbsp;</span><span class="mtk9">$${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk5">function</span><span class="mtk1">&nbsp;</span><span class="mtk15">__construct</span><span class="mtk1">&#40;</span><span class="mtk9">$${CodeGenerator.randomProperty()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">$this</span><span class="mtk1">-&gt;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk9">$${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">public</span><span class="mtk1">&nbsp;</span><span class="mtk5">function</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">$this</span><span class="mtk1">-&gt;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">$${CodeGenerator.randomCondition()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">echo</span><span class="mtk1">&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Ruby 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateRubyLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk5">def</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span>`,
      () => `<span class="mtk5">end</span>`,
      () => `<span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk18">${CodeGenerator.randomClassName()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">attr_accessor</span><span class="mtk1">&nbsp;:</span><span class="mtk9">${CodeGenerator.randomProperty()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">def</span><span class="mtk1">&nbsp;</span><span class="mtk15">initialize</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">@${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">end</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">def</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">@${CodeGenerator.randomProperty()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">end</span>`,
      () => `<span class="mtk5">end</span>`,
      () => `<span class="mtk4">#&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">puts</span><span class="mtk1">&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk5">end</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Rust 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateRustLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">let</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">fn</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;&amp;</span><span class="mtk5">str</span><span class="mtk1">&#41;&nbsp;-&gt;&nbsp;</span><span class="mtk5">String</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">.</span><span class="mtk15">to_string</span><span class="mtk1">&#40;&#41;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">struct</span><span class="mtk1">&nbsp;</span><span class="mtk18">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk5">String</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk5">i32</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">impl</span><span class="mtk1">&nbsp;</span><span class="mtk18">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">fn</span><span class="mtk1">&nbsp;</span><span class="mtk15">new</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk5">String</span><span class="mtk1">&#41;&nbsp;-&gt;&nbsp;</span><span class="mtk5">Self</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">Self</span><span class="mtk1">&nbsp;&#123;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">fn</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&amp;</span><span class="mtk5">self</span><span class="mtk1">&#41;&nbsp;-&gt;&nbsp;&amp;</span><span class="mtk5">str</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&amp;</span><span class="mtk5">self</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">.</span><span class="mtk15">is_empty</span><span class="mtk1">&#40;&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">println!</span><span class="mtk1">&#40;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&#41;;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Swift 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateSwiftLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">let</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk5">var</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;</span><span class="mtk18">String</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk5">func</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;</span><span class="mtk18">String</span><span class="mtk1">&#41;&nbsp;-&gt;&nbsp;</span><span class="mtk18">String</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk18">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">var</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk18">String</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">init</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk18">String</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">self</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">func</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;&nbsp;-&gt;&nbsp;</span><span class="mtk18">String</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">.</span><span class="mtk15">isEmpty</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">print</span><span class="mtk1">&#40;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk1">&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Lua 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateLuaLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">local</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk5">function</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span>`,
      () => `<span class="mtk5">end</span>`,
      () => `<span class="mtk5">local</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;&#123;&#125;</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk5">function</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">:</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk5">self</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span>`,
      () => `<span class="mtk5">end</span>`,
      () => `<span class="mtk4">--&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">then</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">print</span><span class="mtk1">&#40;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk5">end</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * R 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateRLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;&lt;-&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;&lt;-&nbsp;</span><span class="mtk15">c</span><span class="mtk1">&#40;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">,&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">,&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&nbsp;&lt;-&nbsp;</span><span class="mtk5">function</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk15">library</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomModuleName()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;&lt;-&nbsp;</span><span class="mtk15">data.frame</span><span class="mtk1">&#40;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk15">c</span><span class="mtk1">&#40;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">,&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">&#41;,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk15">c</span><span class="mtk1">&#40;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">,&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk1">&#41;</span>`,
      () => `<span class="mtk4">#&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk15">plot</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk15">summary</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * PowerShell 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generatePowerShellLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk5">function</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">param</span><span class="mtk1">&#40;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk15">Get-${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&nbsp;-</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span>`,
      () => `<span class="mtk15">Set-${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&nbsp;-</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span>`,
      () => `<span class="mtk4">#&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">if</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">Write-Host</span><span class="mtk1">&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">foreach</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">$${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;</span><span class="mtk5">in</span><span class="mtk1">&nbsp;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">Write-Output</span><span class="mtk1">&nbsp;</span><span class="mtk9">$${CodeGenerator.randomProperty()}</span>`,
      () => `<span class="mtk1">&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * INI 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateIniLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk18">&#91;${CodeGenerator.randomModuleName()}&#93;</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">=</span><span class="mtk11">${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">=</span><span class="mtk6">${CodeGenerator.randomNumber()}</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">=</span><span class="mtk5">true</span>`,
      () => `<span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">=</span><span class="mtk5">false</span>`,
      () => `<span class="mtk4">;&nbsp;${CodeGenerator.randomComment()}</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Log 代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateLogLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk1">&#91;</span><span class="mtk6">${new Date().toISOString()}</span><span class="mtk1">&#93;&nbsp;</span><span class="mtk5">INFO</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk1">&#91;</span><span class="mtk6">${new Date().toISOString()}</span><span class="mtk1">&#93;&nbsp;</span><span class="mtk8">ERROR</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk1">&#91;</span><span class="mtk6">${new Date().toISOString()}</span><span class="mtk1">&#93;&nbsp;</span><span class="mtk16">WARN</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk1">&#91;</span><span class="mtk6">${new Date().toISOString()}</span><span class="mtk1">&#93;&nbsp;</span><span class="mtk9">DEBUG</span><span class="mtk1">:&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomString()}</span>`,
      () => `<span class="mtk6">${new Date().toISOString()}</span><span class="mtk1">&nbsp;-&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;&#41;&nbsp;executed&nbsp;successfully</span>`,
      () => `<span class="mtk6">${new Date().toISOString()}</span><span class="mtk1">&nbsp;-&nbsp;User&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">&nbsp;performed&nbsp;action:&nbsp;</span><span class="mtk11">${CodeGenerator.randomString().replace(/"/g, '')}</span>`,
      () => `<span class="mtk6">${new Date().toISOString()}</span><span class="mtk1">&nbsp;-&nbsp;Request&nbsp;processed&nbsp;in&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span><span class="mtk1">ms</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }


  /**
   * C头文件代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateCHeaderLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk4">/*&nbsp;${CodeGenerator.randomComment()}&nbsp;*/</span>`,
      () => `<span class="mtk5">#ifndef</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomHeaderName().toUpperCase()}_H</span>`,
      () => `<span class="mtk5">#define</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomHeaderName().toUpperCase()}_H</span>`,
      () => `<span class="mtk5">#include</span><span class="mtk1">&nbsp;</span><span class="mtk11">&lt;${CodeGenerator.randomHeaderName()}.h&gt;</span>`,
      () => `<span class="mtk5">#include</span><span class="mtk1">&nbsp;</span><span class="mtk11">"${CodeGenerator.randomHeaderName()}.h"</span>`,
      () => `<span class="mtk5">#define</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName().toUpperCase()}</span><span class="mtk1">&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}</span>`,
      () => `<span class="mtk5">typedef</span><span class="mtk1">&nbsp;</span><span class="mtk5">struct</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk16">${CodeGenerator.randomCppType()}</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk16">${CodeGenerator.randomCppType()}</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomCppParameters()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk5">extern</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomCppType()}</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">#ifdef</span><span class="mtk1">&nbsp;</span><span class="mtk9">__cplusplus</span>`,
      () => `<span class="mtk5">extern</span><span class="mtk1">&nbsp;</span><span class="mtk11">"C"</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk5">#endif</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">#endif</span><span class="mtk1">&nbsp;</span><span class="mtk4">/*&nbsp;${CodeGenerator.randomHeaderName().toUpperCase()}_H&nbsp;*/</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * C++头文件代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateCppHeaderLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk4">/*&nbsp;${CodeGenerator.randomComment()}&nbsp;*/</span>`,
      () => `<span class="mtk5">#pragma</span><span class="mtk1">&nbsp;</span><span class="mtk9">once</span>`,
      () => `<span class="mtk5">#ifndef</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomHeaderName().toUpperCase()}_HPP</span>`,
      () => `<span class="mtk5">#define</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomHeaderName().toUpperCase()}_HPP</span>`,
      () => `<span class="mtk5">#include</span><span class="mtk1">&nbsp;</span><span class="mtk11">&lt;${CodeGenerator.randomHeaderName()}&gt;</span>`,
      () => `<span class="mtk5">#include</span><span class="mtk1">&nbsp;</span><span class="mtk11">"${CodeGenerator.randomHeaderName()}.hpp"</span>`,
      () => `<span class="mtk5">namespace</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomModuleName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk5">class</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomClassName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk5">public</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">${CodeGenerator.randomClassName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomCppParameters()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">virtual</span><span class="mtk1">&nbsp;</span><span class="mtk15">~${CodeGenerator.randomClassName()}</span><span class="mtk1">&#40;&#41;&nbsp;=&nbsp;</span><span class="mtk5">default</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk16">${CodeGenerator.randomCppType()}</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomCppParameters()}</span><span class="mtk1">&#41;&nbsp;</span><span class="mtk5">const</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">private</span><span class="mtk1">:</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk16">${CodeGenerator.randomCppType()}</span><span class="mtk1">&nbsp;</span><span class="mtk9">m_${CodeGenerator.randomProperty()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;;</span>`,
      () => `<span class="mtk1">&#125;&nbsp;</span><span class="mtk4">//&nbsp;namespace&nbsp;${CodeGenerator.randomModuleName()}</span>`,
      () => `<span class="mtk5">#endif</span><span class="mtk1">&nbsp;</span><span class="mtk4">/*&nbsp;${CodeGenerator.randomHeaderName().toUpperCase()}_HPP&nbsp;*/</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Git配置文件代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateGitLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk4">#&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk9">*.log</span>`,
      () => `<span class="mtk9">*.tmp</span>`,
      () => `<span class="mtk9">node_modules/</span>`,
      () => `<span class="mtk9">dist/</span>`,
      () => `<span class="mtk9">build/</span>`,
      () => `<span class="mtk9">.env</span>`,
      () => `<span class="mtk9">.DS_Store</span>`,
      () => `<span class="mtk9">*.swp</span>`,
      () => `<span class="mtk9">*.swo</span>`,
      () => `<span class="mtk9">*.pyc</span>`,
      () => `<span class="mtk9">__pycache__/</span>`,
      () => `<span class="mtk9">*.class</span>`,
      () => `<span class="mtk9">target/</span>`,
      () => `<span class="mtk9">*.iml</span>`,
      () => `<span class="mtk9">.idea/</span>`,
      () => `<span class="mtk9">.vscode/</span>`,
      () => `<span class="mtk9">coverage/</span>`,
      () => `<span class="mtk9">*.coverage</span>`,
      () => `<span class="mtk4">#&nbsp;Dependency&nbsp;directories</span>`,
      () => `<span class="mtk9">vendor/</span>`,
      () => `<span class="mtk4">#&nbsp;OS&nbsp;generated&nbsp;files</span>`,
      () => `<span class="mtk9">Thumbs.db</span>`,
      () => `<span class="mtk9">ehthumbs.db</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * LESS样式文件代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateLessLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk9">@${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk9">@${CodeGenerator.randomVariableName()}-color</span><span class="mtk1">:&nbsp;</span><span class="mtk11">#${Math.floor(Math.random() * 16777215).toString(16)}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">.</span><span class="mtk16">${CodeGenerator.randomCssClass()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk9">@${CodeGenerator.randomVariableName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk1">&</span><span class="mtk1">:</span><span class="mtk16">hover</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk1">.</span><span class="mtk15">${CodeGenerator.randomCssClass()}-mixin</span><span class="mtk1">&#40;</span><span class="mtk9">@${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk9">@${CodeGenerator.randomVariableName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk1">.</span><span class="mtk16">${CodeGenerator.randomCssClass()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;.</span><span class="mtk15">${CodeGenerator.randomCssClass()}-mixin</span><span class="mtk1">&#40;</span><span class="mtk9">@${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk1">&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * LaTeX文件代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateTexLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk5">\\documentclass</span><span class="mtk1">&#91;</span><span class="mtk9">12pt</span><span class="mtk1">&#93;&#123;</span><span class="mtk9">article</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\usepackage</span><span class="mtk1">&#123;</span><span class="mtk9">${CodeGenerator.randomChoice(['amsmath', 'graphicx', 'hyperref', 'geometry', 'babel'])}</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\title</span><span class="mtk1">&#123;</span><span class="mtk11">${CodeGenerator.randomComment()}</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\author</span><span class="mtk1">&#123;</span><span class="mtk11">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\date</span><span class="mtk1">&#123;</span><span class="mtk11">\\today</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\begin</span><span class="mtk1">&#123;</span><span class="mtk9">document</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\maketitle</span>`,
      () => `<span class="mtk5">\\section</span><span class="mtk1">&#123;</span><span class="mtk11">${CodeGenerator.randomComment()}</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\subsection</span><span class="mtk1">&#123;</span><span class="mtk11">${CodeGenerator.randomComment()}</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk1">${CodeGenerator.randomComment()}&nbsp;</span><span class="mtk5">\\cite</span><span class="mtk1">&#123;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\begin</span><span class="mtk1">&#123;</span><span class="mtk9">equation</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">E</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk9">mc^2</span>`,
      () => `<span class="mtk5">\\end</span><span class="mtk1">&#123;</span><span class="mtk9">equation</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\begin</span><span class="mtk1">&#123;</span><span class="mtk9">itemize</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">\\item</span><span class="mtk1">&nbsp;</span><span class="mtk11">${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">\\end</span><span class="mtk1">&#123;</span><span class="mtk9">itemize</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\textbf</span><span class="mtk1">&#123;</span><span class="mtk11">${CodeGenerator.randomComment()}</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\textit</span><span class="mtk1">&#123;</span><span class="mtk11">${CodeGenerator.randomComment()}</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">\\end</span><span class="mtk1">&#123;</span><span class="mtk9">document</span><span class="mtk1">&#125;</span>`,
      () => `<span class="mtk4">%&nbsp;${CodeGenerator.randomComment()}</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Rust工具链配置文件代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateRustToolchainLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk4">#&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk9">&#91;toolchain&#93;</span>`,
      () => `<span class="mtk9">channel</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">"${CodeGenerator.randomChoice(['stable', 'beta', 'nightly', '1.70.0'])}"</span>`,
      () => `<span class="mtk9">components</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">&#91;"${CodeGenerator.randomChoice(['rustfmt', 'clippy', 'rust-src', 'rust-analyzer'])}"&#93;</span>`,
      () => `<span class="mtk9">targets</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">&#91;"${CodeGenerator.randomChoice(['wasm32-unknown-unknown', 'x86_64-unknown-linux-gnu', 'aarch64-apple-darwin'])}"&#93;</span>`,
      () => `<span class="mtk9">profile</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">"${CodeGenerator.randomChoice(['minimal', 'default', 'complete'])}"</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * SCSS样式文件代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateScssLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk9">$${CodeGenerator.randomVariableName()}-color</span><span class="mtk1">:&nbsp;</span><span class="mtk11">#${Math.floor(Math.random() * 16777215).toString(16)}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">@import</span><span class="mtk1">&nbsp;</span><span class="mtk11">'${CodeGenerator.randomFileName()}'</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">@mixin</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomCssClass()}</span><span class="mtk1">&#40;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk1">.</span><span class="mtk16">${CodeGenerator.randomCssClass()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">@include</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomCssClass()}</span><span class="mtk1">&#40;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk1">&</span><span class="mtk1">:</span><span class="mtk16">hover</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk15">darken</span><span class="mtk1">&#40;</span><span class="mtk9">$${CodeGenerator.randomVariableName()}</span><span class="mtk1">,&nbsp;</span><span class="mtk6">10%</span><span class="mtk1">&#41;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk1">&</span><span class="mtk16">.${CodeGenerator.randomCssClass()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">@media</span><span class="mtk1">&nbsp;&#40;</span><span class="mtk9">max-width</span><span class="mtk1">:&nbsp;</span><span class="mtk6">${CodeGenerator.randomNumber()}px</span><span class="mtk1">&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;.</span><span class="mtk16">${CodeGenerator.randomCssClass()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * TypeScript定义文件代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateTypeScriptDefLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk4">//&nbsp;${CodeGenerator.randomComment()}</span>`,
      () => `<span class="mtk5">declare</span><span class="mtk1">&nbsp;</span><span class="mtk5">module</span><span class="mtk1">&nbsp;</span><span class="mtk11">'${CodeGenerator.randomModuleName()}'</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">export</span><span class="mtk1">&nbsp;</span><span class="mtk5">interface</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomInterfaceName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">?:&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomParameters()}</span><span class="mtk1">&#41;:&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">export</span><span class="mtk1">&nbsp;</span><span class="mtk5">type</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomTypeName()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">&nbsp;|&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">export</span><span class="mtk1">&nbsp;</span><span class="mtk5">function</span><span class="mtk1">&nbsp;</span><span class="mtk15">${CodeGenerator.randomFunctionName()}</span><span class="mtk1">&#40;</span><span class="mtk9">${CodeGenerator.randomParameters()}</span><span class="mtk1">&#41;:&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">export</span><span class="mtk1">&nbsp;</span><span class="mtk5">const</span><span class="mtk1">&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">:&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">declare</span><span class="mtk1">&nbsp;</span><span class="mtk5">global</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk5">namespace</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomModuleName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">interface</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomInterfaceName()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk16">${CodeGenerator.randomType()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk5">export</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk9">${CodeGenerator.randomModuleName()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">export</span><span class="mtk1">&nbsp;</span><span class="mtk5">as</span><span class="mtk1">&nbsp;</span><span class="mtk5">namespace</span><span class="mtk1">&nbsp;</span><span class="mtk16">${CodeGenerator.randomModuleName()}</span><span class="mtk1">;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * Vue单文件组件代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateVueLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk1">&lt;</span><span class="mtk5">template</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&lt;</span><span class="mtk5">div</span><span class="mtk1">&nbsp;</span><span class="mtk9">class</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomCssClass()}"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">h1</span><span class="mtk1">&gt;</span><span class="mtk11">{{ ${CodeGenerator.randomProperty()} }}</span><span class="mtk1">&lt;/</span><span class="mtk5">h1</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">button</span><span class="mtk1">&nbsp;</span><span class="mtk9">@click</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomMethod()}"</span><span class="mtk1">&gt;</span><span class="mtk11">${CodeGenerator.randomComment()}</span><span class="mtk1">&lt;/</span><span class="mtk5">button</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">input</span><span class="mtk1">&nbsp;</span><span class="mtk9">v-model</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomProperty()}"</span><span class="mtk1">&nbsp;/&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&lt;/</span><span class="mtk5">div</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;/</span><span class="mtk5">template</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;</span><span class="mtk5">script</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk5">import</span><span class="mtk1">&nbsp;&#123;&nbsp;</span><span class="mtk9">${CodeGenerator.randomVariableName()}</span><span class="mtk1">&nbsp;&#125;&nbsp;</span><span class="mtk5">from</span><span class="mtk1">&nbsp;</span><span class="mtk11">'${CodeGenerator.randomModuleName()}'</span><span class="mtk1">;</span>`,
      () => `<span class="mtk5">export</span><span class="mtk1">&nbsp;</span><span class="mtk5">default</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">name</span><span class="mtk1">:&nbsp;</span><span class="mtk11">'${CodeGenerator.randomClassName()}'</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">data</span><span class="mtk1">&#40;&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">return</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;,</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">methods</span><span class="mtk1">:&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk15">${CodeGenerator.randomMethod()}</span><span class="mtk1">&#40;&#41;&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk5">this</span><span class="mtk1">.</span><span class="mtk9">${CodeGenerator.randomProperty()}</span><span class="mtk1">&nbsp;=&nbsp;</span><span class="mtk11">${CodeGenerator.randomValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&#125;</span>`,
      () => `<span class="mtk1">&#125;;</span>`,
      () => `<span class="mtk1">&lt;/</span><span class="mtk5">script</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;</span><span class="mtk5">style</span><span class="mtk1">&nbsp;</span><span class="mtk9">scoped</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">.</span><span class="mtk16">${CodeGenerator.randomCssClass()}</span><span class="mtk1">&nbsp;&#123;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9">${CodeGenerator.randomCssProperty()}</span><span class="mtk1">:&nbsp;</span><span class="mtk11">${CodeGenerator.randomCssValue()}</span><span class="mtk1">;</span>`,
      () => `<span class="mtk1">&#125;</span>`,
      () => `<span class="mtk1">&lt;/</span><span class="mtk5">style</span><span class="mtk1">&gt;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }

  /**
   * XSL样式表代码生成器 - 返回带有高亮样式的HTML
   */
  private static generateXslLine(fileType: string): string {
    const patterns = [
      () => `<span class="mtk1">&lt;?</span><span class="mtk5">xml</span><span class="mtk1">&nbsp;</span><span class="mtk9">version</span><span class="mtk1">=</span><span class="mtk11">"1.0"</span><span class="mtk1">&nbsp;</span><span class="mtk9">encoding</span><span class="mtk1">=</span><span class="mtk11">"UTF-8"</span><span class="mtk1">?&gt;</span>`,
      () => `<span class="mtk1">&lt;</span><span class="mtk5">xsl:stylesheet</span><span class="mtk1">&nbsp;</span><span class="mtk9">version</span><span class="mtk1">=</span><span class="mtk11">"1.0"</span><span class="mtk1">&nbsp;</span><span class="mtk9">xmlns:xsl</span><span class="mtk1">=</span><span class="mtk11">"http://www.w3.org/1999/XSL/Transform"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&lt;</span><span class="mtk5">xsl:template</span><span class="mtk1">&nbsp;</span><span class="mtk9">match</span><span class="mtk1">=</span><span class="mtk11">"/"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">html</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">head</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">title</span><span class="mtk1">&gt;</span><span class="mtk11">${CodeGenerator.randomComment()}</span><span class="mtk1">&lt;/</span><span class="mtk5">title</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/</span><span class="mtk5">head</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">body</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">xsl:for-each</span><span class="mtk1">&nbsp;</span><span class="mtk9">select</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomVariableName()}"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">div</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">xsl:value-of</span><span class="mtk1">&nbsp;</span><span class="mtk9">select</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomProperty()}"</span><span class="mtk1">/&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/</span><span class="mtk5">div</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/</span><span class="mtk5">xsl:for-each</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/</span><span class="mtk5">body</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;/</span><span class="mtk5">html</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&lt;/</span><span class="mtk5">xsl:template</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&lt;</span><span class="mtk5">xsl:template</span><span class="mtk1">&nbsp;</span><span class="mtk9">match</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomVariableName()}"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">xsl:if</span><span class="mtk1">&nbsp;</span><span class="mtk9">test</span><span class="mtk1">=</span><span class="mtk11">"${CodeGenerator.randomProperty()}&nbsp;!=&nbsp;''"</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;</span><span class="mtk5">span</span><span class="mtk1">&gt;&lt;</span><span class="mtk5">xsl:value-of</span><span class="mtk1">&nbsp;</span><span class="mtk9">select</span><span class="mtk1">=</span><span class="mtk11">"."</span><span class="mtk1">/&gt;&lt;/</span><span class="mtk5">span</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&lt;/</span><span class="mtk5">xsl:if</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&nbsp;&nbsp;&lt;/</span><span class="mtk5">xsl:template</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk1">&lt;/</span><span class="mtk5">xsl:stylesheet</span><span class="mtk1">&gt;</span>`,
      () => `<span class="mtk4">&lt;!--&nbsp;${CodeGenerator.randomComment()}&nbsp;--&gt;</span>`
    ];

    return CodeGenerator.getNextPattern(fileType, patterns)();
  }
}
