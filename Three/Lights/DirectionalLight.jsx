import React, { useRef } from "react";

const DirectionalLight = () => {
  const ref = useRef(null);


  return (
    <>
      <directionalLight
        ref={ref}
        castShadow
        position={[5, 5, 2]}
        intensity={3}
        
      />
    </>
  );
};

export default DirectionalLight;
