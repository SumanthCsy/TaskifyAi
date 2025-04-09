import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 40, 
  text = "Loading...",
  className = ""
}: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-8 ${className}`}
    >
      <Loader2 size={size} className="animate-spin text-primary mb-3" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </motion.div>
  );
}
