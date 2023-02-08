import {
  memo, useMemo, useCallback, RefObject,
} from 'react';
import { useRecoilValue } from 'recoil';
import {
  TfiArrowCircleLeft, TfiArrowCircleRight, TfiArrowCircleUp, TfiArrowCircleDown,
} from "react-icons/tfi";

import { handlePressed, handleReleased } from '../../controls';

import * as atoms from '../../../atoms';
import * as types from '../../../types';

const InfoElements = ({ objectsRef, ownId }: { objectsRef: RefObject<types.GameObject[]>; ownId: string | undefined }) => (
  Object.entries(objectsRef.current || []).reduce((acc: any, [id, object]) => {
    const o = object;
    if (id !== ownId) {
      acc.push(
        <div
          key={id}
          ref={(element) => {
            o.infoElement = element;
          }}
          className="absolute text-white text-xs -translate-x-1/2"
        />,
      );
    }
    return acc;
  }, [])
);

const InfoBox = ({ visible, objectsRef, ownId }: { visible: boolean, objectsRef: RefObject<types.GameObject[]>; ownId: string | undefined }) => (
  visible ? (
    <div
      className="absolute left-5 top-5 w-20 bg-white opacity-80 whitespace-pre-line px-1 py-0.5 text-xs"
      ref={(element: HTMLDivElement) => {
        const ownObject = objectsRef.current?.find((x) => x.id === ownId);
        if (ownObject) {
          ownObject.infoBoxElement = element;
        }
      }}
    />
  ) : null
);

const Connecting = ({ visible }: { visible: boolean }) => (
  visible ? (
    <div className="w-full h-full flex justify-center items-center">
      <div className="bg-red-100 w-1/2 h-1/4 flex justify-center items-center">Connecting...</div>
    </div>
  ) : null
);

const ControlButton = ({
  control,
  objectsRef,
}: {
  control: types.Keys,
  objectsRef: RefObject<types.GameObject[]>,
}) => {
  const ownId = useRecoilValue(atoms.ownId);

  const onPressed = useCallback(() => {
    handlePressed(control, ownId, objectsRef);
  }, [control, ownId, objectsRef]);

  const onReleased = useCallback(() => {
    handleReleased(control, ownId, objectsRef);
  }, [control, ownId, objectsRef]);

  const symbol = useMemo(() => {
    switch (control) {
      case types.Keys.LEFT:
        return <TfiArrowCircleLeft />;
      case types.Keys.RIGHT:
        return <TfiArrowCircleRight />;
      case types.Keys.UP:
        return <TfiArrowCircleUp />;
      case types.Keys.DOWN:
        return <TfiArrowCircleDown />;
      default:
        return null;
    }
  }, [control]);

  return (
    <button
      className="text-red-900 text-[40px]"
      type="button"
      onTouchStart={onPressed}
      onTouchEnd={onReleased}
      onMouseDown={onPressed}
      onMouseUp={onReleased}
    >
      {symbol}
    </button>
  );
};

const ControlButtons = ({ objectsRef }: { objectsRef: RefObject<types.GameObject[]> }) => (
  <div className="landscape:hidden absolute left-0 right-0 bottom-8 flex flex-col items-center">
    <ControlButton control={types.Keys.UP} objectsRef={objectsRef} />
    <div className="w-full flex justify-evenly">
      <ControlButton control={types.Keys.LEFT} objectsRef={objectsRef} />
      <ControlButton control={types.Keys.RIGHT} objectsRef={objectsRef} />
    </div>
    <ControlButton control={types.Keys.DOWN} objectsRef={objectsRef} />
  </div>
);

const CanvasOverlay = ({ objectsRef }: { objectsRef: RefObject<types.GameObject[]> }) => {
  console.log('--CanvasOverlay');

  const channelsOrdered = useRecoilValue(atoms.channelsOrdered);
  const channelsUnordered = useRecoilValue(atoms.channelsUnordered);
  const main = useRecoilValue(atoms.main);
  const ownId = useRecoilValue(atoms.ownId);
  const connectedToMain = Boolean(main || (channelsOrdered.length && channelsUnordered.length));

  return (
    <div className="absolute left-0 right-0 top-0 bottom-[30%] landscape:right-[20%] landscape:bottom-0 z-10">
      <InfoElements objectsRef={objectsRef} ownId={ownId} />
      <Connecting visible={!connectedToMain} />
      <InfoBox visible={connectedToMain} objectsRef={objectsRef} ownId={ownId} />
      <ControlButtons objectsRef={objectsRef} />
    </div>
  );
};

export default memo(CanvasOverlay);
