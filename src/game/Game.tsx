import { memo, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import * as networkingHooks from "../networking/hooks"

import Canvas from './components/Canvas';
import UserInterface from './components/UI';

import * as atoms from '../atoms';
import * as hooks from "./hooks";

const Container = ({ refreshUser }: { refreshUser: Function }) => {
  const { connect, disconnect } = networkingHooks.useConnections();
  hooks.useControls();


  const setWindowHeight = useSetRecoilState(atoms.windowHeight);

  const resizeHandler = () => {
    setWindowHeight(window.innerHeight);
  };

  const debounceResizeHandler = useMemo(() => debounce(resizeHandler, 300), [debounce]);
  window.onresize = debounceResizeHandler;

  const quit = useCallback(() => {
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    connect();
    return () => {
      quit();
    };
  }, [connect, quit]);


  return (
    <>
      <Canvas />
      <UserInterface refreshUser={refreshUser} quit={quit} />
    </>
  );
};

export default memo(Container);
