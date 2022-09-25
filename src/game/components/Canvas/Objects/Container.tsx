import React, { memo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import * as THREE from 'three';
import GameObject from './GameObject';
import Background from './Background';

const Container = ({
  ids, id, objectIds, objects,
}: any) => {
  const [fighterImage, image1] = useLoader(TextureLoader, [
    'fighter.png',
    'image1.jpeg',
  ]);

  image1.wrapS = THREE.MirroredRepeatWrapping;
  image1.wrapT = THREE.MirroredRepeatWrapping;
  image1.repeat.set(120, 120);

  return (
    <>
      <Background map={image1} />
      {objectIds.current.map((x: any, i: any) => (
        <GameObject
          ids={ids}
          objects={objects}
          id={id}
          map={fighterImage}
          objectId={x}
          key={x}
        />
      ))}
    </>
  );
};

Container.displayName = 'Container';
const MemoContainer = memo(
  Container,
  (prev, next) => prev.ids === next.ids,
);

export default MemoContainer;
