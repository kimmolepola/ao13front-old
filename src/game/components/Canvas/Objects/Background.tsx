import { useEffect, memo } from 'react';
import * as THREE from 'three';

const Background = ({ map }: { map: THREE.Texture }) => {
  useEffect(() => {
    map.wrapS = THREE.MirroredRepeatWrapping;
    map.wrapT = THREE.MirroredRepeatWrapping;
    map.repeat.set(120, 120);
  }, [map]);

  return (
    <mesh>
      <planeGeometry args={[map.image.width, map.image.height]} />
      <meshBasicMaterial color="#e5e4e2" map={map} />
    </mesh>
  )
};

export default memo(Background);
