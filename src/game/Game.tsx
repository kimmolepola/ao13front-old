import {
  useRef, memo, useCallback, useMemo, useEffect,
} from 'react';
import { debounce } from 'lodash';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import * as networkingHooks from '../networking/hooks';

import Canvas from './components/Canvas';
import UserInterface from './components/UI';

import * as atoms from '../atoms';
import * as hooks from './hooks';

const Game = ({ refreshUser }: { refreshUser: Function }) => {
  const objectsRef = useRef([]);
  const setObjectsRef = useSetRecoilState(atoms.objects);
  const signalerInitialized = useRecoilValue(atoms.signalerInitialized);
  const { connect, disconnect } = networkingHooks.useConnections();

  hooks.useControls();

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
    if (!signalerInitialized) {
      connect();
    }
    setObjectsRef(objectsRef);
  }, [connect, setObjectsRef, signalerInitialized]);

  return (
    <>
      <Canvas />
      <UserInterface refreshUser={refreshUser} quit={quit} />
    </>
  );
};

export default memo(Game);
