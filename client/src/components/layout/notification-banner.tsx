import { useState, useEffect } from 'react';

export default function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [highlightColor, setHighlightColor] = useState('from-primary to-purple-400');
  const [textHighlight, setTextHighlight] = useState(false);
  
  // Animation effect for changing gradient colors
  useEffect(() => {
    const colors = [
      'from-primary to-purple-400',
      'from-blue-500 to-primary',
      'from-purple-500 to-blue-400',
      'from-indigo-500 to-purple-500'
    ];
    
    let colorIndex = 0;
    const intervalId = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length;
      setHighlightColor(colors[colorIndex]);
    }, 2000); // Change color every 2 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Text highlight blinking effect
  useEffect(() => {
    const textBlinkInterval = setInterval(() => {
      setTextHighlight(prev => !prev);
    }, 800); // Blink every 800ms
    
    return () => clearInterval(textBlinkInterval);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className={`w-full bg-gradient-to-r ${highlightColor} py-2 transition-all duration-1000 shadow-md`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className={`text-white font-medium text-sm md:text-base ${textHighlight ? 'bg-black/20 px-2 py-1 rounded-md shadow-inner' : ''} transition-all duration-300`}>
              <span className="inline-block transform hover:scale-105 transition-transform">
                This tool is under construction, but you will be able to use it
              </span>
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}