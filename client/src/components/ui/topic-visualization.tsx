import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopicVisualizationProps {
  title: string;
  tags?: string[];
  category?: string;
}

// Generates a stable color based on string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

// Generate nodes for visualization
const generateNodes = (title: string, tags: string[] = [], category: string = "General") => {
  const nodes = [];
  
  // Main node for the title
  nodes.push({
    id: "main",
    label: title,
    radius: 50,
    color: "hsl(250, 90%, 60%)",
    x: 0,
    y: 0,
  });
  
  // Category node
  nodes.push({
    id: "category",
    label: category,
    radius: 35,
    color: stringToColor(category),
    x: -120,
    y: -100,
  });
  
  // Tag nodes
  tags.forEach((tag, index) => {
    const angle = (2 * Math.PI * index) / tags.length;
    const radius = 150;
    
    nodes.push({
      id: `tag-${index}`,
      label: tag,
      radius: 30,
      color: stringToColor(tag),
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
  });
  
  return nodes;
};

export default function TopicVisualization({ title, tags = [], category = "General" }: TopicVisualizationProps) {
  const [nodes, setNodes] = useState<any[]>([]);
  
  useEffect(() => {
    setNodes(generateNodes(title, tags, category));
  }, [title, tags, category]);
  
  return (
    <Card className="overflow-hidden border-border shadow-md">
      <CardContent className="p-0">
        <div className="relative h-64 bg-background">
          <svg width="100%" height="100%" viewBox="-250 -150 500 300">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
            </defs>
            
            {/* Connecting lines */}
            {nodes.map((node) => {
              if (node.id !== "main") {
                return (
                  <motion.line
                    key={`line-${node.id}`}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 0.5, pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    x1="0"
                    y1="0"
                    x2={node.x}
                    y2={node.y}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                  />
                );
              }
              return null;
            })}
            
            {/* Nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                <motion.circle
                  initial={{ r: 0 }}
                  animate={{ r: node.radius }}
                  transition={{ duration: 0.8, type: "spring" }}
                  cx={node.x}
                  cy={node.y}
                  fill={`${node.color}20`}
                  stroke={node.color}
                  strokeWidth="2"
                />
                
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fontSize={node.id === "main" ? "14" : "12"}
                  fontWeight={node.id === "main" ? "bold" : "normal"}
                >
                  {node.label.length > 15 
                    ? `${node.label.substring(0, 15)}...` 
                    : node.label}
                </motion.text>
              </g>
            ))}
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-2 right-2 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-background">
              {category}
            </Badge>
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="bg-background">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="bg-background">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
