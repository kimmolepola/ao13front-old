import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import theme from '../../theme';
import { guestLogin, login } from '../../networking/services/auth.service';

const ErrorMessage = styled.div<any>`
  max-width: 5cm;
  display: ${(props) => (props.error ? '' : 'none')};
  margin: ${theme.margins.large} 0px 0px ${theme.margins.basic};
  font-size: 12px;
  color: red;
`;

const Line = styled.div`
  margin: 20px ${theme.margins.basic} 20px ${theme.margins.basic};
  border-top: ${theme.borders.basic};
  height: 1px;
`;

const ClickableText = styled.button`
  color: ${(props) => props.color};
  cursor: pointer;
  background: none;
  border: none;
  margin: ${theme.margins.large};
`;

const Button = styled.button<any>`
  ${theme.basicButton}
  min-height: 30px;
  margin: ${theme.margins.basic};
  background-color: ${(props) => props.background || theme.colors.elementHighlights.button1};
`;

const Input = styled.input<any>`
  ${theme.basicInput}
  height: 30px;
  margin: ${theme.margins.basic};
  ${(props) => props.error && 'border-color: red;'}
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div<any>`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  flex-direction: column;
`;

const Login = ({ user, setUser, history }: any) => {
  const navigate = useNavigate();
  const [validation, setValidation] = useState<any>({
    dirty: false,
    state: 'open',
    login: null,
    username: null,
    password: null,
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const resetValidation = () => {
    if (validation.dirty) {
      setValidation({
        dirty: false,
        state: 'open',
        login: null,
        username: null,
        password: null,
      });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newValidation = {
      dirty: true,
      state: 'open',
      login: null,
      username: username.length ? null : 'required',
      password: password.length ? null : 'required',
    };
    if (!newValidation.username && !newValidation.password) {
      newValidation.state = 'loading';
      setValidation(newValidation);
      const { data, error } = await login({ username, password });
      newValidation.login = error;
      newValidation.state = 'open';
      if (!error) {
        setUser(data);
        setUsername('');
      }
    }
    setPassword('');
    setValidation({ ...newValidation });
  };

  const handleUsernameInput = (e: any) => {
    resetValidation();
    setUsername(e.target.value);
  };

  const handlePasswordInput = (e: any) => {
    resetValidation();
    setPassword(e.target.value);
  };

  const handleForgottenPasswordClick = () => {
    navigate('/forgottenpassword');
  };

  const handleCreateAccountClick = () => {
    navigate('/createaccount');
  };

  const handleGuestClick = async () => {
    const { data, error } = await guestLogin();
    console.log('--guest login, data:', data);
    if (!error) {
      setUser(data);
    }
  };

  return (
    <Container show={!user}>
      <ErrorMessage error={validation.login}>{validation.login}</ErrorMessage>
      <Form onSubmit={handleSubmit}>
        <ErrorMessage error={validation.username}>
          {validation.username}
        </ErrorMessage>
        <Input
          autoCapitalize="none"
          error={validation.username}
          onChange={handleUsernameInput}
          value={username}
          placeholder="username or email"
        />
        <ErrorMessage error={validation.password}>
          {validation.password}
        </ErrorMessage>
        <Input
          type="password"
          error={validation.password}
          onChange={handlePasswordInput}
          value={password}
          placeholder="password"
        />
        <Button disabled={validation.state === 'loading'} type="submit">
          Log in
        </Button>
      </Form>
      <ClickableText
        color={theme.colors.elementHighlights.button1}
        onClick={handleForgottenPasswordClick}
      >
        Forgotten password?
      </ClickableText>
      <Line>&nbsp;</Line>
      <Button
        background={theme.colors.elementHighlights.button2}
        onClick={handleCreateAccountClick}
      >
        Create account
      </Button>
      <ClickableText
        color={theme.colors.elementHighlights.button1}
        onClick={handleGuestClick}
      >
        Sign in as a guest
      </ClickableText>
      <div style={{ marginTop: '1cm', maxWidth: '5cm' }}>
        for demo use please use
        {' '}
        <br />
        username: demo
        {' '}
        <br />
        password: demo
        <br />
      </div>
    </Container>
  );
};

export default Login;
