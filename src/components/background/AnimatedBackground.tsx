'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];

    // Store dimensions - only viewport size for fixed canvas
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Resize canvas to viewport only
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color palette matching the app theme
    const colors = [
      'rgba(212, 168, 75, ', // gold/amber
      'rgba(79, 70, 229, ',  // indigo
      'rgba(59, 130, 246, ', // blue
      'rgba(16, 185, 129, ', // green
    ];

    // Create particle
    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    // Update particle
    const updateParticle = (particle: Particle, time: number) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Pulse effect
      const pulse = Math.sin(time * particle.pulseSpeed + particle.pulsePhase) * 0.3 + 0.7;
      particle.opacity = (Math.random() * 0.3 + 0.1) * pulse;

      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;
    };

    // Draw particle
    const drawParticle = (particle: Particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color + particle.opacity + ')';
      ctx.fill();
    };

    // Create particles - fewer for better performance on mobile
    const particleCount = Math.min(40, Math.floor((width * height) / 30000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    // Draw connections between nearby particles
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212, 168, 75, ${0.04 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Gradient orbs - positioned relative to viewport
    const orbs = [
      { x: 0.15, y: 0.2, radius: 300, color: 'rgba(79, 70, 229, 0.08)' },
      { x: 0.85, y: 0.15, radius: 280, color: 'rgba(212, 168, 75, 0.06)' },
      { x: 0.5, y: 0.6, radius: 400, color: 'rgba(59, 130, 246, 0.05)' },
      { x: 0.1, y: 0.85, radius: 250, color: 'rgba(16, 185, 129, 0.04)' },
      { x: 0.9, y: 0.7, radius: 300, color: 'rgba(139, 92, 246, 0.05)' },
    ];

    const drawOrbs = (time: number) => {
      orbs.forEach((orb, index) => {
        const offsetX = Math.sin(time * 0.0003 + index) * 40;
        const offsetY = Math.cos(time * 0.0002 + index * 2) * 40;
        
        const gradient = ctx.createRadialGradient(
          orb.x * width + offsetX,
          orb.y * height + offsetY,
          0,
          orb.x * width + offsetX,
          orb.y * height + offsetY,
          orb.radius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });
    };

    // Animation loop
    let time = 0;
    const animate = () => {
      time++;
      
      // Clear canvas with transparent (CSS handles base gradient)
      ctx.clearRect(0, 0, width, height);

      // Draw gradient orbs
      drawOrbs(time);

      // Update and draw particles
      particles.forEach(particle => {
        updateParticle(particle, time);
        drawParticle(particle);
      });

      // Draw connections
      drawConnections();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      {/* CSS gradient background - covers full page without repetition */}
      <div 
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              180deg,
              #0f172a 0%,
              #1a2744 15%,
              #162032 30%,
              #1e293b 50%,
              #162032 70%,
              #1a2744 85%,
              #0f172a 100%
            )
          `,
          backgroundAttachment: 'fixed',
          backgroundSize: '100% 100vh',
        }}
        aria-hidden="true"
      />
      {/* Canvas for animated particles and orbs */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}
