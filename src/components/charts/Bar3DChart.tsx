import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Group } from 'three';

interface Bar3DData {
  name: string;
  value: number;
  color: string;
}

interface Bar3DChartProps {
  data: Bar3DData[];
  formatValue?: (value: number) => string;
  animate?: boolean;
}

export function Bar3DChart({ data, formatValue, animate = true }: Bar3DChartProps) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Vérification de sécurité pour les données vides
  if (!data || data.length === 0) {
    return (
      <group>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="hsl(var(--muted-foreground))"
          anchorX="center"
          anchorY="middle"
        >
          Aucune donnée disponible
        </Text>
      </group>
    );
  }

  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => d.value));
    return max > 0 ? max : 1; // Éviter division par zéro
  }, [data]);

  const bars = useMemo(() => {
    return data.map((item, index) => {
      const height = (item.value / maxValue) * 4;
      const x = (index - data.length / 2) * 1.5;
      
      return (
        <group key={item.name} position={[x, height / 2, 0]}>
          <mesh>
            <boxGeometry args={[1, height, 1]} />
            <meshStandardMaterial color={item.color} />
          </mesh>
          <Text
            position={[0, height / 2 + 0.5, 0]}
            fontSize={0.3}
            color="hsl(var(--foreground))"
            anchorX="center"
            anchorY="middle"
          >
            {formatValue ? formatValue(item.value) : item.value.toString()}
          </Text>
          <Text
            position={[0, -height / 2 - 0.5, 0]}
            fontSize={0.25}
            color="hsl(var(--muted-foreground))"
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {item.name}
          </Text>
        </group>
      );
    });
  }, [data, maxValue, formatValue]);

  return (
    <group ref={groupRef}>
      {bars}
      {/* Base plane */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[data.length * 2, 3]} />
        <meshStandardMaterial color="hsl(var(--muted))" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}