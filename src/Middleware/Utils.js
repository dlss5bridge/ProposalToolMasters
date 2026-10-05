const DialCode = [
  {
    value: "+44",
    label: "+44",
  },
  {
    value: "+1",
    label: "+1",
  },
  {
    value: "+7",
    label: "+7",
  },
  {
    value: "+31",
    label: "+31",
  },
  {
    value: "+32",
    label: "+32",
  },
  {
    value: "+33",
    label: "+33",
  },
  {
    value: "+34",
    label: "+34",
  },
  {
    value: "+39",
    label: "+39",
  },
  {
    value: "+41",
    label: "+41",
  },
  {
    value: "+46",
    label: "+46",
  },
  {
    value: "+48",
    label: "+48",
  },
  {
    value: "+49",
    label: "+49",
  },
  {
    value: "+52",
    label: "+52",
  },
  {
    value: "+55",
    label: "+55",
  },
  {
    value: "+61",
    label: "+61",
  },
  {
    value: "+62",
    label: "+62",
  },
  {
    value: "+66",
    label: "+66",
  },
  {
    value: "+81",
    label: "+81",
  },
  {
    value: "+82",
    label: "+82",
  },
  {
    value: "+86",
    label: "+86",
  },
  {
    value: "+90",
    label: "+90",
  },
  {
    value: "+91",
    label: "+91",
  },
  {
    value: "+234",
    label: "+234",
  },
  {
    value: "+966",
    label: "+966",
  },
];

const VAT_Registered = [
  {
    value: 0,
    label: "Yes",
  },
  {
    value: 1,
    label: "No",
  },
];

const IS_default = [
  {
    value: true,
    label: "Yes",
  },
  {
    value: false,
    label: "No",
  },
];

const CouponTypeIDs = [
  {
    value: 1,
    label: "Fixed",
  },
  {
    value: 2,
    label: "Percentage",
  },
];
const TemplateOption = [
  { value: 1, label: "Quote" },
  { value: 2, label: "Contract" },
];

const NatureOfBusiness = [
  {
    value: "Professional/IT Services",
    label: "Professional/IT Services",
  },
  {
    value: "Restaurant/Hotel/Bar/Travel",
    label: "Restaurant/Hotel/Bar/Travel",
  },
  {
    value: "Construction/Development",
    label: "Construction/Development",
  },
  {
    value: "Rental",
    label: "Rental",
  },
  {
    value: "Home Services/Construction Trades",
    label: "Home Services/Construction Trades",
  },
  {
    value: "E-commerce/Retailers/Trading",
    label: "E-commerce/Retailers/Trading",
  },
  {
    value: "Other",
    label: "Other",
  },
];

const Incorporated_In = [
  {
    value: "England and Wales (EW)",
    label: "England and Wales (EW)",
  },
  {
    value: "Northern Ireland(NI)",
    label: "Northern Ireland(NI)",
  },
  {
    value: "Scotland (SC)",
    label: "Scotland (SC)",
  },
  {
    value: "Wales (WA)",
    label: "Wales (WA)",
  },
];

const Payment_Frequency = [
  {
    value: 1,
    label: "Yearly",
  },
  {
    value: 2,
    label: "Half Yearly",
  },
  {
    value: 3,
    label: "Quarterly",
  },
  {
    value: 4,
    label: "Monthly",
  },
];

const paymentStatus = [
  {
    value: null,
    label: "All",
  },
  {
    value: 1,
    label: "Paid",
  },
  {
    value: 0,
    label: "Unpaid",
  },
];

const source = [
  {
    value: 1,
    label: "From Scratch",
  },
  {
    value: 2,
    label: "From Quote",
  },
  {
    isDisabled: false,
    value: 3,
    label: "Package (Customisable) (Single)",
  },
  {
    isDisabled: false,
    value: 4,
    label: "Packaged (Standard) (Single)",
  },
];

const payment_gateway = [
  {
    value: 1,
    label: "Not Applicable",
  },
  {
    value: 2,
    label: "Stripe",
  },
  {
    value: 3,
    label: "Go Cardless",
  },
  {
    value: 4,
    label: "Bank Transfer",
  },
];
const fees = [
  {
    value: "ManuaShow Full Breakdownl",
    label: "Show Full Breakdown",
  },
  {
    value: "Show Totals Only",
    label: "Show Totals Only",
  },
];

const select_Quote_Type = [
  {
    value: 1,
    label: "Custom Packages",
  },
  {
    value: 2,
    label: "Packages",
  },
  {
    value: 3,
    label: "Services",
  },
  {
    value: 4,
    label: "Master Agreement- Custom Variable Fee",
  },
];

const ProposalStatus = [
  {
    value: null,
    label: "All",
  },
  {
    value: 2,
    label: "Sent (Viewed + Signed + Declined)",
  },

  {
    value: 1,
    label: "Draft",
  },
  {
    value: 4,
    label: "Viewed",
  },

  // {
  //   value: 5,
  //   label: "Signed",
  // },
  {
    value: 6,
    label: "Accepted",
  },
  {
    value: 7,
    label: "Declined",
  },
  {
    value: 3,
    label: "Skipped",
  },
];

const EngagementLetterStatus = [
  {
    value: null,
    label: "All",
  },
  {
    value: 2,
    label: "Sent (Viewed + Signed + Declined)",
  },

  {
    value: 1,
    label: "Draft",
  },
  {
    value: 4,
    label: "Viewed",
  },

  {
    value: 5,
    label: "Signed",
  },
  // {
  //   value: 6,
  //   label: "Accepted",
  // },
  {
    value: 7,
    label: "Declined",
  },
  {
    value: 8,
    label: "Voided",
  },
  // {
  //   value: 3,
  //   label: "Skipped",
  // },
];

const PreviewSelection = [
  {
    value: 1,
    label: "HTML",
  },
  {
    value: 2,
    label: "PDF",
  },
  {
    value: 3,
    label: "Web Proposal",
  },
];
const webBasedProposalTypes = [
  {
    value: 1,
    label: "Standard Slideshow",
  },
  {
    value: 2,
    label: "Slideshow with Input Fields",
  },
  {
    value: 3,
    label: "Proposal Amendment",
  },
];
const CalenderFilter = [
  {
    value: 0,
    label: "All",
  },
  {
    value: 1,
    label: "This Week",
  },
  {
    value: 2,
    label: "Last Week",
  },
  {
    value: 3,
    label: "This Month",
  },
  {
    value: 4,
    label: "Last Month",
  },
  {
    value: 5,
    label: "This Quarter",
  },
  {
    value: 6,
    label: "Last Quarter",
  },
  {
    value: 7,
    label: "This 6 Months",
  },
  {
    value: 8,
    label: "Last 6 Months",
  },
  {
    value: 9,
    label: "This Year",
  },
  {
    value: 10,
    label: "Last Year",
  },
  {
    value: 11,
    label: "Custom Date Range",
  },
];
const DateFilter = [
  {
    value: 0,
    label: "Active in last 1 day",
  },
  {
    value: 1,
    label: "Active in last 7 days",
  },
  {
    value: 2,
    label: "Active in last 1 month",
  },
  {
    value: 3,
    label: "Active in last 2 months",
  },
  {
    value: 4,
    label: "Active in last 3 months",
  },
  {
    value: 5,
    label: "Active in last 6 months",
  },
  {
    value: 6,
    label: "Active in last 1 year",
  },
];
const ucFirst = (word) => word.charAt(0).toUpperCase() + word.slice(1); // Upper Case First Letter
const stringifyNumber = (n) => {
  const special = [
    "zeroth",
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "nineteenth",
  ];
  const deca = [
    "twent",
    "thirt",
    "fort",
    "fift",
    "sixt",
    "sevent",
    "eight",
    "ninet",
  ];
  const bigs = [
    "",
    "thousand",
    "million",
    "billion",
    "trillion",
    "quadrillion",
    "quintillion",
  ]; // Add more as needed
  let numStr = "";

  const chunkify = (num) => {
    const chunks = [];
    while (num > 0) {
      chunks.push(num % 1000);
      num = Math.floor(num / 1000);
    }
    return chunks;
  };

  const chunkToWords = (chunk) => {
    if (chunk === 0) return "";
    let words = "";
    const hundreds = Math.floor(chunk / 100);
    const tens = chunk % 100;
    if (hundreds > 0) {
      words += special[hundreds] + " hundred";
      if (tens > 0) words += " and ";
    }
    if (tens < 20) {
      words += special[tens];
    } else {
      const tensIndex = Math.floor(tens / 10) - 2;
      words += deca[tensIndex];
      if (tens % 10 !== 0) words += "y-" + special[tens % 10];
    }
    return words;
  };

  const chunks = chunkify(n);
  const wordsArray = chunks.map((chunk, index) => {
    const bigName = bigs[index];
    const chunkWords = chunkToWords(chunk);
    return chunkWords + (chunkWords && bigName ? " " + bigName : "");
  });

  numStr = wordsArray.reverse().join(" ");

  return ucFirst(numStr);
};

const feeInProposal = [
  {
    value: 1,
    label: "Show Full Breakdown",
  },
  {
    value: 2,
    label: "Show Totals Only",
  },
];

const DiscountLines = [
  {
    value: 1,
    label: "Yes",
  },
  {
    value: 2,
    label: "No",
  },
];
const SignaturePosition = [
  {
    value: 1,
    label: "Right Column",
  },
  {
    value: 2,
    label: "Left Column",
  },
];

const TemplateTypeLookupListSuperAdmin = [
  {
    value: 1,
    label: "Confirmation Email",
  },
  {
    value: 2,
    label: "Welcome Email",
  },
  {
    value: 3,
    label: "Forget Password Email",
  },
  {
    value: 4,
    label: "Invite For Sign-up Email",
  },
  {
    value: 5,
    label: "2-FA Email",
  },
];

const dropdownOptions = [
  { id: 0, value: "Select..." },
  { id: 1, value: "BT Internet" },
  { id: 2, value: "Gmail" },
  { id: 3, value: "Hotmail" },
  { id: 4, value: "Microsoft" },
  { id: 5, value: "Microsoft Exchange Server" },
  { id: 6, value: "Office 365" },
  { id: 7, value: "Yahoo" },
  { id: 8, value: "Other" },
  // { id: null, value: "Other" }
];

const emailTemplates = [
  { value: 1, label: "Template 1" },
  { value: 2, label: "Template 2" },
  { value: 3, label: "Template 3" },
];

export const PdfToCsvValidityList = [
  { value: 1, label: "Months" },
  { value: 2, label: "Current Month" },
  { value: 3, label: "Unlimited" },
];

const periods = [{ value: 1, label: "After" }];

const repeats = [
  { value: 1, label: "Yes" },
  { value: 2, label: "No" },
];

const FontFamily = [
  { value: null, label: "Select" },
  { value: 1, label: "Georgia, serif" },
  { value: 2, label: "Arial, sans-serif" },
  { value: 3, label: "Verdana, sans-serif" },
  { value: 4, label: "Times New Roman, serif" },
  { value: 5, label: "Courier New, monospace" },
  { value: 6, label: "Roboto, sans-serif" },
  { value: 7, label: "Open Sans, sans-serif" },
  { value: 8, label: "Lora, serif" },
  { value: 9, label: "Montserrat, sans-serif" },
  { value: 10, label: "Helvetica, sans-serif" },

  // Additional 20 fonts
  { value: 11, label: "Nunito, sans-serif" },
  { value: 12, label: "Poppins, sans-serif" },
  { value: 13, label: "Raleway, sans-serif" },
  { value: 14, label: "Inter, sans-serif" },
  { value: 15, label: "Ubuntu, sans-serif" },
  { value: 16, label: "Fira Sans, sans-serif" },
  { value: 17, label: "Work Sans, sans-serif" },
  { value: 18, label: "Barlow, sans-serif" },
  { value: 19, label: "Quicksand, sans-serif" },
  { value: 20, label: "Source Sans, sans-serif" },
  { value: 21, label: "Merriweather, serif" },
  { value: 22, label: "Playfair Display, serif" },
  { value: 23, label: "PT Serif, serif" },
  { value: 24, label: "Crimson Text, serif" },
  { value: 25, label: "Fira Code, monospace" },
  { value: 26, label: "JetBrains Mono, monospace" },
  { value: 27, label: "Inconsolata, monospace" },
  { value: 28, label: "Oswald, sans-serif" },
  { value: 29, label: "Bebas Neue, sans-serif" },
  { value: 30, label: "Comic Sans MS, cursive, sans-serif" },
];

const DECIMAL_PLACE_OPTIONS = [
  { value: 2, label: "2 decimal places" },
  { value: 1, label: "1 decimal place" },
  { value: 0, label: "No decimal places" },
];
const getDecimalPlaceLabel = (decimalPlaces) => {
  if (decimalPlaces === 0) return "No decimal places";
  if (decimalPlaces === 1) return "1 decimal place";
  return `${decimalPlaces} decimal places`;
};

const specialCharOptions = [
  ".",
  "-",
  "+",
  ";",
  ":",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "=",
  "{",
  "}",
  "[",
  "]",
  "|",
  "\\",
  "/",
  "<",
  ">",
  "?",
  "~",
  "`",
  "'",
  '"',
  ",",
].map((char) => ({
  label: char,
  value: char,
}));

const dateFormats = [
  { label: "ISO (YYYY-MM-DD)", value: "yyyy-MM-dd" },
  { label: "US (MM/DD/YYYY)", value: "MM/dd/yyyy" },
  { label: "European (DD/MM/YYYY)", value: "dd/MM/yyyy" },
  { label: "UK (DD-MM-YYYY)", value: "dd-MM-yyyy" },
];
// const FontSize = [
//   { value: 1, label: "1px" },
//   { value: 2, label: "2px" },
//   { value: 3, label: "3px" },
//   { value: 4, label: "4px" },
//   { value: 5, label: "5px" },
//   { value: 6, label: "6px" },
//   { value: 7, label: "7px" },
// ];
const heightOptions = Array.from({ length: 39 }, (_, i) => {
  const value = `${10 + i * 5}px`;
  return { value, label: value };
});
const FontSize = [
  { value: 5, label: "5px" },
  { value: 6, label: "6px" },
  { value: 7, label: "7px" },
  { value: 10, label: "10px" },
  { value: 12, label: "12px" },
  { value: 14, label: "14px" },
  { value: 16, label: "16px" },
  { value: 18, label: "18px" },
  { value: 20, label: "20px" },
  { value: 24, label: "24px" },
  { value: 30, label: "30px" },
  { value: 36, label: "36px" },
  { value: 48, label: "48px" },
];

export default {
  heightOptions,
  DECIMAL_PLACE_OPTIONS,
  getDecimalPlaceLabel,
  specialCharOptions,
  dateFormats,
  FontSize,
  FontFamily,
  emailTemplates,
  periods,
  repeats,
  stringifyNumber,
  SignaturePosition,
  CouponTypeIDs,
  feeInProposal,
  ProposalStatus,
  CalenderFilter,
  DialCode,
  VAT_Registered,
  IS_default,
  NatureOfBusiness,
  EngagementLetterStatus,
  TemplateOption,
  Incorporated_In,
  source,
  select_Quote_Type,
  Payment_Frequency,
  paymentStatus,
  PreviewSelection,
  webBasedProposalTypes,
  TemplateTypeLookupListSuperAdmin,
  payment_gateway,
  fees,
  DiscountLines,
  dropdownOptions,
  DateFilter,
};
