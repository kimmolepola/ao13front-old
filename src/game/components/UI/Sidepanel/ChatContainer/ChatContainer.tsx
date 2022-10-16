import { memo, RefObject } from 'react';
import styled from 'styled-components';

import theme from '../../../../../themets.js';

import Chat from './Chat';
import InputForm from './InputForm';

import * as types from '../../../../../types';

const Container = styled.div`
  background: ${theme.colors.bgVerylight};
  box-shadow: ${theme.shadow};
  border: ${theme.borders.basic};
  border-radius: ${theme.borderRadius};
  display: flex;
  flex-direction: column-reverse;
  height: 65%;
`;

const ChatContainer = ({ objectsRef }: { objectsRef: RefObject<types.GameObject[]> }) => {
  console.log('--ChatContainer');

  return (
    <Container>
      <InputForm objectsRef={objectsRef} />
      <Chat />
    </Container>
  );
};

export default memo(ChatContainer);
