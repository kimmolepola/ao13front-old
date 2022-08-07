import {
  memo, useCallback, useEffect, useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { signup } from '../../networking/services/auth.service';

import * as theme from '../../theme';
import * as atoms from '../../atoms';
import * as types from '../types';
import * as hooks from '../hooks';

const SignUp = () => {
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(atoms.user);
  const [validation, setValidation, resetValidation] = hooks.useValidation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [navigate, user]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const newValidation = {
      dirty: true,
      state: types.ValidationState.OPEN,
      create: undefined,
      email: email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        ? undefined
        : 'Invalid email address',
      password: password !== '' ? undefined : 'Invalid password',
      repeatPassword: password === repeatPassword ? undefined : 'Password mismatch',
    };
    if (
      !newValidation.email
      && !newValidation.password
      && !newValidation.repeatPassword
    ) {
      newValidation.state = types.ValidationState.LOADING;
      setValidation(newValidation);
      const { data, error } = await signup({ email, password });
      newValidation.create = error;
      newValidation.state = types.ValidationState.OPEN;
      if (!error) {
        setUser(data);
      }
    }
    setPassword('');
    setRepeatPassword('');
    setValidation({ ...newValidation });
  };

  const onChangeEmail = useCallback((e: any) => {
    resetValidation();
    setEmail(e.target.value);
  }, [resetValidation]);

  const onChangePassword = useCallback((e: any) => {
    resetValidation();
    setPassword(e.target.value);
  }, [resetValidation]);

  const onChangeRepeatPassword = useCallback((e: any) => {
    resetValidation();
    setRepeatPassword(e.target.value);
  }, [resetValidation]);

  return (
    <div className={theme.cContainerPage}>
      {validation.state !== types.ValidationState.LOADING ? 'Create account' : 'Creating...'}
      <form onSubmit={onSubmit} className={theme.cForm}>
        {validation.create && <div className={theme.cValidationError}>{validation.create}</div>}
        {validation.email && <div className={theme.cValidationError}>{validation.email}</div>}
        <input
          className={theme.cInput(validation.email)}
          onChange={onChangeEmail}
          value={email}
          placeholder="email"
        />
        {validation.password && <div className={theme.cValidationError}>{validation.password}</div>}
        <input
          className={theme.cInput(validation.password)}
          onChange={onChangePassword}
          type="password"
          value={password}
          placeholder="password"
        />
        {validation.repeatPassword
          && (
            <div className={theme.cValidationError}>
              {validation.repeatPassword}
            </div>
          )}
        <input
          className={theme.cInput(validation.repeatPassword)}
          onChange={onChangeRepeatPassword}
          type="password"
          value={repeatPassword}
          placeholder="repeat password"
        />
        <button
          disabled={validation.state === types.ValidationState.LOADING}
          type="submit"
          className={theme.cButtonOrange}
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default memo(SignUp);
