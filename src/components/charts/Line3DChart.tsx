import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import { Group, Vector3 } from 'three';

interface Line3DData {
  name: string;
  [key: string]: string | number;
}

interface Line3DChartProps {
  data: Line3DData[];
  lines: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  formatValue?: (value: number) => string;
  animate?: boolean;
}

export function Line3DChart({ data, lines, formatValue, animate = true }: Line3DChartProps) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
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

  const { maxValue, minValue } = useMemo(() => {
    let max = -Infinity;
    let min = Infinity;
    
    data.forEach(item => {
      lines.forEach(line => {
        const value = Number(item[line.key]) || 0;
        max = Math.max(max, value);
        min = Math.min(min, value);
      });
    });
    
    // Vérification de sécurité pour éviter les divisions par zéro ou les valeurs invalides
    if (max === -Infinity) max = 1;
    if (min === Infinity) min = 0;
    if (max === min) max = min + 1;
    
    return { maxValue: max, minValue: min };
  }, [data, lines]);

  const lineComponents = useMemo(() => {
    return lines.map((line, lineIndex) => {
      const points: Vector3[] = data.map((item, index) => {
        const value = Number(item[line.key]) || 0;
        const x = (index - data.length / 2) * 1.5;
        const y = ((value - minValue) / (maxValue - minValue)) * 4;
        const z = lineIndex * 0.5;
        
        return new Vector3(x, y, z);
      });

      return (
        <group key={line.key}>
          <Line
            points={points}
            color={line.color}
            lineWidth={3}
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <mesh key={index} position={point}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial color={line.color} />
            </mesh>
          ))}
          
          {/* Legend */}
          <Text
            position={[data.length * 0.75, 4.5 - lineIndex * 0.5, lineIndex * 0.5]}
            fontSize={0.25}
            color={line.color}
            anchorX="left"
            anchorY="middle"
          >
            {line.name}
          </Text>
        </group>
      );
    });
  }, [data, lines, maxValue, minValue]);

  const xAxisLabels = useMemo(() => {
    return data.map((item, index) => {
      const x = (index - data.length / 2) * 1.5;
      return (
        <Text
          key={index}
          position={[x, -0.5, 0]}
          fontSize={0.2}
          color="hsl(var(--muted-foreground))"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 4, 0, 0]}
        >
          {item.name}
        </Text>
      );
    });
  }, [data]);

  return (
    <group ref={groupRef}>
      {lineComponents}
      {xAxisLabels}
      
      {/* Grid */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[data.length * 2, 6]} />
        <meshStandardMaterial 
          color="hsl(var(--muted))" 
          opacity={0.1} 
          transparent 
          wireframe
        />
      </mesh>
    </group>
  );
}