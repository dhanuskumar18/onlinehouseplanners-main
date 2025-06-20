"use client";

import CanvasWrapper from "@/Three/CanvasWrapper";
import LandingPage from "@/Three/LandingPage";
import WaveLoader from "@/Three/Loader";
import { BoxRotationScene } from "@/Three/Scenes";
import { Loader, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
export default function Home() {
  return (
    // <div className="w-full h-screen">
    //   <CanvasWrapper>
    //     <BoxRotationScene/>
    //     <OrbitControls/>
    
    //   </CanvasWrapper>
    // </div>

    <>
      {/* <Suspense fallback={<WaveLoader />}> */}
      {/* <WaveLoader/> */}
        <LandingPage />
      {/* </Suspense> */}
    </>
  );
}
