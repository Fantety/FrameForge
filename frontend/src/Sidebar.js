import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import AnimationIcon from '@mui/icons-material/Animation';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const Sidebar = ({ activeSection, onSectionChange }) => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: 240, 
          boxSizing: 'border-box',
          background: 'rgba(44, 10, 77, 0.8)',
          color: 'white',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        },
      }}
    >
      <Typography variant="h6" noWrap component="div" sx={{ padding: 2, fontWeight: 'bold' }}>
        FrameForge
      </Typography>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List>
        <ListItem 
          button 
          selected={activeSection === 'image'}
          onClick={() => onSectionChange('image')}
          sx={{ 
            '&.Mui-selected': { 
              backgroundColor: 'rgba(139, 0, 139, 0.3)' 
            },
            '&:hover': { 
              backgroundColor: 'rgba(255, 69, 0, 0.1)' 
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <ImageIcon />
          </ListItemIcon>
          <ListItemText primary="图像生成" />
        </ListItem>
        <ListItem 
          button 
          selected={activeSection === 'animation'}
          onClick={() => onSectionChange('animation')}
          sx={{ 
            '&.Mui-selected': { 
              backgroundColor: 'rgba(139, 0, 139, 0.3)' 
            },
            '&:hover': { 
              backgroundColor: 'rgba(255, 69, 0, 0.1)' 
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <AnimationIcon />
          </ListItemIcon>
          <ListItemText primary="动画生成" />
        </ListItem>
        
        <ListItem 
          button 
          selected={activeSection === 'chiptune'}
          onClick={() => onSectionChange('chiptune')}
          sx={{ 
            '&.Mui-selected': { 
              backgroundColor: 'rgba(139, 0, 139, 0.3)' 
            },
            '&:hover': { 
              backgroundColor: 'rgba(255, 69, 0, 0.1)' 
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <MusicNoteIcon />
          </ListItemIcon>
          <ListItemText primary="Chiptune音乐生成" />
        </ListItem>
      </List>
      
      {/* 预留未来扩展位置 */}
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', marginTop: 'auto' }} />
      <List>
        <ListItem button disabled>
          <ListItemText primary="更多功能即将推出" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;