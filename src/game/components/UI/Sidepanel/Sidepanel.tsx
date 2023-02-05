import { memo, useCallback, RefObject } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import ChatContainer from './ChatContainer';
import theme from '../../../../themets.js';

import * as atoms from '../../../../atoms';
import * as types from '../../../../types';

const Text = styled.div`
  margin: ${theme.margins.basic};
  opacity: ${theme.opacity.basic};
  font-family: ${theme.fontFamily};
  font-size: 16px;
  color: ${theme.colors.highlight1};
  font-weight: bold;
  user-select: none;
`;

const Button = styled.button`
  margin-bottom: ${theme.margins.large};
  align-self: flex-end;
  font-family: ${theme.fontFamily};
  font-size: 10px;
  height: 20px;
  width: 40px;
  ${theme.basicButton}
  background-color: transparent;
  color: ${theme.colors.highlight1};
  font-weight: bold;
`;

const InfoBox = styled.div`
  margin-bottom: ${theme.margins.basic};
  color: ${theme.colors.bgMedium};
  background: white;
  padding: 2px;
  font-family: ${theme.fontFamily};
  font-size: 12px;
  border-radius: ${theme.borderRadius};
  cursor: default;
`;

const Sidepanel = ({
  quit,
  objectsRef,
}: {
  quit: Function,
  objectsRef: RefObject<types.GameObject[]>
}) => {
  console.log('--Sidepanel');

  const main = useRecoilValue(atoms.main);
  const connectedIdsOnMain = useRecoilValue(atoms.connectedIdsOnMain);
  const connectionMessage = useRecoilValue(atoms.connectionMessage);
  const score = useRecoilValue(atoms.score);

  const onClickQuit = useCallback(() => {
    quit();
  }, [quit]);

  return (
    <div className="absolute left-0 right-0 top-[70%] bottom-0 landscape:top-0 landscape:left-[80%]">
      <div className="flex flex-col">
        <div className="flex w-full justify-between">
          <Text>AO13</Text>
          <Button onClick={onClickQuit}>Quit</Button>
        </div>
        <InfoBox>
          <div>{main ? 'You are the game host' : null}</div>
          {main && <div>{`Players: ${connectedIdsOnMain.length}`}</div>}
          <div>
            {connectionMessage}
          </div>
        </InfoBox>
        <InfoBox>
          <p />
          <p />
          {score}
          <p />
          <p />
        </InfoBox>
      </div>
      <ChatContainer objectsRef={objectsRef} />
    </div>
  );
};

export default memo(Sidepanel);
