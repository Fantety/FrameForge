/*
 * @FilePath: \frontend\src\ImageGeneration.js
 * @Author: Fantety
 * @Descripttion: 
 * @Date: 2025-08-17 18:05:29
 * @LastEditors: Fantety
 * @LastEditTime: 2025-08-18 18:29:28
 */
import React, { useState, useRef, useEffect } from 'react';
import { historyService } from './HistoryService';
import { Box, Typography, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Slider, FormControlLabel, Switch, Card, CardMedia, CircularProgress, LinearProgress, Modal, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImageGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // 新增：存储图片URL
  const [size, setSize] = useState('512x512');
  const [guidanceScale, setGuidanceScale] = useState(2.5);
  const [seed, setSeed] = useState(12345);
  const [watermark, setWatermark] = useState(true);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [userRequest, setUserRequest] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // 准备请求参数
      const requestBody = {
        prompt,
        size,
        guidance_scale: guidanceScale,
        seed: parseInt(seed),
        watermark
      };
      
      // 如果提供了图片URL，则添加到请求参数中
      if (imageUrl && imageUrl.trim()) {
        requestBody.image = imageUrl.trim();
      }
      
      // 调用后端API生成图像
      const response = await fetch('http://localhost:8000/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedImage(data.image_url);
      
      // 保存到历史记录
      if (data.image_url) {
        historyService.addHistoryItem({
          type: 'image',
          prompt,
          generatedUrl: data.image_url,
          params: {
            size,
            guidance_scale: guidanceScale,
            seed: parseInt(seed),
            watermark,
            hasImageUrl: !!(imageUrl && imageUrl.trim())
          }
        });
      }
    } catch (error) {
      console.error('生成图像时出错:', error);
      // 在实际应用中，这里可以显示错误消息给用户
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    setGeneratingPrompt(true);
    try {
      // 调用后端API生成提示词
      const response = await fetch('http://localhost:8000/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_request: userRequest
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedPrompt(data.generated_prompt);
    } catch (error) {
      console.error('生成提示词时出错:', error);
      setGeneratedPrompt('生成提示词失败，请重试。');
    } finally {
      setGeneratingPrompt(false);
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
        img.onload = function () {
          try {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // 将canvas内容转换为blob并下载
            canvas.toBlob(function (blob) {
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

        img.onerror = function () {
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

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          bgcolor: '#140424',
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          width: 400,
          position: 'relative'
        }}>
          <IconButton
            aria-label="close"
            onClick={() => setOpenModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" gutterBottom>
            AI生成提示词
          </Typography>
          <TextField
            fullWidth
            label="输入你的需求"
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
            sx={{
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
          <Box sx={{ position: 'relative', display: 'inline-block', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleGeneratePrompt}
              disabled={generatingPrompt}
              sx={{
                background: 'linear-gradient(45deg, #ff4500, #ffa500)',
                color: '#333',
                fontWeight: 'bold',
                padding: '10px 20px',
                borderRadius: '50px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #e03e00, #e69500)'
                },
                '&.Mui-disabled': {
                  background: 'linear-gradient(45deg, #cccccc, #999999)',
                  color: 'white'
                }
              }}
            >
              生成提示词
            </Button>
            {generatingPrompt && (
              <CircularProgress
                size={24}
                sx={{
                  '& .MuiInputBase-input': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'white' },
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
          {generatingPrompt ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography>正在生成提示词...</Typography>
            </Box>
          ) : generatedPrompt && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                生成的提示词：
              </Typography>
              <TextField
                fullWidth
                value={generatedPrompt}
                multiline
                rows={3}
                variant="outlined"
                sx={{
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
                variant="outlined"
                onClick={() => {
                  setPrompt(generatedPrompt);
                  setOpenModal(false);
                }}
                sx={{ mt: 1 }}
              >
                使用此提示词
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
      <Paper elevation={3} sx={{ padding: 3, background: 'rgba(44, 10, 77, 0.3)', borderRadius: 2, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          AI图像生成工具
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'white' }}>
          使用我们的AI驱动工具生成高质量的游戏图像素材。只需描述您想要的内容，我们的系统将为您创建精美的视觉元素。
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Prompt输入框在左侧 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Button
              variant="outlined"
              onClick={() => setOpenModal(true)}
              sx={{
                mb: 2,
                borderColor: '#ff4500',
                color: '#ff4500',
                '&:hover': {
                  borderColor: '#ffa500',
                  backgroundColor: 'rgba(255, 69, 0, 0.1)'
                }
              }}
            >
              AI生成提示词
            </Button>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {/* 图片URL输入组件 */}
              <TextField
                fullWidth
                label="图片URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                margin="normal"
                variant="outlined"
                sx={{
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
              
              {/* 图片预览悬浮窗 */}
              {imageUrl && (
                <Tooltip 
                  title={
                    <img 
                      src={imageUrl} 
                      alt="预览" 
                      style={{ maxWidth: '300px', maxHeight: '300px', borderRadius: '8px' }} 
                    />
                  }
                  placement="top"
                  arrow
                >
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      padding: '5px',
                      border: '1px dashed #ff4500',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '120px',
                      height: '56px', // 设置与TextField一致的高度
                      marginTop: '16px', // 与TextField的margin-top一致
                      marginBottom: '8px'  // 与TextField的margin-bottom一致
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      悬浮预览
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>
            <TextField
              fullWidth
              label="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{
                flexGrow: 1,
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
                sx={{
                  '& .MuiSelect-select': { color: 'white' },
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
                sx={{
                  '& .MuiSlider-thumb': {
                    background: 'linear-gradient(45deg, #ff4500, #ffa500)',
                  },
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(90deg, #ff4500, #ffa500)',
                  },
                  '& .MuiSlider-rail': {
                    background: 'linear-gradient(90deg, #ff4500, #ffa500)',
                  }
                }}
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
              sx={{
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

            <FormControlLabel
              control={<Switch checked={watermark} onChange={(e) => setWatermark(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#ff4500',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 69, 0, 0.08)',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    background: 'linear-gradient(90deg, #ff4500, #ffa500)',
                  },
                }} />}
              sx={{
                color: 'white',
                '& .MuiFormControlLabel-label': {
                  background: 'linear-gradient(90deg, #ff4500, #ffa500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }
              }}
              label="Watermark"
            />
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          sx={{
            background: 'linear-gradient(45deg, #ff4500, #ffa500)',
            color: '#333',
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
        <Paper elevation={3} sx={{ padding: 3, background: 'rgba(44, 10, 77, 0.3)', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              生成的图像
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleDownload}
                disabled={downloading}
                sx={{
                  background: 'linear-gradient(45deg, #ff4500, #ffa500)',
                  color: '#333',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  borderRadius: '50px'
                }}
              >
                {downloading ? '下载中...' : '下载图像'}
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  // 通过localStorage传递图像URL
                  localStorage.setItem('firstFrameImageUrl', generatedImage);
                  // 触发自定义事件通知AnimationGeneration组件
                  window.dispatchEvent(new Event('firstFrameImageUrlUpdated'));
                  // 使用React Router导航到创作页面，并设置activeSection为animation
                  window.dispatchEvent(new CustomEvent('navigateToCreate', { detail: { section: 'animation' } }));
                }}
                sx={{
                  background: 'linear-gradient(45deg, #00c853, #64dd17)',
                  color: '#333',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  borderRadius: '50px'
                }}
              >
                制作动画
              </Button>
            </Box>
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