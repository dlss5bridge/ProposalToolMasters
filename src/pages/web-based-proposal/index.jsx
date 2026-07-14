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
  primary: "#00BFFF", // Buttons, active step, links
  secondary: "#00192D", // Header & Footer
  background: "#FFFFFF", // Page background
  surface: "#FFFFFF", // Card background
  border: "#E2E8F0",
  text: "#1E293B",
  textLight: "#64748B",
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
