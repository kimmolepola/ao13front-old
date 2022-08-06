import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../../networking/services/auth.service';

import * as types from '../types';
import * as hooks from '../hooks';

const ForgottenPassword = () => {
  const navigate = useNavigate();
  const [validation, setValidation, resetValidation] = hooks.useValidation();
  const [username, setUsername] = useState('');

  const stateText = useMemo(() => {
    switch (validation.state) {
      case types.ValidationState.LOADING:
        return 'Please wait...';
      case types.ValidationState.SUCCESS:
        return 'Email sent (check spam)';
      default:
        return 'Enter your username or email';
    }
  }, [validation.state]);

  const onSubmit = useCallback(async (e: any) => {
    e.preventDefault();
    const newValidation = {
      dirty: true,
      state: types.ValidationState.OPEN,
      request: undefined,
      username: username.length ? undefined : 'required',
    };
    if (!newValidation.username) {
      newValidation.state = types.ValidationState.LOADING;
      setValidation(newValidation);
      const { error } = await requestPasswordReset({ username });
      newValidation.request = error;
      newValidation.state = error ? types.ValidationState.OPEN : types.ValidationState.SUCCESS;
      setUsername('');
    }
    setValidation({ ...newValidation });
  }, [setValidation, username]);

  const onChangeUsername = useCallback((e: any) => {
    resetValidation();
    setUsername(e.target.value);
  }, [resetValidation]);

  const onClickCancel = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col text-sm gap-4 items-center w-full">
      {stateText}
      {validation.request && <div className="text-red-400">{validation.request}</div>}
      {validation.state !== types.ValidationState.SUCCESS
        && (
          <form onSubmit={onSubmit} className="flex flex-col gap-2 w-full max-w-[5cm]">
            {validation.username && <div className="text-red-400">{validation.username}</div>}
            <input
              className={`pl-2 h-8 border ${validation.username && 'border-red-400'}`}
              autoCapitalize="none"
              onChange={onChangeUsername}
              value={username}
              placeholder="username or email"
            />
            <div className="flex justify-between gap-2">
              <button
                className="h-8 border border-rose-900 text-rose-900 bg-transparent grow"
                onClick={onClickCancel}
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={validation.state === types.ValidationState.LOADING}
                type="submit"
                className="h-8 border text-gray-50 bg-rose-900 grow"
              >
                Submit
              </button>
            </div>
          </form>
        )}
    </div>
  );
};

export default ForgottenPassword;
