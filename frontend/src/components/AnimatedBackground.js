import React from 'react';
import { Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

// Floating animation for bubbles
const float = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0px) rotate(360deg);
    opacity: 1;
  }
`;

// Gradient animation
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Bubble floating animation
const bubbleFloat = keyframes`
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
`;

// Styled components
const BackgroundContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: -1,
  background: `
    linear-gradient(-45deg, 
      #667eea, 
      #764ba2, 
      #f093fb, 
      #f5576c,
      #4facfe,
      #00f2fe
    )
  `,
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 15s ease infinite`,
  overflow: 'hidden',
}));

const BubbleContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  pointerEvents: 'none',
});

const Bubble = styled(Box)(({ size, delay, duration, left }) => ({
  position: 'absolute',
  bottom: '-100px',
  left: `${left}%`,
  width: `${size}px`,
  height: `${size}px`,
  background: `
    radial-gradient(circle at 30% 30%, 
      rgba(255, 255, 255, 0.8), 
      rgba(255, 255, 255, 0.3), 
      rgba(255, 255, 255, 0.1)
    )
  `,
  borderRadius: '50%',
  animation: `${bubbleFloat} ${duration}s linear infinite`,
  animationDelay: `${delay}s`,
  backdropFilter: 'blur(2px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const FloatingShape = styled(Box)(({ theme, size, delay, duration, left, top }) => ({
  position: 'absolute',
  left: `${left}%`,
  top: `${top}%`,
  width: `${size}px`,
  height: `${size}px`,
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1), 
      rgba(255, 255, 255, 0.05)
    )
  `,
  borderRadius: '50%',
  animation: `${float} ${duration}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const GeometricShape = styled(Box)(({ theme, rotation, delay }) => ({
  position: 'absolute',
  width: '200px',
  height: '200px',
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.05), 
      rgba(255, 255, 255, 0.02)
    )
  `,
  borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
  animation: `${float} 20s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  transform: `rotate(${rotation}deg)`,
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const AnimatedBackground = () => {
  // Generate random bubbles
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    delay: Math.random() * 10,
    duration: Math.random() * 10 + 15,
    left: Math.random() * 100,
  }));

  // Generate floating shapes
  const floatingShapes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 6,
    left: Math.random() * 100,
    top: Math.random() * 100,
  }));

  // Generate geometric shapes
  const geometricShapes = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    rotation: Math.random() * 360,
    delay: Math.random() * 10,
    left: Math.random() * 100,
    top: Math.random() * 100,
  }));

  return (
    <BackgroundContainer>
      {/* Animated gradient background */}
      
      {/* Floating bubbles */}
      <BubbleContainer>
        {bubbles.map((bubble) => (
          <Bubble
            key={bubble.id}
            size={bubble.size}
            delay={bubble.delay}
            duration={bubble.duration}
            left={bubble.left}
          />
        ))}
      </BubbleContainer>

      {/* Floating shapes */}
      {floatingShapes.map((shape) => (
        <FloatingShape
          key={shape.id}
          size={shape.size}
          delay={shape.delay}
          duration={shape.duration}
          left={shape.left}
          top={shape.top}
        />
      ))}

      {/* Geometric shapes */}
      {geometricShapes.map((shape) => (
        <GeometricShape
          key={shape.id}
          rotation={shape.rotation}
          delay={shape.delay}
          style={{
            left: `${shape.left}%`,
            top: `${shape.top}%`,
          }}
        />
      ))}
    </BackgroundContainer>
  );
};

export default AnimatedBackground;
