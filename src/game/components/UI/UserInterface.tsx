import { memo } from "react";
import CanvasOverlay from './CanvasOverlay';
import Sidepanel from './Sidepanel';

const UserInterface = ({ refreshUser, quit }: { refreshUser: Function, quit: Function }) => (
  <>
    <CanvasOverlay />
    <Sidepanel refreshUser={refreshUser} quit={quit} />
  </>
);

export default memo(UserInterface);
