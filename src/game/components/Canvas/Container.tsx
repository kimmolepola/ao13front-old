import { memo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import styled from 'styled-components';
import theme from '../../../themets.js';
import { useRecoilValue } from "recoil";

import Loop from "./Loop";
import Objects from "./Objects";

import * as atoms from "../../../atoms";

const Container = styled.div<any>`
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: min(
    ${theme.sidepanelMaxWidth},
    ${(props) => (props.windowHeight / 100) * theme.sidepanelWidthPercent}px
  );
  left: 0px;
  @media (min-width: ${theme.mobileWidth}px) {
    right: min(${theme.sidepanelMaxWidth}, ${theme.sidepanelWidthPercent}vw);
    bottom: 0px;
  }
`;

const CanvasContainer = () => {
  const windowHeight = useRecoilValue(atoms.windowHeight);

  return (
    <Container windowHeight={windowHeight}>
      <Canvas
        camera={{
          fov: 75,
          near: 5,
          far: 11,
          position: [0, 0, 10],
        }}
      >
        <color attach="background" args={['bisque']} />
        <Loop />
        <Suspense fallback={null}>
          <Objects />
        </Suspense>
      </Canvas>
    </Container>
  )
};

export default memo(CanvasContainer);