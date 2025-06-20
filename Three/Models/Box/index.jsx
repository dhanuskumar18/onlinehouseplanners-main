import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import React from "react";

const Box = React.forwardRef((props, ref) => {
  

  return (
    <mesh ref={ref} position={[0,1,0]} rotation={[1/Math.PI,0,0]}>
      <boxGeometry   />
    </mesh>
  );
});

export default Box;
