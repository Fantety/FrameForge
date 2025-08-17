import React, { useEffect, useRef, useState } from 'react';

const Particles = () => {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 设置canvas尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 鼠标移动事件
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // 几何图形系统
    const particles = [];
    const particleCount = 200;
    
    // 创建几何图形
    for (let i = 0; i < particleCount; i++) {
      const shapeType = Math.floor(Math.random() * 4); // 0: triangle, 1: square, 2: hexagon, 3: star
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 60 + 40,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.02 - 0.01,
        color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.6 + 0.3})`,
        shape: shapeType
      });
    }
    
    // 绘制几何图形
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 更新和绘制几何图形
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // 更新位置
        p.x += p.speedX;
        p.y += p.speedY;
        
        // 更新旋转角度
        p.rotation += p.rotationSpeed;
        
        // 鼠标交互
        const dx = p.x - mousePosition.x;
        const dy = p.y - mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          p.x += dx * force * 0.05;
          p.y += dy * force * 0.05;
        }
        
        // 边界检查
        if (p.x > canvas.width || p.x < 0) p.speedX = -p.speedX;
        if (p.y > canvas.height || p.y < 0) p.speedY = -p.speedY;
        
        // 绘制几何图形
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        
        switch (p.shape) {
          case 0: // 三角形
            ctx.beginPath();
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.fill();
            break;
          case 1: // 正方形
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            break;
          case 2: // 六边形
            ctx.beginPath();
            for (let j = 0; j < 6; j++) {
              const angle = (j * Math.PI) / 3;
              const x = Math.cos(angle) * p.size / 2;
              const y = Math.sin(angle) * p.size / 2;
              if (j === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
          case 3: // 星形
            ctx.beginPath();
            for (let j = 0; j < 10; j++) {
              const angle = (j * Math.PI) / 5;
              const radius = j % 2 === 0 ? p.size / 2 : p.size / 4;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              if (j === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
        }
        
        ctx.restore();
      }
      
      // 绘制鼠标周围的光环
      const gradient = ctx.createRadialGradient(
        mousePosition.x, mousePosition.y, 0,
        mousePosition.x, mousePosition.y, 150
      );
      gradient.addColorStop(0, 'rgba(255, 69, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(mousePosition.x, mousePosition.y, 150, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      requestAnimationFrame(drawParticles);
    };
    
    // 启动动画
    drawParticles();
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePosition]);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }} 
    />
  );
};

export default Particles;