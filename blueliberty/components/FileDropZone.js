"use client";
import { useState } from "react";

export default function FileDropZone({ onFileSelect }) {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: "2px dashed var(--dark-carolina)",
        borderRadius: "8px",
        padding: "2rem",
        textAlign: "center",
        background: dragging ? "#f0f8ff" : "transparent",
        cursor: "pointer",
        marginTop: "1rem",
      }}
    >
      <p>{dragging ? "Release to upload" : "Drag & drop a file here"}</p>
      <p>or</p>
      <input type="file" onChange={(e) => onFileSelect(e.target.files[0])} />
    </div>
  );
}
