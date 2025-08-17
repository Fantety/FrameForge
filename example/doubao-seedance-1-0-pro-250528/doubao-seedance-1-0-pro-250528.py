
import os
import time
import requests
from datetime import datetime
# 通过 pip install 'volcengine-python-sdk[ark]' 安装方舟SDK
from volcenginesdkarkruntime import Ark

# 请确保您已将 API Key 存储在环境变量 ARK_API_KEY 中
# 初始化Ark客户端，从环境变量中读取您的API Key
client = Ark(
    # 此为默认路径，您可根据业务所在地域进行配置
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    # 从环境变量中获取您的 API Key。此为默认方式，您可根据需要进行修改
    api_key= "ARK_API_KEY",
)

if __name__ == "__main__":
    print("----- create request -----")
    create_result = client.content_generation.tasks.create(
        model="doubao-seedance-1-0-pro-250528", # 模型 Model ID 已为您填入
        content=[
            {
                # 文本提示词与参数组合
                "type": "text",
                "text": "无人机以极快速度穿越复杂障碍或自然奇观，带来沉浸式飞行体验  --resolution 1080p  --duration 5 --camerafixed false --watermark true"
            },
            { # 若仅需使用文本生成视频功能，可对该大括号内的内容进行注释处理，并删除上一行中大括号后的逗号。
                # 首帧图片URL
                "type": "image_url",
                "image_url": {
                    "url": "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png" 
                }
            }
        ]
    )
    print(create_result)

    # 轮询查询部分
    print("----- polling task status -----")
    task_id = create_result.id
    while True:
        get_result = client.content_generation.tasks.get(task_id=task_id)
        status = get_result.status
        if status == "succeeded":
            print("----- task succeeded -----")
            print(get_result)
            
            # 下载视频部分
            # 获取视频URL
            video_url = get_result.content.video_url.strip()
            print(f"视频URL: {video_url}")
            
            # 创建以日期命名的文件夹
            folder_name = datetime.now().strftime("%Y-%m-%d")
            if not os.path.exists(folder_name):
                os.makedirs(folder_name)
            
            # 下载视频
            video_response = requests.get(video_url)
            if video_response.status_code == 200:
                # 生成文件名
                file_name = f"{datetime.now().strftime('%H-%M-%S')}.mp4"
                file_path = os.path.join(folder_name, file_name)
                
                # 保存视频
                with open(file_path, 'wb') as f:
                    f.write(video_response.content)
                print(f"视频已保存到: {file_path}")
            else:
                print("下载视频失败")
            
            break
        elif status == "failed":
            print("----- task failed -----")
            print(f"Error: {get_result.error}")
            break
        else:
            print(f"Current status: {status}, Retrying after 3 seconds...")
            time.sleep(3)

# 更多操作请参考下述网址
# 查询视频生成任务列表：https://www.volcengine.com/docs/82379/1521675
# 取消或删除视频生成任务：https://www.volcengine.com/docs/82379/1521720