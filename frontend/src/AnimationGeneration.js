import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Slider, FormControlLabel, Switch, Card, CardMedia, CircularProgress, LinearProgress, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PreviewIcon from '@mui/icons-material/Preview';

const AnimationGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [firstFrame, setFirstFrame] = useState('');
  const [resolution, setResolution] = useState('1080p');
  const [duration, setDuration] = useState(5);
  const [cameraFixed, setCameraFixed] = useState(false);
  const [watermark, setWatermark] = useState(true);
  const [generatedAnimation, setGeneratedAnimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // AI生成提示词相关状态
  const [openModal, setOpenModal] = useState(false);
  const [userRequest, setUserRequest] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const previewButtonRef = useRef(null);
  const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      // 模拟生成的动画URL
      setGeneratedAnimation('https://sample-videos.com/gif/1.gif');
    } catch (error) {
      console.error('生成动画时出错:', error);
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
      // 模拟下载过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 创建临时下载链接
      const link = document.createElement('a');
      link.href = generatedAnimation;
      link.download = 'generated-animation.gif';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载动画时出错:', error);
    } finally {
      setDownloading(false);
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#140424',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* AI生成提示词模态框 */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
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
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            AI生成提示词
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="描述你想要生成的动画场景..."
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            sx={{
              mb: 2,
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
            fullWidth
            variant="contained"
            onClick={handleGeneratePrompt}
            disabled={generatingPrompt}
            sx={{
              background: 'linear-gradient(45deg, #FF9A00, #FFD200)',
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              '&:hover': {
                background: 'linear-gradient(45deg, #FF9A00, #FFD200)',
                opacity: 0.9
              },
              '&:disabled': {
                background: 'linear-gradient(45deg, #FF9A00, #FFD200)',
                opacity: 0.7
              }
            }}
          >
            {generatingPrompt ? (
              <>
                <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                生成中...
              </>
            ) : '生成提示词'}
          </Button>
          {generatedPrompt && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                生成的提示词：
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={generatedPrompt}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  mb: 2,
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
                fullWidth
                variant="contained"
                onClick={() => {
                  setPrompt(generatedPrompt);
                  setOpenModal(false);
                }}
                sx={{
                  background: 'linear-gradient(45deg, #FF9A00, #FFD200)',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF9A00, #FFD200)',
                    opacity: 0.9
                  }
                }}
              >
                使用此提示词
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
        动画生成
      </Typography>
      <Paper elevation={3} sx={{ padding: 3, background: 'rgba(44, 10, 77, 0.3)', borderRadius: 2, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          AI动画生成工具
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'white' }}>
          使用我们的AI驱动工具生成流畅的游戏动画。描述您想要的动作序列，我们的系统将为您创建生动的动画效果。
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Prompt输入框在左侧 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Button
              variant="outlined"
              onClick={() => setOpenModal(true)}
              sx={{
                mb: 2,
                borderColor: 'linear-gradient(45deg, #FF9A00, #FFD200)',
                color: 'white',
                '&:hover': {
                  borderColor: 'linear-gradient(45deg, #FF9A00, #FFD200)',
                  background: 'rgba(255, 154, 0, 0.1)'
                }
              }}
            >
              AI生成提示词
            </Button>
            <TextField
              fullWidth
              label="文本提示词"
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
              rows={4}
            />

            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                  首帧图片URL
                </Typography>
                <IconButton 
                  ref={previewButtonRef}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 165, 0, 0.1)'
                    }
                  }}
                  disabled={!firstFrame || !firstFrame.trim()}
                  onMouseEnter={() => {
                    if (firstFrame && firstFrame.trim()) {
                      setPreviewImage(firstFrame);
                      setShowPreview(true);
                      // 获取按钮位置
                      if (previewButtonRef.current) {
                        const rect = previewButtonRef.current.getBoundingClientRect();
                        setPreviewPosition({
                          top: rect.bottom + window.scrollY,
                          left: rect.left + window.scrollX
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    setShowPreview(false);
                  }}
                >
                  <PreviewIcon />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                label="图片URL"
                value={firstFrame || ''}
                onChange={(e) => setFirstFrame(e.target.value)}
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
            </Box>
          </Box>

          {showPreview && (
            <Box
              sx={{
                position: 'absolute',
                top: previewPosition.top,
                left: previewPosition.left,
                zIndex: 1000,
                backgroundColor: 'white',
                padding: 2,
                borderRadius: 1,
                boxShadow: 3,
                maxWidth: '300px',
                maxHeight: '300px',
              }}
            >
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1001,
                }}
                onClick={() => setShowPreview(false)}
              >
                <CloseIcon />
              </IconButton>
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}

          {/* 其他参数在右侧 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel sx={{ color: 'white' }}>Resolution</InputLabel>
              <Select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                label="Resolution"
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
                <MenuItem value="360p">360p</MenuItem>
                <MenuItem value="720p">720p</MenuItem>
                <MenuItem value="1080p">1080p</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography gutterBottom sx={{ color: 'white' }}>Duration: {duration}s</Typography>
              <Slider
                value={duration}
                onChange={(e, newValue) => setDuration(newValue)}
                aria-labelledby="duration-slider"
                min={5}
                max={10}
                step={5}
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

            <FormControlLabel
              control={<Switch checked={cameraFixed} onChange={(e) => setCameraFixed(e.target.checked)}
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
              label="Camera Fixed"
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
          {loading ? '生成中...' : '生成动画'}
        </Button>
      </Paper>

      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 5, height: 10 }} />
        </Box>
      )}

      {generatedAnimation && (
        <Paper elevation={3} sx={{ padding: 3, background: 'rgba(44, 10, 77, 0.3)', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              生成的动画
            </Typography>
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
              {downloading ? '下载中...' : '下载动画'}
            </Button>
          </Box>
          <Card>
            <CardMedia
              component="img"
              image={generatedAnimation}
              alt="Generated animation"
            />
          </Card>
        </Paper>
      )}
    </Box>
  );
};

export default AnimationGeneration;