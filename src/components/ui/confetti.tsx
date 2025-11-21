import * as React from "react";
import { cn } from "../../lib/utils";

export interface ConfettiProps {
  active?: boolean;
  className?: string;
  colors?: string[];
  particleCount?: number;
  spread?: number;
  originY?: number;
}

const Confetti = React.forwardRef<HTMLDivElement, ConfettiProps>(
  ({ 
    active = false, 
    className, 
    colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"],
    particleCount = 50,
    spread = 45,
    originY = 0.6,
    ...props 
  }, ref) => {
    const [particles, setParticles] = React.useState<Array<{
      id: number;
      x: number;
      y: number;
      color: string;
      angle: number;
      velocity: number;
      rotation: number;
      rotationSpeed: number;
    }>>([]);

    React.useEffect(() => {
      if (!active) {
        setParticles([]);
        return;
      }

      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: originY * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: (Math.random() - 0.5) * spread,
        velocity: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      }));

      setParticles(newParticles);

      const interval = setInterval(() => {
        setParticles(prev => 
          prev.map(particle => ({
            ...particle,
            x: particle.x + Math.cos(particle.angle * Math.PI / 180) * particle.velocity,
            y: particle.y + Math.sin(particle.angle * Math.PI / 180) * particle.velocity + 0.5,
            rotation: particle.rotation + particle.rotationSpeed,
          })).filter(particle => particle.y < 100)
        );
      }, 16);

      return () => clearInterval(interval);
    }, [active, particleCount, spread, originY, colors]);

    if (!active) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 pointer-events-none z-50 overflow-hidden",
          className
        )}
        {...props}
      >
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg)`,
              transition: "transform 0.1s linear",
            }}
          />
        ))}
      </div>
    );
  }
);

Confetti.displayName = "Confetti";

export { Confetti };
