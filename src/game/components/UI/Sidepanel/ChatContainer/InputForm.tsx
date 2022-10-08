import {
  memo, useCallback, useState, RefObject,
} from 'react';
import styled from 'styled-components';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import theme from '../../../../../themets.js';
import * as networkingHooks from '../../../../../networking/hooks';
import * as atoms from '../../../../../atoms';
import * as types from '../../../../../types';

const Button = styled.button`
  width: 12%;
  min-width: 22px;
  ${theme.basicButton}
`;

const InputField = styled.input`
  ${theme.basicInput}
  min-width: 40px;
  flex: 1;
`;

const InputForm = styled.form`
  display: flex;
  height: 30px;
`;

const Container = styled.div``;

const ChatInputForm = ({ objectsRef }: { objectsRef: RefObject<types.GameObject[]> }) => {
  const setChatMessages = useSetRecoilState(atoms.chatMessages);
  const { sendOrdered: sendOrderedFromMain } = networkingHooks.useSendFromMain();
  const { sendOrdered: sendOrderedFromClient } = networkingHooks.useSendFromClient();
  const main = useRecoilValue(atoms.main);
  const ownId = useRecoilValue(atoms.ownId);
  const [value, setValue] = useState('');

  const onSubmit = useCallback((e: any) => {
    e.preventDefault();
    if (main) {
      if (ownId) {
        const chatMessageFromMain = {
          type: types.NetDataType.CHATMESSAGE_MAIN as types.NetDataType.CHATMESSAGE_MAIN,
          userId: ownId,
          messageId: ownId + Date.now().toString(),
          message: value,
        };
        sendOrderedFromMain(chatMessageFromMain);
        setChatMessages((x) => [
          {
            userId: ownId,
            username: objectsRef.current?.find((xx) => xx.id === ownId)?.username || '',
            messageId: chatMessageFromMain.messageId,
            message: value,
          },
          ...x]);
      }
    } else {
      sendOrderedFromClient({
        type: types.NetDataType.CHATMESSAGE_CLIENT,
        message: value,
      });
    }
    setValue('');
  }, [
    main,
    objectsRef,
    ownId,
    sendOrderedFromClient,
    sendOrderedFromMain,
    setChatMessages,
    value,
  ]);

  const onChange = useCallback((e: any) => { setValue(e.target.value); }, []);

  const onFocus = useCallback((e: any) => {
    e.target.placeholder = '';
  }, []);

  const onBlur = useCallback((e: any) => {
    e.target.placeholder = 'Input';
  }, []);

  return (
    <Container>
      <InputForm
        onSubmit={onSubmit}
        noValidate
        autoComplete="off"
      >
        <InputField
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Input"
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <Button>&#9166;</Button>
      </InputForm>
    </Container>
  );
};

export default memo(ChatInputForm);
