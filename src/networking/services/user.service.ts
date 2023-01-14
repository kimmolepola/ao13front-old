import axios from 'axios';

const server = process.env.NODE_ENV === 'production'
  ? `http://${process.env.REACT_APP_BACKEND}`
  : `http://${process.env.REACT_APP_BACKEND}`;

export const checkOkToStart = async () => {
  console.log('--checkOkToStart');

  try {
    const response = await axios.get(` ${server}/api/v1/user/checkOkToStart`);
    return { data: response.data, error: null };
  } catch (err: any) {
    const error = err.response?.data ? err.response.data.error : err.toString();
    return { data: null, error };
  }
};

export const getUser = async () => {
  console.log('--getUser');

  try {
    const response = await axios.get(`${server}/api/v1/user`);
    return { data: response.data, error: null };
  } catch (err: any) {
    const error = err.response?.data ? err.response.data.error : err.toString();
    return { data: null, error };
  }
};

export const updateUsername = async (username: any) => {
  console.log('--updateUsername');

  try {
    const response = await axios.post(`${server}/api/v1/user/updateUsername`, {
      username,
    });
    return { data: response.data, error: null };
  } catch (err: any) {
    const error = err.response?.data ? err.response.data.error : err.toString();
    return { data: null, error };
  }
};
