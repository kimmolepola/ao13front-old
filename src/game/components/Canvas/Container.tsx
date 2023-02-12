import { memo, Suspense, RefObject } from "react";
import { Canvas } from "@react-three/fiber";
// eslint-disable-next-line
import { useRecoilBridgeAcrossReactRoots_UNSTABLE } from 'recoil';

import Loop from "./Loop";
import Objects from "./Objects";

import * as types from "../../../types";

const CanvasContainer = ({
  objectsRef,
}: {
  objectsRef: RefObject<types.GameObject[]>;
}) => {
  console.log("--CanvasContainer");

  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE();

  return (
    <div className="absolute left-0 right-0 top-0 bottom-[30%] landscape:right-[20%] landscape:bottom-0">
      <Canvas
        camera={{
          fov: 75,
          near: 5,
          far: 11,
          position: [0, 0, 10],
        }}
      >
        <RecoilBridge>
          <color attach="background" args={["bisque"]} />
          <Loop objectsRef={objectsRef} />
          <Suspense fallback={null}>
            <Objects objectsRef={objectsRef} />
          </Suspense>
        </RecoilBridge>
      </Canvas>
    </div>
  );
};

export default memo(CanvasContainer);
