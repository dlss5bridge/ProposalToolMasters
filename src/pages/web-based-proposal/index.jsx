import { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import ProposalAmendment from "./proposalTypes/ProposalAmendment";
import StandardProposalWithInputs from "./proposalTypes/ProposalInputForm";
import StandardProposal from "./proposalTypes/StandardProposal";
import ProposalAlreadyAccepted from "./ProposalAlreadyAccepted";
import { Loader2 } from "lucide-react";
import {
  getProposalTheme,
  DEFAULT_PROPOSAL_THEME,
} from "./theme/proposalTheme";
import "./theme/proposalTheme.css";
import {
  getQuoteModel,
  getOrganisationThemeSettings,
  selectQuoteModel,
  selectQuoteModelLoading,
  selectQuoteModelError,
  selectThemeSettings,
} from "../../redux/reducer/webProposal";
import {
  getInputFieldsList,
  selectInputFieldsListLoading,
} from "../../redux/reducer/webProposal/inputFields";

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
  const themeSettings = useSelector(selectThemeSettings);
  const inputFieldsLoading = useSelector(selectInputFieldsListLoading);

  // Brand color comes from quoteModel, background/font from org theme settings.
  const theme = useMemo(
    () => getProposalTheme(quoteModel, themeSettings),
    [quoteModel, themeSettings],
  );

  useEffect(() => {
    if (quoteKeyID) {
      dispatch(getQuoteModel(quoteKeyID));
      dispatch(getOrganisationThemeSettings(quoteKeyID));
      dispatch(getInputFieldsList(quoteKeyID));
    }
  }, [dispatch, quoteKeyID]);

  if (!quoteKeyID) {
    return <div>Missing QuoteKeyID.</div>;
  }

  // Fetched here (not in ProposalInputFieldsStep) so selectHasInputFields is
  // already resolved before the proposal-type components decide whether to
  // include that step.
  if (loading || inputFieldsLoading || (!quoteModel && !error)) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 px-4 text-center"
        style={{
          height: "100dvh",
          backgroundColor: DEFAULT_PROPOSAL_THEME.background,
        }}
      >
        <Loader2
          className="h-8 w-8 animate-spin sm:h-10 sm:w-10"
          style={{ color: DEFAULT_PROPOSAL_THEME.primary }}
        />
        <span
          className="text-sm sm:text-base"
          style={{ color: DEFAULT_PROPOSAL_THEME.textSecondary }}
        >
          Loading proposal...
        </span>
      </div>
    );
  }

  if (error || !quoteModel) {
    return <div>Failed to load proposal.</div>;
  }

  // GetOrganisationThemeSettings's statusName tells us whether this quote
  // has already been accepted — once it has, the Standard/Standard-with-
  // Input-Fields/Amendment accept flow no longer applies, so every
  // webProposalTypeID shows this screen instead of its usual flow.
  if (themeSettings?.statusName === "Accepted") {
    return <ProposalAlreadyAccepted theme={theme} />;
  }

  const proposal = {
    quoteModel,
    title: quoteModel.quotationName || "Proposal",
    showSidebar: false,
    theme,
    themeSettings,
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
