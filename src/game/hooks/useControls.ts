import { useEffect, useCallback } from "react";
import { useRecoilValue } from "recoil";

import { handlePressed, handleReleased } from "../controls";

import * as atoms from "../../atoms";
import * as types from "../../types";

const convertKeyToControl = (key: string) => {
  switch (key) {
    case 'ArrowUp':
      return types.Keys.UP;
    case 'ArrowDown':
      return types.Keys.DOWN;
    case 'ArrowLeft':
      return types.Keys.LEFT;
    case 'ArrowRight':
      return types.Keys.RIGHT;
    default:
      return null;
  }
};

export const useControls = () => {
  const objectsRef = useRecoilValue(atoms.objects);
  const ownId = useRecoilValue(atoms.ownId)

  const handleKeyDown = useCallback((e: any) => {
    if (e.repeat) return;
    const control = convertKeyToControl(e.code);
    if (control && ownId) handlePressed(control, ownId, objectsRef);
  }, [convertKeyToControl, handlePressed]);

  const handleKeyUp = useCallback((e: any) => {
    const control = convertKeyToControl(e.code);
    if (control && ownId) handleReleased(control, ownId, objectsRef);
  }, [convertKeyToControl, handleReleased]);

  useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', handleKeyDown);
    };

  }, [handleKeyUp, handleKeyDown]);
};