import { memo, useCallback, RefObject } from "react";
import { useRecoilValue } from "recoil";

import Chat from "./Chat";
import * as atoms from "../../../../atoms";
import * as types from "../../../../types";

const Sidepanel = ({
  quit,
  objectsRef,
}: {
  quit: Function;
  objectsRef: RefObject<types.GameObject[]>;
}) => {
  console.log("--Sidepanel");

  const main = useRecoilValue(atoms.main);
  const connectedIdsOnMain = useRecoilValue(atoms.connectedIdsOnMain);
  const connectionMessage = useRecoilValue(atoms.connectionMessage);
  const score = useRecoilValue(atoms.score);

  const onClickQuit = useCallback(() => {
    quit();
  }, [quit]);

  return (
    <div className="absolute left-0 right-0 top-[70%] bottom-0 landscape:top-0 landscape:left-[80%] flex flex-col">
      <div className="flex flex-col">
        <div className="flex w-full justify-between m-[1px]">
          <div className="text-rose-900 font-bold select-none items-center">
            AO13
          </div>
          <button
            className="text-rose-900 border-2 px-2 active:brightness-80 text-xs font-bold"
            type="button"
            onClick={onClickQuit}
          >
            Quit
          </button>
        </div>
        <div className="flex gap-1 flex-wrap text-xs p-0.5 border">
          {main && <div>You are the game host |</div>}
          {main && <div>{`Players: ${connectedIdsOnMain.length} |`}</div>}
          <div>{`${connectionMessage} |`}</div>
          <div>{`Score: ${score}`}</div>
        </div>
      </div>
      <Chat objectsRef={objectsRef} />
    </div>
  );
};

export default memo(Sidepanel);
