import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh, CylinderGeometry, Group } from 'three';

interface Pie3DData {
  name: string;
  value: number;
  color: string;
}

interface Pie3DChartProps {
  data: Pie3DData[];
  formatValue?: (value: number) => string;
  animate?: boolean;
}

export function Pie3DChart({ data, formatValue, animate = true }: Pie3DChartProps) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
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

  const total = useMemo(() => {
    const sum = data.reduce((sum, item) => sum + item.value, 0);
    return sum > 0 ? sum : 1; // Éviter division par zéro
  }, [data]);

  const segments = useMemo(() => {
    let currentAngle = 0;
    
    return data.map((item, index) => {
      const percentage = item.value / total;
      const segmentAngle = percentage * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;
      const middleAngle = startAngle + segmentAngle / 2;
      
      currentAngle += segmentAngle;
      
      // Position for the label
      const labelRadius = 2.5;
      const labelX = Math.cos(middleAngle) * labelRadius;
      const labelZ = Math.sin(middleAngle) * labelRadius;
      
      return (
        <group key={item.name}>
          {/* Segment */}
          <mesh rotation={[0, startAngle, 0]}>
            <cylinderGeometry 
              args={[0, 2, 0.5, 16, 1, false, 0, segmentAngle]} 
            />
            <meshStandardMaterial color={item.color} />
          </mesh>
          
          {/* Label */}
          <Text
            position={[labelX, 0.8, labelZ]}
            fontSize={0.2}
            color="hsl(var(--foreground))"
            anchorX="center"
            anchorY="middle"
          >
            {item.name}
          </Text>
          
          {/* Value */}
          <Text
            position={[labelX, 0.4, labelZ]}
            fontSize={0.15}
            color="hsl(var(--muted-foreground))"
            anchorX="center"
            anchorY="middle"
          >
            {formatValue ? formatValue(item.value) : `${(percentage * 100).toFixed(1)}%`}
          </Text>
        </group>
      );
    });
  }, [data, total, formatValue]);

  return (
    <group ref={groupRef}>
      {segments}
    </group>
  );
}