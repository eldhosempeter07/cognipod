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

  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const sessionData = doc.data();

        if (sessionData.code !== code) {
          setCode(sessionData.code || "");
        }

        setIsModerator(sessionData.moderator === userId);

        setIsCollaborator(sessionData.collaborators?.includes(userId) || false);
      }
    });

    return () => unsubscribe();
  }, [sessionId, userId]);

  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const sessionData = doc.data();

        if (sessionData.codeOutput !== output) {
          setOutput(sessionData.codeOutput || "");
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  // Handle editor changes
  const handleChange = (value: string | undefined) => {
    if (value === undefined) return;

    if (isModerator || isCollaborator) {
      setCode(value);
      onCodeChange(value);

      updateSessionCode(sessionId, value);
    }
  };

  const handleEditorDidMount = (editor: Monaco) => {
    editorRef.current = editor; // Store the editor instance
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  const requestCollaboration = async () => {
    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      collaborators: arrayUnion(userId),
    });
    setIsCollaborator(true);
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
        {/* <button onClick={handleRunCode} style={{ marginLeft: "10px" }}>
          Run Code
        </button> */}

        {!isModerator && !isCollaborator && (
          <button onClick={requestCollaboration} style={{ marginLeft: "10px" }}>
            Request Collaboration
          </button>
        )}
      </div>

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
