import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';

interface Chart3DContainerProps {
  children: React.ReactNode;
  height?: string;
  title?: string;
}

export function Chart3DContainer({ children, height = "400px", title }: Chart3DContainerProps) {
  return (
    <div style={{ height, width: "100%" }} className="relative bg-muted/20 rounded-lg">
      {title && (
        <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-md">
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={5}
        />
        <Suspense fallback={
          <Html center>
            <div className="text-sm text-muted-foreground">Chargement...</div>
          </Html>
        }>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}