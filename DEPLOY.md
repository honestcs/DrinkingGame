# 部署指南 (How to Deploy)

这个项目是一个纯静态的 H5 网页应用，您可以非常方便地将其免费部署到 GitHub Pages，生成一个在线链接分享给朋友。

## 准备工作

1. 拥有一个 [GitHub 账号](https://github.com/)。
2. 电脑上安装了 Git (可选，如果是直接上传文件则不需要)。

## 方法一：使用 GitHub Pages (推荐)

这是最简单且完全免费的方法。

### 步骤 1：上传代码到 GitHub
1. 登录 GitHub，点击右上角的 `+` -> `New repository`。
2. 输入仓库名称 (例如 `bar-games`)，选择 `Public` (公开)，点击 `Create repository`。
3. **上传代码**:
   - 如果您熟悉 Git:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/您的用户名/bar-games.git
     git push -u origin main
     ```
   - **如果不熟悉 Git**:
     - 在 GitHub 仓库页面点击 `uploading an existing file`。
     - 将本项目文件夹下的所有文件（除了 `node_modules` 文件夹）拖拽上传。
     - 提交更改。

### 步骤 2：开启 GitHub Pages
1. 进入您刚才创建的 GitHub 仓库页面。
2. 点击顶部的 **Settings** (设置) 选项卡。
3. 在左侧菜单找到 **Pages**。
4. 在 **Build and deployment** 下的 **Source** 选择 `Deploy from a branch`。
5. 在 **Branch** 下选择 `main` 分支，文件夹选择 `/ (root)`，点击 **Save**。

**注意**: 由于本项目是基于 Vite 构建的，直接部署源码可能需要配置 GitHub Actions 或者先在本地构建。为了最简化操作，建议您**先在本地构建**，然后只上传构建后的文件，或者使用 `gh-pages` 分支。

---

### 🔥 最简单的“懒人”部署法 (上传 dist 文件夹)

如果您不想折腾构建配置，请按以下步骤操作：

1. **在本地构建项目**:
   在项目根目录下打开终端 (命令行)，运行：
   ```bash
   npm run build
   ```
   这会生成一个 `dist` 文件夹。

2. **只上传 dist 文件夹的内容**:
   - 创建一个新的 GitHub 仓库。
   - 打开 `dist` 文件夹。
   - 将 `dist` 文件夹内的**所有文件** (index.html, assets文件夹等) 拖拽上传到 GitHub 仓库。
   - 确保 `index.html` 在仓库的根目录下。

3. **开启 Pages**:
   - 按照上面的“步骤 2”开启 GitHub Pages。
   - 等待几分钟，GitHub 会给您一个链接 (例如 `https://yourname.github.io/bar-games/`)。
   - 发送给朋友即可畅玩！

## 方法二：使用 Vercel (无需命令行)

1. 注册并登录 [Vercel](https://vercel.com/)。
2. 点击 **Add New ...** -> **Project**。
3. 连接您的 GitHub 账号，导入刚才创建的 `bar-games` 仓库。
4. Vercel 会自动识别 Vite 项目，直接点击 **Deploy**。
5. 等待几十秒，部署完成，获得访问链接。

## 本地运行

如果您想在自己电脑上玩：

1. 安装 Node.js。
2. 在项目目录运行：
   ```bash
   npm install
   npm run dev
   ```
3. 浏览器打开显示的本地链接 (通常是 `http://localhost:5173`)。
