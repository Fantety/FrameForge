<!--
 * @FilePath: \README.md
 * @Author: Fantety
 * @Descripttion: 
 * @Date: 2025-08-17 17:25:35
 * @LastEditors: Fantety
 * @LastEditTime: 2025-08-17 17:39:31
-->
# FrameForge

FrameForge是一个使用FastAPI和React构建的Web应用程序。

## 项目结构

```
FrameForge/
├── backend/
│   ├── main.py
│   └── requirements.txt
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## 仅运行后端访问Web应用

您可以通过以下步骤构建前端并仅运行后端来访问完整的Web应用：

1. 安装前端依赖 (**重要：这一步不可省略**):
   ```
   cd frontend
   npm install
   ```

   注意：这一步会安装所有必要的依赖，包括react-scripts。
   如果省略此步骤，您将看到'react-scripts'命令未识别的错误。

2. 构建前端应用 (**重要：这一步不可省略**):
   ```
   npm run build
   ```

   注意：这一步会创建build文件夹，其中包含所有静态资源。
   如果省略此步骤，您将在浏览器中看到"Frontend build not found"消息。

3. 运行后端服务器:
   ```
   python backend/main.py
   ```

4. 访问应用:
   打开浏览器并访问 `http://localhost:8000` 即可查看React前端页面

   如果您看到"Frontend build not found"消息，请确保已完成步骤2。

5. 健康检查:
   您可以通过访问 `http://localhost:8000/api/health` 来检查后端服务状态

## 分别运行前后端（开发模式）

### 后端

1. 安装后端依赖:
   ```
   pip install -r backend/requirements.txt
   ```

2. 运行后端服务器:
   ```
   python backend/main.py
   ```

3. 访问API:
   打开浏览器并访问 `http://localhost:8000`

### 前端

1. 确保已安装Node.js (推荐版本14或更高)

2. 安装前端依赖 (**重要：这一步不可省略**):
   ```
   cd frontend
   npm install
   ```

   注意：这一步会安装所有必要的依赖，包括react-scripts。
   如果省略此步骤，您将看到'react-scripts'命令未识别的错误。

3. 启动开发服务器:
   ```
   npm start
   ```

   前端将在 `http://localhost:3000` 上运行。

如果遇到任何问题，请尝试清除缓存并重新安装:
   ```
   cd frontend
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```