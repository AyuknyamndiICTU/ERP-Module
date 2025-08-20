import React from 'react';
import { Card, CardContent, Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

// Hover animation (unused)
/*
const hoverGlow = keyframes`
  0% {
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }
  50% {
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
  }
  100% {
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }
`;
*/

// Shimmer effect
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const StyledGlassCard = styled(Card)(({ theme, variant = 'default', hover = true }) => ({
  background: variant === 'gradient' 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  // Shimmer overlay
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      )
    `,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s infinite`,
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },

  ...(hover && {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
      
      '&::before': {
        opacity: 1,
      },
    },
  }),

  // Variants
  ...(variant === 'primary' && {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
    border: '1px solid rgba(102, 126, 234, 0.2)',
  }),

  ...(variant === 'secondary' && {
    background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1), rgba(245, 87, 108, 0.1))',
    border: '1px solid rgba(240, 147, 251, 0.2)',
  }),

  ...(variant === 'success' && {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1))',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  }),

  ...(variant === 'warning' && {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1))',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  }),

  ...(variant === 'error' && {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1))',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  }),

  ...(variant === 'dark' && {
    background: 'rgba(31, 41, 55, 0.95)',
    border: '1px solid rgba(75, 85, 99, 0.3)',
    color: '#f9fafb',
  }),
}));

const GlassCardContent = styled(CardContent)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(3),
  
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

const GlassCard = ({ 
  children, 
  variant = 'default', 
  hover = true, 
  sx = {}, 
  contentSx = {},
  ...props 
}) => {
  return (
    <StyledGlassCard 
      variant={variant} 
      hover={hover} 
      sx={sx} 
      {...props}
    >
      <GlassCardContent sx={contentSx}>
        {children}
      </GlassCardContent>
    </StyledGlassCard>
  );
};

// Additional glass card variants
export const GradientCard = ({ children, gradient, ...props }) => {
  const gradientStyles = {
    background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    
    '& .MuiTypography-root': {
      color: '#ffffff',
    },
  };

  return (
    <GlassCard sx={gradientStyles} hover={true} {...props}>
      {children}
    </GlassCard>
  );
};

export const StatsCard = ({ children, icon, color = 'primary', ...props }) => {
  const IconWrapper = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '1.5rem',
    boxShadow: `0 4px 20px ${theme.palette[color].main}40`,
  }));

  return (
    <GlassCard variant={color} {...props}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      {children}
    </GlassCard>
  );
};

export const FeatureCard = ({ children, ...props }) => {
  return (
    <GlassCard 
      variant="gradient" 
      hover={true}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
        },
      }}
      {...props}
    >
      {children}
    </GlassCard>
  );
};

export default GlassCard;
