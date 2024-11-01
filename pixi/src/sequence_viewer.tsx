import { Layout } from "@pixi/layout";
import { Application, extend, useApplication } from "@pixi/react";
import { DrawCallback } from "@pixi/react/src/typedefs/DrawCallback";
import { Text, Container, Graphics, Rectangle, EventSystem } from "pixi.js";
import { Viewport, Wheel } from "pixi-viewport";
import React from "react";

extend({
  Container,
  Graphics,
  Layout,
  Text,
  Viewport,
});

const INTERFACE_WIDTH = 800;
const INTERFACE_HEIGHT = 600;

// AGK = Anocca Gene Kit

type AgkContextType = {
  sequence: string;
};

const AgkContext = React.createContext<undefined | AgkContextType>(undefined);

const AgkProvider = ({
  sequence,
  children,
}: {
  sequence: string;
  children?: React.ReactNode;
}) => {
  return (
    <AgkContext.Provider value={{ sequence }}>{children}</AgkContext.Provider>
  );
};

const useAkg = () => {
  const ctx = React.useContext(AgkContext);
  if (!ctx) {
    throw new Error(
      "You must wrap your component in <AgkProvider> to use useAkg()",
    );
  }
  return ctx;
};

export const SequenceViewer = ({ sequence }: { sequence: string }) => {
  const [wrapperRef, setWrapperRef] = React.useState<HTMLDivElement | null>(
    null,
  );

  return (
    <div
      ref={setWrapperRef}
      style={{
        width: "100%",
        aspectRatio: 1,
      }}
    >
      {wrapperRef && <App wrapper={wrapperRef} sequence={sequence} />}
    </div>
  );
};

function App({
  wrapper,
  sequence,
}: {
  wrapper: HTMLDivElement;
  sequence: string;
}) {
  return (
    <Application
      background={"orange"}
      resizeTo={wrapper}
      antialias
      autoDensity
      resolution={2}
    >
      <AgkProvider sequence={sequence}>
        <Canvas />
      </AgkProvider>
    </Application>
  );
}

function Canvas() {
  const [rotation, setRotation] = React.useState(0);
  const [scale, setZoom] = React.useState(1);

  const { app } = useApplication();

  const drawCallback: DrawCallback = React.useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: "red" });
    graphics.rect(0, 0, INTERFACE_WIDTH, INTERFACE_HEIGHT);
    graphics.fill();
    graphics.stroke({
      width: 10,
      color: 0x000000,
    });
  }, []);

  const appWidth = app.screen.width;
  const appHeight = app.screen.width;

  const rect = React.useMemo(
    () => new Rectangle(0, 0, appWidth, appHeight),
    [appWidth, appHeight],
  );

  const { sequence } = useAkg();
  const [viewport, setViewport] = React.useState<Viewport | null>(null);

  React.useEffect(() => {
    console.log("ref updated");
    if (!viewport) {
      return;
    }
    viewport.wheel({
      interruptWhilePressed: ["ShiftLeft", "ShiftRight"],
    });

    const onWheel = (ev: WheelEvent) => {
      if (ev.shiftKey) {
        ev.preventDefault();
        setRotation(rotation + ev.deltaY * 0.01);
      }
    };

    viewport.options.events.domElement.addEventListener("wheel", onWheel, {
      passive: false,
    });

    return () => {
      console.log("??");
      viewport.destroy();
      viewport.options.events.domElement.removeEventListener("wheel", onWheel);
    };
  }, [viewport]);

  return (
    <container
      x={0}
      y={0}
      width={appWidth}
      height={appHeight}
      hitArea={rect}
      eventMode="dynamic"
      interactive
    >
      <viewport
        events={app.renderer.events}
        worldWidth={1600}
        worldHeight={1200}
        screenWidth={appWidth}
        screenHeight={appHeight}
        ticker={app.ticker}
        passiveWheel={false}
        ref={setViewport}
      >
        <container
          rotation={rotation}
          scale={scale}
          width={INTERFACE_WIDTH}
          height={INTERFACE_HEIGHT}
          pivot={{ x: INTERFACE_WIDTH / 2, y: INTERFACE_HEIGHT / 2 }}
          x={appWidth / 2}
          y={appHeight / 2}
        >
          <graphics draw={drawCallback} />
          {sequence.split("").map((base, i) => {
            const angle = (i / sequence.length) * Math.PI * 2 + Math.PI / 2;
            const r = INTERFACE_HEIGHT / 2;
            const x = Math.cos(angle) * r + INTERFACE_WIDTH / 2;
            const y = Math.sin(angle) * r + INTERFACE_HEIGHT / 2;
            return (
              <pixiText
                key={i}
                text={base}
                x={x}
                y={y}
                anchor={{ x: 0.5, y: 0.5 }}
                rotation={angle}
                style={{
                  align: "center",
                  fill: "0xffffff",
                  fontSize: 12,
                  letterSpacing: 0,
                }}
              ></pixiText>
            );
          })}
        </container>
      </viewport>
    </container>
  );
}
