/*
 * @FilePath: \frontend\src\ImageGeneration.js
 * @Author: Fantety
 * @Descripttion: 
 * @Date: 2025-08-17 18:05:29
 * @LastEditors: Fantety
 * @LastEditTime: 2025-08-17 18:05:37
 */
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Slider, FormControlLabel, Switch, Card, CardMedia, CircularProgress, LinearProgress } from '@mui/material';

const ImageGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('512x512');
  const [guidanceScale, setGuidanceScale] = useState(2.5);
  const [seed, setSeed] = useState(12345);
  const [watermark, setWatermark] = useState(true);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // 调用后端API生成图像
      const response = await fetch('http://localhost:8000/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          size,
          guidance_scale: guidanceScale,
          seed: parseInt(seed),
          watermark
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGeneratedImage(data.image_url);
    } catch (error) {
      console.error('生成图像时出错:', error);
      // 在实际应用中，这里可以显示错误消息给用户
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // 创建一个临时的canvas元素来处理跨域图像
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // 设置图片跨域属性
      img.crossOrigin = 'Anonymous';
      
      // 使用Promise来处理异步操作
      await new Promise((resolve, reject) => {
        img.onload = function() {
          try {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // 将canvas内容转换为blob并下载
            canvas.toBlob(function(blob) {
              try {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'generated-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                resolve();
              } catch (error) {
                reject(error);
              }
            });
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = function() {
          reject(new Error('图片加载失败'));
        };
        
        img.src = generatedImage;
      });
    } catch (error) {
      console.error('下载图像时出错:', error);
      
      // 如果上述方法失败，尝试直接下载
      try {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = 'generated-image.png';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('备用下载方法也失败了:', fallbackError);
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
        图像生成
      </Typography>
      <Paper elevation={3} sx={{ padding: 3, background: 'rgba(0, 0, 0, 0.2)', borderRadius: 2, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          AI图像生成工具
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'white' }}>
          使用我们的AI驱动工具生成高质量的游戏图像素材。只需描述您想要的内容，我们的系统将为您创建精美的视觉元素。
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Prompt输入框在左侧 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TextField
              fullWidth
              label="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{ flexGrow: 1, '& .MuiInputBase-input': { color: 'white' }, '& .MuiInputLabel-root': { color: 'white' } }}
              multiline
              rows={8}
            />
          </Box>
          
          {/* 其他参数在右侧 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel sx={{ color: 'white' }}>Size</InputLabel>
              <Select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                label="Size"
                sx={{ '& .MuiSelect-select': { color: 'white' } }}
              >
                <MenuItem value="512x512">512x512</MenuItem>
                <MenuItem value="768x768">768x768</MenuItem>
                <MenuItem value="1024x1024">1024x1024</MenuItem>
              </Select>
            </FormControl>
            
            <Box>
              <Typography gutterBottom sx={{ color: 'white' }}>Guidance Scale: {guidanceScale}</Typography>
              <Slider
                value={guidanceScale}
                onChange={(e, newValue) => setGuidanceScale(newValue)}
                aria-labelledby="guidance-scale-slider"
                min={0.5}
                max={10}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <TextField
                  fullWidth
                  label="Seed"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  type="number"
                  margin="normal"
                  variant="outlined"
                  sx={{ '& .MuiInputBase-input': { color: 'white' }, '& .MuiInputLabel-root': { color: 'white' } }}
                />
            
            <FormControlLabel
              control={<Switch checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />}
              sx={{ color: 'white' }}
              label="Watermark"
            />
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          onClick={handleGenerate}
          disabled={loading}
          sx={{ 
            background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
            color: 'white',
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '50px',
            marginTop: 2,
            minWidth: '150px'
          }}
        >
          {loading ? '生成中...' : '生成图像'}
        </Button>
      </Paper>
      
      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 5, height: 10 }} />
        </Box>
      )}
      
      {generatedImage && (
        <Paper elevation={3} sx={{ padding: 3, background: 'rgba(0, 0, 0, 0.2)', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              生成的图像
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleDownload}
              disabled={downloading}
              sx={{ 
                background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
                color: 'white',
                fontWeight: 'bold',
                padding: '10px 20px',
                borderRadius: '50px'
              }}
            >
              {downloading ? '下载中...' : '下载图像'}
            </Button>
          </Box>
          <Card>
            <CardMedia
              component="img"
              image={generatedImage}
              alt="Generated image"
            />
          </Card>
        </Paper>
      )}
    </Box>
  );
};

export default ImageGeneration;