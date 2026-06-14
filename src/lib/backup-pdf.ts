import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { Lang } from "@/contexts/LanguageContext";

// Brand colors (from tailwind.config.ts)
const INK: [number, number, number] = [26, 42, 74];      // #1A2A4A
const BLUE: [number, number, number] = [59, 130, 246];   // #3B82F6
const LAVENDER: [number, number, number] = [219, 234, 254]; // #DBEAFE
const AMBER_BG: [number, number, number] = [255, 247, 224];
const AMBER_BORDER: [number, number, number] = [245, 215, 150];
const AMBER_TEXT: [number, number, number] = [146, 90, 20];
const MUTED: [number, number, number] = [110, 120, 140];

const TXT = {
  sl: {
    title: "Varnostna kopija denarnice",
    subtitle: "Lana denarnica — hranite ta dokument na varnem mestu",
    warnTitle: "POMEMBNO — shranite varno",
    warn: "Ta dokument vsebuje vaš zasebni ključ (WIF). Kdorkoli z njim ima popoln dostop do vaše denarnice in sredstev. Nikoli ga ne delite, ne fotografirajte v oblak in ne pošiljajte po sporočilih. Natisnite ga ali shranite na varno mesto brez povezave (npr. v sef).",
    walletLabel: "ID denarnice (naslov)",
    keyLabel: "Zasebni ključ (WIF)",
    qrCaption: "Skenirajte za obnovitev denarnice",
    created: "Ustvarjeno",
    footer: "Lana. Preprosto. Lepo. Tvoje.",
  },
  en: {
    title: "Wallet Backup",
    subtitle: "Lana wallet — keep this document in a safe place",
    warnTitle: "IMPORTANT — store securely",
    warn: "This document contains your private key (WIF). Anyone who has it gains full access to your wallet and funds. Never share it, never photograph it to the cloud, and never send it via messages. Print it or store it in a safe offline place (e.g. a vault).",
    walletLabel: "Wallet ID (address)",
    keyLabel: "Private key (WIF)",
    qrCaption: "Scan to restore the wallet",
    created: "Created",
    footer: "Lana. Simple. Beautiful. Yours.",
  },
};

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function fetchDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function fetchBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return bufferToBase64(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// Registers a Unicode font (DejaVu Sans) that supports Slovenian č/š/ž.
// Returns the family name to use, or "helvetica" if the fonts couldn't load.
async function registerUnicodeFont(doc: jsPDF): Promise<string> {
  const [reg, bold] = await Promise.all([
    fetchBase64("/fonts/DejaVuSans.ttf"),
    fetchBase64("/fonts/DejaVuSans-Bold.ttf"),
  ]);
  if (!reg || !bold) return "helvetica";
  doc.addFileToVFS("DejaVuSans.ttf", reg);
  doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVuSans", "bold");
  return "DejaVuSans";
}

interface BackupData {
  walletId: string;
  wif: string;
  lang: Lang;
  ownerName?: string;
}

export async function generateBackupPdf(
  { walletId, wif, lang, ownerName }: BackupData,
  opts?: { output?: "datauri" },
): Promise<string | void> {
  const tx = TXT[lang];
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;

  // Load assets in parallel
  const [qrDataUrl, logoDataUrl, FONT] = await Promise.all([
    QRCode.toDataURL(wif, { margin: 1, width: 600, errorCorrectionLevel: "H" }),
    fetchDataUrl("/lana-favicon.png"),
    registerUnicodeFont(doc),
  ]);

  let y = margin;

  // ── Header band ──
  doc.setFillColor(...LAVENDER);
  doc.roundedRect(margin, y, contentW, 30, 4, 4, "F");
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin + 6, y + 6, 18, 18);
  }
  doc.setTextColor(...INK);
  doc.setFont(FONT, "bold");
  doc.setFontSize(19);
  doc.text(tx.title, margin + 30, y + 14);
  doc.setFont(FONT, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(tx.subtitle, margin + 30, y + 22);
  y += 30 + 8;

  // ── Owner (optional) ──
  if (ownerName) {
    doc.setFont(FONT, "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(ownerName, margin, y);
    y += 8;
  }

  // ── Warning box ──
  doc.setFont(FONT, "normal");
  doc.setFontSize(9.5);
  const warnLines = doc.splitTextToSize(tx.warn, contentW - 12) as string[];
  const warnBoxH = 13 + warnLines.length * 4.8;
  doc.setFillColor(...AMBER_BG);
  doc.setDrawColor(...AMBER_BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, warnBoxH, 3, 3, "FD");
  doc.setFont(FONT, "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...AMBER_TEXT);
  doc.text(tx.warnTitle, margin + 6, y + 8);
  doc.setFont(FONT, "normal");
  doc.setFontSize(9.5);
  doc.text(warnLines, margin + 6, y + 15);
  y += warnBoxH + 10;

  // ── Key/value fields ──
  const drawField = (label: string, value: string): void => {
    doc.setFont(FONT, "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BLUE);
    doc.text(label.toUpperCase(), margin, y);
    y += 5;
    const valLines = doc.splitTextToSize(value, contentW - 10) as string[];
    const boxH = 6 + valLines.length * 5.2;
    doc.setFillColor(248, 250, 253);
    doc.setDrawColor(...LAVENDER);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentW, boxH, 2.5, 2.5, "FD");
    // values are ASCII (base58) — courier keeps them crisp & monospaced
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(valLines, margin + 5, y + 7.5);
    y += boxH + 9;
  };

  drawField(tx.walletLabel, walletId);
  drawField(tx.keyLabel, wif);

  // ── QR code ──
  const qrSize = 56;
  const qrX = (W - qrSize) / 2;
  doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
  y += qrSize + 6;
  doc.setFont(FONT, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(tx.qrCaption, W / 2, y, { align: "center" });

  // ── Footer ──
  const dateStr = new Date().toLocaleString(lang === "sl" ? "sl-SI" : "en-GB");
  const footerY = 285;
  doc.setDrawColor(...LAVENDER);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 6, W - margin, footerY - 6);
  doc.setFont(FONT, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(tx.footer, margin, footerY);
  doc.text(`${tx.created}: ${dateStr}`, W - margin, footerY, { align: "right" });

  if (opts?.output === "datauri") {
    return doc.output("datauristring");
  }

  const shortId = walletId.slice(0, 10);
  doc.save(`lana-backup-${shortId}.pdf`);
}
