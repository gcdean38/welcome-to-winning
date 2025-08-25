"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ViewerPage() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get("file");

  useEffect(() => {
    if (!fileUrl) return;

    const fetchHtml = async () => {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Failed to fetch file");
        const text = await res.text();

        // Inject auto-print script
        const injected = text.replace(
          "</body>",
          `<script>
            window.onload = () => setTimeout(() => window.print(), 500);
          </script></body>`
        );

        // ✅ Open in a new tab as a full document
        const blob = new Blob([injected], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } catch (err) {
        console.error("Viewer failed:", err);
        alert("Failed to open viewer.");
      }
    };

    fetchHtml();
  }, [fileUrl]);

  return <p>Loading document...</p>;
}
