import React, { useEffect, useState, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";

const ExcalidrawComponent: React.FC<{ sessionId: string }> = ({
  sessionId,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [drawingData, setDrawingData] = useState<{
    elements: any[];
    appState: any;
  }>({ elements: [], appState: {} });

  useEffect(() => {
    const socket: Socket = io("http://localhost:3001"); // Connect to backend
    socketRef.current = socket;

    // Join the session
    socket.emit("joinSession", sessionId);

    // Listen for drawing updates from other clients
    socket.on("drawingUpdate", (data: any) => {
      // Update the drawing data state
      setDrawingData(data);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const handleChange = (elements: any, appState: any) => {
    if (socketRef.current) {
      // Emit drawing updates to the server
      socketRef.current.emit("drawingUpdate", sessionId, {
        elements,
        appState,
      });

      setDrawingData(elements);
    }
  };

  return (
    <div style={{ height: "500px" }}>
      <Excalidraw
        initialData={drawingData} // Pass the drawing data to Excalidraw
        onChange={handleChange}
      />
    </div>
  );
};

export default ExcalidrawComponent;
