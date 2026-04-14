/**
 * HIPAA-aligned de-identification service.
 * Removes personal identifiers from lab report text using regex heuristics.
 * No PHI is logged or stored.
 */

const PHI_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  // Names (common patterns like "Patient Name: John Doe")
  { pattern: /(?:patient\s*name|name)\s*[:]\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}/gi, replacement: "Patient Name: [REDACTED]" },
  // Date of Birth
  { pattern: /(?:DOB|Date\s*of\s*Birth|D\.O\.B)\s*[:]\s*\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/gi, replacement: "DOB: [REDACTED]" },
  // MRN / Patient ID
  { pattern: /(?:MRN|Patient\s*ID|Medical\s*Record|Accession|Reg\.?\s*No)\s*[:]\s*[\w\-]+/gi, replacement: "ID: [REDACTED]" },
  // Phone numbers
  { pattern: /(?:\+?\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}/g, replacement: "[PHONE REDACTED]" },
  // Email addresses
  { pattern: /[\w._%+\-]+@[\w.\-]+\.[a-zA-Z]{2,}/g, replacement: "[EMAIL REDACTED]" },
  // Addresses (basic: number + street name patterns)
  { pattern: /\d{1,5}\s+(?:[A-Z][a-z]+\s){1,3}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\.?/gi, replacement: "[ADDRESS REDACTED]" },
  // SSN
  { pattern: /\b\d{3}[\-\s]?\d{2}[\-\s]?\d{4}\b/g, replacement: "[SSN REDACTED]" },
  // Hospital/Lab names
  { pattern: /(?:hospital|laboratory|lab|clinic|medical\s*center|diagnostics)\s*[:]\s*.+/gi, replacement: "[FACILITY REDACTED]" },
  // Doctor names
  { pattern: /(?:Dr\.|Doctor|Physician|Referred\s*by|Ref\.?\s*by)\s*[:.]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}/gi, replacement: "Doctor: [REDACTED]" },
  // Age/Sex line
  { pattern: /(?:Age|Sex|Gender)\s*[:]\s*\S+/gi, replacement: "[DEMOGRAPHIC REDACTED]" },
];

export function deidentifyText(rawText: string): string {
  let cleaned = rawText;
  for (const { pattern, replacement } of PHI_PATTERNS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned;
}
