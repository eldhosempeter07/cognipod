import React, { useState } from "react";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css"; // Import the CSS for react-resizable
import CodeEditor from "./CodeEditor";
import ExcalidrawComponent from "./ExcalidrawComponent";

interface ResizableLayoutProps {
  sessionId: string;
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({ sessionId }) => {
  const [width, setWidth] = useState<number>(600); // Initial width for the code editor
  const [height, setHeight] = useState<number>(400); // Initial height for the code editor

  return (
    <Resizable
      height={height}
      width={width}
      onResize={(event, { size }) => {
        setWidth(size.width);
        setHeight(size.height);
      }}
    >
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Left Panel: Code Editor */}
        <Resizable
          width={width}
          height={height}
          onResize={(event, { size }) => {
            setWidth(size.width);
            setHeight(size.height);
          }}
        >
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            {/* <CodeEditor sessionId={sessionId} /> */}
          </div>
        </Resizable>

        {/* Resize Handle */}
        <div
          style={{
            width: "10px",
            cursor: "col-resize",
            backgroundColor: "#ddd",
          }}
        />

        {/* Right Panel: Excalidraw */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <ExcalidrawComponent sessionId={sessionId} />
        </div>
      </div>
    </Resizable>
  );
};

export default ResizableLayout;
