import React, { useEffect, useRef, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { arrayUnion, doc, onSnapshot, updateDoc } from "@firebase/firestore";
import { db } from "../util/firebase/firebase"; // Adjust the import path as needed
import { updateSessionCode } from "../util/firebase/services/session";

interface CodeEditorProps {
  sessionId: string;
  initialCode: string;
  userId: string;
  onCodeChange: (newCode: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  sessionId,
  initialCode,
  userId,
  onCodeChange,
}) => {
  const editorRef = useRef<Monaco | null>(null);
  const [code, setCode] = useState<string>(initialCode);
  const [language, setLanguage] = useState<string>("javascript");
  const [output, setOutput] = useState<string>("");
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [isCollaborator, setIsCollaborator] = useState<boolean>(false);

  // Subscribe to Firestore for real-time code updates
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const sessionData = doc.data();
        console.log("Firestore update received:", sessionData); // Debugging

        // Update the editor content if it has changed
        if (sessionData.code !== code) {
          setCode(sessionData.code || "");
        }

        // Check if the current user is the moderator
        setIsModerator(sessionData.moderator === userId);

        // Check if the current user is a collaborator
        setIsCollaborator(sessionData.collaborators?.includes(userId) || false);
      }
    });

    return () => unsubscribe();
  }, [sessionId, userId]);

  // Subscribe to Firestore for real-time output updates
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const sessionData = doc.data();

        // Update the output if it has changed
        if (sessionData.codeOutput !== output) {
          setOutput(sessionData.codeOutput || "");
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  // Handle editor changes
  const handleChange = (value: string | undefined) => {
    if (value === undefined) return; // Handle undefined value

    // Only allow changes if the user is the moderator or a collaborator
    if (isModerator || isCollaborator) {
      setCode(value); // Update local state
      onCodeChange(value); // Notify parent component of the change

      // Update Firestore with the new code
      updateSessionCode(sessionId, value);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: Monaco) => {
    editorRef.current = editor; // Store the editor instance
  };

  // Handle language change
  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value); // Update the selected language
  };

  // Handle running the code
  const handleRunCode = async () => {
    try {
      const response = await fetch("http://localhost:3001/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language, sessionId }), // Include sessionId in the request
      });

      const result = await response.json();
      const outputText = result.output || result.error;

      // Update local state
      setOutput(outputText);

      // Update Firestore with the new output
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, {
        codeOutput: outputText, // Store the output in Firestore
      });

      console.log("Firestore updated with output:", outputText); // Debugging
    } catch (error) {
      const errorMessage = "Error executing code.";
      setOutput(errorMessage);

      // Update Firestore with the error message
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, {
        codeOutput: errorMessage, // Store the error in Firestore
      });

      console.log("Firestore updated with error:", errorMessage); // Debugging
    }
  };

  // Request collaboration
  const requestCollaboration = async () => {
    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      collaborators: arrayUnion(userId), // Add the user to the collaborators array
    });
    setIsCollaborator(true); // Update local state
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Language:
          <select value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </label>
        <button onClick={handleRunCode} style={{ marginLeft: "10px" }}>
          Run Code
        </button>

        {/* Request collaboration button */}
        {!isModerator && !isCollaborator && (
          <button onClick={requestCollaboration} style={{ marginLeft: "10px" }}>
            Request Collaboration
          </button>
        )}
      </div>

      {/* Code Editor */}
      <Editor
        height="70vh"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly: !(isModerator || isCollaborator),
        }}
      />

      {/* Output */}
      {output && (
        <div style={{ marginTop: "10px" }}>
          <h3>Output:</h3>
          <pre
            style={{ background: "#1e1e1e", color: "#fff", padding: "10px" }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
