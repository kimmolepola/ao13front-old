import {
  memo, useCallback, useMemo,
} from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import Canvas from './components/Canvas';
import UserInterface from './components/UI';

import * as atoms from '../atoms';
import * as hooks from './hooks';

const Game = ({ objectsRef }: { objectsRef: any }) => {
  console.log('--Game');

  const navigate = useNavigate();

  hooks.useControls(objectsRef);

  const setWindowHeight = useSetRecoilState(atoms.windowHeight);

  const resizeHandler = useCallback(() => {
    setWindowHeight(window.innerHeight);
  }, [setWindowHeight]);

  const debounceResizeHandler = useMemo(() => debounce(resizeHandler, 300), [resizeHandler]);
  window.onresize = debounceResizeHandler;

  const quit = useCallback(async () => {
    navigate('/');
  }, [navigate]);

  return (
    <>
      <Canvas objectsRef={objectsRef} />
      <UserInterface quit={quit} objectsRef={objectsRef} />
    </>
  );
};

export default memo(Game);
