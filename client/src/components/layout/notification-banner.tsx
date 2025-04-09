import { useState, useEffect } from 'react';

export default function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [shimmerPosition, setShimmerPosition] = useState(0);
  
  // Shimmer animation effect
  useEffect(() => {
    const shimmerInterval = setInterval(() => {
      setShimmerPosition(prev => (prev + 1) % 100);
    }, 50); // Fast shimmer movement
    
    return () => clearInterval(shimmerInterval);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="relative w-full bg-card py-2 border-b border-border overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent" 
        style={{ 
          transform: `translateX(${shimmerPosition - 50}%)`,
          width: '150%',
          transition: 'transform 0.5s ease'
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-primary font-medium text-sm md:text-base">
              This tool is under construction, but you will be able to use it - <span className="font-semibold">@Sumanth Csy (CEO-Taskify AI)</span>
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}