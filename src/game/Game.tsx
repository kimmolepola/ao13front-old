import {
  useRef, memo, useCallback, useMemo, useEffect,
} from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import * as networkingHooks from '../networking/hooks';

import Canvas from './components/Canvas';
import UserInterface from './components/UI';

import * as atoms from '../atoms';
import * as hooks from './hooks';

const Game = () => {
  const navigate = useNavigate();
  const stateRef = useRef({ initialized: false });
  const objectsRef = useRef([]);
  const { connect, disconnect } = networkingHooks.useConnections(objectsRef);

  hooks.useControls(objectsRef);

  const setWindowHeight = useSetRecoilState(atoms.windowHeight);
  const user = useRecoilValue(atoms.user);

  const resizeHandler = useCallback(() => {
    setWindowHeight(window.innerHeight);
  }, [setWindowHeight]);

  const debounceResizeHandler = useMemo(() => debounce(resizeHandler, 300), [resizeHandler]);
  window.onresize = debounceResizeHandler;

  // useEffect(() => { console.log('--navigate:', navigate); }, [navigate]);

  // useEffect(() => { console.log('--stateRef:', stateRef); }, [stateRef]);

  // useEffect(() => { console.log('--objectsRef', objectsRef); }, [objectsRef]);

  // useEffect(() => { console.log('--connect:', connect); }, [connect]);

  // useEffect(() => { console.log('--disconnect:', disconnect); }, [disconnect]);

  // useEffect(() => { console.log('--user:', user); }, [user]);

  // useEffect(() => { console.log('--resizeHandler:', resizeHandler); }, [resizeHandler]);

  // useEffect(() => { console.log('--debounceResizeHandler:', debounceResizeHandler); }, [debounceResizeHandler]);

  const quit = useCallback(async () => {
    await disconnect();
    console.log('--QUIT USER:', user);
    navigate('/');
  }, [disconnect, navigate, user]);

  useEffect(() => {
    if (stateRef.current && !stateRef.current.initialized) {
      stateRef.current.initialized = true;
      connect();
    }
  }, [stateRef, connect]);

  return (
    <>
      <Canvas objectsRef={objectsRef} />
      <UserInterface quit={quit} objectsRef={objectsRef} />
    </>
  );
};

export default memo(Game);
