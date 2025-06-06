import React, { useRef, useState, useCallback, useEffect } from "react";
import { Camera, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CameraCaptureProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isMounted, setIsMounted] = useState(true); // Track component mount state

  // Create a cleanup function to properly stop camera streams
  const cleanupCamera = useCallback(() => {
    if (stream) {
      console.log("Cleaning up camera stream manually");
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Track ${track.id} stopped`);
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setStream(null);
    }
  }, [stream]);

  // Custom close function that ensures camera is properly closed
  const handleClose = useCallback(() => {
    cleanupCamera();
    onClose();
  }, [cleanupCamera, onClose]);
  
  const startCamera = useCallback(async () => {
    // Skip if component unmounted
    if (!isMounted) return;
    
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Step 1: Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setError("Your browser doesn't support camera access. Please try using Chrome, Safari, or Firefox.");
        }
        return;
      }
      
      // Step 2: Set initial constraints - simpler setup for better compatibility
      let constraints: MediaStreamConstraints = {
        video: true,
        audio: false
      };
      
      // On mobile, first try with facingMode
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        try {
          // Try with environment camera first (back camera) for mobile devices
          console.log("Attempting to access mobile camera with facingMode:", facingMode);
          
          const mobileConstraints: MediaStreamConstraints = {
            video: {
              facingMode: facingMode,
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false
          };
          
          const mobileStream = await navigator.mediaDevices.getUserMedia(mobileConstraints);
          if (!isMounted) {
            // Component unmounted during async operation
            mobileStream.getTracks().forEach(track => track.stop());
            return;
          }
          
          setStream(mobileStream);
          setError(null);
          setPermissionDenied(false);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mobileStream;
            // Add a small delay before attempting to play
            setTimeout(() => {
              if (videoRef.current && isMounted) {
                videoRef.current.play()
                  .then(() => console.log("Video playing successfully"))
                  .catch(playError => {
                    console.error("Error playing video:", playError);
                    // Don't throw the error - just log it and continue
                    // This way we at least have the stream even if the play() fails
                  });
              }
            }, 300);
          }
          
          return; // Success! Exit early
        } catch (mobileError) {
          console.warn("Mobile-specific camera access failed, falling back to basic access", mobileError);
          // Continue to generic attempt
        }
      }
      
      // Generic attempt with basic constraints
      console.log("Attempting to access camera with basic constraints");
      const basicStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!isMounted) {
        // Component unmounted during async operation
        basicStream.getTracks().forEach(track => track.stop());
        return;
      }
      
      setStream(basicStream);
      setError(null);
      setPermissionDenied(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = basicStream;
        // Add a small delay before attempting to play
        setTimeout(() => {
          if (videoRef.current && isMounted) {
            videoRef.current.play()
              .then(() => console.log("Video playing successfully"))
              .catch(playError => {
                console.error("Error playing video:", playError);
                // Just log the error and continue - don't throw it
                // The stream is set up, even if autoplay fails
              });
          }
        }, 300);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      
      // Skip error handling if component unmounted
      if (!isMounted) return;
      
      // More user-friendly error handling
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionDenied(true);
        setError(
          "Camera permission denied. To use this feature, please:" +
          "\n1. Click the camera icon in your browser's address bar" +
          "\n2. Select 'Allow' for camera access" +
          "\n3. Try again by clicking 'Try Again' below"
        );
      } else if (err.name === "NotFoundError") {
        setError("No camera found on your device. Please make sure your camera is connected and not in use by another app.");
      } else if (err.name === "NotReadableError" || err.name === "AbortError") {
        setError("Camera is in use by another application. Please close other camera apps and try again.");
      } else if (err.name === "OverconstrainedError") {
        // Try one more time with absolutely minimal constraints
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true });
          
          if (!isMounted) {
            // Component unmounted during async operation
            simpleStream.getTracks().forEach(track => track.stop());
            return;
          }
          
          setStream(simpleStream);
          setError(null);
          setPermissionDenied(false);
          
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream;
            // Add a small delay before attempting to play
            setTimeout(() => {
              if (videoRef.current && isMounted) {
                videoRef.current.play()
                  .then(() => console.log("Video playing successfully with minimal constraints"))
                  .catch(playError => {
                    console.error("Error playing video with minimal constraints:", playError);
                    // We already have the stream, just log the play error
                  });
              }
            }, 300);
          }
        } catch (finalError) {
          setError("Unable to access your camera with compatible settings.");
        }
      } else {
        setError(`Camera error: ${err.message || "Please check camera permissions in your browser settings."}`);
      }
    }
  }, [facingMode, stream, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    startCamera();
    
    return () => {
      setIsMounted(false);
      
      // Ensure all tracks are properly stopped when component unmounts
      if (stream) {
        console.log("Cleaning up camera stream on unmount");
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`Track ${track.id} stopped`);
        });
      }
      
      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [facingMode, startCamera, stream]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL('image/png');
        setCapturedImage(imgData);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const savePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden w-full max-w-md">
        <div className="p-2 sm:p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-base sm:text-xl font-semibold text-white flex items-center">
            <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-purple-400" />
            Camera Capture
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
        
        <div className="relative bg-black">
          {error ? (
            <div className="h-60 sm:h-80 flex items-center justify-center p-3 sm:p-4 text-center">
              <div>
                <p className="text-red-400 mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
                {permissionDenied && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                    onClick={() => {
                      setError(null);
                      startCamera();
                    }}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          ) : capturedImage ? (
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full object-contain"
                style={{ maxHeight: '50vh' }} 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 sm:p-4">
                <div className="sparkle">
                  <p className="text-white text-center mb-1 sm:mb-2 font-medium text-xs sm:text-sm">
                    Image Ready for Analysis
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="w-full object-cover" 
                style={{ maxHeight: '50vh' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 sm:p-4">
                <p className="text-white text-center mb-1 sm:mb-2 font-medium text-xs sm:text-sm">
                  Position your subject in the frame
                </p>
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="p-2 sm:p-4 flex justify-between">
          {capturedImage ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={retakePhoto}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-xs sm:text-sm"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Retake
              </Button>
              <Button 
                size="sm"
                onClick={savePhoto}
                className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Use Photo
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={switchCamera}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-xs sm:text-sm"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Switch Camera
              </Button>
              <Button 
                size="sm"
                onClick={takePhoto}
                className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Take Photo
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}