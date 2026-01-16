# 🚀 项目启动指南

本指南详细介绍了如何在本地运行 **TalentScout AI** 项目。

## ✅ 前置条件

- **Node.js** (推荐 v18 或更高版本)
- **npm** (随 Node.js 一起安装)

## 🛠️ 安装步骤

1.  在项目目录中打开终端：
    ```bash
    cd /Users/luowenbin/tools/InterviewGuy
    ```

2.  安装所需的依赖项：
    ```bash
    npm install
    ```

## 🔑 环境配置

要启用 AI 功能，您需要一个 Gemini API 密钥。

1.  在根目录下创建一个 `.env.local` 文件。
2.  添加您的 API 密钥：
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```
    *(注：我已经为您配置了 `AIzaSyB2Q57z1ARlwa4wNFzxHKyopdOnKF5_mOU` 到该文件中)*

## ▶️ 运行应用

启动开发服务器：

```bash
npm run dev
```

运行命令后，您应该会看到类似以下的输出：

```
  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

在浏览器中打开 **http://localhost:3000** 查看应用。
