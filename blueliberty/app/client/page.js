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
  const [inboundFiles, setInboundFiles] = useState([]);
  const [outboundFiles, setOutboundFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Fetch inbound & outbound files for the user's org
  useEffect(() => {
  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch("/api/s3/listOrgFiles", { method: "POST" });
      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        console.error("API error:", data);
        throw new Error(data?.error || `Failed with status ${res.status}`);
      }

      setInboundFiles(data.inbound || []);
      setOutboundFiles(data.outbound || []);
    } catch (err) {
      console.error("Fetch files failed:", err);
      setInboundFiles([]);
      setOutboundFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  if (session?.user?.orgId) fetchFiles();
}, [session?.user?.orgId]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Not signed in</p>;

  const renderFileCards = (files) =>
    files.map((f) => {
      const dateStr = f.lastModified
        ? new Date(f.lastModified).toISOString().split("T")[0]
        : "";

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
    });

  return (
    <div style={{ padding: "2rem", color: "var(--dark-carolina)" }}>
      <h1>{session.user?.orgName || "N/A"}&apos;s Dashboard</h1>

      {/* Upload section */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Upload Files</h2>
        <FileDropZone onFileSelect={(f) => setFile(f)} />
        <button
          onClick={() => handleUpload(file, setOutboundFiles)}
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

      {/* Inbound files */}
      <section style={{ marginTop: "2rem" }}>
        <h2>
    Files From Blue Liberty ({inboundFiles.length})
  </h2>
        {loadingFiles ? (
          <p>Loading files...</p>
        ) : inboundFiles.length === 0 ? (
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
            {renderFileCards(inboundFiles)}
          </div>
        )}
      </section>

      {/* Outbound files */}
      <section style={{ marginTop: "2rem" }}>
          <h2>
    Files To Blue Liberty ({outboundFiles.length})
  </h2>
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
            {renderFileCards(outboundFiles)}
          </div>
        )}
      </section>
    </div>
  );
}

// Upload function now optionally refreshes outbound files
async function handleUpload(file, setOutboundFiles) {
  if (!file) return;

  try {
    // Step 1: Get presigned URL from API
    const res = await fetch("/api/s3/upload", {
      method: "POST",
      body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Failed to get upload URL");
    const { url } = await res.json();

    // Step 2: Upload file to S3
    await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    alert("File uploaded!");

    // Step 3: Refresh outbound files
    const listRes = await fetch("/api/s3/listOrgFiles", { method: "POST" });
    if (listRes.ok) {
      const data = await listRes.json();
      setOutboundFiles(data.outbound || []);
    }
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed. Please try again.");
  }
}

// Download file
async function downloadFile(f) {
  try {
    const res = await fetch(f.url, { method: "GET" });
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
