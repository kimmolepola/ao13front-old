import { memo, RefObject } from "react";

import Chat from "./Chat";
import Input from "./Input";

import * as types from "src/types";

const Container = ({
  objectsRef,
}: {
  objectsRef: RefObject<types.GameObject[]>;
}) => {
  console.log("--ChatContainer");

  return (
    <div className="flex flex-col grow">
      <Chat />
      <Input objectsRef={objectsRef} />
    </div>
  );
};

export default memo(Container);
