import React from "react";
import DirectionalLight from "./DirectionalLight";

function Lights() {
  return (
    <>
      <ambientLight intensity={1} />
      <DirectionalLight />
    </>
  );
}

export default Lights;
