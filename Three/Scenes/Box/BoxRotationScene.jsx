import Box from "@/Three/Models/Box";
import {  useThree } from "@react-three/fiber";
import React, { useRef } from "react";  

const BoxRotationScene = () => {
  const ref = useRef(null);

  const {camera}=useThree()


    camera.position.set(-1,1,4)

  return (
    <>
      <Box ref={ref} />
    </>
  );
};

export { BoxRotationScene };
