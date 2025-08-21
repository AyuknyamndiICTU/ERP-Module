import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GlassCard, { StatsCard, FeatureCard } from './GlassCard';
import { School as SchoolIcon } from '@mui/icons-material';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('GlassCard Component', () => {
  test('renders children correctly', () => {
    renderWithTheme(
      <GlassCard>
        <div>Test Content</div>
      </GlassCard>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('applies custom styles', () => {
    const { container } = renderWithTheme(
      <GlassCard sx={{ backgroundColor: 'red' }}>
        <div>Test Content</div>
      </GlassCard>
    );
    
    const glassCard = container.firstChild;
    expect(glassCard).toHaveStyle('background-color: red');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(
      <GlassCard onClick={handleClick}>
        <div>Clickable Content</div>
      </GlassCard>
    );
    
    fireEvent.click(screen.getByText('Clickable Content'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('StatsCard Component', () => {
  const defaultProps = {
    title: 'Test Stat',
    value: '100',
    icon: <SchoolIcon />,
    color: 'primary'
  };

  test('renders stats card with all props', () => {
    renderWithTheme(<StatsCard {...defaultProps} />);
    
    expect(screen.getByText('Test Stat')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('renders with trend indicator', () => {
    renderWithTheme(
      <StatsCard 
        {...defaultProps} 
        trend={15}
        trendLabel="vs last month"
      />
    );
    
    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  test('renders with subtitle', () => {
    renderWithTheme(
      <StatsCard 
        {...defaultProps} 
        subtitle="Additional info"
      />
    );
    
    expect(screen.getByText('Additional info')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(
      <StatsCard 
        {...defaultProps} 
        onClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByText('Test Stat'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('FeatureCard Component', () => {
  test('renders feature card with children', () => {
    renderWithTheme(
      <FeatureCard>
        <div>Feature Content</div>
      </FeatureCard>
    );
    
    expect(screen.getByText('Feature Content')).toBeInTheDocument();
  });

  test('applies hover effects', () => {
    const { container } = renderWithTheme(
      <FeatureCard>
        <div>Hoverable Content</div>
      </FeatureCard>
    );
    
    const featureCard = container.firstChild;
    expect(featureCard).toHaveStyle('cursor: pointer');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(
      <FeatureCard onClick={handleClick}>
        <div>Clickable Feature</div>
      </FeatureCard>
    );
    
    fireEvent.click(screen.getByText('Clickable Feature'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies custom styles', () => {
    const { container } = renderWithTheme(
      <FeatureCard sx={{ padding: '20px' }}>
        <div>Styled Feature</div>
      </FeatureCard>
    );
    
    const featureCard = container.firstChild;
    expect(featureCard).toHaveStyle('padding: 20px');
  });
});

describe('Accessibility Tests', () => {
  test('GlassCard has proper ARIA attributes when clickable', () => {
    const handleClick = jest.fn();
    renderWithTheme(
      <GlassCard onClick={handleClick} role="button" tabIndex={0}>
        <div>Accessible Content</div>
      </GlassCard>
    );
    
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  test('StatsCard has proper semantic structure', () => {
    renderWithTheme(
      <StatsCard 
        title="Students Enrolled"
        value="1,234"
        icon={<SchoolIcon />}
        color="primary"
      />
    );
    
    // Check that the title and value are properly structured
    expect(screen.getByText('Students Enrolled')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });
});

describe('Performance Tests', () => {
  test('renders multiple cards efficiently', () => {
    const startTime = performance.now();
    
    renderWithTheme(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <StatsCard 
            key={i}
            title={`Stat ${i}`}
            value={i.toString()}
            icon={<SchoolIcon />}
            color="primary"
          />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render 100 cards in less than 1000ms
    expect(renderTime).toBeLessThan(1000);
  });
});

describe('Error Handling', () => {
  test('handles missing props gracefully', () => {
    // Should not crash with minimal props
    expect(() => {
      renderWithTheme(<StatsCard />);
    }).not.toThrow();
  });

  test('handles invalid color prop', () => {
    expect(() => {
      renderWithTheme(
        <StatsCard 
          title="Test"
          value="100"
          icon={<SchoolIcon />}
          color="invalid-color"
        />
      );
    }).not.toThrow();
  });
});
