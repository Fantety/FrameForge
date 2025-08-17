/*
 * @FilePath: \frontend\src\ImageGeneration.js
 * @Author: Fantety
 * @Descripttion: 
 * @Date: 2025-08-17 18:05:29
 * @LastEditors: Fantety
 * @LastEditTime: 2025-08-17 18:05:37
 */
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Slider, FormControlLabel, Switch, Card, CardMedia } from '@mui/material';

const ImageGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('512x512');
  const [guidanceScale, setGuidanceScale] = useState(2.5);
  const [seed, setSeed] = useState(12345);
  const [watermark, setWatermark] = useState(true);
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleGenerate = async () => {
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
          sx={{ 
            background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
            color: 'white',
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '50px',
            marginTop: 2
          }}
        >
          生成图像
        </Button>
      </Paper>
      
      {generatedImage && (
        <Paper elevation={3} sx={{ padding: 3, background: 'rgba(0, 0, 0, 0.2)', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
            生成的图像
          </Typography>
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