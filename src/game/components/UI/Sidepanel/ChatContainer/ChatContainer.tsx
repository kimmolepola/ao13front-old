import { memo } from 'react';
import styled from 'styled-components';

import theme from '../../../../../themets.js';

import Chat from './Chat';
import InputForm from './InputForm';

const Container = styled.div`
  background: ${theme.colors.bgVerylight};
  box-shadow: ${theme.shadow};
  border: ${theme.borders.basic};
  border-radius: ${theme.borderRadius};
  display: flex;
  flex-direction: column-reverse;
  height: 65%;
`;

const ChatContainer = () => (
  <Container>
    <InputForm />
    <Chat />
  </Container>
);

export default memo(ChatContainer);
