import React, { useContext } from 'react';
import styled from 'styled-components';
import theme from '../../../../../themets.js';
import appContext from '../../../../../context/appContext';

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
  const { chatMessages, id }: any = useContext(appContext);

  return (
    <Container>
      {chatMessages.map((x: any, index: any) => (
        <div key={x.chatMessageId}>
          <Divider
            style={{ display: index !== chatMessages.length - 1 ? '' : 'none' }}
          />
          <Message
            style={{
              background: x.userId === id ? 'DarkKhaki' : 'none',
            }}
          >
            <Text>
              {x.username}
              :
              {x.chatMessage}
            </Text>
            <Avatar src="avatar.jpg" alt="Avatar" />
          </Message>
        </div>
      ))}
    </Container>
  );
};

export default Chat;