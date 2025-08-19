import React from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './Sidebar';
import ImageGeneration from './ImageGeneration';
import AnimationGeneration from './AnimationGeneration';
import ChiptuneGeneration from './ChiptuneGeneration';

function App() {
  const navigate = useNavigate();
  
  const handleStart = () => {
    // 跳转到创作页面
    navigate('/create');
  };

  return (
    <div className="container">
      {/* 浮动粒子背景 */}
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      
      <Routes>
        <Route path="/" element={
          <>
            <header>
              <h1>FrameForge</h1>
              <p>专为游戏开发者打造的AI素材生成工具</p>
            </header>
            
            <main>
              <div className="hero">
                <div className="game-elements">
                  <div className="pixel-art pixel-art-1"></div>
                  <div className="pixel-art pixel-art-2"></div>
                  <div className="pixel-art pixel-art-3"></div>
                </div>
                <h2>释放您的游戏创造力</h2>
                <p>通过AI技术将您的游戏想法转化为令人惊叹的视觉素材</p>
                <button id="get-started" className="btn btn-primary" onClick={handleStart}>
          立即开始创作
        </button>
              </div>
            </main>
          </>
        } />
        <Route path="/create" element={<CreatePage />} />
      </Routes>
    </div>
  );
}

export default App;

// 新增创作页面组件
export function CreatePage() {
  const [activeSection, setActiveSection] = React.useState('image');
  
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
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main style={{ flexGrow: 1, padding: '20px' }}>
        {renderContent()}
      </main>
    </div>
  );
}