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
    ? `<p class="muted" style="margin-top:16px">This file was saved to your device. To get a <strong>PDF</strong>, open it and choose <strong>Print</strong> (Ctrl+P / ⌘P), then select <strong>Save as PDF</strong> as the printer.</p>`
    : "";

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${p.invoiceNo}</title>
    <style>
      body{font-family:ui-sans-serif,system-ui,Arial;margin:40px;color:#111}
      .card{max-width:720px;margin:auto;border:1px solid #eee;border-radius:12px;padding:32px}
      h1{margin:0;color:#DC2626}
      .muted{color:#666;font-size:12px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      td,th{padding:10px;border-bottom:1px solid #f1f1f1;text-align:left}
      .right{text-align:right}
      .total{font-size:20px;font-weight:800;color:#DC2626}
      .btn{display:inline-block;margin-top:16px;padding:10px 16px;background:#DC2626;color:#fff;text-decoration:none;border-radius:6px}
      @media print { .btn{display:none} }
    </style>
  </head>
  <body>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <h1>Xtreme Fitness Gym</h1>
          <div class="muted">Sector 115, Mohali · +91 98765 43210</div>
        </div>
        <div class="right">
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

      <a href="javascript:window.print()" class="btn">Print</a>
      ${downloadTip}
      <div class="muted" style="margin-top:24px">Thank you for training with us at Xtreme Fitness!</div>
    </div>
  </body>
</html>`;

  const headers: Record<string, string> = { "Content-Type": "text/html; charset=utf-8" };
  if (asDownload) {
    headers["Content-Disposition"] = `attachment; filename="Xtreme-Invoice-${safeInvoiceFilename(p.invoiceNo)}.html"`;
  }

  return new NextResponse(html, { headers });
}
