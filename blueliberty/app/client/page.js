"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

/** 🔹 Reusable Drag-and-Drop Zone */
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
      }}
    >
      <p>{dragging ? "Release to upload" : "Drag & drop a file here"}</p>
      <p>or</p>
      <input
        type="file"
        onChange={(e) => onFileSelect(e.target.files[0])}
      />
    </div>
  );
}

/** 🔹 Main Client Dashboard */
export default function ClientPage() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [outboundFiles, setOutboundFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/s3/list", { method: "POST" });

        if (!res.ok) {
          console.error("Failed to fetch files:", res.status);
          setOutboundFiles([]);
          return;
        }

        const text = await res.text();
        if (!text) {
          setOutboundFiles([]);
          return;
        }

        const data = JSON.parse(text);
        setOutboundFiles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching files:", err);
        setOutboundFiles([]);
      } finally {
        setLoadingFiles(false);
      }
    };

    if (session?.user?.orgId) {
      fetchFiles();
    }
  }, [session?.user?.orgId]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Not signed in</p>;

  return (
    <div style={{ padding: "2rem", color: "var(--dark-carolina)" }}>
      <h1>{session.user?.orgName || "N/A"}&apos;s Dashboard</h1>

      {/* Upload section */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Upload Files</h2>
        <FileDropZone onFileSelect={(f) => setFile(f)} />
        <button
          onClick={() => handleUpload(file)}
          disabled={!file}
          style={{ marginTop: "1rem" }}
        >
          Upload
        </button>
      </div>

      {/* Outbound files */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Files From Blue Liberty</h2>
        {loadingFiles ? (
          <p>Loading files...</p>
        ) : outboundFiles.length === 0 ? (
          <p>No files available.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {outboundFiles.map((f) => (
              <li
                key={f.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  gap: "1rem",
                }}
              >
                <span>{f.name}</span>

                {/* View Icon (Eyeball) */}
                <a
                  href={f.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View file"
                  style={{ textDecoration: "none", fontSize: "1.2rem" }}
                >
                  👁️
                </a>

                {/* Download Icon */}
                <button
                  onClick={async () => {
                    try {
                      if (f.name.endsWith(".html")) {
                        window.open(
                          `/viewer?file=${encodeURIComponent(f.downloadUrl)}`,
                          "_blank"
                        );
                      } else {
                        const res = await fetch(f.downloadUrl, { method: "GET" });
                        if (!res.ok) throw new Error(`HTTP error! ${res.status}`);

                        const arrayBuffer = await res.arrayBuffer();
                        const blob = new Blob([arrayBuffer], {
                          type:
                            res.headers.get("Content-Type") ||
                            "application/octet-stream",
                        });

                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = f.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      }
                    } catch (err) {
                      console.error("Download failed:", err);
                      alert("Download failed. Please try again.");
                    }
                  }}
                  title="Download file"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                  }}
                >
                  ⬇️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** 🔹 Upload to S3 */
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
