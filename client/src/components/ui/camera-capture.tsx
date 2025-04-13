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

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Try catch specifically for iOS Safari issues
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      // Force low quality for mobile devices to improve performance
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        constraints.video.width = { ideal: 640 };
        constraints.video.height = { ideal: 480 };
      }
      
      console.log("Starting camera with constraints:", JSON.stringify(constraints));
      
      // Special handling for iOS Safari
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        console.log("iOS device detected, using special camera handling");
        // Try with exact constraints first
        try {
          const newStream = await navigator.mediaDevices.getUserMedia(constraints);
          setStream(newStream);
          setError(null);
          setPermissionDenied(false);
          
          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
            videoRef.current.play().catch(e => console.error("Error playing video:", e));
          }
        } catch (firstTryErr) {
          console.warn("First camera attempt failed, trying with minimal constraints", firstTryErr);
          // If that fails, try with minimal constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ 
              video: true, 
              audio: false 
            });
            setStream(basicStream);
            setError(null);
            setPermissionDenied(false);
            
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream;
              videoRef.current.play().catch(e => console.error("Error playing video:", e));
            }
          } catch (secondTryErr: any) {
            throw secondTryErr; // Still failed, throw to be caught by outer catch
          }
        }
      } else {
        // Normal flow for other browsers
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
        setError(null);
        setPermissionDenied(false);
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        setPermissionDenied(true);
        setError("Camera access denied. Please allow camera access to use this feature.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on your device.");
      } else if (err.name === "NotReadableError" || err.name === "AbortError") {
        setError("Camera is already in use by another application. Please close other apps using the camera.");
      } else if (err.name === "OverconstrainedError") {
        // Fall back to basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
          });
          setStream(basicStream);
          setError(null);
          setPermissionDenied(false);
          
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
          }
        } catch (fallbackErr) {
          setError("Could not access any camera on your device.");
        }
      } else {
        setError("Error accessing camera: " + err.message);
      }
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, startCamera]);

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
            onClick={onClose}
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