import { memo, RefObject } from 'react';
import CanvasOverlay from './CanvasOverlay';
import Sidepanel from './Sidepanel';

import * as types from '../../../types';

const UserInterface = ({
  refreshUser,
  quit,
  objectsRef,
}: {
  refreshUser: Function,
  quit: Function,
  objectsRef: RefObject<types.GameObject[]>
}) => (
  <>
    <CanvasOverlay objectsRef={objectsRef} />
    <Sidepanel refreshUser={refreshUser} quit={quit} objectsRef={objectsRef} />
  </>
);

export default memo(UserInterface);
