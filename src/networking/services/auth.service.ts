import axios from 'axios';

const server = process.env.NODE_ENV === 'production'
  ? `https://${process.env.REACT_APP_BACKEND}`
  : `http://${process.env.REACT_APP_BACKEND}`;

export const setToken = (token: any) => {
  axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
};

export const guestLogin = async () => {
  try {
    const response = await axios.post(`${server}/api/v1/auth/guestLogin`);
    return { data: response.data, error: null };
  } catch (err: any) {
    const error = err.response ? err.response.data.error : err.toString();
    return { data: null, error };
  }
};

export const resetPassword = async ({ token, userId, password }: any) => {
  try {
    const response = await axios.post(`${server}/api/v1/auth/resetpassword`, {
      token,
      userId,
      password,
    });
    return { data: response.data, error: null };
  } catch (err: any) {
    const error = err.response ? err.response.data.error : err.toString();
    return { data: null, error };
  }
};

export const requestPasswordReset = async ({ username }: any) => {
  try {
    const response = await axios.post(
      `${server}/api/v1/auth/requestResetPassword`,
      {
        username,
      },
    );
    return { data: response.data, error: null };
  } catch (err: any) {
    const error = err.response ? err.response.data.error : err.toString();
    return { data: null, error };
  }
};

export const login = async ({ username, password }: any) => {
  try {
    const response = await axios.post(`${server}/api/v1/auth/login`, {
      username,
      password,
    });
    return { data: response.data, error: null };
  } catch (err: any) {
    const error = err.response ? err.response.data.error : err.toString();
    return { data: null, error };
  }
};

export const signup = async ({ email, password }: any) => {
  try {
    const response = await axios.post(`${server}/api/v1/auth/signup`, {
      email,
      password,
    });
    return { data: response.data, error: null };
  } catch (err: any) {
    const error = err.response ? err.response.data.error : err.toString();
    return { data: null, error };
  }
};
