from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Optional


class ImageGenerationRequest(BaseModel):
    prompt: str
    size: Optional[str] = "512x512"
    guidance_scale: Optional[float] = 2.5
    seed: Optional[int] = 12345
    watermark: Optional[bool] = True


class PromptGenerationRequest(BaseModel):
    user_request: str


class AnimationGenerationRequest(BaseModel):
    prompt: str
    first_frame: Optional[str] = None
    resolution: Optional[str] = "1080p"
    duration: Optional[int] = 5
    camera_fixed: Optional[bool] = False
    watermark: Optional[bool] = True


from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from datetime import datetime
import time
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
        
        # 添加提示词生成API端点
        @app.options("/api/generate-prompt")
        def generate_prompt_options():
            return {"status": "ok"}

        @app.post("/api/generate-prompt")
        def generate_prompt(request: PromptGenerationRequest):
            user_request = request.user_request
            try:
                print(f"收到提示词生成请求: user_request={user_request}")
                
                # 验证参数
                if not user_request or len(user_request.strip()) == 0:
                    raise HTTPException(status_code=400, detail="用户需求不能为空")
                
                # 调用提示词生成API
                completion = client.chat.completions.create(
                    model="doubao-1-5-lite-32k-250115",
                    messages=[
                        {"role": "system", "content": "你是一个AI提示词专家，专门帮助用户创建详细、精确的图像生成提示词。你的任务是根据用户的需求，生成一个结构化的提示词，包含以下元素：\n1. 主体描述（详细说明主要对象）\n2. 场景/环境（背景设置）\n3. 风格/艺术类型（如：数字艺术、油画、摄影等）\n4. 技术细节（如：高细节、8k分辨率等）\n\n请以英文输出提示词，确保描述具体且富有表现力。"},
                        {"role": "user", "content": user_request},
                    ],
                )
                
                # 获取生成的提示词
                generated_prompt = completion.choices[0].message.content
                print(f"提示词生成成功: {generated_prompt}")
                
                # 返回生成的提示词
                return {"generated_prompt": generated_prompt}
            except HTTPException as he:
                print(f"HTTP异常: {he.detail}")
                raise he
            except Exception as e:
                print(f"提示词生成过程中发生错误: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
        
        # 添加动画生成API端点
        @app.options("/api/generate-animation")
        def generate_animation_options():
            return {"status": "ok"}

        @app.post("/api/generate-animation")
        def generate_animation(request: AnimationGenerationRequest):
            prompt = request.prompt
            first_frame = request.first_frame
            resolution = request.resolution
            duration = request.duration
            camera_fixed = request.camera_fixed
            watermark = request.watermark
            
            try:
                print(f"收到动画生成请求: prompt={prompt}, first_frame={first_frame}, resolution={resolution}, duration={duration}, camera_fixed={camera_fixed}, watermark={watermark}")
                
                # 验证参数
                if not prompt or len(prompt.strip()) == 0:
                    raise HTTPException(status_code=400, detail="Prompt不能为空")
                
                # 构建参数字符串
                params_str = f" --resolution {resolution}  --duration {duration} --camerafixed {str(camera_fixed).lower()} --watermark {str(watermark).lower()}"
                full_prompt = prompt + params_str
                
                # 准备内容数组
                content = [
                    {
                        "type": "text",
                        "text": full_prompt
                    }
                ]
                
                # 如果提供了首帧图片URL，则添加到内容中
                if first_frame and first_frame.strip():
                    content.append(
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": first_frame.strip()
                            }
                        }
                    )
                
                # 调用动画生成API
                create_result = client.content_generation.tasks.create(
                    model="doubao-seedance-1-0-pro-250528",
                    content=content
                )
                
                # 获取任务ID
                task_id = create_result.id
                print(f"动画生成任务已创建，任务ID: {task_id}")
                
                # 轮询查询任务状态
                while True:
                    get_result = client.content_generation.tasks.get(task_id=task_id)
                    status = get_result.status
                    
                    if status == "succeeded":
                        print("动画生成任务成功完成")
                        # 获取视频URL
                        video_url = get_result.content.video_url.strip()
                        print(f"视频URL: {video_url}")
                        
                        # 返回视频URL
                        return {"video_url": video_url}
                    elif status == "failed":
                        print("动画生成任务失败")
                        error_msg = get_result.error.message if get_result.error else "未知错误"
                        raise HTTPException(status_code=500, detail=f"动画生成失败: {error_msg}")
                    else:
                        print(f"当前任务状态: {status}, 3秒后重试...")
                        import time
                        time.sleep(3)
                        
            except HTTPException as he:
                print(f"HTTP异常: {he.detail}")
                raise he
            except Exception as e:
                print(f"动画生成过程中发生错误: {str(e)}")
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