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
        marginTop: "0.5rem",
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

/** 🔹 Admin Dashboard */
export default function AdminPage() {
  const { data: session, status } = useSession();

  const [allFiles, setAllFiles] = useState({});
  const [newFiles, setNewFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchAll = async () => {
      try {
        const res = await fetch("/api/s3/listAll", { method: "POST" });
        if (!res.ok) {
          console.error("Failed to fetch all files", res.status);
          return;
        }
        const data = await res.json();
        setAllFiles(data);

        // detect new files in last 24h
        const now = new Date();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const recent = [];
        Object.entries(data).forEach(([orgId, dirs]) => {
          ["inbound", "outbound"].forEach((dir) => {
            dirs[dir].forEach((f) => {
              if (new Date(f.lastModified) > cutoff) {
                recent.push({ orgId, dir, name: f.name });
              }
            });
          });
        });

        setNewFiles(recent);
      } catch (err) {
        console.error("Error fetching all files:", err);
      }
    };

    fetchAll();
  }, [status]);

  const handleUpload = async () => {
    if (!file || !selectedOrg) {
      alert("Please select an org and a file");
      return;
    }

    try {
      const res = await fetch("/api/s3/upload", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          targetOrgId: selectedOrg, // ✅ admin must specify target org
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Failed to request upload", res.status);
        return;
      }

      const { url } = await res.json();

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      alert(`File uploaded to ${selectedOrg}/inbound/ ✅`);
      setFile(null);
      setSelectedOrg("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div style={{ padding: "2rem", color: "var(--dark-carolina)" }}>
      <h1>Blue Liberty Admin Dashboard</h1>
      <p>Role: {session.user?.role}</p>

      {newFiles.length > 0 && (
        <div
          style={{
            background: "#fffae6",
            border: "1px solid #ffe58f",
            padding: "1rem",
            marginBottom: "2rem",
            borderRadius: "8px",
          }}
        >
          <strong>🔔 {newFiles.length} new file(s)</strong>
          <ul>
            {newFiles.map((f, i) => (
              <li key={i}>
                {f.orgId} → {f.dir}: <em>{f.name}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload section */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Upload File to Campaign</h2>
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
        >
          <option value="">Select campaign...</option>
          {Object.keys(allFiles).map((orgId) => (
            <option key={orgId} value={orgId}>
              {orgId}
            </option>
          ))}
        </select>

        <FileDropZone onFileSelect={(f) => setFile(f)} />

        <button
          onClick={handleUpload}
          disabled={!file || !selectedOrg}
          style={{ marginTop: "1rem" }}
        >
          Upload
        </button>
      </div>

      {Object.entries(allFiles).map(([orgId, dirs]) => (
        <details key={orgId} style={{ marginBottom: "1rem" }}>
          <summary>{orgId}</summary>
          <h3>Inbound (Admin → Client)</h3>
          {dirs.inbound.length === 0 ? (
            <p>No inbound files</p>
          ) : (
            <ul>
              {dirs.inbound.map((f) => (
                <li key={f.name}>
                  <a href={f.url} download>
                    {f.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <h3>Outbound (Client → Admin)</h3>
          {dirs.outbound.length === 0 ? (
            <p>No outbound files</p>
          ) : (
            <ul>
              {dirs.outbound.map((f) => (
                <li key={f.name}>
                  <a href={f.url} download>
                    {f.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </details>
      ))}
    </div>
  );
}
