import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, PerspectiveCamera, ContactShadows, Stage } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RedRose, LoveRing, TeddyBears, HeartInLove,
    LoveBalloon, LoveAnil, LoveLotus
} from './LocalModels';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Hero3D.css';

const objects = [
    {
        component: RedRose,
        name: '🌹 Piano Rose',
        message: 'A symbol of my growing love for you',
        color: '#DC143C',
    },
    {
        component: LoveRing,
        name: '💍 Promise Ring',
        message: 'A promise of a beautiful future together',
        color: '#FFD700',
    },
    {
        component: TeddyBears,
        name: '🧸 Stay Together',
        message: 'Cuddles and warmth forever with you',
        color: '#D2691E',
    },
    {
        component: HeartInLove,
        name: '💖 Heart In Love',
        message: 'You make my heart beat faster every day',
        color: '#FF1493',
    },
    {
        component: LoveBalloon,
        name: '🎈 Love Balloon',
        message: 'My love for you reaches the sky',
        color: '#FF69B4',
    },
    {
        component: LoveAnil,
        name: '💑 Eternal Connection',
        message: 'Two hearts, one soul, infinite love',
        color: '#B76E79',
    },
    {
        component: LoveLotus,
        name: '🪷 Love Lotus',
        message: 'Our love is as pure and rare as a lotus',
        color: '#EA899A',
    },
];

const Hero3D = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMessage, setShowMessage] = useState(false);

    const nextObject = () => {
        setCurrentIndex((prev) => (prev + 1) % objects.length);
        setShowMessage(false);
    };

    const prevObject = () => {
        setCurrentIndex((prev) => (prev - 1 + objects.length) % objects.length);
        setShowMessage(false);
    };

    const handleObjectClick = () => {
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
    };

    const CurrentObject = objects[currentIndex].component;

    return (
        <div className="hero-3d-container">
            <Canvas shadows camera={{ position: [0, 0, 15], fov: 40 }}>
                {/* Background */}
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />

                {/* Lighting Backup */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                {/* 3D Object with Professional Stage Display */}
                <Suspense fallback={
                    <mesh>
                        <sphereGeometry args={[1, 32, 32]} />
                        <meshStandardMaterial color="#FF69B4" emissive="#FF69B4" emissiveIntensity={0.5} />
                    </mesh>
                }>
                    <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.7, blur: 2 }} adjustCamera={true}>
                        <CurrentObject
                            onClick={handleObjectClick}
                        />
                    </Stage>
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    makeDefault
                />
            </Canvas>

            {/* Navigation Arrows */}
            <button className="hero-3d-nav prev" onClick={prevObject}>
                <ChevronLeft size={30} />
            </button>
            <button className="hero-3d-nav next" onClick={nextObject}>
                <ChevronRight size={30} />
            </button>

            {/* Object Name */}
            <div className="hero-3d-name">{objects[currentIndex].name}</div>

            {/* Dots Indicator */}
            <div className="hero-3d-dots">
                {objects.map((_, index) => (
                    <button
                        key={index}
                        className={`hero-3d-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => {
                            setCurrentIndex(index);
                            setShowMessage(false);
                        }}
                    />
                ))}
            </div>

            {/* Click Message */}
            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        className="hero-3d-message"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {objects[currentIndex].message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instruction */}
            <div className="hero-3d-instruction">
                Click & drag to rotate • Click object for message
            </div>
        </div>
    );
};

export default Hero3D;
