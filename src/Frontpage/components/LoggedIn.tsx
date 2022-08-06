import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { checkOkToStart } from '../../networking/services/user.service';
import theme from '../../theme.js';
import Settings from './Settings';

import * as atoms from '../../atoms';

const Score = styled.div<any>`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  margin: 40;
  align-items: center;
`;

const ErrorMessage = styled.div<any>`
  max-width: 5cm;
  display: ${(props) => (props.error ? '' : 'none')};
  margin: ${theme.margins.large};
  font-size: 12px;
  color: red;
`;

const RefreshButton = styled.button<any>`
  ${theme.basicButton}
  box-shadow: none;
  border: none;
  margin: ${theme.margins.large};
  color: ${theme.colors.highlight1};
  background-color: ${(props) => props.background || 'transparent'};
  :active {
    background: ${(props) => props.background || 'transparent'};
    color: ${theme.colors.highlight1};
  }
  :disabled {
    background-color: transparent;
    cursor: default;
    transform: rotate(20turn);
    transition-duration: 6s;
  }
  font-size: 20px;
  font-weight: bold;
`;

const Button = styled.button<any>`
  ${theme.basicButton}
  min-height: 40px;
  min-width: 100px;
  margin: ${theme.margins.basic};
  background-color: ${(props) => props.background || theme.colors.highlight1};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div<any>`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
`;

const LoggedIn = ({
  refreshUser,
}: any) => {
  const user = useRecoilValue(atoms.user);
  const navigate = useNavigate();
  const [errorText, setErrorText] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErrorText(null);
  }, [user]);

  const handleRefreshClick = async () => {
    setLoading(true);
    await refreshUser();
    setLoading(false);
    console.log('refresh');
  };

  const handlePlayClick = async () => {
    if (!errorText) {
      const { data, error } = await checkOkToStart();
      if (data && data.success) {
        navigate('/play');
      } else {
        setErrorText(error || data.reason);
        setTimeout(() => setErrorText(null), 5000);
      }
    }
  };

  return (
    <Container show={user}>
      <Routes>
        <Route
          path="/settings"
          element={<Settings />}
        />
        <Route
          path="*"
          element={(
            <>
              <Score show={user && !user.username.includes('guest_')}>
                Score:
                {user ? user.score : null}
                <RefreshButton
                  disabled={loading}
                  onClick={handleRefreshClick}
                  type="button"
                >
                  {'\u21BB'}
                </RefreshButton>
              </Score>
              <ErrorMessage error={errorText}>{errorText}</ErrorMessage>
              <Button onClick={handlePlayClick} type="button">
                play
              </Button>
            </>
          )}
        />
      </Routes>
    </Container>
  );
};

export default LoggedIn;
