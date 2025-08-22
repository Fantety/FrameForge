import React, { useState } from 'react';
import { historyService } from './HistoryService';
import { Box, Button, TextField, Typography, Card, CardContent, LinearProgress } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const ChiptuneGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入音乐描述');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedMusic(null);

    try {
      // 调用后端API生成Chiptune音乐
      const response = await fetch('http://localhost:8000/api/generate-chiptune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          bpm: 130  // 默认BPM
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 获取生成的音乐数据
      const musicBlob = await response.blob();
      const musicUrl = URL.createObjectURL(musicBlob);
      setGeneratedMusic(musicUrl);
      
      // 保存到历史记录
      historyService.addHistoryItem({
        type: 'chiptune',
        prompt,
        generatedUrl: musicUrl,
        params: {
          bpm: 130
        }
      });
    } catch (err) {
      setError('音乐生成失败: ' + err.message);
      console.error('音乐生成错误:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        <MusicNoteIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
        Chiptune音乐生成
      </Typography>

      <Typography variant="body1">
        使用AI技术生成具有复古游戏风格的Chiptune音乐。请输入您想要的音乐风格描述，
        例如"欢快的8位像素冒险游戏背景音乐"或"紧张刺激的Boss战音乐"。
      </Typography>

      <Card sx={{ marginBottom: 3, backgroundColor: '#140424' }}>
        <CardContent>
          <TextField
            fullWidth
            label="音乐描述"
            multiline
            rows={4}
            variant="outlined"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="例如：欢快的8位像素冒险游戏背景音乐"
            sx={{
              mb :2,
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiInputLabel-root': { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ff4500',
                },
                '&:hover fieldset': {
                  borderColor: '#ffa500',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffa500',
                },
              }
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerate}
            disabled={isGenerating}
            sx={{
              background: 'linear-gradient(45deg, #ff4500, #ffa500)',
              color: '#333',
              fontWeight: 'bold',
              padding: '10px 20px',
              borderRadius: '50px'
            }}
          >
            {isGenerating ? '生成中...' : '生成音乐'}
          </Button>

          {isGenerating && (
            <LinearProgress sx={{ marginTop: 2 }} />
          )}

          {error && (
            <Typography color="error" sx={{ marginTop: 2 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>

      {generatedMusic && (
            <Card sx={{ backgroundColor: '#140424' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>生成的音乐</Typography>
                <audio controls src={generatedMusic} style={{ width: '100%' }}>
                  您的浏览器不支持音频播放。
                </audio>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedMusic;
                    link.download = 'generated_music.mp3';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  sx={{
                    marginTop: 2,
                    background: 'linear-gradient(45deg, #1db954, #1ed760)',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    borderRadius: '50px'
                  }}
                >
                  下载音乐
                </Button>
              </CardContent>
            </Card>
          )}

      <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>
        使用说明
      </Typography>
      <Typography variant="body1" component="div">
        <ul>
          <li>描述尽可能详细，包括音乐风格、情绪、节奏等</li>
          <li>Chiptune音乐具有独特的8位或16位游戏音效风格</li>
          <li>生成的音乐可用于游戏开发、视频制作等</li>
        </ul>
      </Typography>
    </Box>
  );
};

export default ChiptuneGeneration;