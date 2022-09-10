import React, {
  useMemo, useState, useEffect, useRef,
} from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import Canvas from './components/Canvas';
import AppContext from '../context/appContext';
import connect from '../networking/peerConnection';
import { subscribeToKeyboardEvents } from './controls';
import { sendDataOnOrderedChannelsAndRelay } from '../networking/services/game.service';
import { saveGameState } from '../networking/services/gameObject.service';
import UI from './components/UI';

import * as atoms from '../atoms';

const mainUpdatePeers = (
  idsNew: any,
  main: any,
  id: any,
  objectIds: any,
  objects: any,
  connection: any,
) => {
  if (main && main === id) {
    const objectsNew: any = {};
    objectIds.current.forEach((x: any) => {
      const obj = objects.current[x];
      if (obj) {
        objectsNew[x] = {
          username: obj.username,
          score: obj.score,
          startPosition: obj.elref ? obj.elref.position.toArray() : [0, 0, 1],
          startQuaternion: obj.elref
            ? obj.elref.quaternion.toArray()
            : [0, 0, 0, 1],
          controls: obj.controls,
          controlsOverChannels: obj.controlsOverChannels,
          controlsOverRelay: obj.controlsOverRelay,
          speed: obj.speed,
          rotationSpeed: obj.rotationSpeed,
          backendPosition: obj.backendPosition,
          backendQuaternion: obj.backendQuaternion,
          keyDowns: obj.keyDowns,
        };
      }
    });
    const arg = { type: 'updateObjects', ids: idsNew, objects: objectsNew };
    sendDataOnOrderedChannelsAndRelay(arg, connection);
  }
};
const cleanup = (idsNew: any, objects: any) => {
  const objectsNew: any = {};
  idsNew.forEach((x: any) => {
    objectsNew[x] = objects.current[x];
  });
  // eslint-disable-next-line no-param-reassign
  objects.current = objectsNew;
};

const Game = ({ refreshUser }: any) => {
  console.log('--RENDER GAME');

  const user = useRecoilValue(atoms.user);
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return <div />;
  }

  const [connection, setConnection] = useState<any>();
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [connectionMessage, setConnectionMessage] = useState();
  const [main, setMain] = useState();
  const [chatMessages, setChatMessages] = useState([]);
  const [id, setId] = useState<any>();
  const [ids, setIds] = useState([]);
  const objects: any = useRef({});
  const objectIds = useRef([]);
  const text = useRef();
  const score = useRef({ value: 0, textContent: 0 });

  console.log('ids:', ids);

  const saveState = async () => {
    if (main && main === id && !id.includes('guest')) {
      const { error, data } = await saveGameState(
        objectIds.current.reduce((acc: any, cur: any) => {
          if (!cur.includes('guest_')) {
            acc.push({
              playerId: cur,
              score: objects.current[cur].score,
            });
          }
          return acc;
        }, []),
      );
      if (error) {
        console.error(error);
      }
    }
    return true;
  };

  const quit = async () => {
    if (main && main === id) {
      await saveState();
    }
    if (connection) {
      connection.disconnect();
    }
  };

  const resizeHandler = () => {
    setWindowHeight(window.innerHeight);
  };

  const debounceResizeHandler = useMemo(() => debounce(resizeHandler, 300), []);

  window.onresize = debounceResizeHandler;

  useEffect(() => {
    cleanup(ids, objects);
    mainUpdatePeers(ids, main, id, objectIds, objects, connection);
  }, [ids]);

  useEffect(() => {
    let unsubscribe: any;
    if (id) {
      unsubscribe = subscribeToKeyboardEvents({
        id,
        objects,
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    setConnection(
      connect({
        objects,
        objectIds,
        user,
        setConnectionMessage,
        setIds,
        setId,
        setChatMessages,
        setMain,
      }),
    );
    return () => {
      quit();
    };
  }, []);

  const contextValue: any = useMemo(() => ({
    connection,
    username: user.username,
    refreshUser,
    quit,
    score,
    windowHeight,
    objects,
    main,
    ids,
    connectionMessage,
    setChatMessages,
    chatMessages,
    id,
    text,
  }), [connection,
    user.username,
    refreshUser,
    quit,
    score,
    windowHeight,
    objects,
    main,
    ids,
    connectionMessage,
    setChatMessages,
    chatMessages,
    id,
    text,
  ]);

  return (
    <>
      <Canvas
        connection={connection}
        score={score}
        windowHeight={windowHeight}
        ids={ids}
        main={main}
        id={id}
        objectIds={objectIds}
        objects={objects}
        text={text}
      />
      <AppContext.Provider
        value={contextValue}
      >
        <UI />
      </AppContext.Provider>
    </>
  );
};

export default Game;
