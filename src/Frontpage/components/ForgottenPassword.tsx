import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../../networking/services/auth.service';

import * as theme from '../../theme';
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

  const onSubmit = async (e: any) => {
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
  };

  const onChangeUsername = useCallback((e: any) => {
    resetValidation();
    setUsername(e.target.value);
  }, [resetValidation]);

  const onClickCancel = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className={theme.cContainerPage}>
      {stateText}
      {validation.request && <div className={theme.cValidationError}>{validation.request}</div>}
      {validation.state !== types.ValidationState.SUCCESS
        && (
          <form onSubmit={onSubmit} className={theme.cForm}>
            {validation.username
              && <div className={theme.cValidationError}>{validation.username}</div>}
            <input
              className={theme.cInput(validation.username)}
              autoCapitalize="none"
              onChange={onChangeUsername}
              value={username}
              placeholder="username or email"
            />
            <div className="flex justify-between gap-2 w-full">
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
