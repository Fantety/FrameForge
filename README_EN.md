<div align="center">
  <img src="icon.png" alt="FrameForge Logo" width="500">
</div>

# FrameForge <a href="README.md" target="_blank" style="font-size: 0.8em; text-decoration: none; color: #666;">[中文版]</a>

FrameForge is a web application built with FastAPI and React, designed as an AI material generation tool specifically for game developers. It provides various AI-powered features to help developers quickly create visual and audio materials needed for games.

## Core Features

FrameForge offers three core AI material generation features to help game developers quickly create the required content:

### Image Generation

Generate high-quality game material images using AI technology with support for various parameter adjustments:

- Custom prompt descriptions for precise control over generated content
- Adjustable image sizes (e.g., 512x512, 1024x1024, etc.)
- Control over image generation guidance scale
- Setting random seeds for reproducible results
- Optional watermark addition feature

### Animation Generation

AI-based animation generation functionality to create short animation clips:

- Generate animation content through text descriptions
- Support for providing a first frame image as reference
- Selectable resolutions (e.g., 720p, 1080p, etc.)
- Adjustable animation duration (1-10 seconds)
- Fixed or moving camera perspective options
- Optional watermark addition feature
- Frame splitting functionality to split generated animations into individual frame images

### Chiptune Music Generation

Generate retro game-style chiptune music using AI technology:

- Generate music styles through natural language descriptions (e.g., "happy 8-bit pixel adventure game background music")
- Adjustable music beats per minute (BPM)
- One-click music generation and playback
- Support for generated music download functionality

## Application Packaging and Distribution

### Prerequisites

Before executing the packaging script, ensure you have installed the following software:

1. Node.js (recommended version 14 or higher) - [Node.js official website](https://nodejs.org/)
2. Python (recommended version 3.7 or higher)

You can check if they are correctly installed with the following commands:

```bash
node --version
npm --version
python --version
```

Ensure these commands are available in your system PATH. If the commands cannot be found, reinstall the corresponding software and ensure you select the option to add the program to the system PATH during installation.

### Building Methods

#### Method 1: Complete Packaging (Including Frontend Build)

This method builds the frontend application and packages it together with the backend, suitable for distributing the complete application.

1. Run the packaging script:
   
   ```bash
   python build.py
   ```

2. After packaging is complete, a `frameforge.zip` file will be generated in the `bin` folder at the project root directory.

### Starting the Application

After extracting the packaged files, you can start the application in the following way:

#### Windows

Double-click the `frameforge.exe` file

Once started, you can access FrameForge in your browser at `http://localhost:8000`.

# FrameForge User Guide

## Basic Process

1. **Log in to Volcano Engine**
   
   - Register or log in to your [Volcano Engine account](https://www.volcengine.com/)
   
   - Visit [Volcano Ark](https://console.volcengine.com/ark/region:ark+cn-beijing/experience/vision?taskType=Picture&type=GenImage)
   
   - Select any model option on the left, then click `API Access` in the top right corner

2. **Activate Required Models**
   
   - After clicking `API Access`, get your API KEY in STEP 1 by clicking `Create API KEY`
   
   - In STEP 2 for quick access testing, activate all models
   
   - Alternatively, you can choose to activate only the following models, which are required:
     
     > doubao-1-5-lite-32k-250115
     > 
     > doubao-seedream-3-0-t2i-250415
     > 
     > doubao-seedance-1-0-pro-250528
     > 
     > doubao-1-5-pro-256k-250115

3. **Set API KEY**
   
   - Copy your API KEY, which will need to be set as an environment variable later

4. **Set Environment Variable**
   
   - Set the environment variable in Windows:
     
     - Right-click "This PC" -> "Properties" -> "Advanced system settings" -> "Environment Variables"
     - Add a new variable in System variables or User variables:
       - Variable name: ARK_API_KEY
       - Variable value: Your API KEY obtained from Volcano Engine
     - Click "OK" to save settings
   
   - Or temporarily set the environment variable in the command line:
     
     ```cmd
     set ARK_API_KEY=Your_API_KEY
     ```

5. **Start the Application**
   
   - Double-click to run the `frameforge.exe` file to start the application
   
   - Or execute in the command line:
     
     ```cmd
     frameforge.exe
     ```
   
   - After the application starts, it will open the FrameForge interface in your browser at 127.0.0.1:8000

## Notes

- Ensure the ARK_API_KEY environment variable is correctly set, otherwise the application will not work properly
- If you encounter network connection issues, please check your firewall settings
- The application needs internet access to call Volcano Engine's AI services