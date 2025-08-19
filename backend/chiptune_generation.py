"""
音乐生成功能模块
"""
import os
import tempfile
import uuid
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
import numpy as np
from pydub import AudioSegment
import re
import sys
from collections import defaultdict

# 通过 pip install 'volcengine-python-sdk[ark]' 安装方舟SDK
from volcenginesdkarkruntime import Ark

# 初始化Ark客户端
client = Ark(
    # 此为默认路径，您可根据业务所在地域进行配置
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    # 请将您的 API Key 存储在环境变量 ARK_API_KEY 中
    api_key=os.environ.get('ARK_API_KEY'),
)

# 配置参数
SAMPLE_RATE = 44100  # 音频采样率
VOLUME = 0.3  # 整体音量 (0-1)
BIT_DEPTH = 16  # 位深度

# 音高频率映射 (A4 = 440Hz)
NOTE_FREQUENCIES = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
}

class MusicGenerationRequest(BaseModel):
    prompt: str
    bpm: Optional[int] = 130


def note_to_frequency(note):
    """将音符（如5A）转换为频率"""
    if not note:
        return 0
    
    # 提取八度和音符
    octave = int(note[0])
    note_name = note[1:]
    
    # 如果找不到音符，默认返回A的频率
    base_freq = NOTE_FREQUENCIES.get(note_name, NOTE_FREQUENCIES['A'])
    
    # 计算对应八度的频率
    return base_freq * (2 ** (octave - 4))


def parse_time(time_str):
    """解析时间格式 (小节:拍) 为拍数"""
    if ':' in time_str:
        parts = time_str.split(':')
        if len(parts) == 2:
            measure = int(float(parts[0]))  # 允许小数小节
            beat = float(parts[1])  # 允许小数拍
            return (measure - 1) * 4 + (beat - 1)
    return float(time_str) - 1  # 简化情况，允许小数


def parse_duration(duration_str):
    """解析时长为拍数"""
    return float(duration_str)


def parse_parameters(param_str):
    """解析参数字符串为字典"""
    params = {}
    if not param_str:
        return params
        
    # 确保参数字符串是UTF-8编码
    if isinstance(param_str, bytes):
        param_str = param_str.decode('utf-8', errors='ignore')
    elif not isinstance(param_str, str):
        param_str = str(param_str)
        
    # 打印参数字符串用于调试
    print(f"解析参数字符串: {repr(param_str)}")
        
    for param in param_str.split(','):
        param = param.strip()
        if '=' in param:
            key, value = param.split('=', 1)  # 只分割第一个等号
            key = key.lower().strip()
            value = value.strip()
            
            # 打印键值对用于调试
            print(f"解析键值对: key={repr(key)}, value={repr(value)}")
            
            # 清理值中的特殊字符
            value = value.encode('utf-8', errors='ignore').decode('utf-8')
            
            # 尝试将值转换为适当的类型
            # 首先检查是否为整数
            if value.isdigit() or (value.startswith('-') and value[1:].isdigit()):
                params[key] = int(value)
                print(f"参数 {key} 转换为整数: {params[key]}")
            # 然后检查是否为浮点数
            elif ('.' in value and value.replace('.', '', 1).isdigit()) or (value.startswith('-') and '.' in value and value[1:].replace('.', '', 1).isdigit()):
                try:
                    params[key] = float(value)
                    print(f"参数 {key} 转换为浮点数: {params[key]}")
                except ValueError:
                    # 保持为字符串
                    params[key] = value
                    print(f"参数 {key} 保持为字符串: {params[key]}")
            else:
                # 保持为字符串
                params[key] = value
                print(f"参数 {key} 保持为字符串: {params[key]}")
    return params


def generate_wave(freq, duration, sample_rate, wave_type='square', pulse_width=0.5, volume=1.0, envelope=None):
    """生成指定类型的波形"""
    # 计算样本数
    num_samples = int(sample_rate * duration)
    if num_samples <= 0:
        return np.array([], dtype=np.int16)
    
    # 生成时间数组
    t = np.linspace(0, duration, num_samples, endpoint=False)
    
    if wave_type == 'square':
        # 改进的方波生成算法，更接近真实的芯片音乐声音
        # 使用更精确的脉冲宽度控制
        wave = np.zeros(num_samples)
        if freq > 0:
            period = 1.0 / freq
            wave = np.where((t % period) < (pulse_width * period), 1.0, -1.0)
        
    elif wave_type == 'triangle':
        # 改进的三角波生成算法
        wave = np.zeros(num_samples)
        if freq > 0:
            wave = 2 * np.abs(2 * (t * freq - np.floor(t * freq + 0.5))) - 1
        
    elif wave_type == 'noise':
        # 改进的噪音生成算法，模拟经典游戏机的噪音效果
        # 使用线性反馈移位寄存器(LFSR)生成伪随机噪音
        wave = generate_noise_lfsr(num_samples, pulse_width)
            
    else:
        # 默认正弦波
        wave = np.sin(2 * np.pi * freq * t) if freq > 0 else np.zeros(num_samples)
    
    # 应用包络控制（如果提供）
    if envelope is not None and len(envelope) == num_samples:
        wave *= envelope
    elif envelope is not None and len(envelope) != num_samples:
        # 如果包络长度不匹配，进行插值
        envelope_interp = np.interp(np.linspace(0, 1, num_samples), np.linspace(0, 1, len(envelope)), envelope)
        wave *= envelope_interp
    
    # 应用音量
    wave = wave * volume * VOLUME
    
    # 应用淡入淡出效果以减少爆音
    fade_samples = min(100, num_samples // 10)  # 淡入淡出样本数
    if fade_samples > 0:
        fade_in = np.linspace(0, 1, fade_samples)
        fade_out = np.linspace(1, 0, fade_samples)
        wave[:fade_samples] *= fade_in
        wave[-fade_samples:] *= fade_out
    
    # 转换为16位PCM格式
    wave = np.clip(wave, -1.0, 1.0)  # 限制范围
    wave = (wave * (2 **(BIT_DEPTH - 1) - 1)).astype(np.int16)
    return wave


def generate_noise_lfsr(num_samples, pulse_width):
    """使用线性反馈移位寄存器(LFSR)生成伪随机噪音"""
    # 初始化LFSR
    lfsr = 0x1234  # 初始种子
    noise = np.zeros(num_samples)
    
    # 根据脉冲宽度参数调整噪音密度
    noise_density = max(0.1, min(0.9, pulse_width))
    
    for i in range(num_samples):
        # 生成LFSR噪音
        bit = ((lfsr >> 1) & 1) ^ (lfsr & 1)
        lfsr = (lfsr >> 1) | (bit << 14)
        
        # 根据噪音密度决定是否输出噪音
        if np.random.random() < noise_density:
            noise[i] = (lfsr & 1) * 2.0 - 1.0
        else:
            noise[i] = 0.0
    
    return noise


def parse_chiptune_text(chiptune_text):
    """解析Chiptune指令文本"""
    tracks = defaultdict(list)  # 按轨道存储指令
    
    for line_num, line in enumerate(chiptune_text.split('\n'), 1):
        line = line.strip()
        if not line or line.startswith('#'):
            continue  # 跳过空行和注释
            
        # 解析每行指令
        parts = [p.strip() for p in re.split(r'\|', line) if p.strip()]
        
        if len(parts) < 4:
            print(f"警告: 第{line_num}行格式不正确，跳过")
            continue
            
        channel, time_str, note, duration_str = parts[:4]
        params_str = parts[4] if len(parts) > 4 else ''
        
        # 解析各部分
        try:
            time = parse_time(time_str)
            duration = parse_duration(duration_str)
            params = parse_parameters(params_str)
            
            # 确定波形类型
            wave_type = 'square'
            if channel.startswith('S1') or channel.startswith('S2'):
                wave_type = 'square'
            elif channel.startswith('TR'):
                wave_type = 'triangle'
            elif channel.startswith('NO'):
                wave_type = 'noise'
                
            # 提取脉冲宽度
            pulse_width = 0.5  # 默认值
            if 'pw' in params:
                # 确保参数值是数字
                pw_value = params['pw']
                if isinstance(pw_value, str):
                    pw_value = int(float(pw_value)) if '.' in pw_value else int(pw_value)
                pulse_width = pw_value / 100.0
            elif 'np' in params:  # 噪音周期参数
                # 确保参数值是数字
                np_value = params['np']
                if isinstance(np_value, str):
                    np_value = int(float(np_value)) if '.' in np_value else int(np_value)
                pulse_width = np_value / 100.0
                
            # 提取音量
            volume = 0.7  # 默认值
            if 'vol' in params:
                # 确保参数值是数字
                vol_value = params['vol']
                if isinstance(vol_value, str):
                    vol_value = int(float(vol_value)) if '.' in vol_value else int(vol_value)
                volume = vol_value / 15.0  # 转换为0-1范围
                
            # 添加到轨道
            tracks[channel].append({
                'time': time,
                'note': note,
                'duration': duration,
                'wave_type': wave_type,
                'pulse_width': pulse_width,
                'volume': volume
            })
            
        except Exception as e:
            print(f"警告: 解析第{line_num}行时出错 - {str(e)}，跳过")
            continue
    
    return tracks


def generate_envelope(duration, sample_rate, attack=0.01, decay=0.01, sustain=0.7, release=0.05):
    """生成ADSR包络"""
    total_samples = int(sample_rate * duration)
    if total_samples <= 0:
        return np.array([])
    
    # 计算各阶段样本数
    attack_samples = int(sample_rate * attack)
    decay_samples = int(sample_rate * decay)
    release_samples = int(sample_rate * release)
    sustain_samples = max(0, total_samples - attack_samples - decay_samples - release_samples)
    
    # 创建包络数组
    envelope = np.zeros(total_samples)
    
    # 攻击阶段 (从0到1)
    if attack_samples > 0:
        envelope[:attack_samples] = np.linspace(0, 1, attack_samples)
    
    # 衰减阶段 (从1到sustain)
    if decay_samples > 0:
        envelope[attack_samples:attack_samples+decay_samples] = np.linspace(1, sustain, decay_samples)
    
    # 持续阶段 (保持sustain电平)
    if sustain_samples > 0:
        envelope[attack_samples+decay_samples:attack_samples+decay_samples+sustain_samples] = sustain
    
    # 释放阶段 (从sustain到0)
    if release_samples > 0:
        envelope[-release_samples:] = np.linspace(sustain, 0, release_samples)
    
    return envelope


def generate_track(commands, bpm, sample_rate):
    """根据指令生成单个轨道的音频"""
    if not commands:
        return np.array([])
        
    # 计算每拍的秒数
    beat_duration = 60.0 / bpm
    
    # 找到最长的时间点以确定总时长
    max_time = max(cmd['time'] + cmd['duration'] for cmd in commands)
    total_duration = max_time * beat_duration
    
    # 创建空的音频数组
    track = np.zeros(int(sample_rate * total_duration), dtype=np.float32)  # 使用float32以提高混合质量
    
    # 为每个音符生成波形并添加到轨道
    for cmd in commands:
        start_time = cmd['time'] * beat_duration
        duration = cmd['duration'] * beat_duration
        
        # 计算频率（噪音不需要频率）
        freq = note_to_frequency(cmd['note']) if cmd['wave_type'] != 'noise' else 0
        
        # 为不同类型的波形生成不同的包络
        envelope = None
        if cmd['wave_type'] == 'square' or cmd['wave_type'] == 'triangle':
            # 为旋律音符生成ADSR包络
            envelope = generate_envelope(duration, sample_rate, attack=0.005, decay=0.01, sustain=0.8, release=0.02)
        elif cmd['wave_type'] == 'noise':
            # 为噪音生成较短的包络
            envelope = generate_envelope(duration, sample_rate, attack=0.001, decay=0.001, sustain=0.7, release=0.01)
        
        # 生成波形
        wave = generate_wave(
            freq, duration, sample_rate,
            wave_type=cmd['wave_type'],
            pulse_width=cmd['pulse_width'],
            volume=cmd['volume'],
            envelope=envelope
        )
        
        # 计算波形在轨道中的位置
        start_idx = int(start_time * sample_rate)
        end_idx = start_idx + len(wave)
        
        # 确保不超出轨道范围
        if end_idx > len(track):
            # 扩展轨道
            track = np.append(track, np.zeros(end_idx - len(track), dtype=np.float32))
        
        # 将波形添加到轨道
        track[start_idx:end_idx] += wave.astype(np.float32)
    
    # 防止溢出并转换为16位
    track = np.clip(track, -(2**(BIT_DEPTH-1)), 2**(BIT_DEPTH-1)-1)
    return track.astype(np.int16)


def apply_reverb(signal, sample_rate, reverb_time=0.1, decay=0.5):
    """应用简单混响效果"""
    if len(signal) == 0:
        return signal
    
    # 计算混响延迟样本数
    delay_samples = int(sample_rate * reverb_time)
    if delay_samples == 0:
        return signal
    
    # 创建混响缓冲区
    signal_float = signal.astype(np.float32) / (2**(BIT_DEPTH-1))  # 归一化到-1到1
    reverbed = signal_float.copy()
    
    # 应用延迟和衰减
    for i in range(delay_samples, len(signal_float)):
        reverbed[i] += reverbed[i - delay_samples] * decay
    
    # 限制范围并转换回int16
    reverbed = np.clip(reverbed, -1.0, 1.0)
    return (reverbed * (2**(BIT_DEPTH-1))).astype(np.int16)


def mix_tracks(tracks, sample_rate):
    """混合多个轨道的音频"""
    if not tracks:
        return np.array([])
        
    # 找到最长的轨道以确定总时长
    max_length = max(len(track) for track in tracks.values())
    
    # 使用浮点数进行混合以提高质量
    mixed = np.zeros(max_length, dtype=np.float32)
    
    # 混合所有轨道
    for track in tracks.values():
        # 将轨道转换为浮点数
        track_float = track.astype(np.float32)
        
        # 如果轨道较短，补零
        if len(track_float) < max_length:
            track_float = np.append(track_float, np.zeros(max_length - len(track_float), dtype=np.float32))
        
        # 添加到混合轨道，使用缩放因子避免溢出
        mixed += track_float * 0.7  # 缩放因子，避免混合后溢出
    
    # 防止溢出并转换为int16
    mixed = np.clip(mixed, -(2**(BIT_DEPTH-1)), 2**(BIT_DEPTH-1)-1)
    
    # 应用轻微的混响效果
    mixed_int16 = mixed.astype(np.int16)
    mixed_with_reverb = apply_reverb(mixed_int16, sample_rate, reverb_time=0.02, decay=0.1)
    
    return mixed_with_reverb


def convert_to_mp3(audio_data, sample_rate, output_file):
    """将音频数据转换为MP3"""
    # 将numpy数组转换为AudioSegment
    # 注意：pydub需要16位小端字节序的PCM数据
    audio_data = audio_data.astype(np.int16)
    bytes_data = audio_data.tobytes()
    
    audio_segment = AudioSegment(
        bytes_data,
        frame_rate=sample_rate,
        sample_width=2,  # 16位
        channels=1  # 单声道
    )
    
    # 导出为MP3
    audio_segment.export(output_file, format="mp3")


def generate_chiptune_from_prompt(prompt: str) -> str:
    """使用AI模型根据提示生成Chiptune文本"""
    try:
        # 调用AI模型生成Chiptune文本
        completion = client.chat.completions.create(
            model="doubao-1-5-pro-256k-250115",
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的Chiptune音乐生成器。你的任务是根据用户提供的音乐风格描述，生成符合Chiptune格式的音乐指令文本。\n\nChiptune格式说明：\n1. 每行代表一个音符指令\n2. 格式为：轨道|时间|音符|时长|参数\n3. 轨道类型：S1/S2（方波），TR（三角波），NO（噪音）\n4. 时间格式：小节:拍 或 拍数\n5. 音符格式：八度+音名（如4C表示第4八度的C音）\n6. 时长：以拍为单位\n7. 参数：vol=音量(0-15), pw=脉冲宽度(0-100)\n\n示例：\nS1 | 1:1 | 5C | 0.5 | vol=10\nS1 | 1:1.5 | 5D | 0.5 | vol=10\nS1 | 1:2 | 5E | 0.5 | vol=10\n\n请严格按照上述格式输出，不要添加任何额外的文本或解释。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        # 获取生成的Chiptune文本
        chiptune_text = completion.choices[0].message.content
        
        # 打印AI生成的原始内容用于调试
        print(f"AI生成的原始内容: {repr(chiptune_text)}")
        
        # 确保文本是UTF-8编码
        if isinstance(chiptune_text, bytes):
            chiptune_text = chiptune_text.decode('utf-8', errors='ignore')
        elif not isinstance(chiptune_text, str):
            chiptune_text = str(chiptune_text)
        
        # 清理文本中的特殊字符
        chiptune_text = chiptune_text.encode('utf-8', errors='ignore').decode('utf-8')
        
        return chiptune_text
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成Chiptune文本时发生错误: {str(e)}")


def generate_music_from_chiptune(chiptune_text: str, bpm: int = 130) -> bytes:
    """将Chiptune文本转换为MP3音频数据"""
    try:
        # 解析Chiptune文本
        tracks_commands = parse_chiptune_text(chiptune_text)
        
        if not tracks_commands:
            raise ValueError("没有找到有效的音频指令")
        
        # 生成各个轨道的音频
        tracks_audio = {}
        for channel, commands in tracks_commands.items():
            tracks_audio[channel] = generate_track(commands, bpm, SAMPLE_RATE)
        
        # 混合所有轨道
        mixed_audio = mix_tracks(tracks_audio, SAMPLE_RATE)
        
        # 创建临时文件来保存MP3
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp_file:
            tmp_filename = tmp_file.name
        
        # 转换为MP3
        convert_to_mp3(mixed_audio, SAMPLE_RATE, tmp_filename)
        
        # 读取MP3文件内容
        with open(tmp_filename, 'rb') as f:
            mp3_data = f.read()
        
        # 删除临时文件
        os.unlink(tmp_filename)
        
        return mp3_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成音乐时发生错误: {str(e)}")


def generate_music(prompt: str, bpm: int = 130) -> bytes:
    """根据提示生成音乐的完整流程"""
    # 1. 使用AI模型生成Chiptune文本
    chiptune_text = generate_chiptune_from_prompt(prompt)
    
    # 2. 将Chiptune文本转换为MP3音频
    mp3_data = generate_music_from_chiptune(chiptune_text, bpm)
    
    return mp3_data