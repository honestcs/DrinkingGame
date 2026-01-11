1. **修改 CSS 布局**：在 `src/views/Home.vue` 中，调整 `.game-grid` 的 `grid-template-columns` 属性。

   * 默认设置为 `repeat(2, 1fr)`，确保移动端显示双列。

   * 调整 `gap` 和 `padding` 以优化空间利用。

   * 添加媒体查询，在屏幕宽度大于 600px 时切换为 3 列或自适应布局。

   * 移除原本针对超小屏幕的单列优化代码。

