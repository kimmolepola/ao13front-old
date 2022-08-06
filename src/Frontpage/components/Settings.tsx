import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { updateUsername } from '../../networking/services/user.service';
import theme from '../../theme.js';

import * as atoms from '../../atoms';

const Arrow = styled.button<any>`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  cursor: pointer;
  background: none;
  border: none;
  font-family: ${theme.fontFamily};
  font-size: 50px;
  font-weight: bold;
  color: ${theme.colors.highlight1};
  position: absolute;
  bottom: 33%;
  left: 0px;
  width: 100%;
  justify-content: center;
`;

const ErrorMessage = styled.div<any>`
  max-width: 5cm;
  display: ${(props) => (props.error ? '' : 'none')};
  margin: ${theme.margins.large} 0px 0px ${theme.margins.basic};
  font-size: 12px;
  color: red;
`;

const Subtitle = styled.div`
  margin: ${theme.margins.large} ${theme.margins.basic};
  opacity: ${theme.opacity.basic};
`;

const Input = styled.input<any>`
  ${theme.basicInput}
  height: 30px;
  margin: ${theme.margins.basic};
  ${(props) => props.error && 'border-color: red;'}
`;

const Button = styled.button<any>`
  ${theme.basicButton}
  min-height: 30px;
  margin: ${theme.margins.basic};
  background-color: ${(props) => props.background || theme.colors.highlight1};
`;

const Form = styled.form<any>`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  flex-direction: column;
`;

const Container = styled.div<any>`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  flex-direction: column;
`;

const stateText = (state: any) => {
  switch (state) {
    case 'loading':
      return 'Updating...';
    case 'success':
      return 'Username updated';
    default:
      return 'Update username';
  }
};

const Settings = () => {
  const [user, setUser] = useRecoilState(atoms.user);
  const navigate = useNavigate();
  const [validation, setValidation] = useState<any>({
    dirty: false,
    state: 'open',
    update: null,
    username: null,
  });
  const [username, setUsername] = useState('');

  const resetValidation = () => {
    if (validation.dirty) {
      setValidation({
        dirty: false,
        state: 'open',
        update: null,
        username: null,
      });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newValidation = {
      dirty: true,
      state: 'open',
      update: null,
      username: (() => {
        if (username.length === 0) return 'can not be empty';
        if (username.length > 20) return 'max 20 characters';
        return null;
      })(),
    };
    if (!newValidation.username) {
      newValidation.state = 'loading';
      setValidation(newValidation);
      const { data, error } = await updateUsername(username);
      newValidation.update = error;
      newValidation.state = error ? 'open' : 'success';
      if (!error) {
        setUser(data);
        setUsername('');
      }
    }
    setValidation({ ...newValidation });
  };

  const handleArrowClick = () => {
    navigate('/');
  };

  const handleUsernameInput = (e: any) => {
    resetValidation();
    setUsername(e.target.value);
  };

  return (
    <Container show={user}>
      <Subtitle>{stateText(validation.state)}</Subtitle>
      <Arrow show={validation.state === 'success'} onClick={handleArrowClick}>
        {'\u2794'}
      </Arrow>
      <Form show={validation.state !== 'success'} onSubmit={handleSubmit}>
        <ErrorMessage error={validation.update}>
          {validation.update}
        </ErrorMessage>
        <ErrorMessage error={validation.username}>
          {validation.username}
        </ErrorMessage>
        <Input
          placeholder="new username"
          value={username}
          onChange={handleUsernameInput}
        />
        <Button type="submit">submit</Button>
      </Form>
    </Container>
  );
};

export default Settings;
