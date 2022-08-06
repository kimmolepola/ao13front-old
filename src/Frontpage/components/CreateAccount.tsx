import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { signup } from '../../networking/services/auth.service';

import * as atoms from '../../atoms';
import * as types from '../types';
import * as hooks from '../hooks';

const CreateAccount = () => {
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

  const onSubmit = useCallback(async (e: any) => {
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
  }, [email, password, repeatPassword, setUser, setValidation]);

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
    <div className="flex flex-col text-sm gap-4 items-center w-full">
      {validation.state !== types.ValidationState.LOADING ? 'Create account' : 'Creating...'}
      <form onSubmit={onSubmit} className="flex flex-col gap-2 w-full max-w-[5cm]">
        {validation.create && <div className="text-red-400">{validation.create}</div>}
        {validation.email && <div className="text-red-400">{validation.email}</div>}
        <input
          className={`pl-2 h-8 border ${validation.email && 'border-red-400'}`}
          onChange={onChangeEmail}
          value={email}
          placeholder="email"
        />
        {validation.password && <div className="text-red-400">{validation.password}</div>}
        <input
          className={`pl-2 h-8 border ${validation.password && 'border-red-400'}`}
          onChange={onChangePassword}
          type="password"
          value={password}
          placeholder="password"
        />
        {validation.repeatPassword && <div className="text-red-400">{validation.repeatPassword}</div>}

        <input
          className={`pl-2 h-8 border ${validation.repeatPassword && 'border-red-400'}`}
          onChange={onChangeRepeatPassword}
          type="password"
          value={repeatPassword}
          placeholder="repeat password"
        />
        <button
          disabled={validation.state === types.ValidationState.LOADING}
          type="submit"
          className="h-8 border text-gray-50 bg-orange-500 w-full max-w-[5cm]"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateAccount;
