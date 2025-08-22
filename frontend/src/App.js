import React, { useEffect, useState } from 'react';
import HistoryFloatingButton from './HistoryFloatingButton';
import { useNavigate, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './Sidebar';
import ImageGeneration from './ImageGeneration';
import AnimationGeneration from './AnimationGeneration';
import ChiptuneGeneration from './ChiptuneGeneration';

function App() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  // 初始化粒子
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 10,
        shape: Math.floor(Math.random() * 5), // 0-4 代表不同形状
        speed: Math.random() * 10 + 5
      });
    }
    setParticles(newParticles);
  }, []);

  // 监听鼠标移动事件，用于视差效果和粒子交互
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStart = () => {
    // 平滑滚动到创作页面
    navigate('/create');
  };

  // 计算视差效果
  const getParallaxStyle = (factor = 1) => {
    const x = (mousePosition.x - window.innerWidth / 2) * 0.01 * factor;
    const y = (mousePosition.y - window.innerHeight / 2) * 0.01 * factor;
    return { transform: `translate(${x}px, ${y}px)` };
  };

  // 计算粒子跟随鼠标的效果
  const getParticleStyle = (particle) => {
    const dx = mousePosition.x - window.innerWidth * particle.x / 100;
    const dy = mousePosition.y - window.innerHeight * particle.y / 100;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = Math.max(window.innerWidth, window.innerHeight) / 2;
    
    // 粒子远离鼠标
    const repelFactor = Math.max(0, 1 - distance / maxDistance) * 50;
    const angle = Math.atan2(dy, dx);
    const offsetX = Math.cos(angle) * repelFactor;
    const offsetY = Math.sin(angle) * repelFactor;
    
    return {
      position: 'fixed',
      top: `${particle.y}%`,
      left: `${particle.x}%`,
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      transform: `translate(${offsetX}px, ${offsetY}px)`,
      opacity: '0.9',
      transition: 'transform 0.3s ease'
    };
  };

  return (
      <div className="container">
        {/* 动态粒子背景 */}
        {particles.map((particle) => (
          <div 
            key={particle.id} 
            className={`particle particle-shape-${particle.shape}`} 
            style={getParticleStyle(particle)} 
          ></div>
        ))}
        
        <Routes>
          <Route path="/" element={
            <>
              <main className="hero-container">
                <div className="hero-left" style={getParallaxStyle(0.8)}>
                  <div className="logo-container">
                    <img src="/frameforge.svg" alt="FrameForge" className="logo" />
                    <div className="logo-glow"></div>
                  </div>
                </div>
                
                <div className="hero-right" style={getParallaxStyle(1.2)}>
                  <div className="feature-list">
                    <div className="feature-item">
                      <div className="feature-icon">🎨</div>
                      <span>AI生成图像</span>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">✨</div>
                      <span>动画效果创建</span>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">🎵</div>
                      <span>8位芯片音乐制作</span>
                    </div>
                  </div>
                  <button id="get-started" className="btn btn-primary" onClick={handleStart}>
                    立即开始创作
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </main>
            </>
          } />
          <Route path="/create" element={<CreatePage />} />
        </Routes>
        
        {/* 悬浮历史记录按钮 */}
        <HistoryFloatingButton />
      </div>
    );
}

export default App;

// 新增创作页面组件
export function CreatePage() {
  const [activeSection, setActiveSection] = React.useState('image');
  
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // 添加对自定义导航事件的监听
  React.useEffect(() => {
    const handleNavigateToCreate = (event) => {
      const { section } = event.detail;
      setActiveSection(section);
    };

    window.addEventListener('navigateToCreate', handleNavigateToCreate);

    return () => {
      window.removeEventListener('navigateToCreate', handleNavigateToCreate);
    };
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'image':
        return <ImageGeneration />;
      case 'animation':
        return <AnimationGeneration />;
      case 'chiptune':
        return <ChiptuneGeneration />;
      default:
        return <ImageGeneration />;
    }
  };
  
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <main style={{ flexGrow: 1, padding: '20px' }}>
        {renderContent()}
      </main>
    </div>
  );
}