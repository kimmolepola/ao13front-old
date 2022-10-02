import { useEffect, useCallback } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';

import * as gameHooks from "../../game/hooks"

import * as atoms from '../../atoms';

export const useMain = () => {
  const channelsOrdered = useRecoilValue(atoms.channelsOrdered);
  const channelsUnordered = useRecoilValue(atoms.channelsUnordered);
  const [main, setMain] = useRecoilState(atoms.main);
  const connectedIds = useRecoilValue(atoms.connectedIds);
  const {
    savePlayerDataOnMain,
    handlePossiblyNewIdOnMain,
    handleNewIdsOnMain,
    handleRemoveIdsOnMain
  } = gameHooks.useObjectsOnMain();

  const onChannelsChanged = useCallback(() => {
    const actuallyConnectedIds = channelsOrdered.reduce((prev: string[], cur) => {
      if (channelsUnordered.some((x) => x.remoteId === cur.remoteId)) {
        prev.push(cur.remoteId);
      }
      return prev;
    }, []);
    const newIds = actuallyConnectedIds.reduce((prev: string[], cur) => {
      if (!connectedIds.includes(cur)) {
        prev.push(cur);
      }
      return prev;
    }, []);
    const disconnectedIds = connectedIds.reduce((prev: string[], cur) => {
      if (!actuallyConnectedIds.includes(cur)) {
        prev.push(cur);
      }
      return prev;
    }, []);
    handleRemoveIdsOnMain(disconnectedIds);
    handleNewIdsOnMain(newIds);
  }, [channelsOrdered, channelsUnordered, connectedIds]);

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

  return { onReceiveMain };
};
