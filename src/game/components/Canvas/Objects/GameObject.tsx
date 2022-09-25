import { memo, useMemo } from 'react';
import * as THREE from "three";
import { useRecoilValue } from "recoil";

import * as atoms from "../../../../atoms";

const GameObject = ({ id, map }: { id: string, map: THREE.Texture }) => {
  const ownId = useRecoilValue(atoms.ownId)
  const gameObjectsRef = useRecoilValue(atoms.objects)
  const o = gameObjectsRef.current?.find((x) => x.id === id);

  const meshColor = useMemo(() => ownId === id ? 'orange' : undefined, [ownId, id])

  const boxGeometryArgs = useMemo(() => ({
    width: Math.min(1, map.image.width / map.image.height),
    height: Math.min(1, map.image.height / map.image.width),
    depth: 1,
  }), [map]);

  if (!o) {
    return <></>
  }

  return (
    <mesh ref={(ref) => o.object3D = ref as THREE.Object3D}>
      <meshBasicMaterial
        attach="material-4"
        color={meshColor}
        transparent
        map={map}
      />
      <boxGeometry
        args={[
          boxGeometryArgs.width,
          boxGeometryArgs.height,
          boxGeometryArgs.depth,
        ]}
      />
    </mesh>
  )
};

export default memo(GameObject);
