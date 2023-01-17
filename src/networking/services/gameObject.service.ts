import axios from 'axios';

import * as types from '../../types';

const server = process.env.NODE_ENV === 'production'
  ? `https://${process.env.REACT_APP_BACKEND}`
  : `http://${process.env.REACT_APP_BACKEND}`;

// eslint-disable-next-line import/prefer-default-export
export const getGameObject = async (id: any) => {
  console.log('--getGameObject');

  try {
    const response = await axios.get(`${server}/api/v1/gameObject/${id}`);
    return { data: response.data as types.InitialGameObject | undefined };
  } catch (err: any) {
    const error = err.response?.data ? err.response.data.error : err.toString();
    console.error('gameobject fetch error:', error);
    return { error };
  }
};

export const savePlayerData = async (data: { remoteId: string, score: number }[]) => {
  console.log('--savePlayerData');

  try {
    const response = await axios.post(
      `${server}/api/v1/gameObject/saveGameState`,
      data,
    );
    return { data: response.data, error: null };
  } catch (err: any) {
    const error = err.response?.data ? err.response.data.error : err.toString();
    return { data: null, error };
  }
};
