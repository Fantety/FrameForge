from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Optional


class ImageGenerationRequest(BaseModel):
    prompt: str
    size: Optional[str] = "512x512"
    guidance_scale: Optional[float] = 2.5
    seed: Optional[int] = 12345
    watermark: Optional[bool] = True


from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from datetime import datetime
# 通过 pip install 'volcengine-python-sdk[ark]' 安装方舟SDK
from volcenginesdkarkruntime import Ark

# 初始化Ark客户端
client = Ark(
    # 此为默认路径，您可根据业务所在地域进行配置
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    # 请将您的 API Key 存储在环境变量 ARK_API_KEY 中
    api_key="37939eeb-b9ba-44e5-bf3d-3f4d4a2bc32a",
)

app = FastAPI()

# 添加CORS中间件以允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=None,
    expose_headers=[],
    max_age=600,
)

# 检查前端依赖和构建
current_dir = os.path.dirname(__file__)
frontend_dir = os.path.join(current_dir, "..", "frontend")
frontend_build_path = os.path.join(frontend_dir, "build")
node_modules_path = os.path.join(frontend_dir, "node_modules")

print(f"检查前端目录: {frontend_dir}")
print(f"检查node_modules路径: {node_modules_path}")
print(f"检查前端构建路径: {frontend_build_path}")
print(f"node_modules是否存在: {os.path.isdir(node_modules_path)}")
print(f"构建路径是否存在: {os.path.isdir(frontend_build_path)}")

if os.path.isdir(frontend_build_path):
    # 确保build目录包含index.html
    index_html_path = os.path.join(frontend_build_path, "index.html")
    if os.path.isfile(index_html_path):
        # 添加一个简单的API端点用于健康检查
        @app.get("/api/health")
        def health_check():
            return {"status": "ok", "service": "FrameForge"}
        
        # 添加图像生成API端点
        @app.options("/api/generate-image")
        def generate_image_options():
            return {"status": "ok"}

        @app.post("/api/generate-image")
        def generate_image(request: ImageGenerationRequest):
            prompt = request.prompt
            size = request.size
            guidance_scale = request.guidance_scale
            seed = request.seed
            watermark = request.watermark
            try:
                print(f"收到图像生成请求: prompt={prompt}, size={size}, guidance_scale={guidance_scale}, seed={seed}, watermark={watermark}")
                
                # 验证参数
                if not prompt or len(prompt.strip()) == 0:
                    raise HTTPException(status_code=400, detail="Prompt不能为空")
                
                # 调用图像生成API
                imagesResponse = client.images.generate(
                    model="doubao-seedream-3-0-t2i-250415",
                    prompt=prompt,
                    size=size,
                    guidance_scale=guidance_scale,
                    seed=seed,
                    watermark=watermark
                )
                
                # 获取图片URL
                image_url = imagesResponse.data[0].url
                print(f"图像生成成功，图片URL: {image_url}")
                
                # 返回图片URL
                return {"image_url": image_url}
            except HTTPException as he:
                print(f"HTTP异常: {he.detail}")
                raise he
            except Exception as e:
                print(f"图像生成过程中发生错误: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
        
        # 挂载静态文件服务到根路径
        app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="static")
        print("静态文件服务已挂载到根路径")
    else:
        print("index.html文件未找到，无法挂载静态文件服务")
        @app.get("/")
        def frontend_status():
            return {
                "status": "error",
                "message": "index.html not found in build directory",
                "build_path_checked": frontend_build_path
            }
else:
    @app.get("/")
    def frontend_status():
        # 检查node_modules是否存在
        if not os.path.isdir(node_modules_path):
            return {
                "status": "error",
                "message": "Frontend dependencies not installed. Please follow these steps:",
                "steps": [
                    "1. Navigate to the frontend directory: cd frontend",
                    "2. Install dependencies: npm install",
                    "   This will install react-scripts and other required packages.",
                    "3. Build the frontend: npm run build",
                    "4. Restart the backend server: python backend/main.py"
                ],
                "details": "The 'react-scripts' command is not recognized because the frontend dependencies have not been installed.",
                "node_modules_path_checked": node_modules_path
            }
        else:
            return {
                "status": "error",
                "message": "Frontend build not found. Please follow these steps:",
                "steps": [
                    "1. Navigate to the frontend directory: cd frontend",
                    "2. Build the frontend: npm run build",
                    "3. Restart the backend server: python backend/main.py"
                ],
                "build_path_checked": frontend_build_path
            }
    print("前端构建未找到，提供状态检查API")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)