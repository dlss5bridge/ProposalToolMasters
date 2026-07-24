import ProposalAmendment from "./proposalTypes/ProposalAmendment";
import StandardProposalWithInputs from "./proposalTypes/ProposalInputForm";
import StandardProposal from "./proposalTypes/StandardProposal";
// import StandardProposalWithInputs from "./proposalTypes/StandardProposalWithInputs";
// import ProposalAmendment from "./proposalTypes/ProposalAmendment";

export const proposalTheme = {
  // Layout
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",

  // Brand
  primary: "#00BFFF",
  secondary: "#00192D",

  // Header/Footer
  headerBackground: "#00192D",
  headerText: "#FFFFFF",

  footerBackground: "#00192D",
  footerText: "#FFFFFF",

  // Sidebar
  sidebarBackground: "#FFFFFF",
  sidebarBorder: "#E2E8F0",

  // Text
  textPrimary: "#1E293B",
  textSecondary: "#64748B",

  // Buttons
  primaryButtonBackground: "#00BFFF",
  primaryButtonText: "#FFFFFF",

  secondaryButtonBackground: "#FFFFFF",
  secondaryButtonBorder: "#CBD5E1",
  secondaryButtonText: "#00192D",

  // PDF
  pdfBackground: "#EEF2F7",
};

export default function WebBasedProposal() {
  // Later this object will come from Redux/API
  const proposal = {
    proposalType: "AMENDMENT", // STANDARD | STANDARD_INPUT | AMENDMENT
    title: "Accounting Proposal",

    showSidebar: false,

    steps: [
      "Proposal",
      "Input Fields",
      //"Basic Information",
      "Services",
      "Pricing Table",
      "Preview",
      "Sign",
    ],

    theme: proposalTheme,
  };

  switch (proposal.proposalType) {
    case "STANDARD":
      return <StandardProposal proposal={proposal} theme={proposal.theme} />;

    case "STANDARD_INPUT":
      return (
        <StandardProposalWithInputs
          proposal={proposal}
          theme={proposal.theme}
        />
      );

    case "AMENDMENT":
      return <ProposalAmendment proposal={proposal} theme={proposal.theme} />;

    default:
      return <div>Invalid Proposal Type</div>;
  }
}
