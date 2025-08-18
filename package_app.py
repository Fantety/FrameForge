#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FrameForge 简化版打包脚本
此脚本用于打包FrameForge应用，不依赖Node.js环境。
"""

import os
import sys
import shutil
import zipfile
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.absolute()
FRONTEND_DIR = PROJECT_ROOT / "frontend"
BACKEND_DIR = PROJECT_ROOT / "backend"
BIN_DIR = PROJECT_ROOT / "bin"
BUILD_DIR = BIN_DIR / "build"


def package_backend():
    """打包后端应用"""
    print("开始打包后端应用...")
    
    # 创建打包目录
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    
    # 复制后端代码
    backend_build_dir = BUILD_DIR / "backend"
    if backend_build_dir.exists():
        shutil.rmtree(backend_build_dir)
    shutil.copytree(BACKEND_DIR, backend_build_dir)
    
    # 检查前端构建结果是否存在
    frontend_build_dir = FRONTEND_DIR / "build"
    if frontend_build_dir.exists():
        print("发现前端构建结果，正在复制...")
        frontend_target_dir = backend_build_dir / "build"
        if frontend_target_dir.exists():
            shutil.rmtree(frontend_target_dir)
        shutil.copytree(frontend_build_dir, frontend_target_dir)
    else:
        print("未发现前端构建结果，将仅打包后端应用")
        print("用户需要先手动构建前端或单独运行前端开发服务器")
    
    print("后端打包完成\n")


def create_startup_script():
    """创建启动脚本"""
    print("创建启动脚本...")
    
    # 创建Windows批处理文件
    bat_content = """@echo off
TITLE FrameForge
echo 启动 FrameForge 应用...

cd /d "%~dp0\build\backend"
python main.py

pause
"""
    
    bat_path = BUILD_DIR / "start_frameforge.bat"
    with open(bat_path, "w", encoding="utf-8") as f:
        f.write(bat_content)
    
    # 创建Linux/Mac脚本
    sh_content = """#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "启动 FrameForge 应用..."

cd "$DIR/build/backend"
python3 main.py
"""
    
    sh_path = BUILD_DIR / "start_frameforge.sh"
    with open(sh_path, "w", encoding="utf-8") as f:
        f.write(sh_content)
    
    # 给予执行权限
    os.chmod(sh_path, 0o755)
    
    print("启动脚本创建完成\n")


def create_requirements_txt():
    """创建打包环境的requirements.txt"""
    print("创建requirements.txt...")
    
    # 复制原始requirements.txt
    src_req = BACKEND_DIR / "requirements.txt"
    dst_req = BUILD_DIR / "backend" / "requirements.txt"
    
    if src_req.exists():
        shutil.copy2(src_req, dst_req)
    
    print("requirements.txt创建完成\n")


def package_application():
    """打包整个应用程序为zip文件"""
    print("开始打包应用程序...")
    
    # 创建zip文件
    zip_path = BIN_DIR / "frameforge_package.zip"
    if zip_path.exists():
        zip_path.unlink()
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in BUILD_DIR.rglob("*"):
            if file_path.is_file():
                arcname = file_path.relative_to(BIN_DIR)
                zipf.write(file_path, arcname)
    
    print(f"应用程序打包完成: {zip_path}\n")


def main():
    """主函数"""
    print("开始打包FrameForge应用...\n")
    
    # 打包后端
    package_backend()
    
    # 创建启动脚本
    create_startup_script()
    
    # 创建requirements.txt
    create_requirements_txt()
    
    # 打包为zip
    package_application()
    
    print("FrameForge应用打包完成！")
    print(f"打包文件位置: {BIN_DIR / 'frameforge_package.zip'}")


if __name__ == "__main__":
    main()