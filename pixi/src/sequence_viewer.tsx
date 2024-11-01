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

type BaseSequenceType =
  | {
      type: "dna";
      defaultLayout: "linear" | "circular";
      sequence: string;
      title?: string;
    }
  | {
      type: "protein";
      sequence: string;
      title?: string;
    };

type AgkContextType = {
  sequences: BaseSequenceType[];
};

const AgkContext = React.createContext<undefined | AgkContextType>(undefined);

const AgkProvider = ({
  sequences,
  children,
}: {
  sequences: BaseSequenceType[];
  children?: React.ReactNode;
}) => {
  return (
    <AgkContext.Provider value={{ sequences }}>{children}</AgkContext.Provider>
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

export const SequenceViewer = ({
  sequences,
}: {
  sequences: BaseSequenceType[];
}) => {
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
      {wrapperRef && <App wrapper={wrapperRef} sequences={sequences} />}
    </div>
  );
};

function App({
  wrapper,
  sequences,
}: {
  wrapper: HTMLDivElement;
  sequences: BaseSequenceType[];
}) {
  return (
    <Application
      background={"orange"}
      resizeTo={wrapper}
      antialias
      autoDensity
      resolution={2}
    >
      <AgkProvider sequences={sequences}>
        <AppStateProvider>
          <Canvas />
        </AppStateProvider>
      </AgkProvider>
    </Application>
  );
}

type Sequence = BaseSequenceType & {
  id: string;
};

type AppState = {
  sequences: Sequence[];
  rotation: number;
  updateRotation: (rotation: number) => void;
  updateSequence: (
    id: string,
    update: (sequence: Sequence) => Sequence,
  ) => void;
};

const AppStateContext = React.createContext<undefined | AppState>(undefined);

const useAppState = () => {
  const ctx = React.useContext(AppStateContext);
  if (!ctx) {
    throw new Error(
      "You must wrap your component in <AppStateProvider> to use useAppState()",
    );
  }
  return ctx;
};

function AppStateProvider({ children }: { children?: React.ReactNode }) {
  const agk = useAkg();
  const [sequences, setSequences] = React.useState(
    agk.sequences.map((sequence) => ({
      ...sequence,
      id: Math.random().toString(36).substring(7),
    })),
  );
  const [rotation, setRotation] = React.useState(0);
  const appState = React.useMemo((): AppState => {
    return {
      sequences,
      rotation,
      updateRotation: setRotation,
      updateSequence: (
        id: string,
        update: (sequence: Sequence) => Sequence,
      ) => {
        setSequences((sequences) =>
          sequences.map((sequence) =>
            sequence.id === id ? update(sequence) : sequence,
          ),
        );
      },
    };
  }, [sequences, rotation]);

  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
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

  const { sequences } = useAppState();
  const [viewport, setViewport] = React.useState<Viewport | null>(null);

  React.useEffect(() => {
    if (!viewport) {
      return;
    }
    viewport.wheel().drag();

    const onWheel = (ev: WheelEvent) => {
      if (ev.shiftKey) {
        ev.preventDefault();
        setRotation((rotation) => rotation + ev.deltaY * 0.001);
      }
    };

    viewport.options.events.domElement.addEventListener("wheel", onWheel, {
      passive: false,
    });

    return () => {
      viewport.destroy();
      viewport.options.events.domElement.removeEventListener("wheel", onWheel);
    };
  }, [viewport]);

  const rows = Math.ceil(Math.sqrt(sequences.length));
  const cols = rows;

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
        stopWheel={(ev) => {
          return ev.shiftKey;
        }}
        ref={setViewport}
      >
        {sequences.map((seq, index) => {
          const row = 1 + Math.floor(index / cols);
          const col = 1 + (index % cols);

          return (
            <container
              key={seq.id}
              rotation={rotation}
              scale={scale}
              width={INTERFACE_WIDTH}
              height={INTERFACE_HEIGHT}
              pivot={{ x: INTERFACE_WIDTH / 2, y: INTERFACE_HEIGHT / 2 }}
              x={(col * appWidth) / 2}
              y={(row * appHeight) / 2}
            >
              <graphics draw={drawCallback} />
              {seq.sequence.split("").map((base, i) => {
                const angle =
                  (i / seq.sequence.length) * Math.PI * 2 + Math.PI / 2;
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
          );
        })}
      </viewport>
    </container>
  );
}
