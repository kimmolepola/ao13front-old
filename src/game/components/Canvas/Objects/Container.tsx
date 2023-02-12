import { memo, RefObject } from "react";
import { useLoader } from "@react-three/fiber";
import { useRecoilValue } from "recoil";
import * as THREE from "three";

import GameObject from "./GameObject";
import Background from "./Background";

import * as atoms from "../../../../atoms";
import * as types from "../../../../types";

const Container = ({
  objectsRef,
}: {
  objectsRef: RefObject<types.GameObject[]>;
}) => {
  console.log("--Container (game/components/Canvas/Objects");

  const objectIds = useRecoilValue(atoms.objectIds);
  const [fighterImage, backgroundImage] = useLoader(THREE.TextureLoader, [
    "fighter.png",
    "image1.jpeg",
  ]);

  return (
    <>
      <Background map={backgroundImage} />
      {objectIds.map((x: string) => (
        <GameObject key={x} id={x} map={fighterImage} objectsRef={objectsRef} />
      ))}
    </>
  );
};

export default memo(Container);
