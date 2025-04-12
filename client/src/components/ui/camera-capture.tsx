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
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(newStream);
      setError(null);
      setPermissionDenied(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        setPermissionDenied(true);
        setError("Camera access denied. Please allow camera access to use this feature.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on your device.");
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
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden max-w-md w-full">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Camera className="h-5 w-5 mr-2 text-purple-400" />
            Camera Capture
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative bg-black">
          {error ? (
            <div className="h-80 flex items-center justify-center p-4 text-center">
              <div>
                <p className="text-red-400 mb-4">{error}</p>
                {permissionDenied && (
                  <Button 
                    variant="outline"
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
                style={{ maxHeight: '60vh' }} 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="sparkle">
                  <p className="text-white text-center mb-2 font-medium text-sm">
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
                style={{ maxHeight: '60vh' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <p className="text-white text-center mb-2 font-medium text-sm">
                  Position your subject in the frame
                </p>
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="p-4 flex justify-between">
          {capturedImage ? (
            <>
              <Button 
                variant="outline" 
                onClick={retakePhoto}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button 
                onClick={savePhoto}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Use Photo
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={switchCamera}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Switch Camera
              </Button>
              <Button 
                onClick={takePhoto}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}