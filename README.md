# Interview Guy (智能面试助手)

一个基于 AI 的智能招聘辅助工具，帮助招聘人员高效分析简历、生成面试题并评估候选人。

## 主要功能

*   **简历分析**: 上传 PDF/图片简历，AI 自动提取关键信息。
*   **智能出题**: 根据 JD 和简历，实时生成高质量、场景化的面试问题。
*   **面试记录评估**: 支持上传面试对话记录 (文本/PDF/Word)，AI 生成深度评估报告。
*   **实时交互**: 
    *   流式响应 (Streaming Response)：结果即时呈现，无需漫长等待。
    *   动态可视化：雷达图展示候选人五维能力模型。
*   **多模态支持**: 能够理解简历截图和文档附件。

## 本地运行 (Run Locally)

**前置要求:** Node.js (推荐 v16+)

1.  **安装依赖**:
    ```bash
    npm install
    ```

2.  **配置环境变量**:
    *   复制示例配置: `cp .env.example .env.local`
    *   在 `.env.local` 中填入您的 API Key:
        ```env
        VITE_API_KEY=sk-xxxxxx
        ```

3.  **启动开发服务器**:
    ```bash
    npm run dev
    ```

4.  **构建部署**:
    ```bash
    npm run build
    ```
