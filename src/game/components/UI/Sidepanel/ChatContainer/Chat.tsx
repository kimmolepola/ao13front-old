import { memo } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import theme from '../../../../../themets.js';

import * as atoms from '../../../../../atoms';

const Avatar = styled.img`
  margin-left: auto;
  height: 30px;
  width: 30px;
  border-radius: ${theme.borderRadius};
`;

const Message = styled.div`
  overflow-anchor: none;
  display: flex;
  padding: 3px 3px 3px 6px;
`;

const Text = styled.div`
  margin-right: 3px;
  font-family: ${theme.fontFamily};
  font-size: 12px;
`;

const Divider = styled.hr`
  border-style: solid;
  border-color: ${theme.colors.bgVerylight} transparent
    transparent;
  margin: 0;
`;

const Container = styled.div`
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 8px ${theme.colors.bgLight};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${theme.colors.bgMedium};
    outline: 1px solid ${theme.colors.bgLight};
  }
  display: flex;
  flex-direction: column-reverse;
  max-height: calc(100% - 30px);
  overflow-y: auto;
  scrollbar-width: thin;
  background: white;
  box-shadow: ${theme.shadow};
  border: ${theme.borders.basic};
  border-radius: ${theme.borderRadius};
`;

const Chat = () => {
  console.log('--Chat');

  const chatMessages = useRecoilValue(atoms.chatMessages);
  const ownId = useRecoilValue(atoms.ownId);

  return (
    <Container>
      {chatMessages.map((x, i) => (
        <div key={x.messageId}>
          <Divider
            style={{ display: i !== chatMessages.length - 1 ? '' : 'none' }}
          />
          <Message
            style={{
              background: x.userId === ownId ? 'DarkKhaki' : 'none',
            }}
          >
            <Text>
              {x.username}
              :
              {x.message}
            </Text>
            <Avatar src="avatar.jpg" alt="Avatar" />
          </Message>
        </div>
      ))}
    </Container>
  );
};

export default memo(Chat);
