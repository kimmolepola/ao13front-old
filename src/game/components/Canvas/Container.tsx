import { memo, Suspense, RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import styled from 'styled-components';
// eslint-disable-next-line
import { useRecoilBridgeAcrossReactRoots_UNSTABLE, useRecoilValue } from 'recoil';
import theme from '../../../themets.js';

import Loop from './Loop';
import Objects from './Objects';

import * as atoms from '../../../atoms';
import * as types from '../../../types';

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

const CanvasContainer = ({ objectsRef }: { objectsRef: RefObject<types.GameObject[]> }) => {
  console.log('--CanvasContainer');

  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE();
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
        <RecoilBridge>
          <color attach="background" args={['bisque']} />
          <Loop objectsRef={objectsRef} />
          <Suspense fallback={null}>
            <Objects objectsRef={objectsRef} />
          </Suspense>
        </RecoilBridge>
      </Canvas>
    </Container>
  );
};

export default memo(CanvasContainer);
