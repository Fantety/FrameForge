# FrameForge

FrameForge是一个使用FastAPI和React构建的Web应用程序，专为游戏开发者打造的AI素材生成工具。它提供了多种AI驱动的功能，帮助开发者快速创建游戏所需的视觉和音频素材。

## 项目结构

```
FrameForge/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── bin/
├── build.py
└── package_app.py
```

## 核心功能

FrameForge提供了三种核心的AI素材生成功能，帮助游戏开发者快速创建所需内容：

### 图像生成

使用AI技术生成高质量的游戏素材图像，支持多种参数调整：
- 自定义提示词描述，精确控制生成内容
- 可调节图像尺寸（如512x512, 1024x1024等）
- 控制生成图像的指导尺度(guidance scale)
- 设置随机种子以获得可重现的结果
- 可选的水印添加功能

### 动画生成

基于AI的动画生成功能，可以创建简短的动画片段：
- 通过文本描述生成动画内容
- 支持提供首帧图像作为参考
- 可选择不同分辨率（如720p, 1080p等）
- 可调节动画时长（1-10秒）
- 固定或移动摄像头视角选项
- 可选的水印添加功能
- 帧拆分功能，可将生成的动画拆分为单独的帧图片

### Chiptune音乐生成

使用AI技术生成具有复古游戏风格的Chiptune音乐：
- 通过自然语言描述生成音乐风格（如"欢快的8位像素冒险游戏背景音乐"）
- 可调节音乐节拍(BPM)
- 一键生成并播放音乐
- 支持生成音乐的下载功能

## 应用打包分发

### 前置条件

在执行打包脚本之前，请确保您已安装以下软件：

1. Node.js (推荐版本14或更高版本) - [Node.js官网](https://nodejs.org/)
2. Python (推荐版本3.7或更高版本)

您可以通过以下命令检查是否已正确安装：

```bash
node --version
npm --version
python --version
```

确保这些命令在您的系统PATH中可用。如果命令无法找到，请重新安装相应软件并确保在安装过程中选择了将程序添加到系统PATH的选项。

### 打包方式

FrameForge提供两种打包方式：

#### 方式一：完整打包（包含前端构建）

这种方式会构建前端应用并将其与后端一起打包，适用于分发完整的应用。

1. 运行打包脚本：
   ```bash
   python build.py
   ```

2. 打包完成后，会在项目根目录的`bin`文件夹中生成`frameforge.zip`文件。

3. 分发方法：
   - 将`frameforge.zip`文件发送给其他用户
   - 用户解压后，根据操作系统运行相应的启动脚本：
     - Windows: 双击`start_frameforge.bat`或运行`start_frameforge.bat`
     - Linux/Mac: 运行`./start_frameforge.sh`

#### 方式二：简化打包（仅后端）

这种方式仅打包后端代码，不包含前端构建，适用于已有前端构建结果或只需要后端的情况。

1. 运行简化打包脚本：
   ```bash
   python package_app.py
   ```

2. 打包完成后，会在项目根目录的`bin`文件夹中生成`frameforge_package.zip`文件。

3. 分发方法：
   - 将`frameforge_package.zip`文件发送给其他用户
   - 用户解压后，根据操作系统运行相应的启动脚本：
     - Windows: 双击`start_frameforge.bat`或运行`start_frameforge.bat`
     - Linux/Mac: 运行`./start_frameforge.sh`

#### 创建不包含源代码的可执行文件

如果您希望创建不包含Python源代码的可执行文件，可以使用PyInstaller。这将保护您的源代码不被查看。

1. 安装PyInstaller：
   ```bash
   pip install pyinstaller
   ```

2. 运行打包脚本，它会自动创建可执行文件：
   ```bash
   python build.py
   ```

3. 如果您不希望创建可执行文件，可以使用以下命令：
   ```bash
   python build.py --no-exe
   ```

当创建可执行文件时，打包脚本会自动排除Python源代码文件（保留requirements.txt），生成的zip文件将包含可执行文件而不是源代码。

### 启动应用

解压打包文件后，您可以通过以下方式启动应用：

#### Windows

双击`start_frameforge.bat`文件，或在命令行中运行：

```cmd
start_frameforge.bat
```

#### Linux/Mac

在终端中运行：

```bash
./start_frameforge.sh
```

启动后，您可以在浏览器中访问`http://localhost:8000`来使用FrameForge应用。

### 项目结构

```
FrameForge/
├── backend/          # 后端代码
├── frontend/         # 前端代码
├── bin/              # 打包输出目录
│   ├── frameforge.zip       # 完整打包文件
│   └── frameforge_package.zip # 简化打包文件
├── build.py          # 完整打包脚本
├── package_app.py    # 简化打包脚本
└── README.md
```

### 注意事项

1. 如果您在运行打包脚本时遇到问题，请检查是否已正确安装Node.js和Python，并确保它们已添加到系统PATH中。
2. 在某些Windows系统上，可能需要以管理员权限运行打包脚本。
3. 如果您不需要构建前端应用，可以使用简化打包方式（package_app.py），它不会尝试构建前端应用，但需要确保后端代码中的静态文件路径正确配置。
4. 打包脚本会自动排除后端的frames目录，因为该目录通常包含临时文件，不需要打包分发。

1. 分发:
   将生成的zip文件发送给其他用户，他们解压后即可使用。

2. 使用:
   在解压后的目录中，用户可以运行:
   - Windows系统: 双击`start_frameforge.bat`或运行`start_frameforge.bat`
   - Linux/Mac系统: 运行`./start_frameforge.sh`

   应用将在`http://localhost:8000`上启动。

   注意：
   - 如果使用方式一打包，应用将包含完整的前端界面
   - 如果使用方式二打包且没有前端构建结果，用户需要单独运行前端或通过其他方式提供前端界面

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