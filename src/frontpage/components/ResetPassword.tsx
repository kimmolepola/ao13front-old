import { memo, useMemo, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { resetPassword } from '../../networking/services/auth.service';

import * as theme from '../../theme';
import * as types from '../types';
import * as hooks from '../hooks';

const ResetPassword = () => {
  const query = new URLSearchParams(useLocation().search);
  const [validation, setValidation, resetValidation] = hooks.useValidation();
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const stateText = useMemo(() => {
    switch (validation.state) {
      case types.ValidationState.LOADING:
        return 'Please wait...';
      case types.ValidationState.SUCCESS:
        return 'Password changed. You can now log in using your new password.';
      default:
        return 'Enter new password';
    }
  }, [validation.state]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const newValidation = {
      dirty: true,
      state: types.ValidationState.OPEN,
      request: undefined,
      password: password !== '' ? undefined : 'invalid password',
      repeatPassword: password === repeatPassword ? undefined : 'password mismatch',
    };
    if (!newValidation.password && !newValidation.repeatPassword) {
      newValidation.state = types.ValidationState.LOADING;
      setValidation(newValidation);
      const token = query.get('token');
      const userId = query.get('id');
      let err;
      if (token && userId) {
        const { error } = await resetPassword({
          password,
          token,
          userId,
        });
        err = error;
      } else {
        err = 'Missing token or userId';
      }
      newValidation.request = err;
      newValidation.state = err ? types.ValidationState.OPEN : types.ValidationState.SUCCESS;
    }
    setPassword('');
    setRepeatPassword('');
    setValidation({ ...newValidation });
  };

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
      {stateText}
      {validation.request && <div className={theme.cValidationError}>{validation.request}</div>}
      {validation.state !== types.ValidationState.SUCCESS
        && (
          <form onSubmit={onSubmit} className={theme.cForm}>
            {validation.password
              && <div className={theme.cValidationError}>{validation.password}</div>}
            <input
              className={theme.cInput(validation.password)}
              type="password"
              onChange={onChangePassword}
              value={password}
              placeholder="password"
            />
            {validation.repeatPassword
              && <div className={theme.cValidationError}>{validation.repeatPassword}</div>}
            <input
              className={theme.cInput(validation.repeatPassword)}
              type="password"
              onChange={onChangeRepeatPassword}
              value={repeatPassword}
              placeholder="repeat password"
            />
            <button
              disabled={validation.state === types.ValidationState.LOADING}
              type="submit"
              className={theme.cButtonRose}
            >
              Submit
            </button>
          </form>
        )}
    </div>
  );
};

export default memo(ResetPassword);
