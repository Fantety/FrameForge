import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, IconButton, Tooltip, Divider, Button } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ImageIcon from '@mui/icons-material/Image';
import VideoIcon from '@mui/icons-material/VideoFile';
import MusicIcon from '@mui/icons-material/MusicNote';
import DeleteIcon from '@mui/icons-material/Delete';
import { historyService } from './HistoryService';

const HistoryFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);

  // 加载历史记录并监听更新
  useEffect(() => {
    const loadHistory = () => {
      setHistoryItems(historyService.getAllHistory());
    };

    loadHistory(); // 初始加载
    
    // 监听历史记录更新事件
    window.addEventListener('historyUpdated', loadHistory);

    return () => {
      window.removeEventListener('historyUpdated', loadHistory);
    };
  }, []);

  // 复制文本到剪贴板
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // 可以添加一个短暂的提示
      const button = document.createElement('div');
      button.textContent = '已复制！';
      button.style.position = 'fixed';
      button.style.bottom = '80px';
      button.style.right = '20px';
      button.style.background = 'linear-gradient(45deg, #ff4500, #ffa500)';
      button.style.color = 'white';
      button.style.padding = '8px 16px';
      button.style.borderRadius = '20px';
      button.style.zIndex = '9999';
      button.style.fontSize = '12px';
      document.body.appendChild(button);
      
      setTimeout(() => {
        button.remove();
      }, 2000);
    });
  };

  // 查看生成的媒体
  const handleViewMedia = (mediaUrl, type) => {
    if (!mediaUrl) return;
    
    // 创建一个新的标签页打开媒体
    window.open(mediaUrl, '_blank');
  };

  // 获取图标根据类型
  const getMediaIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon size="small" sx={{ color: '#ff4500', marginRight: 1 }} />;
      case 'animation':
        return <VideoIcon size="small" sx={{ color: '#4CAF50', marginRight: 1 }} />;
      case 'chiptune':
        return <MusicIcon size="small" sx={{ color: '#2196F3', marginRight: 1 }} />;
      default:
        return null;
    }
  };

  // 获取类型标签
  const getTypeLabel = (type) => {
    switch (type) {
      case 'image':
        return <span style={{ color: '#ff4500', fontWeight: 'bold' }}>图像</span>;
      case 'animation':
        return <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>动画</span>;
      case 'chiptune':
        return <span style={{ color: '#2196F3', fontWeight: 'bold' }}>音乐</span>;
      default:
        return <span>未知</span>;
    }
  };

  // 清除所有历史记录
  const handleClearHistory = () => {
    if (window.confirm('确定要清除所有历史记录吗？')) {
      historyService.clearHistory();
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* 悬浮球按钮 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: '9998',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.3s ease'
        }}
      >
        <Tooltip title="历史记录">
          <IconButton
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              background: 'linear-gradient(45deg, #ff4500, #ffa500)',
              color: 'white',
              width: '60px',
              height: '60px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            <HistoryIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 悬浮窗 */}
      {isOpen && (
        <Paper
          elevation={5}
          sx={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            maxHeight: '500px',
            background: 'rgba(44, 10, 77, 0.95)',
            borderRadius: '15px',
            overflow: 'hidden',
            zIndex: '9999',
            border: '1px solid rgba(255, 165, 0, 0.3)'
          }}
        >
          {/* 悬浮窗头部 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              background: 'linear-gradient(45deg, #2c0a4d, #1a0529)',
              borderBottom: '1px solid rgba(255, 165, 0, 0.3)'
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
              <HistoryIcon sx={{ marginRight: 1, color: '#ff4500' }} />
              历史记录
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={handleClearHistory}
                startIcon={<DeleteIcon size="small" />}
                sx={{
                  color: '#ff4500',
                  '&:hover': {
                    background: 'rgba(255, 69, 0, 0.1)'
                  }
                }}
              >
                清除
              </Button>
              <IconButton
                onClick={() => setIsOpen(false)}
                size="small"
                sx={{
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <CloseIcon size="small" />
              </IconButton>
            </Box>
          </Box>

          {/* 历史记录列表 */}
          <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
            {historyItems.length === 0 ? (
              <Box
                sx={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                暂无历史记录
              </Box>
            ) : (
              <List>
                {historyItems.map((item) => (
                  <>
                    <ListItem
                      key={item.id}
                      sx={{
                        padding: '12px 15px',
                        borderBottom: '1px solid rgba(255, 165, 0, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
                          {getMediaIcon(item.type)}
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {formatTime(item.timestamp)} · {getTypeLabel(item.type)}
                          </Typography>
                        </Box>
                        <ListItemText
                          primary={item.prompt}
                          primaryTypographyProps={{
                            sx: {
                              color: 'white',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            },
                            title: item.prompt
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="复制提示词">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(item.prompt)}
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': {
                                color: '#ff4500',
                                background: 'rgba(255, 69, 0, 0.1)'
                              }
                            }}
                          >
                            <FileCopyIcon size="small" />
                          </IconButton>
                        </Tooltip>
                        {(item.generatedUrl || item.videoUrl) && (
                          <Tooltip title="查看生成内容">
                            <IconButton
                              size="small"
                              onClick={() => handleViewMedia(item.generatedUrl || item.videoUrl, item.type)}
                              sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&:hover': {
                                  color: '#4CAF50',
                                  background: 'rgba(76, 175, 80, 0.1)'
                                }
                              }}
                            >
                              {item.type === 'chiptune' ? (
                                <MusicIcon size="small" />
                              ) : (item.type === 'animation' ? (
                                <VideoIcon size="small" />
                              ) : (
                                <ImageIcon size="small" />
                              ))}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </ListItem>
                  </>
                ))}
              </List>
            )}
          </Box>

          {/* 底部信息 */}
          {historyItems.length > 0 && (
            <Box
              sx={{
                padding: '10px 15px',
                textAlign: 'center',
                background: 'rgba(26, 5, 41, 0.5)',
                borderTop: '1px solid rgba(255, 165, 0, 0.2)'
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                共 {historyItems.length} 条记录
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </>
  );
};

export default HistoryFloatingButton;