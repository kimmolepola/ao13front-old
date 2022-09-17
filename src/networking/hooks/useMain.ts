import { useEffect, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

import * as atoms from '../../atoms';

export const useMain = () => {
  const setMain = useSetRecoilState(atoms.main);
  const channelsOrdered = useRecoilValue(atoms.channelsOrdered);
  const channelsUnordered = useRecoilValue(atoms.channelsUnordered);
  const [connectedIds, setConnectedIds] = useRecoilState(atoms.connectedIds);
  const [objectIds, setObjectIds] = useRecoilState(atoms.objectIds);

  const mainUpdatePeers = useCallback(() => {
    console.log('--updatePeers');
  }, []);

  const handleNewId = useCallback(async (newId: string) => {
    if (!objectIds.includes(newId)) {
      setObjectIds([...objectIds, newId]);
      // CREATE OBJECT HERE ?
      // const { data } = await getGameObject(newId);
      // if (data && objects.current) {
      // objects.current[newId] = data;
      // }
    }
  }, [objectIds, setObjectIds]);

  const onReceiveMain = useCallback((id: string) => {
    setMain(true);
    handleNewId(id);
  }, [setMain, handleNewId]);

  const handleNewIds = useCallback((ids: string[]) => { }, []);

  const handleDisconectedIds = useCallback((ids: string[]) => { }, []);

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
    handleNewIds(newIds);
    handleDisconectedIds(disconnectedIds);
  }, [channelsOrdered, channelsUnordered, connectedIds, handleNewIds, handleDisconectedIds]);

  useEffect(() => {
    onChannelsChanged();
  }, [channelsOrdered, channelsUnordered, onChannelsChanged]);

  return { onReceiveMain };
};
