import os
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
    api_key="37939eeb-b9ba-44e5-bf3d-3f4d4a2bc32a",
)

imagesResponse = client.images.generate(
    model="doubao-seedream-3-0-t2i-250415",
    prompt="业务介绍图片，用于淘宝，业务内容：AI游戏帧动画代生成，只有“AI游戏帧动画代生成”文字，不包含其他任何文字内容，简约风格，高级感，科技",
    size="1024x1024",
    guidance_scale=10,
    watermark=False
)

# 获取图片URL
image_url = imagesResponse.data[0].url
print("图片URL:", image_url)

# 创建以当前日期命名的文件夹
current_date = datetime.now().strftime("%Y-%m-%d")
if not os.path.exists(current_date):
    os.makedirs(current_date)

# 下载图片并保存到日期文件夹
response = requests.get(image_url)
if response.status_code == 200:
    # 从URL中提取文件名
    filename = image_url.split("/")[-1].split("?")[0]
    file_path = os.path.join(current_date, filename)
    
    with open(file_path, 'wb') as f:
        f.write(response.content)
    print(f"图片已保存到: {file_path}")
else:
    print("下载图片失败")