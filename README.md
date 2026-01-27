# SPR ERP 前端项目

这是一个使用 Next.js 构建的 SPR ERP 前端项目。

## 准备工作

在开始之前，请确保您的电脑上安装了以下软件：

1.  **Node.js**: 建议安装 LTS 版本 ([下载地址](https://nodejs.org/))
2.  **Git**: 用于版本控制 ([下载地址](https://git-scm.com/))
3.  **Vercel 账号**: 用于项目部署 ([注册地址](https://vercel.com/))

## 本地开发指南

按照以下步骤在本地运行项目：

1.  **安装依赖**
    打开终端（Terminal）或命令行工具，进入项目目录并在终端运行：
    ```bash
    npm install
    ```

2.  **配置环境变量**
    项目包含一个 `.env.example` 文件。复制该文件并重命名为 `.env.local`：
    ```bash
    cp .env.example .env.local
    # 或者在 Windows PowerShell 中：
    # copy .env.example .env.local
    ```
    *注意：`.env.local` 包含本地开发配置，已被 Git 忽略，不会上传到代码仓库。*

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    启动后，在浏览器中访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 部署到 GitHub

将项目源代码备份到 GitHub：

1.  **初始化 Git 仓库**（如果尚未初始化）
    ```bash
    git init
    ```

2.  **添加文件并提交**
    ```bash
    git add .
    git commit -m "Initial commit"
    ```

3.  **连接远程仓库**
    *请先在 GitHub 上创建一个新的空仓库，然后运行以下命令（将 URL 替换为您的仓库地址）：*
    ```bash
    git branch -M main
    git remote add origin https://github.com/您的用户名/您的仓库名.git
    git push -u origin main
    ```

## 部署到 Vercel (推荐)

Vercel 是 Next.js 的官方部署平台，部署流程非常简单：

1.  **登录 Vercel**
    访问 [Vercel Dashboard](https://vercel.com/dashboard) 并使用 GitHub 账号登录。

2.  **导入项目**
    - 点击 "Add New..." -> "Project".
    - 在 "Import Git Repository" 中找到您刚刚推送到 GitHub 的仓库，点击 "Import"。

3.  **配置项目**
    - **Framework Preset**: 默认选择 Next.js 即可。
    - **Root Directory**: 默认为 `./`。
    - **Environment Variables** (环境变量):
      根据 `.env.example` 的内容添加环境变量：
      - `NEXT_PUBLIC_USE_MOCK`: `true` (或根据生产环境需求设置)
      - `NEXT_PUBLIC_API_URL`: 您的生产环境后端 API 地址 (例如 `https://api.example.com`)

4.  **点击 Deploy**
    等待几分钟构建完成，Vercel 会自动分配一个访问域名。

## 常用命令

-   `npm run dev`: 启动本地开发服务器
-   `npm run build`: 构建生产版本
-   `npm run start`: 运行构建后的生产版本
-   `npm run lint`: 运行代码检查
