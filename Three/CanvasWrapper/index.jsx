import { Canvas } from "@react-three/fiber";
import React from "react";

function CanvasWrapper({ children }) {
  return (
    <Canvas
      className="w-full h-full bg-white"
    >
     
      {children}
    </Canvas>
  );
}

export default CanvasWrapper;
