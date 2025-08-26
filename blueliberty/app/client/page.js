"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

function FileDropZone({ onFileSelect }) {
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
    if (e.dataTransfer.files?.length > 0) {
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
        borderRadius: "12px",
        padding: "2rem",
        textAlign: "center",
        background: dragging ? "#f0f8ff" : "#fafafa",
        cursor: "pointer",
      }}
    >
      <p style={{ marginBottom: "0.5rem" }}>
        {dragging ? "Release to upload" : "Drag & drop a file here"}
      </p>
      <p style={{ margin: "0.5rem 0" }}>or</p>
      <input type="file" onChange={(e) => onFileSelect(e.target.files[0])} />
    </div>
  );
}

export default function ClientPage() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [outboundFiles, setOutboundFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

useEffect(() => {
  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/s3/list", { method: "POST" });
      if (!res.ok) throw new Error("Failed to fetch");
      const text = await res.text();
      if (!text) return setOutboundFiles([]);

      let data = JSON.parse(text);
      if (!Array.isArray(data)) data = [];

      // ✅ sort by lastModified descending (most recent first)
      data.sort((a, b) => new Date(b.lastModified || b.uploadedAt) - new Date(a.lastModified || a.uploadedAt));

      setOutboundFiles(data);
    } catch (err) {
      console.error(err);
      setOutboundFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };
  if (session?.user?.orgId) fetchFiles();
}, [session?.user?.orgId]);


  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Not signed in</p>;

  return (
    <div style={{ padding: "2rem", color: "var(--dark-carolina)" }}>
      <h1>{session.user?.orgName || "N/A"}&apos;s Dashboard</h1>

      {/* Upload section */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Upload Files</h2>
        <FileDropZone onFileSelect={(f) => setFile(f)} />
        <button
          onClick={() => handleUpload(file)}
          disabled={!file}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            background: "var(--dark-carolina)",
            color: "#fff",
            borderRadius: "6px",
            border: "none",
            cursor: file ? "pointer" : "not-allowed",
          }}
        >
          Upload
        </button>
      </section>

      {/* Outbound files as CARDS */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Files From Blue Liberty</h2>
        {loadingFiles ? (
          <p>Loading files...</p>
        ) : outboundFiles.length === 0 ? (
          <p>No files available.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.5rem",
              marginTop: "1rem",
            }}
          >
{outboundFiles.map((f) => {
  // format the date
  let dateStr = "";
  if (f.lastModified || f.uploadedAt) {
    const d = new Date(f.lastModified || f.uploadedAt);
    dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
  }
  return (
    <div
      key={f.name}
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100px",
      }}
    >
      {/* File name + inline download button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontWeight: "600",
            color: "var(--dark-carolina)",
            wordBreak: "break-word",
          }}
        >
          {f.name}
        </div>
        <button
          onClick={() => downloadFile(f)}
          title="Download file"
          style={{
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          ⬇️
        </button>
      </div>

      {/* Date uploaded */}
      {dateStr && (
        <div
          style={{
            fontSize: "0.85rem",
            fontStyle: "italic",
            color: "#444",
            marginTop: "0.4rem",
          }}
        >
          Date uploaded: {dateStr}
        </div>
      )}
    </div>
  );
})}


          </div>
        )}
      </section>
    </div>
  );
}

async function handleUpload(file) {
  if (!file) return;
  const res = await fetch("/api/s3/upload", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    headers: { "Content-Type": "application/json" },
  });
  const { url } = await res.json();
  await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  alert("File uploaded!");
}

async function downloadFile(f) {
  try {
    const res = await fetch(f.downloadUrl, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const blob = new Blob([arrayBuffer], {
      type: res.headers.get("Content-Type") || "application/octet-stream",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = f.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Download failed. Please try again.");
  }
}
