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
    
    // 粒子系统
    const particles = [];
    const particleCount = 150;
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        color: `rgba(0, 200, 255, ${Math.random() * 0.5 + 0.1})`
      });
    }
    
    // 绘制粒子和连线
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 更新和绘制粒子
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // 更新位置
        p.x += p.speedX;
        p.y += p.speedY;
        
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
        
        // 绘制粒子
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      
      // 绘制粒子间的连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = 1 - distance / 120;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 200, 255, ${opacity * 0.3})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      // 绘制鼠标周围的光环
      const gradient = ctx.createRadialGradient(
        mousePosition.x, mousePosition.y, 0,
        mousePosition.x, mousePosition.y, 100
      );
      gradient.addColorStop(0, 'rgba(0, 200, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 200, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(mousePosition.x, mousePosition.y, 100, 0, Math.PI * 2);
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