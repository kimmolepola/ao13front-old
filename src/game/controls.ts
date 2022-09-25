export const handlePressed = (key: any, id: any, objects: any) => {
  if (objects.current[id] && !objects.current[id].keyDowns.includes(key)) {
    objects.current[id].keyDowns.push(key);
  }
};

export const handleReleased = (key: any, id: any, objects: any) => {
  if (objects.current[id]) {
    const index = objects.current[id].keyDowns.findIndex((x: any) => x === key);
    if (index !== -1) objects.current[id].keyDowns.splice(index, 1);
  }
};

const convertKeyToControl = (key: any) => {
  switch (key) {
    case 'ArrowUp':
      return 'up';
    case 'ArrowDown':
      return 'down';
    case 'ArrowLeft':
      return 'left';
    case 'ArrowRight':
      return 'right';
    default:
      return null;
  }
};

export const subscribeToKeyboardEvents = ({ id, objects }: any) => {
  const handleKeyDown = (e: any) => {
    if (e.repeat) return;
    const control = convertKeyToControl(e.code);
    if (control) handlePressed(control, id, objects);
  };
  const handleKeyUp = (e: any) => {
    const control = convertKeyToControl(e.code);
    if (control) handleReleased(control, id, objects);
  };
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('keydown', handleKeyDown);
  return () => {
    document.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('keydown', handleKeyDown);
  };
};
