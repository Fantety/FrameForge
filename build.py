#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FrameForge 打包脚本
此脚本用于自动化构建和打包FrameForge应用，包括前端构建和后端打包。
"""

import os
import sys
import shutil
import subprocess
import zipfile
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.absolute()
FRONTEND_DIR = PROJECT_ROOT / "frontend"
BACKEND_DIR = PROJECT_ROOT / "backend"
BIN_DIR = PROJECT_ROOT / "bin"


def check_prerequisites():
    """检查前置条件"""
    print("检查前置条件...")
    
    # 检查Node.js和npm
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True, shell=True)
        print(f"Node.js版本: {result.stdout.strip()}")
    except FileNotFoundError:
        print("错误: 未找到Node.js，请先安装Node.js (https://nodejs.org/)并确保它在系统PATH中")
        sys.exit(1)
    
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True, shell=True)
        print(f"npm版本: {result.stdout.strip()}")
        print(f"npm stderr: {result.stderr}")
        print(f"npm return code: {result.returncode}")
    except FileNotFoundError as e:
        print(f"错误: 未找到npm，请先安装Node.js (https://nodejs.org/)并确保它在系统PATH中")
        print(f"异常详情: {e}")
        # 尝试在系统PATH中查找npm
        import shutil
        npm_path = shutil.which("npm")
        print(f"在系统中查找npm路径: {npm_path}")
        sys.exit(1)
    
    # 检查Python
    print(f"Python版本: {sys.version}")
    
    # 检查PyInstaller
    try:
        result = subprocess.run(["pyinstaller", "--version"], capture_output=True, text=True, shell=True)
        print(f"PyInstaller版本: {result.stdout.strip()}")
    except FileNotFoundError:
        print("警告: 未找到PyInstaller，将无法创建可执行文件")
        print("您可以通过运行 'pip install pyinstaller' 来安装PyInstaller")
    
    print("前置条件检查完成\n")


def run_command(cmd, cwd=None):
    """运行命令并检查返回码"""
    print(f"执行命令: {' '.join(cmd)}")
    try:
        # 在Windows上使用shell=True来更好地处理npm命令
        is_windows = os.name == 'nt'
        result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, shell=is_windows)
        if result.returncode != 0:
            print(f"命令执行失败: {result.stderr}")
            sys.exit(1)
        return result
    except FileNotFoundError as e:
        print(f"命令执行失败: 找不到指定的文件或程序 - {e}")
        print("请确保所有必要的程序都已安装并添加到系统PATH中")
        sys.exit(1)
    except Exception as e:
        print(f"命令执行失败: {e}")
        sys.exit(1)


def build_frontend():
    """构建前端应用"""
    print("开始构建前端应用...")
    
    # 安装前端依赖
    run_command(["npm", "install"], cwd=FRONTEND_DIR)
    
    # 构建前端
    run_command(["npm", "run", "build"], cwd=FRONTEND_DIR)
    
    print("前端构建完成\n")


def package_backend():
    """打包后端应用"""
    print("开始打包后端应用...")
    
    # 创建打包目录
    BIN_DIR.mkdir(parents=True, exist_ok=True)
    
    # 复制前端构建结果
    frontend_build_dir = FRONTEND_DIR / "build"
    if frontend_build_dir.exists():
        frontend_target_dir = BIN_DIR / "build"
        if frontend_target_dir.exists():
            shutil.rmtree(frontend_target_dir)
        shutil.copytree(frontend_build_dir, frontend_target_dir)
    
    print("后端打包完成\n")


def create_executable():
    """创建可执行文件（可选）"""
    print("创建可执行文件...")
    
    # 检查PyInstaller是否可用
    try:
        subprocess.run(["pyinstaller", "--version"], capture_output=True, text=True, shell=True, check=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("警告: PyInstaller不可用，跳过可执行文件创建步骤")
        print("如果您希望创建可执行文件，请安装PyInstaller: pip install pyinstaller")
        return
    
    # 创建PyInstaller spec文件
    main_py = BACKEND_DIR / "main.py"
    
    if not main_py.exists():
        print("错误: 找不到后端主文件 main.py")
        return
    
    # 运行PyInstaller
    cmd = [
        "pyinstaller",
        "--onefile",
        "--name", "frameforge",
        "--distpath", str(BIN_DIR),
        "--workpath", str(BIN_DIR / "build_temp"),
        "--specpath", str(BIN_DIR / "spec"),
        str(main_py)
    ]
    
    try:
        result = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, shell=True)
        if result.returncode != 0:
            print(f"PyInstaller执行失败: {result.stderr}")
            return
        
        # 删除临时目录
        temp_dirs = [BIN_DIR / "build_temp", BIN_DIR / "spec"]
        for temp_dir in temp_dirs:
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
        
        print("可执行文件创建完成")
    except Exception as e:
        print(f"创建可执行文件时出错: {e}")
        return
    
    print("可执行文件创建完成\n")


def create_startup_script():
    """创建启动脚本"""
    print("创建启动脚本...")
    
    # 检查是否创建了可执行文件
    exe_file = BIN_DIR / "frameforge.exe"  # Windows
    if not exe_file.exists():
        exe_file = BIN_DIR / "frameforge"  # Linux/Mac
    
    # 如果没有创建可执行文件，则不创建启动脚本
    if not exe_file.exists():
        print("警告: 未创建可执行文件，将不生成启动脚本")
        return
    
    # 创建Windows批处理文件
    # 使用可执行文件
    bat_content = """@echo off
TITLE FrameForge
echo 启动 FrameForge 应用...

"%~dp0\frameforge.exe"

pause
"""
    
    bat_path = BIN_DIR / "start_frameforge.bat"
    with open(bat_path, "w", encoding="utf-8") as f:
        f.write(bat_content)
    
    # 创建Linux/Mac脚本
    # 使用可执行文件（Linux/Mac）
    sh_content = """#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "启动 FrameForge 应用..."

"$DIR/frameforge"
"""
    
    sh_path = BIN_DIR / "start_frameforge.sh"
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
    dst_req = BIN_DIR / "requirements.txt"
    
    if src_req.exists():
        shutil.copy2(src_req, dst_req)
    
    print("requirements.txt创建完成\n")


def package_application():
    """打包整个应用程序为zip文件"""
    print("开始打包应用程序...")
    
    # 检查是否创建了可执行文件
    exe_file = BIN_DIR / "frameforge.exe"  # Windows
    if not exe_file.exists():
        exe_file = BIN_DIR / "frameforge"  # Linux/Mac
    
    # 创建zip文件
    zip_path = BIN_DIR / "frameforge.zip"
    if zip_path.exists():
        zip_path.unlink()
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in BIN_DIR.rglob("*"):
            if file_path.is_file():
                # 排除zip文件本身
                if file_path.name == "frameforge.zip":
                    continue
                
                # 如果创建了可执行文件，排除Python源代码
                if exe_file.exists():
                    # 检查是否在backend目录下
                    try:
                        relative_path = file_path.relative_to(BIN_DIR)
                        # 排除Python源代码文件，但保留requirements.txt
                        if (relative_path.suffix == ".py" and 
                            relative_path.name != "requirements.txt"):
                            continue
                    except ValueError:
                        # 不在backend目录下，正常处理
                        pass
                
                arcname = file_path.relative_to(BIN_DIR)
                zipf.write(file_path, arcname)
    
    print(f"应用程序打包完成: {zip_path}\n")


def main():
    """主函数"""
    print("开始打包FrameForge应用...\n")
    
    # 解析命令行参数
    import argparse
    parser = argparse.ArgumentParser(description='FrameForge打包脚本')
    parser.add_argument('--no-exe', action='store_true', help='不创建可执行文件')
    args = parser.parse_args()
    
    # 检查前置条件
    check_prerequisites()
    
    # 构建前端
    build_frontend()
    
    # 打包后端
    package_backend()
    
    # 创建可执行文件（除非用户明确要求不创建）
    if not args.no_exe:
        create_executable()
    
    # 创建启动脚本
    create_startup_script()
    
    # 创建requirements.txt
    create_requirements_txt()
    
    # 打包为zip
    package_application()
    
    print("FrameForge应用打包完成！")
    print(f"打包文件位置: {BIN_DIR / 'frameforge.zip'}")


if __name__ == "__main__":
    main()