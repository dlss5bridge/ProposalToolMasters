import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import ProposalAmendment from "./proposalTypes/ProposalAmendment";
import StandardProposalWithInputs from "./proposalTypes/ProposalInputForm";
import StandardProposal from "./proposalTypes/StandardProposal";
import {
  getQuoteModel,
  selectQuoteModel,
  selectQuoteModelLoading,
  selectQuoteModelError,
} from "../../redux/reducer/webProposal";

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

const WEB_PROPOSAL_TYPE_ID = {
  STANDARD: 1,
  STANDARD_INPUT: 2,
  AMENDMENT: 3,
};

export default function WebBasedProposal() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const quoteKeyID = searchParams.get("QuoteKeyID");

  const quoteModel = useSelector(selectQuoteModel);
  const loading = useSelector(selectQuoteModelLoading);
  const error = useSelector(selectQuoteModelError);

  useEffect(() => {
    if (quoteKeyID) {
      dispatch(getQuoteModel(quoteKeyID));
    }
  }, [dispatch, quoteKeyID]);

  if (!quoteKeyID) {
    return <div>Missing QuoteKeyID.</div>;
  }

  if (loading || (!quoteModel && !error)) {
    return <div>Loading proposal...</div>;
  }

  if (error || !quoteModel) {
    return <div>Failed to load proposal.</div>;
  }

  const proposal = {
    quoteModel,
    title: quoteModel.quotationName || "Proposal",

    showSidebar: false,

    theme: proposalTheme,
  };

  switch (quoteModel.webProposalTypeID || 3) {
    case WEB_PROPOSAL_TYPE_ID.STANDARD:
      return <StandardProposal proposal={proposal} theme={proposal.theme} />;

    case WEB_PROPOSAL_TYPE_ID.STANDARD_INPUT:
      return (
        <StandardProposalWithInputs
          proposal={proposal}
          theme={proposal.theme}
        />
      );

    case WEB_PROPOSAL_TYPE_ID.AMENDMENT:
      return (
        <ProposalAmendment
          proposal={proposal}
          theme={proposal.theme}
          quoteModel={quoteModel}
        />
      );

    default:
      return <div>Invalid Proposal Type</div>;
  }
}
