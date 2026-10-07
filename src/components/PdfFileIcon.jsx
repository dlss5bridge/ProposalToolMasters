import React from "react";

// Document icon with a red "PDF" tag, used for PDF links in the lists.
const PdfFileIcon = ({ size = 24, className = "" }) => (
  <svg
    className={`pdf-file-icon ${className}`.trim()}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M6.25 2.75h8.1l4.9 4.95V20a1.25 1.25 0 0 1-1.25 1.25h-11.75A1.25 1.25 0 0 1 5 20V4a1.25 1.25 0 0 1 1.25-1.25Z"
      fill="#ffffff"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M14.1 2.9v3.85a1 1 0 0 0 1 1h4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <rect x="2.25" y="11.4" width="13.5" height="7.2" rx="1.6" fill="#d92d20" />
    <text
      x="9"
      y="16.55"
      textAnchor="middle"
      fontSize="5.1"
      fontWeight="700"
      letterSpacing="0.2"
      fill="#ffffff"
      fontFamily="Inter, Arial, sans-serif"
    >
      PDF
    </text>
  </svg>
);

export default PdfFileIcon;
