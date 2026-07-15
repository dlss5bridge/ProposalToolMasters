import { useState } from "react";
import ProposalLayout from "./layout/ProposalLayout";
import StandardProposal from "./proposalTypes/StandardProposal";

const proposalResponse = {
  proposalType: "AMENDMENT", // STANDARD | INPUT | AMENDMENT

  title: "Accounting Proposal",

  steps: [
    {
      id: "slider",
      title: "Proposal",
      visible: true,
    },
    {
      id: "inputFields",
      title: "Input Fields",
      visible: true,
    },
    {
      id: "basicInformation",
      title: "Basic Information",
      visible: true,
    },
    {
      id: "services",
      title: "Services",
      visible: true,
    },
    {
      id: "reviewServices",
      title: "Review Services",
      visible: true,
    },
    {
      id: "preview",
      title: "Preview",
      visible: true,
    },
    {
      id: "sign",
      title: "Sign",
      visible: true,
    },
  ],

  inputFields: [
    {
      label: "Annual Revenue",
      type: "number",
    },
    {
      label: "No. of Employees",
      type: "number",
    },
  ],
};
const proposalTheme = {
  // Layout
  background: "#FFFFFF",
  surface: "#FFFFFF",
  border: "#E2E8F0",

  // Brand Colors
  primary: "#00BFFF",
  secondary: "#00192D",

  // Text
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textLight: "#FFFFFF",

  // Header & Footer
  headerBackground: "#00192D",
  headerText: "#FFFFFF",

  footerBackground: "#00192D",
  footerText: "#FFFFFF",

  // Buttons
  primaryButtonBackground: "#00BFFF",
  primaryButtonText: "#FFFFFF",
  primaryButtonHover: "#00A9E6",

  secondaryButtonBackground: "#FFFFFF",
  secondaryButtonText: "#00192D",
  secondaryButtonBorder: "#CBD5E1",
  secondaryButtonHover: "#F8FAFC",

  successButtonBackground: "#22C55E",
  successButtonText: "#FFFFFF",
  successButtonHover: "#16A34A",

  // Stepper
  activeStepBackground: "#00BFFF",
  activeStepText: "#FFFFFF",

  completedStepBackground: "#22C55E",
  completedStepText: "#FFFFFF",

  inactiveStepBackground: "#E2E8F0",
  inactiveStepText: "#64748B",

  activeStepLabel: "#00BFFF",
  completedStepLabel: "#22C55E",
  inactiveStepLabel: "#64748B",

  // PDF Viewer
  pdfBackground: "#0000004a",
  pdfShadow: "rgba(15, 23, 42, 0.12)",

  // Controls
  iconColor: "#475569",
  iconHoverBackground: "#F1F5F9",

  // Status Colors
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};
export default function WebBasedProposal() {
  const [activeStep, setActiveStep] = useState(0);
  // PDF Viewer State
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const steps = [
    "Slider",
    "Input Fields",
    "Basic Information",
    "Services",
    "Review Services",
    "Preview",
    "Sign",
  ];

  return (
    <ProposalLayout
      theme={proposalTheme}
      steps={steps}
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
      numPages={numPages}
      setNumPages={setNumPages}
      zoom={zoom}
      setZoom={setZoom}
    >
      <StandardProposal />
    </ProposalLayout>
  );
}
