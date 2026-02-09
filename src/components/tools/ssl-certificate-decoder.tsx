"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface CertInfo { field: string; value: string; }

function decodePEM(pem: string): CertInfo[] {
  const info: CertInfo[] = [];
  const lines = pem.trim().split("\n");

  // Detect type
  const headerLine = lines[0] || "";
  if (headerLine.includes("CERTIFICATE")) {
    info.push({ field: "Type", value: "X.509 Certificate" });
  } else if (headerLine.includes("PUBLIC KEY")) {
    info.push({ field: "Type", value: "Public Key" });
  } else if (headerLine.includes("PRIVATE KEY")) {
    info.push({ field: "Type", value: "Private Key (WARNING: Do not share!)" });
  }

  // Extract base64 content
  const b64Lines = lines.filter(l => !l.startsWith("-----"));
  const b64 = b64Lines.join("");

  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    info.push({ field: "Size", value: `${bytes.length} bytes (${(bytes.length * 8)} bits encoded)` });

    // Basic ASN.1 DER parsing for X.509 certificates
    if (headerLine.includes("CERTIFICATE")) {
      let offset = 0;

      // Read ASN.1 tag and length
      function readTagLength(pos: number): { tag: number; length: number; headerLen: number } {
        if (pos >= bytes.length) return { tag: 0, length: 0, headerLen: 0 };
        const tag = bytes[pos];
        let length = 0;
        let headerLen = 2;
        if (bytes[pos + 1] & 0x80) {
          const numBytes = bytes[pos + 1] & 0x7F;
          headerLen = 2 + numBytes;
          for (let i = 0; i < numBytes; i++) {
            length = (length << 8) | bytes[pos + 2 + i];
          }
        } else {
          length = bytes[pos + 1];
        }
        return { tag, length, headerLen };
      }

      // Read OID
      function readOID(pos: number, len: number): string {
        if (pos + len > bytes.length) return "";
        const oid: number[] = [];
        oid.push(Math.floor(bytes[pos] / 40));
        oid.push(bytes[pos] % 40);
        let val = 0;
        for (let i = 1; i < len; i++) {
          val = (val << 7) | (bytes[pos + i] & 0x7F);
          if (!(bytes[pos + i] & 0x80)) { oid.push(val); val = 0; }
        }
        return oid.join(".");
      }

      // Known OIDs
      const OID_NAMES: Record<string, string> = {
        "2.5.4.3": "CN", "2.5.4.6": "C", "2.5.4.7": "L", "2.5.4.8": "ST",
        "2.5.4.10": "O", "2.5.4.11": "OU",
        "1.2.840.113549.1.1.1": "RSA", "1.2.840.113549.1.1.11": "SHA256withRSA",
        "1.2.840.113549.1.1.12": "SHA384withRSA", "1.2.840.113549.1.1.13": "SHA512withRSA",
        "1.2.840.10045.2.1": "EC", "1.2.840.10045.4.3.2": "ECDSA-SHA256",
      };

      // Walk the DER structure to extract subject/issuer
      function extractDN(pos: number, end: number): string {
        const parts: string[] = [];
        let p = pos;
        while (p < end) {
          const set = readTagLength(p);
          if (set.tag !== 0x31) break;
          p += set.headerLen;
          const seq = readTagLength(p);
          p += seq.headerLen;
          const oidTL = readTagLength(p);
          p += oidTL.headerLen;
          const oid = readOID(p, oidTL.length);
          p += oidTL.length;
          const valTL = readTagLength(p);
          p += valTL.headerLen;
          const val = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(p, p + valTL.length));
          p += valTL.length;
          const name = OID_NAMES[oid] || oid;
          parts.push(`${name}=${val}`);
          // Align to next SET
          p = pos + set.headerLen + set.length;
          pos = p;
        }
        return parts.join(", ");
      }

      try {
        // SEQUENCE (Certificate)
        const cert = readTagLength(offset);
        offset += cert.headerLen;
        // SEQUENCE (TBSCertificate)
        const tbs = readTagLength(offset);
        const tbsStart = offset + tbs.headerLen;
        offset = tbsStart;

        // Version [0] EXPLICIT
        if (bytes[offset] === 0xA0) {
          const ver = readTagLength(offset);
          offset += ver.headerLen;
          const verInt = readTagLength(offset);
          offset += verInt.headerLen;
          const version = bytes[offset] + 1;
          info.push({ field: "Version", value: `v${version}` });
          offset += verInt.length;
        }

        // Serial Number
        const serial = readTagLength(offset);
        offset += serial.headerLen;
        const serialHex = Array.from(bytes.slice(offset, offset + serial.length)).map(b => b.toString(16).padStart(2, "0")).join(":");
        info.push({ field: "Serial Number", value: serialHex });
        offset += serial.length;

        // Signature Algorithm
        const sigAlg = readTagLength(offset);
        offset += sigAlg.headerLen;
        const algOid = readTagLength(offset);
        offset += algOid.headerLen;
        const algStr = readOID(offset, algOid.length);
        info.push({ field: "Signature Algorithm", value: OID_NAMES[algStr] || algStr });
        offset += sigAlg.length - sigAlg.headerLen + sigAlg.headerLen;
        offset = tbsStart + (offset - tbsStart); // recompute

        // Skip past sig alg sequence
        offset = tbsStart;
        // Skip version
        if (bytes[offset] === 0xA0) { const v = readTagLength(offset); offset += v.headerLen + v.length; }
        // Skip serial
        const s2 = readTagLength(offset); offset += s2.headerLen + s2.length;
        // Skip sig alg
        const sa2 = readTagLength(offset); offset += sa2.headerLen + sa2.length;

        // Issuer
        const issuer = readTagLength(offset);
        const issuerDN = extractDN(offset + issuer.headerLen, offset + issuer.headerLen + issuer.length);
        info.push({ field: "Issuer", value: issuerDN || "(unable to parse)" });
        offset += issuer.headerLen + issuer.length;

        // Validity
        const validity = readTagLength(offset);
        offset += validity.headerLen;
        const notBefore = readTagLength(offset);
        offset += notBefore.headerLen;
        const notBeforeStr = new TextDecoder().decode(bytes.slice(offset, offset + notBefore.length));
        offset += notBefore.length;
        const notAfter = readTagLength(offset);
        offset += notAfter.headerLen;
        const notAfterStr = new TextDecoder().decode(bytes.slice(offset, offset + notAfter.length));
        offset += notAfter.length;
        info.push({ field: "Not Before", value: notBeforeStr });
        info.push({ field: "Not After", value: notAfterStr });

        // Subject
        const subject = readTagLength(offset);
        const subjectDN = extractDN(offset + subject.headerLen, offset + subject.headerLen + subject.length);
        info.push({ field: "Subject", value: subjectDN || "(unable to parse)" });
      } catch {
        info.push({ field: "Note", value: "Partial parse - some fields could not be read" });
      }
    }
  } catch {
    info.push({ field: "Error", value: "Invalid base64 encoding" });
  }

  return info;
}

export default function SslCertificateDecoder() {
  const t = useTranslations("tools.ssl-certificate-decoder");
  const [input, setInput] = useState("");
  const [info, setInfo] = useState<CertInfo[]>([]);

  const handleDecode = useCallback(() => {
    if (!input.trim()) return;
    setInfo(decodePEM(input));
  }, [input]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("ui.pasteCert")}
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={8} placeholder="-----BEGIN CERTIFICATE-----&#10;MIIBxTCCAW..." className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
      </label>
      <button onClick={handleDecode} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.decode")}</button>
      {info.length > 0 && (
        <div className="space-y-2">
          {info.map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-[140px]">{item.field}</span>
              <span className="text-sm font-mono text-zinc-900 dark:text-zinc-100 break-all">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
