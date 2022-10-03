import { memo, useCallback, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { setToken, login } from '../../networking/services/auth.service';

import * as theme from '../../theme';
import * as atoms from '../../atoms';
import * as types from '../types';
import * as hooks from '../hooks';

const Login = () => {
  const setUser = useSetRecoilState(atoms.user);
  const navigate = useNavigate();
  const [validation, setValidation, resetValidation] = hooks.useValidation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const newValidation = {
      dirty: true,
      state: types.ValidationState.OPEN,
      login: undefined,
      username: username.length ? undefined : 'Required',
      password: password.length ? undefined : 'Required',
    };
    if (!newValidation.username && !newValidation.password) {
      newValidation.state = types.ValidationState.LOADING;
      setValidation(newValidation);
      const { data, error } = await login({ username, password });
      newValidation.login = error;
      newValidation.state = types.ValidationState.OPEN;
      if (!error) {
        setUser(data);
        setToken(data.token);
        setUsername('');
        if (rememberMe) {
          localStorage.setItem('loggedAo13User', JSON.stringify(data));
        }
      }
    }
    setPassword('');
    setValidation({ ...newValidation });
  };

  const onChangeUsername = useCallback((e: any) => {
    resetValidation();
    setUsername(e.target.value);
  }, [resetValidation]);

  const onChangePassword = useCallback((e: any) => {
    resetValidation();
    setPassword(e.target.value);
  }, [resetValidation]);

  const onChangeRememberMe = useCallback((e: any) => {
    setRememberMe(e.target.checked);
  }, []);

  const onClickSignUp = useCallback(() => { navigate('/signup'); }, [navigate]);

  return (
    <div className={theme.cContainerPage}>
      {validation.login && <div className={theme.cValidationError}>{validation.login}</div>}
      <form onSubmit={onSubmit} className={theme.cForm}>
        {validation.username && <div className={theme.cValidationError}>{validation.username}</div>}
        <input
          className={theme.cInput(validation.username)}
          autoCapitalize="none"
          onChange={onChangeUsername}
          value={username}
          placeholder="username or email"
        />
        {validation.password && <div className={theme.cValidationError}>{validation.password}</div>}
        <input
          className={theme.cInput(validation.password)}
          type="password"
          onChange={onChangePassword}
          value={password}
          placeholder="password"
        />
        <button
          className={theme.cButtonRose}
          disabled={validation.state === types.ValidationState.LOADING}
          type="submit"
        >
          Sign in
        </button>
        <label className="flex gap-1 cursor-pointer select-none">
          <input type="checkbox" checked={rememberMe} onChange={onChangeRememberMe} />
          Remember me
        </label>
      </form>
      <Link
        to="/forgottenpassword"
      >
        Forgotten password?
      </Link>
      <button
        className={theme.cButtonOrange}
        type="button"
        onClick={onClickSignUp}
      >
        Sign up
      </button>
    </div>
  );
};

export default memo(Login);
