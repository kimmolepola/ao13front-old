import { memo, useCallback, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from "recoil";

import ChatContainer from './ChatContainer';
import appContext from '../../../../context/appContext';
import theme from '../../../../themets.js';

import * as atoms from "../../../../atoms";

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

const Container = styled.div<any>`
  position: absolute;
  top: calc(
    ${(props) => props.windowHeight}px -
      min(
        ${theme.sidepanelMaxWidth},
        ${(props) => (props.windowHeight / 100) * theme.sidepanelWidthPercent}px
      )
  );
  right: 0px;
  bottom: 0px;
  left: 0px;
  @media (min-width: ${theme.mobileWidth}px) {
    top: 0px;
    left: calc(
      100vw - min(${theme.sidepanelMaxWidth}, ${theme.sidepanelWidthPercent}vw)
    );
  }
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3px;
  background: ${theme.colors.bgMain};
`;

const Sidepanel = ({ refreshUser, quit }: { refreshUser: Function, quit: Function }) => {
  const navigate = useNavigate();
  const windowHeight = useRecoilValue(atoms.windowHeight);
  const main = useRecoilValue(atoms.main)
  const connectedIds = useRecoilValue(atoms.connectedIds)
  const connectionMessage = useRecoilValue(atoms.connectionMessage)
  const score = useRecoilValue(atoms.score);

  const handleQuit = useCallback(() => {
    quit();
    navigate('/');
    setTimeout(refreshUser, 2500);
  }, [quit, navigate, refreshUser]);

  return (
    <Container windowHeight={windowHeight}>
      <div className="flex flex-col">
        <div className="flex w-full justify-between">
          <Text>AO13</Text>
          <Button onClick={handleQuit}>Quit</Button>
        </div>
        <InfoBox>
          <div>{main ? 'You are the game host' : null}</div>
          <div>{`Players: ${connectedIds.length}`}</div>
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
      <ChatContainer />
    </Container>
  );
};

export default memo(Sidepanel);
