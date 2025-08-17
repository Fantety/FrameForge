import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

const AnimationGeneration = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        动画生成
      </Typography>
      <Paper elevation={3} sx={{ padding: 3, background: 'rgba(0, 0, 0, 0.2)', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          AI动画生成工具
        </Typography>
        <Typography variant="body1" paragraph>
          使用我们的AI驱动工具生成流畅的游戏动画。描述您想要的动作序列，我们的系统将为您创建生动的动画效果。
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            background: 'linear-gradient(45deg, #ff4500, #ffa500)',
            color: '#333',
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '50px',
            marginTop: 2
          }}
        >
          开始生成动画
        </Button>
      </Paper>
    </Box>
  );
};

export default AnimationGeneration;