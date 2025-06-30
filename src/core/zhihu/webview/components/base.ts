/**
 * 基础组件接口
 * 所有HTML组件都需要实现此接口
 */
export interface Component {
  /**
   * 渲染组件内容
   * @returns 组件的HTML字符串
   */
  render(): string;
}

/**
 * 组件渲染参数接口
 */
export interface RenderOptions {
  mediaDisplayMode: string;
  immersiveMode?: boolean; // 沉浸模式开关
  miniMediaScale?: number; // mini模式下图片缩放比例 (1-100)
  [key: string]: any;
}
