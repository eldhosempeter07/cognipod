import React, { useState } from "react";
import ExcalidrawComponent from "./ExcalidrawComponent";
import CodeEditor from "./CodeEditor";

const CollaborationPage: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [tool, setTool] = useState<"excalidraw" | "codemirror">("codemirror");

  return (
    <div>
      <div>
        <button onClick={() => setTool("excalidraw")}>Excalidraw</button>
        <button onClick={() => setTool("codemirror")}>Code Editor</button>
      </div>
      {tool === "excalidraw" && <ExcalidrawComponent sessionId={sessionId} />}
      {/* {tool === "codemirror" && <CodeEditor sessionId={sessionId} />} */}
    </div>
  );
};

export default CollaborationPage;
