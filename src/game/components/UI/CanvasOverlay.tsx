import {
  memo, useMemo, useCallback, RefObject, useEffect,
} from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import theme from '../../../themets.js';
import { handlePressed, handleReleased } from '../../controls';

import * as atoms from '../../../atoms';
import * as types from '../../../types';

const Connecting = styled.div<any>`
  position: absolute;
  top: max(calc(50% - 75px), 0px);
  right: max(calc(50% - 150px), 0px);
  bottom: max(calc(50% - 75px), 0px);
  left: max(calc(50% - 150px), 0px);
  background: ${theme.colors.bgVerylight};
  display: ${(props) => (props.show ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  transition: transform 3s;
`;

const Button = styled.button`
  padding: 0px;
  display: flex;
  opacity: 85%;
  color: ${theme.colors.highlight1};
  border-color: ${theme.colors.highlight1};
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border-radius: 50%;
  border-width: 3px;
  margin: 2mm 7mm 4mm 7mm;
  width: 1cm;
  height: 1cm;
  background: transparent;
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Likely future */
`;

const InfoElement = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.02s;
  font-family: ${theme.fontFamily};
  font-size: 11px;
  color: white;
`;

const InfoElements = ({ objectsRef }: { objectsRef: RefObject<types.GameObject[]> }) => {
  const ownId = useRecoilValue(atoms.ownId);

  return (
    <>
      {Object.entries(objectsRef.current || []).reduce((acc: any, [id, object]) => {
        const o = object;
        if (id !== ownId) {
          acc.push(
            <InfoElement
              key={id}
              ref={(element) => {
                o.infoElement = element;
              }}
            />,
          );
        }
        return acc;
      }, [])}
    </>
  );
};

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
      case types.Keys.UP:
        return '\u2191';
      case types.Keys.DOWN:
        return '\u2193';
      case types.Keys.LEFT:
        return '\u2190';
      case types.Keys.RIGHT:
        return '\u2192';
      default:
        return null;
    }
  }, [control]);

  return (
    <Button
      onTouchStart={onPressed}
      onTouchEnd={onReleased}
      onMouseDown={onPressed}
      onMouseUp={onReleased}
    >
      {symbol}
    </Button>
  );
};

const InfoBox = ({ objectsRef, ownId }: { objectsRef: RefObject<types.GameObject[]>; ownId: string | undefined }) => (
  <div
    className="absolute left-5 top-5 w-20 bg-white opacity-80 whitespace-pre-line px-1 py-0.5 text-xs"
    ref={(element: HTMLDivElement) => {
      const ownObject = objectsRef.current?.find((x) => x.id === ownId);
      if (ownObject) {
        ownObject.infoBoxElement = element;
      }
    }}
  />
);

const ControlButtons = ({ objectsRef }: { objectsRef: RefObject<types.GameObject[]> }) => (
  <div className="landscape:hidden absolute left-0 right-0 bottom-0 flex flex-col items-center">
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

  //  const connectedIds = useRecoilValue(atoms.connectedIdsOnMain);
  const channelsOrdered = useRecoilValue(atoms.channelsOrdered);
  const channelsUnordered = useRecoilValue(atoms.channelsUnordered);
  const objectIds = useRecoilValue(atoms.objectIds);
  const main = useRecoilValue(atoms.main);
  const ownId = useRecoilValue(atoms.ownId);

  useEffect(() => {
    // re-render after updated objectsRef.current
  }, [objectIds]);

  return (
    <div className="absolute left-0 right-0 top-0 bottom-[30%] landscape:right-[20%] landscape:bottom-0 z-10">
      <InfoElements objectsRef={objectsRef} />
      <Connecting show={!main && (!channelsOrdered.length || !channelsUnordered.length)}>Connecting...</Connecting>
      {Boolean(main || (channelsOrdered.length && channelsUnordered.length)) && (
        <InfoBox objectsRef={objectsRef} ownId={ownId} />
      )}
      <ControlButtons objectsRef={objectsRef} />
    </div>
  );
};

export default memo(CanvasOverlay);
