import { useEffect, useCallback, RefObject } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';

import * as gameHooks from '../../game/hooks';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useMain = (objectsRef: RefObject<types.GameObject[]>) => {
  console.log('--useMain');

  const channelsOrdered = useRecoilValue(atoms.channelsOrdered);
  const channelsUnordered = useRecoilValue(atoms.channelsUnordered);
  const [main, setMain] = useRecoilState(atoms.main);
  const [connectedIdsOnMain, setConnectedIdsOnMain] = useRecoilState(atoms.connectedIdsOnMain);
  const {
    handlePossiblyNewIdOnMain,
    handleNewIdsOnMain,
    handleRemoveIdsOnMain,
    handleQuitForObjectsOnMain,
  } = gameHooks.useObjectsOnMain(objectsRef);

  const onChannelsChanged = useCallback(() => {
    const actuallyConnectedIds = channelsOrdered.reduce((prev: string[], cur) => {
      if (channelsUnordered.some((x) => x.remoteId === cur.remoteId)) {
        prev.push(cur.remoteId);
      }
      return prev;
    }, []);
    const newIds = actuallyConnectedIds.reduce((prev: string[], cur) => {
      if (!connectedIdsOnMain.includes(cur)) {
        prev.push(cur);
      }
      return prev;
    }, []);
    const disconnectedIds = connectedIdsOnMain.reduce((prev: string[], cur) => {
      if (!actuallyConnectedIds.includes(cur)) {
        prev.push(cur);
      }
      return prev;
    }, []);
    if (newIds.length || disconnectedIds.length) {
      setConnectedIdsOnMain(actuallyConnectedIds);
      handleRemoveIdsOnMain(disconnectedIds);
      handleNewIdsOnMain(newIds);
    }
  }, [
    channelsOrdered,
    channelsUnordered,
    connectedIdsOnMain,
    setConnectedIdsOnMain,
    handleRemoveIdsOnMain,
    handleNewIdsOnMain,
  ]);

  useEffect(() => {
    // channels change
    if (main) {
      onChannelsChanged();
    }
  }, [main, channelsOrdered, channelsUnordered, onChannelsChanged]);

  const onReceiveMain = useCallback((id: string) => {
    setMain(true);
    handlePossiblyNewIdOnMain(id);
  }, [setMain, handlePossiblyNewIdOnMain]);

  const handleQuitOnMain = useCallback(async () => {
    await handleQuitForObjectsOnMain();
    setMain(false);
  }, [handleQuitForObjectsOnMain, setMain]);

  return { onReceiveMain, handleQuitOnMain };
};
