/**
 * Spark 图标（知乎直答/AI 相关功能使用）
 */
export const sparkIconSvg = `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
  <g clip-path="url(#zhida-spark-a)">
    <path d="M5.219 12.433.876 11.347a.722.722 0 0 1 0-1.402L5.219 8.86a3.228 3.228 0 0 0 2.348-2.348l1.086-4.343a.722.722 0 0 1 1.402 0l1.085 4.343a3.228 3.228 0 0 0 2.349 2.348l4.343 1.086a.722.722 0 0 1 0 1.402l-4.343 1.086a3.228 3.228 0 0 0-2.349 2.348l-1.085 4.343a.722.722 0 0 1-1.402 0L7.567 14.78a3.228 3.228 0 0 0-2.348-2.348ZM16.236.129a.361.361 0 0 1 .677 0l.607 1.64c.122.33.382.59.711.711l1.64.607a.361.361 0 0 1 0 .677l-1.64.607c-.33.122-.59.382-.711.711l-.607 1.64a.361.361 0 0 1-.677 0l-.607-1.64a1.203 1.203 0 0 0-.711-.71l-1.64-.608a.361.361 0 0 1 0-.677l1.64-.607c.33-.122.59-.381.711-.71l.607-1.641Z"></path>
  </g>
  <defs>
    <clipPath id="zhida-spark-a"><path d="M0 0h20v20H0z"></path></clipPath>
  </defs>
</svg>`;

/**
 * 知乎直答（Zhida）AI 弹窗组件
 */
export class ZhidaPanelComponent {
  /**
   * 渲染弹窗 HTML 容器（初始隐藏）
   */
  public static renderModal(): string {
    return `
      <!-- 知乎直答 AI 弹窗 -->
      <div id="zhidaModal" class="zhida-modal" role="dialog" aria-modal="true" aria-label="知乎直答">
        <div class="zhida-modal-overlay" onclick="closeZhidaModal()"></div>
        <div class="zhida-modal-content">
          <div class="zhida-modal-header">
            <div class="zhida-modal-title">
              ${sparkIconSvg.replace('width="16" height="16"', 'width="14" height="14"')}
              知乎直答
            </div>
            <button class="zhida-modal-close" onclick="closeZhidaModal()" title="关闭 (ESC)">×</button>
          </div>
          <div class="zhida-modal-body">
            <!-- 左侧关键词 -->
            <div class="zhida-keyword-panel">
              <div class="zhida-keyword-label">查询内容</div>
              <div class="zhida-keyword-bubble" id="zhidaKeyword">-</div>
            </div>
            <!-- 右侧回答 -->
            <div class="zhida-answer-panel" id="zhidaAnswerPanel">
              <div class="zhida-loading" id="zhidaLoading">
                <div class="zhida-loading-dots">
                  <span></span><span></span><span></span>
                </div>
                <div>正在获取 AI 回答...</div>
              </div>
              <div class="zhida-answer-content" id="zhidaAnswerContent" style="display: none;"></div>
              <div class="zhida-error" id="zhidaError" style="display: none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <div id="zhidaErrorMsg">发生错误</div>
              </div>
            </div>
          </div>
          <div class="zhida-modal-footer">
            <div class="zhida-ai-tip">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M5.219 12.433.876 11.347a.722.722 0 0 1 0-1.402L5.219 8.86a3.228 3.228 0 0 0 2.348-2.348l1.086-4.343a.722.722 0 0 1 1.402 0l1.085 4.343a3.228 3.228 0 0 0 2.349 2.348l4.343 1.086a.722.722 0 0 1 0 1.402l-4.343 1.086a3.228 3.228 0 0 0-2.349 2.348l-1.085 4.343a.722.722 0 0 1-1.402 0L7.567 14.78a3.228 3.228 0 0 0-2.348-2.348Z"/></svg>
              以上内容由知乎 AI 大模型生成，请注意甄别，理性参考。
              <span class="zhida-disclaimer-hint">（hover 查看免责声明）</span>
            </div>
            <div class="zhida-disclaimer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="zhida-disclaimer-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <span><strong>免责声明：</strong>本插件仅模拟用户点击 AI 按钮，将浏览器中已展示的内容搬运至 VSCode 中显示，不会破解、绕过或恶意利用知乎任何 AI 功能与接口，不会上传、收集、存储或分析任何用户数据与隐私信息，不用于任何营利行为。所有操作均在本地执行，代码开源，欢迎审查。</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染回答内标题后的 AI 总结按钮
   * @param answerId 回答 ID
   */
  public static renderSummarizeButton(answerId: string): string {
    return `<button class="zhida-summarize-btn" title="AI 总结此回答" onclick="requestZhidaSummary('${answerId}')">${sparkIconSvg}</button>`;
  }
}
