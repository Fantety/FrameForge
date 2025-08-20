<div align="center">
  <img src="icon.png" alt="FrameForge Logo" width="200">
</div>

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

### 构建方式


#### 方式一：完整打包（包含前端构建）

这种方式会构建前端应用并将其与后端一起打包，适用于分发完整的应用。

1. 运行打包脚本：
   ```bash
   python build.py
   ```

2. 打包完成后，会在项目根目录的`bin`文件夹中生成`frameforge.zip`文件。



### 启动应用

解压打包文件后，您可以通过以下方式启动应用：

#### Windows

双击`frameforge.exe`文件

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

# FrameForge 使用说明

## 基本流程

1. **登录火山引擎**
   
   - 访问 [火山引擎官网](https://www.volcengine.com/)
   - 注册或登录您的账户

2. **激活需要的模型**
   
   - 进入火山引擎控制台
   - 找到需要的AI模型服务（如图像生成、动画生成等）
   - 按照指引激活相关模型
   - 以下是必须激活的模型：
     
     > doubao-1-5-lite-32k-250115
     > 
     > doubao-seedream-3-0-t2i-250415
     > 
     > doubao-seedance-1-0-pro-250528
     > 
     > doubao-1-5-pro-256k-250115

3. **获取APIKEY**
   
   - 在火山引擎控制台中找到API密钥管理页面
   - 创建一个新的API密钥或使用现有的密钥
   - 复制您的APIKEY，稍后需要设置为环境变量

4. **设置环境变量**
   
   - 在Windows系统中设置环境变量：
     - 右键点击"此电脑" -> "属性" -> "高级系统设置" -> "环境变量"
     - 在系统变量或用户变量中添加新的变量：
       - 变量名：ARK_API_KEY
       - 变量值：您从火山引擎获取的APIKEY
     - 点击"确定"保存设置
   - 或者在命令行中临时设置环境变量：
     
     ```cmd
     set ARK_API_KEY=您的APIKEY
     ```

5. **启动应用程序**
   
   - 双击运行 `frameforge.exe` 文件启动应用程序
   - 或者在命令行中执行：
     
     ```cmd
     frameforge.exe
     ```
   - 应用程序启动后，会在浏览器输入127.0.0.1:8000打开FrameForge界面

## 注意事项

- 确保已正确设置环境变量ARK_API_KEY，否则应用程序无法正常工作
- 如果遇到网络连接问题，请检查防火墙设置
- 应用程序需要访问互联网以调用火山引擎的AI服务