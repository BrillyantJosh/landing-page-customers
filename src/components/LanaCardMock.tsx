import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  /** What to encode in the QR. Defaults to the public URL. */
  qrValue?: string;
}

/**
 * Visual mock of a real Lana card (black with golden mandala texture,
 * white square in the centre that holds the QR code, "www.MejmoSeFajn.org"
 * label below). Fills its parent — use inside a positioned scan-frame.
 */
export function LanaCardMock({ qrValue = "https://www.mejmosefajn.org" }: Props) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(qrValue, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0608", light: "#ffffff" },
    })
      .then(setQrSrc)
      .catch((err) => console.error("QR render failed:", err));
  }, [qrValue]);

  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-[#0a0608]">
      {/* Mandala / particle texture — layered radial gradients */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(circle at 8% 50%, rgba(212, 165, 80, 0.55) 0%, transparent 38%)",
            "radial-gradient(circle at 92% 50%, rgba(212, 165, 80, 0.55) 0%, transparent 38%)",
            "radial-gradient(circle at 50% 0%, rgba(180, 140, 60, 0.30) 0%, transparent 45%)",
            "radial-gradient(circle at 50% 100%, rgba(180, 140, 60, 0.35) 0%, transparent 45%)",
            "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.6) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Sparkle dots — a few hand-placed gold pixels via box-shadow */}
      <div className="absolute inset-0 opacity-70 pointer-events-none">
        <div
          className="absolute w-[1px] h-[1px] bg-amber-200"
          style={{
            top: "40%",
            left: "10%",
            boxShadow: [
              "10px 8px 0 rgba(255,210,120,0.9)",
              "22px -14px 0 rgba(255,210,120,0.7)",
              "38px 18px 0 rgba(255,210,120,0.6)",
              "55px -6px 0 rgba(255,210,120,0.85)",
              "70px 14px 0 rgba(255,210,120,0.7)",
              "-12px 24px 0 rgba(255,210,120,0.55)",
              "85px -22px 0 rgba(255,210,120,0.65)",
              "100px 6px 0 rgba(255,210,120,0.5)",
              "120px -18px 0 rgba(255,210,120,0.7)",
              "-30px -10px 0 rgba(255,210,120,0.6)",
            ].join(", "),
          }}
        />
        <div
          className="absolute w-[1px] h-[1px] bg-amber-200"
          style={{
            top: "60%",
            right: "12%",
            boxShadow: [
              "-12px 6px 0 rgba(255,210,120,0.85)",
              "-26px -10px 0 rgba(255,210,120,0.7)",
              "-44px 14px 0 rgba(255,210,120,0.6)",
              "-60px -18px 0 rgba(255,210,120,0.85)",
              "-78px 22px 0 rgba(255,210,120,0.65)",
              "20px -8px 0 rgba(255,210,120,0.55)",
              "-90px -2px 0 rgba(255,210,120,0.6)",
              "-105px 16px 0 rgba(255,210,120,0.7)",
              "-130px -12px 0 rgba(255,210,120,0.5)",
            ].join(", "),
          }}
        />
      </div>

      {/* Centre layout: white QR square + URL */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 p-4">
        <div
          className="relative rounded-2xl bg-white shadow-[0_0_40px_rgba(255,200,100,0.55)] flex items-center justify-center p-1.5"
          style={{ height: "52%", aspectRatio: "1 / 1" }}
        >
          {qrSrc ? (
            <img src={qrSrc} alt="QR" className="block w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <p
            className="font-display text-amber-200 text-xs sm:text-sm md:text-base tracking-wide"
            style={{ textShadow: "0 0 12px rgba(255,200,100,0.5)" }}
          >
            www.MejmoSeFajn.org
          </p>
          <div className="flex items-center gap-2 opacity-80">
            <div className="h-px w-8 sm:w-10 bg-amber-300/60" />
            <span className="text-amber-300 text-[8px]">✦</span>
            <div className="h-px w-8 sm:w-10 bg-amber-300/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
