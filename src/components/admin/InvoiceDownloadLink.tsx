"use client";

import { useState } from "react";

export default function InvoiceDownloadLink({ 
  paymentId, 
  invoiceNo 
}: { 
  paymentId: string;
  invoiceNo: string;
}) {
  const [busy, setBusy] = useState(false);

  function download() {
    if (busy) return;
    setBusy(true);
    
    // Create a hidden iframe that loads the invoice page with ?auto=1
    // This ensures the PDF is generated using the exact same code and environment
    // as the manual download button on the invoice page.
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "1024px";
    iframe.style.height = "1024px";
    iframe.style.visibility = "hidden";
    
    iframe.src = `/api/invoice/${paymentId}?auto=1`;
    document.body.appendChild(iframe);

    // After a reasonable timeout, assume the download has started and clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
      setBusy(false);
    }, 4000);
  }

  return (
    <button 
      onClick={download} 
      className="font-semibold text-brand hover:underline disabled:cursor-not-allowed"
      disabled={busy}
    >
      {busy ? "Downloading..." : "Download"}
    </button>
  );
}
