import { RefObject } from "react";
import { useSetRecoilState } from "recoil";

import { chatMessageTimeToLive } from "../../parameters";

import * as atoms from "../../atoms";
import * as types from "../../types";
import * as gameHooks from "../../game/hooks";

export const useReceiveOnClient = (
  objectsRef: RefObject<types.GameObject[]>
) => {
  console.log("--useReceiveOnClient");

  const setChatMessages = useSetRecoilState(atoms.chatMessages);
  const { handleUpdateData, handleStateData } =
    gameHooks.useObjectsOnClient(objectsRef);

  let mostRecentTimestamp = 0;

  const onReceive = (data: types.NetData) => {
    switch (data.type) {
      case types.NetDataType.STATE: {
        console.log("--CLIENT on receive state:", data);
        handleStateData(data);
        break;
      }
      case types.NetDataType.UPDATE: {
        if (data.timestamp > mostRecentTimestamp) {
          mostRecentTimestamp = data.timestamp;
          handleUpdateData(data);
        }
        break;
      }
      case types.NetDataType.CHATMESSAGE_MAIN: {
        const message = {
          ...data,
          username:
            (objectsRef.current || []).find((x) => x.id === data.userId)
              ?.username || "",
        };
        setChatMessages((x) => [message, ...x]);
        setTimeout(
          () => setChatMessages((x) => x.filter((xx) => xx !== message)),
          chatMessageTimeToLive
        );
        break;
      }
      default:
        break;
    }
  };
  return { onReceive };
};
