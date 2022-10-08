import {
  useRef, memo, useCallback, useMemo, useEffect,
} from 'react';
import { debounce } from 'lodash';
import { useSetRecoilState } from 'recoil';

import * as networkingHooks from '../networking/hooks';

import Canvas from './components/Canvas';
import UserInterface from './components/UI';

import * as atoms from '../atoms';
import * as hooks from './hooks';

const Game = ({ refreshUser }: { refreshUser: Function }) => {
  const stateRef = useRef({ initialized: false });
  const objectsRef = useRef([]);
  const { connect, disconnect } = networkingHooks.useConnections(objectsRef);

  hooks.useControls(objectsRef);

  const setWindowHeight = useSetRecoilState(atoms.windowHeight);

  const resizeHandler = useCallback(() => {
    setWindowHeight(window.innerHeight);
  }, [setWindowHeight]);

  const debounceResizeHandler = useMemo(() => debounce(resizeHandler, 300), [resizeHandler]);
  window.onresize = debounceResizeHandler;

  const quit = useCallback(() => {
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    if (stateRef.current && !stateRef.current.initialized) {
      stateRef.current.initialized = true;
      connect();
    }
  }, [stateRef, connect]);

  return (
    <>
      <Canvas objectsRef={objectsRef} />
      <UserInterface refreshUser={refreshUser} quit={quit} objectsRef={objectsRef} />
    </>
  );
};

export default memo(Game);
