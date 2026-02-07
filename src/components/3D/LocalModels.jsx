import { useGLTF, Float, Clone } from '@react-three/drei';
import React, { useMemo } from 'react';
import * as THREE from 'three';

export const LocalModel = ({ path, onClick }) => {
    const { scene } = useGLTF(path);

    // Ensure materials are vibrant and correctly lit
    useMemo(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material.side = THREE.DoubleSide;
                    // Fix color space for newer Three.js versions
                    if (child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
                }
            }
        });
    }, [scene]);

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Clone
                object={scene}
                onClick={onClick}
            />
        </Float>
    );
};

// Pre-configured models with specific paths and adjustments
export const RedRose = (props) => (
    <LocalModel path="assets/models/piano_rose.glb" {...props} />
);

export const LoveRing = (props) => (
    <LocalModel path="assets/models/543_-_ring.glb" {...props} />
);

export const TeddyBears = (props) => (
    <LocalModel path="assets/models/teddy_bears.glb" {...props} />
);

export const HeartInLove = (props) => (
    <LocalModel path="assets/models/heart_in_love.glb" {...props} />
);

export const LoveBalloon = (props) => (
    <LocalModel path="assets/models/love_balloon.glb" {...props} />
);

export const LoveAnil = (props) => (
    <LocalModel path="assets/models/love_-_anil.glb" {...props} />
);

export const LoveLotus = (props) => (
    <LocalModel path="assets/models/love_lotus.glb" {...props} />
);

// Preload models for better performance
useGLTF.preload("assets/models/piano_rose.glb");
useGLTF.preload("assets/models/543_-_ring.glb");
useGLTF.preload("assets/models/teddy_bears.glb");
useGLTF.preload("assets/models/heart_in_love.glb");
useGLTF.preload("assets/models/love_balloon.glb");
useGLTF.preload("assets/models/love_lotus.glb");
useGLTF.preload("assets/models/love_-_anil.glb");
