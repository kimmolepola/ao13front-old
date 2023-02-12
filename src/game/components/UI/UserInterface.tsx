import { memo, RefObject } from "react";
import CanvasOverlay from "./CanvasOverlay";
import Sidepanel from "./Sidepanel";

import * as types from "../../../types";

const UserInterface = ({
  quit,
  objectsRef,
}: {
  quit: Function;
  objectsRef: RefObject<types.GameObject[]>;
}) => {
  console.log("--UserInterface");

  return (
    <>
      <CanvasOverlay objectsRef={objectsRef} />
      <Sidepanel quit={quit} objectsRef={objectsRef} />
    </>
  );
};

export default memo(UserInterface);
