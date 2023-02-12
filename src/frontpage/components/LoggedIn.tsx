import { memo, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { checkOkToStart } from "../../networking/services/user.service";
import { getTurnCredentials } from "../../networking/services/auth.service";
import * as networkingHooks from "../../networking/hooks";

import Settings from "./Settings";

import * as theme from "../../theme";
import * as atoms from "../../atoms";

const LoggedIn = () => {
  const location = useLocation();
  console.log("--LoggedIn");
  const navigate = useNavigate();
  const user = useRecoilValue(atoms.user);
  const setTurnCredentials = useSetRecoilState(atoms.turnCredentials);
  const { refreshUser } = networkingHooks.useUser();

  const [errorText, setErrorText] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErrorText(undefined);
  }, [user, location]);

  const onClickRefresh = useCallback(async () => {
    setLoading(true);
    await refreshUser();
    setTimeout(() => setLoading(false), 250);
  }, [refreshUser]);

  const onClickPlay = useCallback(async () => {
    if (!errorText) {
      const { data, error } = await checkOkToStart();
      if (data && data.success) {
        const { data: credsData, error: credsError } =
          await getTurnCredentials();
        if (credsData) {
          setTurnCredentials(credsData);
          navigate("/play");
        } else {
          setErrorText(credsError);
          setTimeout(() => setErrorText(undefined), 5000);
        }
      } else {
        setErrorText(error || data.reason);
        setTimeout(() => setErrorText(undefined), 5000);
      }
    }
  }, [errorText, setErrorText, navigate, setTurnCredentials]);

  return (
    <Routes>
      <Route path="/settings" element={<Settings />} />
      <Route
        path="*"
        element={
          <>
            <div className="flex gap-4">
              {user && `Score: ${user.score}`}
              <button
                className="disabled:animate-[spin_600ms_linear_infinite]"
                disabled={loading}
                onClick={onClickRefresh}
                type="button"
              >
                {"\u21BB"}
              </button>
            </div>
            {errorText && (
              <div className={theme.cValidationError}>{errorText}</div>
            )}
            <button
              className={theme.cButton}
              onClick={onClickPlay}
              type="button"
            >
              Play
            </button>
          </>
        }
      />
    </Routes>
  );
};

export default memo(LoggedIn);
