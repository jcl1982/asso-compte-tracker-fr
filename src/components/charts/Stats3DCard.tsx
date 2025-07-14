import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import { Group } from 'three';

interface Stats3DCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  position: [number, number, number];
  animate?: boolean;
}

export function Stats3DCard({ 
  title, 
  value, 
  subtitle, 
  color, 
  position, 
  animate = true 
}: Stats3DCardProps) {
  const cardRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (animate && cardRef.current) {
      cardRef.current.rotation.x = Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
      cardRef.current.rotation.z = Math.cos(state.clock.elapsedTime + position[2]) * 0.05;
    }
  });

  return (
    <group ref={cardRef} position={position}>
      {/* Card background */}
      <RoundedBox args={[2.5, 1.5, 0.1]} radius={0.05}>
        <meshStandardMaterial 
          color="hsl(var(--card))" 
          transparent 
          opacity={0.9}
        />
      </RoundedBox>
      
      {/* Border */}
      <RoundedBox args={[2.6, 1.6, 0.05]} radius={0.05}>
        <meshStandardMaterial 
          color={color}
          transparent 
          opacity={0.3}
        />
      </RoundedBox>
      
      {/* Title */}
      <Text
        position={[0, 0.4, 0.1]}
        fontSize={0.15}
        color="hsl(var(--muted-foreground))"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
      >
        {title}
      </Text>
      
      {/* Value */}
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.25}
        color="hsl(var(--foreground))"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
        font="/fonts/bold.woff"
      >
        {value}
      </Text>
      
      {/* Subtitle */}
      {subtitle && (
        <Text
          position={[0, -0.4, 0.1]}
          fontSize={0.12}
          color="hsl(var(--muted-foreground))"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.2}
        >
          {subtitle}
        </Text>
      )}
    </group>
  );
}