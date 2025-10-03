import React, { useState, useEffect, useRef } from 'react';
import { Fade, Slide, Collapse } from '@mui/material';

/**
 * SafeTransition - A wrapper component that prevents getBoundingClientRect errors
 * by ensuring the DOM element exists before triggering animations
 */
const SafeTransition = ({ 
  type = 'fade', 
  children, 
  in: inProp = true, 
  timeout = 300,
  direction = 'up',
  ...otherProps 
}) => {
  const [mounted, setMounted] = useState(false);
  const [safeIn, setSafeIn] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    // Set mounted immediately
    setMounted(true);
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setSafeIn(inProp);
    }, 50);

    return () => clearTimeout(timer);
  }, [inProp]);

  // Don't render transition until mounted
  if (!mounted) {
    return <div ref={elementRef} style={{ opacity: 0 }}>{children}</div>;
  }

  const commonProps = {
    in: safeIn,
    timeout,
    ...otherProps
  };

  switch (type) {
    case 'slide':
      return (
        <Slide direction={direction} {...commonProps}>
          <div ref={elementRef}>{children}</div>
        </Slide>
      );
    
    case 'collapse':
      return (
        <Collapse {...commonProps}>
          <div ref={elementRef}>{children}</div>
        </Collapse>
      );
    
    case 'fade':
    default:
      return (
        <Fade {...commonProps}>
          <div ref={elementRef}>{children}</div>
        </Fade>
      );
  }
};

export default SafeTransition;
