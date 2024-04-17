"use client";
import { useEffect } from "react";
import Matter from "matter-js";
export default function Home() {
  useEffect(() => {
    // Module aliases
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Composite = Matter.Composite;

    // Create an engine with no native gravity
    const engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });

    // Create a renderer
    const render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
      },
    });

    // Create walls
    const wallThickness = 50; // Thickness of each wall
    const wallOptions = {
      isStatic: true,
      restitution: 1.0, // Walls will reflect all energy back, no energy lost in collision
    };
    const walls = [
      Bodies.rectangle(render.options.width / 2, -wallThickness / 2, render.options.width, wallThickness, wallOptions), // Top wall
      Bodies.rectangle(render.options.width / 2, render.options.height + wallThickness / 2, render.options.width, wallThickness, wallOptions), // Bottom wall
      Bodies.rectangle(-wallThickness / 2, render.options.height / 2, wallThickness, render.options.height, wallOptions), // Left wall
      Bodies.rectangle(render.options.width + wallThickness / 2, render.options.height / 2, wallThickness, render.options.height, wallOptions), // Right wall
    ];
    Composite.add(engine.world, walls);

    // Create multiple bodies with random initial positions and velocities
    const bodies = [];
    const width = render.options.width;
    const height = render.options.height;
    const velocityFactor = 0.5;
    for (let i = 0; i < 4; i++) {
      // Create four bodies that will move
      const positionX = Math.random() * (width - 40) + 20;
      const positionY = Math.random() * (height - 40) + 20;
      const velocityX = (Math.random() - 0.5) * 2 * velocityFactor; // Random velocity between -1 and 1
      const velocityY = (Math.random() - 0.5) * 2 * velocityFactor; // Random velocity between -1 and 1
      const body = Bodies.circle(positionX, positionY, 10, {
        mass: 5,
        frictionAir: 0.0,
        restitution: 1.0 // Ensure high elasticity for good bounces
      });
      Matter.Body.setVelocity(body, { x: velocityX, y: velocityY });
      bodies.push(body);
    }
    Composite.add(engine.world, bodies);

    // Create the "sun" body with no initial velocity
    const sun = Bodies.circle(width / 2, height / 2, 20, {
      mass: 1000, // large mass to attract other bodies strongly
      frictionAir: 0.0,
      render: { fillStyle: "yellow" }, // styling to differentiate
    });
    bodies.push(sun);
    Composite.add(engine.world, sun);

     // Setup mouse control
     const mouse = Mouse.create(render.canvas);
     const mouseConstraint = MouseConstraint.create(engine, {
       mouse: mouse,
       constraint: {
         render: { visible: false },
         stiffness: 0.2,
       },
     });
     Composite.add(engine.world, mouseConstraint);
 
    //  Matter.Events.on(mouseConstraint, "mousemove", function (event) {
    //    Matter.Body.setPosition(sun, event.mouse.position);
    //    Matter.Body.setVelocity(sun, { x: 0, y: 0 });
    //  });

    // Apply gravitational forces
    const applyGravity = () => {
      bodies.forEach((bodyA, indexA) => {
        bodies.forEach((bodyB, indexB) => {
          if (indexA !== indexB) {
            const dx = bodyB.position.x - bodyA.position.x;
            const dy = bodyB.position.y - bodyA.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceMagnitude =
              (bodyA.mass * bodyB.mass) / (distance * distance);
            const forceDirection = Matter.Vector.normalise({ x: dx, y: dy });
            const force = Matter.Vector.mult(forceDirection, forceMagnitude);
            Matter.Body.applyForce(
              bodyA,
              bodyA.position,
              Matter.Vector.mult(force, 0.001) // Small multiplier to control the effect of force
            );
          }
        });
      });
      // Matter.Body.setVelocity(sun, { x: 0, y: 0 });
      // Matter.Body.setPosition(sun, { x: width / 2, y: height / 2 });

    };

    // Run the renderer
    Render.run(render);

    // Create and run the runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Register an event to update the simulation
    Matter.Events.on(engine, "beforeUpdate", applyGravity);

    // Cleanup on unmount
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world);
      Engine.clear(engine);
      render.canvas.remove();
      render.canvas = null!;
      render.context = null!;
    };
  }, []);

  return <main></main>;
}
