import {
  useEffect, useRef, memo, useCallback, useMemo,
} from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import * as networkingHooks from '../networking/hooks';

import Canvas from './components/Canvas';
import UserInterface from './components/UI';

import * as atoms from '../atoms';
import * as hooks from './hooks';

let initialized = false;

const Game = () => {
  console.log('--Game');

  const navigate = useNavigate();
  const objectsRef = useRef([]);
  const { connect, disconnect } = networkingHooks.useConnections(objectsRef);

  hooks.useControls(objectsRef);

  const setWindowHeight = useSetRecoilState(atoms.windowHeight);

  const resizeHandler = useCallback(() => {
    setWindowHeight(window.innerHeight);
  }, [setWindowHeight]);

  const debounceResizeHandler = useMemo(() => debounce(resizeHandler, 300), [resizeHandler]);
  window.onresize = debounceResizeHandler;

  const quit = useCallback(async () => {
    navigate('/');
    initialized = false;
    disconnect();
  }, [navigate, disconnect]);

  useEffect(() => {
    console.log('--game useEffect, initialized:', initialized);
    if (!initialized) {
      console.log('--initialize');
      initialized = true;
      connect();
    }
    return () => {
      console.log('--game useEffect return');
    };
  }, [connect]);

  return (
    <>
      <Canvas objectsRef={objectsRef} />
      <UserInterface quit={quit} objectsRef={objectsRef} />
    </>
  );
};

export default memo(Game);
