import { memo, useMemo, useCallback } from 'react';
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

const Infotext = styled.div<any>`
  display: ${(props) => (props.show ? '' : 'none')};
  padding: 5px;
  background: rgba(255, 255, 255, 0.75);
  white-space: pre-line;
  position: absolute;
  left: 20px;
  top: 20px;
  font-family: ${theme.fontFamily};
  font-size: 12px;
`;

const ControlsContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  @media (min-width: ${theme.mobileWidth}px) {
    display: none;
  }
`;

const Controls = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
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
  margin: 2mm 7mm 4mm 7mm;
  width: 1cm;
  height: 1cm;
  background: transparent;
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Likely future */
`;

const Container = styled.div<any>`
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: min(
    ${theme.sidepanelMaxWidth},
    ${(props) => (props.windowHeight / 100) * theme.sidepanelWidthPercent}px
  );
  left: 0px;
  @media (min-width: ${theme.mobileWidth}px) {
    right: min(${theme.sidepanelMaxWidth}, ${theme.sidepanelWidthPercent}vw);
    bottom: 0px;
  }
  display: flex;
`;

const ObjectInfo = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.02s;
  font-family: ${theme.fontFamily};
  font-size: 11px;
`;

const ObjectInfos = () => {
  const ownId = useRecoilValue(atoms.ownId);
  const objects = useRecoilValue(atoms.objects);

  return (
    <>
      {Object.entries(objects.current || []).reduce((acc: any, [id, object]) => {
        const o = object;
        if (id !== ownId) {
          acc.push(
            <ObjectInfo
              key={id}
              ref={(ref) => {
                o.infoRef = ref;
              }}
            />,
          );
        }
        return acc;
      }, [])}
    </>
  );
};

const ControlButton = ({ control }: { control: types.Keys }) => {
  const ownId = useRecoilValue(atoms.ownId);
  const objects = useRecoilValue(atoms.objects);

  const onPressed = useCallback(() => {
    handlePressed(control, ownId, objects);
  }, [control, ownId, objects]);

  const onReleased = useCallback(() => {
    handleReleased(control, ownId, objects);
  }, [control, ownId, objects]);

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

const CanvasOverlay = () => {
  const windowHeight = useRecoilValue(atoms.windowHeight);
  const connectedIds = useRecoilValue(atoms.connectedIds);
  const overlayInfotext = useRecoilValue(atoms.overlayInfotext);

  return (
    <Container windowHeight={windowHeight}>
      <ObjectInfos />
      <Connecting show={!connectedIds.length}>Connecting...</Connecting>
      <Infotext show={connectedIds.length} ref={overlayInfotext} />
      <ControlsContainer>
        <Controls>
          <ControlButton control={types.Keys.LEFT} />
          <ButtonGroup>
            <ControlButton control={types.Keys.UP} />
            <ControlButton control={types.Keys.DOWN} />
          </ButtonGroup>
          <ControlButton control={types.Keys.RIGHT} />
        </Controls>
      </ControlsContainer>
    </Container>
  );
};

export default memo(CanvasOverlay);
