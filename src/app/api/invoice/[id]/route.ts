import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inr, fmtDate } from "@/lib/utils";

function safeInvoiceFilename(invoiceNo: string) {
  return invoiceNo.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80) || "invoice";
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const p = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { member: true, subscription: { include: { plan: true } } },
  });
  if (!p) return new NextResponse("Not found", { status: 404 });

  const asDownload =
    req.nextUrl.searchParams.get("download") === "1" ||
    req.nextUrl.searchParams.get("download") === "true";

  const downloadTip = asDownload
    ? `<p class="muted" style="margin-top:16px">This file was saved to your device. To get a <strong>PDF</strong>, click the <strong>Download PDF</strong> button below or use Print (Ctrl+P).</p>`
    : "";

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${p.invoiceNo}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body{font-family:ui-sans-serif,system-ui,Arial;margin:40px;color:#111}
      .card{max-width:720px;width:100%;margin:auto;border:1px solid #eee;border-radius:12px;padding:32px;background:#fff}
      h1{margin:0;color:#DC2626}
      .muted{color:#666;font-size:12px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      td,th{padding:10px;border-bottom:1px solid #f1f1f1;text-align:left}
      .right{text-align:right}
      .total{font-size:20px;font-weight:800;color:#DC2626}
      .btn{display:inline-block;margin-top:16px;padding:10px 16px;background:#DC2626;color:#fff;text-decoration:none;border-radius:6px;border:none;cursor:pointer;font-size:14px;font-weight:600}
      .btn-outline{background:#fff;color:#DC2626;border:1px solid #DC2626;margin-left:8px}
      @media print {
        .no-print { display: none !important; }
        body { margin: 0 !important; padding: 12px !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .card { max-width: 100% !important; border: 1px solid #ddd !important; page-break-inside: avoid; }
        @page { margin: 12mm; size: auto; }
      }
      .note-box { margin-top: 24px; padding: 12px; border-radius: 8px; background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b; font-size: 13px; font-weight: 500; }
    </style>
  </head>
  <body>
    <div id="invoice-content" class="card">
      <div class="inv-header" style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <h1>Xtreme Fitness Gym</h1>
          <div class="muted">SCO-5D, 2nd Floor, City Square, Sec-127, Sante Majra, Kharar · +91 70092 73963, +91 76968 89589</div>
        </div>
        <div class="right" style="flex-shrink:0;text-align:right">
          <div><b>Invoice</b> ${p.invoiceNo}</div>
          <div class="muted">${fmtDate(p.receivedAt)}</div>
        </div>
      </div>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee" />
      <div><b>Billed To</b></div>
      <div>${p.member.firstName} ${p.member.lastName} · ${p.member.phone}</div>
      <div class="muted">${p.member.memberCode}</div>

      <table>
        <tr><th>Description</th><th class="right">Amount</th></tr>
        <tr>
          <td>${p.subscription ? `${p.subscription.plan.name} — membership` : "Membership payment"}</td>
          <td class="right">${inr(p.amount)}</td>
        </tr>
        <tr>
          <td>Method</td>
          <td class="right">${p.method}</td>
        </tr>
        <tr>
          <td>Payment type</td>
          <td class="right">${p.payType === "FULL" ? "Full (cleared balance due)" : "Partial"}</td>
        </tr>
      </table>

      <div class="right" style="margin-top:16px">
        <div class="muted">Total Paid</div>
        <div class="total">${inr(p.amount)}</div>
      </div>

      <div class="note-box">
        Note: Fee is non-refundable and non-adjustable.
      </div>

      <div class="no-print" style="margin-top:24px; display: flex; gap: 8px;">
        <button onclick="window.print()" class="btn">Print</button>
        <button onclick="downloadPDF()" class="btn btn-outline">Download PDF</button>
      </div>
      
      ${downloadTip}
      <div class="muted" style="margin-top:24px">Thank you for training with us at Xtreme Fitness!</div>
    </div>

    <script>
      function runHtml2Pdf() {
        var element = document.getElementById('invoice-content');
        if (!element || typeof html2pdf === 'undefined') return Promise.resolve();
        var buttons = element.querySelector('.no-print');
        if (buttons) buttons.style.display = 'none';

        var opt = {
          margin: 0.5,
          filename: 'Xtreme-Invoice-${p.invoiceNo}.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        return html2pdf().set(opt).from(element).save().then(function() {
          if (buttons) buttons.style.display = 'flex';
        });
      }

      function downloadPDF() {
        var params = new URLSearchParams(window.location.search);
        if (params.get('auto') === '1') {
          return runHtml2Pdf();
        }
        var iframe = document.createElement('iframe');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1024px;height:1200px;border:0;visibility:hidden;';
        var u = new URL(window.location.href);
        u.searchParams.set('auto', '1');
        iframe.src = u.toString();
        document.body.appendChild(iframe);
        setTimeout(function() {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 10000);
      }

      (function() {
        if (new URLSearchParams(window.location.search).get('auto') === '1') {
          window.addEventListener('load', function() {
            setTimeout(runHtml2Pdf, 100);
          });
        }
      })();
    </script>
  </body>
</html>`;

  const headers: Record<string, string> = { "Content-Type": "text/html; charset=utf-8" };
  if (asDownload) {
    headers["Content-Disposition"] = `attachment; filename="Xtreme-Invoice-${safeInvoiceFilename(p.invoiceNo)}.html"`;
  }

  return new NextResponse(html, { headers });
}
