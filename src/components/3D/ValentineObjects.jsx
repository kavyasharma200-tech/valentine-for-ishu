import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Rose
export const Rose = ({ position = [0, 0, 0], scale = 1, onClick }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group ref={meshRef} position={position} scale={scale} onClick={onClick}>
                {/* Stem */}
                <mesh position={[0, -0.8, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 1.5, 16]} />
                    <meshStandardMaterial color="#228B22" />
                </mesh>

                {/* Rose Petals - Center */}
                <mesh position={[0, 0.2, 0]}>
                    <sphereGeometry args={[0.15, 32, 32]} />
                    <meshStandardMaterial color="#8B0000" />
                </mesh>

                {/* Outer Petals */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <mesh
                        key={i}
                        position={[
                            Math.cos((angle * Math.PI) / 180) * 0.25,
                            0.1 + (i % 2) * 0.1,
                            Math.sin((angle * Math.PI) / 180) * 0.25
                        ]}
                        rotation={[0.3, (angle * Math.PI) / 180, 0.2]}
                    >
                        <sphereGeometry args={[0.18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color="#DC143C" side={THREE.DoubleSide} />
                    </mesh>
                ))}

                {/* More petals layer */}
                {[30, 90, 150, 210, 270, 330].map((angle, i) => (
                    <mesh
                        key={`outer-${i}`}
                        position={[
                            Math.cos((angle * Math.PI) / 180) * 0.35,
                            0,
                            Math.sin((angle * Math.PI) / 180) * 0.35
                        ]}
                        rotation={[0.5, (angle * Math.PI) / 180, 0.3]}
                    >
                        <sphereGeometry args={[0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color="#FF1493" side={THREE.DoubleSide} />
                    </mesh>
                ))}

                {/* Leaves */}
                <mesh position={[0.2, -0.4, 0]} rotation={[0, 0, 0.5]}>
                    <sphereGeometry args={[0.15, 16, 16, 0, Math.PI, 0, Math.PI]} />
                    <meshStandardMaterial color="#228B22" side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[-0.2, -0.6, 0]} rotation={[0, Math.PI, -0.5]}>
                    <sphereGeometry args={[0.12, 16, 16, 0, Math.PI, 0, Math.PI]} />
                    <meshStandardMaterial color="#228B22" side={THREE.DoubleSide} />
                </mesh>
            </group>
        </Float>
    );
};

// Procedural Teddy Bear
export const TeddyBear = ({ position = [0, 0, 0], scale = 1, onClick }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
            <group ref={meshRef} position={position} scale={scale} onClick={onClick}>
                {/* Body */}
                <mesh position={[0, -0.3, 0]}>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="#D2691E" />
                </mesh>

                {/* Head */}
                <mesh position={[0, 0.4, 0]}>
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshStandardMaterial color="#D2691E" />
                </mesh>

                {/* Ears */}
                <mesh position={[-0.3, 0.7, 0]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial color="#D2691E" />
                </mesh>
                <mesh position={[0.3, 0.7, 0]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial color="#D2691E" />
                </mesh>

                {/* Inner Ears */}
                <mesh position={[-0.3, 0.7, 0.08]}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial color="#FFB6C1" />
                </mesh>
                <mesh position={[0.3, 0.7, 0.08]}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial color="#FFB6C1" />
                </mesh>

                {/* Snout */}
                <mesh position={[0, 0.3, 0.35]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial color="#DEB887" />
                </mesh>

                {/* Nose */}
                <mesh position={[0, 0.35, 0.48]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="#1A1A1A" />
                </mesh>

                {/* Eyes */}
                <mesh position={[-0.12, 0.5, 0.35]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="#1A1A1A" />
                </mesh>
                <mesh position={[0.12, 0.5, 0.35]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="#1A1A1A" />
                </mesh>

                {/* Arms */}
                <mesh position={[-0.5, -0.1, 0]} rotation={[0, 0, 0.5]}>
                    <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
                    <meshStandardMaterial color="#D2691E" />
                </mesh>
                <mesh position={[0.5, -0.1, 0]} rotation={[0, 0, -0.5]}>
                    <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
                    <meshStandardMaterial color="#D2691E" />
                </mesh>

                {/* Legs */}
                <mesh position={[-0.2, -0.7, 0.1]}>
                    <sphereGeometry args={[0.18, 16, 16]} />
                    <meshStandardMaterial color="#D2691E" />
                </mesh>
                <mesh position={[0.2, -0.7, 0.1]}>
                    <sphereGeometry args={[0.18, 16, 16]} />
                    <meshStandardMaterial color="#D2691E" />
                </mesh>

                {/* Heart on belly */}
                <mesh position={[0, -0.2, 0.45]} rotation={[0, 0, Math.PI]}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshStandardMaterial color="#FF1493" />
                </mesh>
            </group>
        </Float>
    );
};

// Procedural Heart
export const Heart3D = ({ position = [0, 0, 0], scale = 1, color = '#FF1493', onClick }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            meshRef.current.scale.setScalar(scale * pulse);
        }
    });

    // Create heart shape
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x, y + 0.5);
    heartShape.bezierCurveTo(x, y + 0.5, x - 0.5, y, x - 0.5, y);
    heartShape.bezierCurveTo(x - 0.5, y - 0.5, x, y - 0.5, x, y - 1);
    heartShape.bezierCurveTo(x, y - 0.5, x + 0.5, y - 0.5, x + 0.5, y);
    heartShape.bezierCurveTo(x + 0.5, y, x, y + 0.5, x, y + 0.5);

    const extrudeSettings = {
        depth: 0.3,
        bevelEnabled: true,
        bevelSegments: 5,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
    };

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
            <mesh
                ref={meshRef}
                position={position}
                rotation={[Math.PI, 0, 0]}
                onClick={onClick}
            >
                <extrudeGeometry args={[heartShape, extrudeSettings]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.3}
                    roughness={0.4}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </Float>
    );
};

// Procedural Gift Box
export const GiftBox = ({ position = [0, 0, 0], scale = 1, onClick }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.008;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
        }
    });

    return (
        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.5}>
            <group ref={meshRef} position={position} scale={scale} onClick={onClick}>
                {/* Box */}
                <mesh>
                    <boxGeometry args={[0.8, 0.6, 0.8]} />
                    <meshStandardMaterial color="#FF69B4" />
                </mesh>

                {/* Lid */}
                <mesh position={[0, 0.38, 0]}>
                    <boxGeometry args={[0.85, 0.15, 0.85]} />
                    <meshStandardMaterial color="#FF1493" />
                </mesh>

                {/* Ribbon Horizontal */}
                <mesh position={[0, 0.01, 0]}>
                    <boxGeometry args={[0.82, 0.62, 0.15]} />
                    <meshStandardMaterial color="#FFD700" />
                </mesh>

                {/* Ribbon Vertical */}
                <mesh position={[0, 0.01, 0]}>
                    <boxGeometry args={[0.15, 0.62, 0.82]} />
                    <meshStandardMaterial color="#FFD700" />
                </mesh>

                {/* Bow Center */}
                <mesh position={[0, 0.55, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial color="#FFD700" />
                </mesh>

                {/* Bow Loops */}
                <mesh position={[-0.2, 0.55, 0]} rotation={[0, 0, 0.3]}>
                    <torusGeometry args={[0.12, 0.04, 8, 16, Math.PI]} />
                    <meshStandardMaterial color="#FFD700" />
                </mesh>
                <mesh position={[0.2, 0.55, 0]} rotation={[0, 0, -0.3]}>
                    <torusGeometry args={[0.12, 0.04, 8, 16, Math.PI]} />
                    <meshStandardMaterial color="#FFD700" />
                </mesh>
            </group>
        </Float>
    );
};

// Procedural Chocolate Box
export const ChocolateBox = ({ position = [0, 0, 0], scale = 1, onClick }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.006;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
            <group ref={meshRef} position={position} scale={scale} onClick={onClick}>
                {/* Box Base - Heart Shape approximation with multiple parts */}
                <mesh>
                    <boxGeometry args={[1, 0.3, 0.8]} />
                    <meshStandardMaterial color="#8B0000" />
                </mesh>

                {/* Chocolates */}
                {[
                    [-0.3, 0.2, -0.2],
                    [0, 0.2, -0.2],
                    [0.3, 0.2, -0.2],
                    [-0.3, 0.2, 0.2],
                    [0, 0.2, 0.2],
                    [0.3, 0.2, 0.2],
                ].map((pos, i) => (
                    <mesh key={i} position={pos}>
                        <sphereGeometry args={[0.1, 16, 16]} />
                        <meshStandardMaterial color={i % 2 === 0 ? "#3D1C02" : "#5D3A1A"} />
                    </mesh>
                ))}

                {/* Decorative ribbon */}
                <mesh position={[0, 0.15, 0.45]}>
                    <boxGeometry args={[0.5, 0.08, 0.02]} />
                    <meshStandardMaterial color="#FFD700" />
                </mesh>
            </group>
        </Float>
    );
};

export default { Rose, TeddyBear, Heart3D, GiftBox, ChocolateBox };
