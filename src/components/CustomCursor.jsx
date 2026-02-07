import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const mouseX = useSpring(0, { stiffness: 1000, damping: 50 });
    const mouseY = useSpring(0, { stiffness: 1000, damping: 50 });

    const auraX = useSpring(0, { stiffness: 150, damping: 25 });
    const auraY = useSpring(0, { stiffness: 150, damping: 25 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isVisible) setIsVisible(true);
            const { clientX, clientY } = e;
            mouseX.set(clientX);
            mouseY.set(clientY);
            auraX.set(clientX);
            auraY.set(clientY);
        };

        const handleMouseOver = (e) => {
            const clickable = e.target.closest('a, button, .astral-card-link');
            setIsHovering(!!clickable);
        };

        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isVisible, mouseX, mouseY, auraX, auraY]);

    if (!isVisible) return null;

    return (
        <>
            <motion.div
                className="comet-head"
                style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
            />
            <motion.div
                className="comet-aura"
                style={{
                    x: auraX,
                    y: auraY,
                    translateX: '-50%',
                    translateY: '-50%',
                    scale: isHovering ? 2 : 1,
                    borderColor: isHovering ? 'var(--aurora-cyan)' : 'rgba(6, 182, 212, 0.2)',
                    background: isHovering ? 'rgba(6, 182, 212, 0.05)' : 'transparent'
                }}
            />
        </>
    );
};

export default CustomCursor;
