import {
  FormEvent,
  ChangeEvent,
  FocusEvent,
  memo,
  RefObject,
  useCallback,
  useState,
} from "react";
import { AiOutlineEnter } from "react-icons/ai";
import { useRecoilValue, useSetRecoilState } from "recoil";
import clsx from "clsx";

import * as parameters from "src/parameters";
import * as theme from "src/theme";
import * as atoms from "src/atoms";
import * as networkingHooks from "src/networking/hooks";
import * as types from "src/types";

const Input = ({
  objectsRef,
}: {
  objectsRef: RefObject<types.GameObject[]>;
}) => {
  console.log("--InputForm");

  const setChatMessages = useSetRecoilState(atoms.chatMessages);
  const { sendOrdered: sendOrderedFromMain } =
    networkingHooks.useSendFromMain();
  const { sendOrdered: sendOrderedFromClient } =
    networkingHooks.useSendFromClient();
  const main = useRecoilValue(atoms.main);
  const ownId = useRecoilValue(atoms.ownId);
  const [value, setValue] = useState("");

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (main) {
        if (ownId) {
          const message = {
            id: ownId + Date.now().toString(),
            text: value,
            userId: ownId,
            username:
              objectsRef.current?.find((xx) => xx.id === ownId)?.username || "",
          };
          const chatMessageFromMain = {
            type: types.NetDataType
              .CHATMESSAGE_MAIN as types.NetDataType.CHATMESSAGE_MAIN,
            id: message.id,
            text: message.text,
            userId: message.userId,
          };
          sendOrderedFromMain(chatMessageFromMain);
          setChatMessages((x) => [message, ...x]);
          setTimeout(
            () => setChatMessages((x) => x.filter((xx) => xx !== message)),
            parameters.chatMessageTimeToLive
          );
        }
      } else {
        sendOrderedFromClient({
          type: types.NetDataType.CHATMESSAGE_CLIENT,
          text: value,
        });
      }
      setValue("");
    },
    [
      main,
      objectsRef,
      ownId,
      sendOrderedFromClient,
      sendOrderedFromMain,
      setChatMessages,
      value,
    ]
  );

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const onFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = "";
  }, []);

  const onBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = "Input";
  }, []);

  return (
    <form
      className="flex mb-0.5"
      onSubmit={onSubmit}
      noValidate
      autoComplete="off"
    >
      <input
        className={clsx(theme.cInput, "w-[unset] grow")}
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Input"
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <button
        className={clsx(theme.cButton, "w-8 flex justify-center items-center")}
        type="submit"
        aria-label="submit"
      >
        <AiOutlineEnter />
      </button>
    </form>
  );
};

export default memo(Input);
