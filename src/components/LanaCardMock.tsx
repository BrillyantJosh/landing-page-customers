import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  /** What to encode in the QR. Defaults to the public URL. */
  qrValue?: string;
}

/**
 * Real Lana card visual: uses the printed back-page image as background
 * and overlays a QR code over the white square. Fills its parent — keep
 * inside an aspect-[3/2] container so the image isn't cropped.
 *
 * The white-square coordinates below were measured against
 * /public/lana-card-back.png (≈600×400). If the printed card is updated,
 * adjust the inset percentages here.
 */
export function LanaCardMock({ qrValue = "https://www.mejmosefajn.org" }: Props) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(qrValue, {
      width: 320,
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0608", light: "#ffffff00" },
    })
      .then(setQrSrc)
      .catch((err) => console.error("QR render failed:", err));
  }, [qrValue]);

  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-black">
      <img
        src="/lana-card-back.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* QR code overlay positioned on the white square */}
      <div
        className="absolute flex items-center justify-center"
        style={{ top: "33%", left: "39%", width: "22%", aspectRatio: "1 / 1" }}
      >
        {qrSrc ? (
          <img src={qrSrc} alt="QR" className="block w-full h-full" draggable={false} />
        ) : null}
      </div>
    </div>
  );
}
