import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectActiveStep } from "../../../redux/reducer/webProposal/stepper";
import {
  selectHasInputFields,
  selectInputFieldsList,
  getInputFieldsFieldErrors,
  setInputFieldsValidationVisible,
} from "../../../redux/reducer/webProposal/inputFields";
import {
  selectQuoteModel,
  addUpdateQuote,
} from "../../../redux/reducer/webProposal";
import { buildAddUpdateQuotePayload } from "../utils/buildAddUpdateQuotePayload";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalHeader from "../layout/ProposalHeader";
import ProposalFooter from "../layout/ProposalFooter";
import ProposalStepper from "../layout/ProposalStepper";
import ProposalSidebar from "../layout/ProposalSidebar";

import ProposalPdfStep from "../steps/ProposalPdfStep";
import ProposalPricingTableStep from "../steps/ProposalPricingTableStep";
import ProposalServicesStep from "../steps/ProposalServicesStep";
import ProposalInputFieldsStep from "../steps/ProposalInputFieldsStep";
import { QUOTE_TYPE_ID } from "../../../Middleware/enums";
import { redirectUri } from "../../../Base-Url/Base_Url";
import { resolveServicePackageKeyID } from "../utils/resolveServicePackageKeyID";

export default function StandardProposalWithInputs({ proposal, theme }) {
  const dispatch = useDispatch();
  const activeStep = useSelector(selectActiveStep);
  const hasInputFields = useSelector(selectHasInputFields);
  const quoteModel = useSelector(selectQuoteModel);
  const inputFieldsList = useSelector(selectInputFieldsList);

  const isPackageType = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isCustomPackageType =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  const isPackageBased = isPackageType || isCustomPackageType;

  const [acceptError, setAcceptError] = useState(null);
  // Mirrors ProposalPricingTableStep's own selection state (via
  // onSelectedPackageChange below) purely so the finish action here can be
  // gated on whether a package has actually been selected yet — same as
  // StandardProposal.jsx's Package/Custom Package flow.
  const [selectedPackageKeyID, setSelectedPackageKeyID] = useState(null);

  // Pricing Table, when this quote is Package/Custom Package, always sits
  // right after Proposal — Input Fields, when present, follows it (shifted
  // by one step from its usual position right after Proposal).
  const PRICING_STEP_INDEX = 1;
  const INPUT_FIELDS_STEP_INDEX = isPackageBased ? 2 : 1;

  const handleBeforeNextStep = (currentStepIndex) => {
    // Package/Custom Package quotes must have a package selected before
    // leaving the Pricing Table step — otherwise Input Fields (or the
    // eventual Accept) would have nothing to price/contract against.
    if (currentStepIndex === PRICING_STEP_INDEX && isPackageBased) {
      if (!selectedPackageKeyID) {
        setAcceptError("Please select a package to continue.");
        return false;
      }
      setAcceptError(null);
    }

    if (!hasInputFields || currentStepIndex !== INPUT_FIELDS_STEP_INDEX) {
      return true;
    }

    const fieldErrors = getInputFieldsFieldErrors(
      inputFieldsList,
      quoteModel?.globalPricingDriverID,
    );
    if (Object.keys(fieldErrors).length > 0) {
      dispatch(setInputFieldsValidationVisible(true));
      return false;
    }
    dispatch(setInputFieldsValidationVisible(false));
    return true;
  };

  // Plain (non-package) Input Fields flow's "Save" action — Package/Custom
  // Package quotes finish via handleAccept below instead. Base request is
  // the complete GetQuoteModel response; only the
  // globalPricingDriverIDsWithValues entries the client actually filled in
  // are patched on top, same as handleAccept. Mirrors handleAccept's
  // generate-contract redirect too, since this is the "finish" action for
  // this (non-package) proposal type just as handleAccept is for package
  // ones.
  const handleSave = async () => {
    const quoteKeyID = quoteModel?.quoteKeyID;
    // themeSettings was already fetched by GetOrganisationThemeSettings on
    // page load (see WebBasedProposal in index.jsx) — reuse it instead of
    // calling the endpoint again here.
    const themeSettings = proposal.themeSettings;
    const serviceChargeTypeID = themeSettings?.serviceChargeTypeID;

    if (!quoteKeyID || serviceChargeTypeID == null) {
      setAcceptError("Failed to save proposal. Please try again.");
      return;
    }

    if (themeSettings?.isCollectPaymentBeforeProposalAmendment) {
      // TODO: Implement payment-before-acceptance flow
      setAcceptError(
        "Payment is required before this proposal can be accepted.",
      );
      return;
    }

    try {
      await dispatch(
        addUpdateQuote(
          buildAddUpdateQuotePayload(quoteModel, inputFieldsList),
        ),
      ).unwrap();
    } catch (err) {
      setAcceptError("Failed to save proposal. Please try again.");
      return;
    }

    // eslint-disable-next-line no-debugger
    debugger; // TEMP: inspect AddUpdateQuote payload/response before navigating away.

    setAcceptError(null);

    // Mirrors the email accept link's query shape exactly (see
    // PreviewComponentpdf.jsx's AcceptRecurringUrl/AcceptOneOffUrl):
    // quoteKeyID, ServiceChargeTypeID, Action, ContractSignatoryKeyID. This
    // is a Service-based (non-package) proposal, so there's no
    // ServicePackageKeyID to resolve — left out of the URL entirely, same
    // as handleAccept does for that case.
    const params = new URLSearchParams({
      quoteKeyID,
      ServiceChargeTypeID: String(serviceChargeTypeID),
      Action: "Accepted",
      ContractSignatoryKeyID: themeSettings?.contractSignatoryKeyID ?? "",
    });

    // Full navigation (not react-router's navigate) — the client-facing
    // generate-contract destination lives on the production proposal
    // domain, not necessarily the origin this app is currently served from.
    window.location.href = `${redirectUri}/generate-contract?${params.toString()}`;
  };

  // Same "Accept" destination the admin-side proposal email button links to
  // (see PreviewComponentpdf.jsx's AcceptRecurringUrl/AcceptOneOffUrl) —
  // /generate-contract itself calls GenerateContractFromProposal on mount,
  // generates the contract PDF, and hands off to SignEasy, so accepting here
  // just navigates there with the same query params instead of duplicating
  // that flow. Mirrors StandardProposal.jsx's handleAccept exactly.
  const handleAccept = async () => {
    const quoteKeyID = quoteModel?.quoteKeyID;
    // themeSettings was already fetched by GetOrganisationThemeSettings on
    // page load (see WebBasedProposal in index.jsx) — reuse it instead of
    // calling the endpoint again here.
    const themeSettings = proposal.themeSettings;
    const serviceChargeTypeID = themeSettings?.serviceChargeTypeID;

    if (!quoteKeyID || serviceChargeTypeID == null) {
      setAcceptError("Failed to accept proposal. Please try again.");
      return;
    }

    // Package/Custom Package proposals must have a package selected on the
    // Pricing Table step before the proposal can be accepted — the Select
    // Package button there only picks a package, it never submits, so this
    // is the one gate that actually blocks acceptance.
    if (isPackageBased && !selectedPackageKeyID) {
      setAcceptError("Please select a package to continue.");
      return;
    }

    if (themeSettings?.isCollectPaymentBeforeProposalAmendment) {
      // TODO: Implement payment-before-acceptance flow
      setAcceptError(
        "Payment is required before this proposal can be accepted.",
      );
      return;
    }

    // Base request is the complete GetQuoteModel response; only the
    // globalPricingDriverIDsWithValues entries the client actually filled in
    // on the Input Fields step are patched on top — the package selection
    // and everything else stays exactly as GetQuoteModel returned it.
    try {
      await dispatch(
        addUpdateQuote(
          buildAddUpdateQuotePayload(quoteModel, inputFieldsList),
        ),
      ).unwrap();
    } catch (err) {
      setAcceptError("Failed to accept proposal. Please try again.");
      return;
    }

    // eslint-disable-next-line no-debugger
    debugger; // TEMP: inspect AddUpdateQuote payload/response before navigating away.

    setAcceptError(null);

    // Mirrors the email accept link's query shape exactly (see
    // PreviewComponentpdf.jsx's AcceptRecurringUrl/AcceptOneOffUrl):
    // quoteKeyID, ServiceChargeTypeID, Action, ServicePackageKeyID,
    // ContractSignatoryKeyID. ServicePackageKeyID is a different value from
    // the selected servicePackageID — it must be looked up from
    // themeSettings._ServicePackage (see resolveServicePackageKeyID) — and a
    // Service-based proposal has no packages at all, so it's left out of the
    // URL entirely for that case.
    const servicePackageID =
      selectedPackageKeyID ?? quoteModel?.servicePackageID?.[0];
    const servicePackageKeyID = resolveServicePackageKeyID(
      themeSettings,
      servicePackageID,
    );
    const params = new URLSearchParams({
      quoteKeyID,
      ServiceChargeTypeID: String(serviceChargeTypeID),
      Action: "Accepted",
      ContractSignatoryKeyID: themeSettings?.contractSignatoryKeyID ?? "",
    });
    if (servicePackageKeyID) {
      params.set("ServicePackageKeyID", servicePackageKeyID);
    }

    // Full navigation (not react-router's navigate) — the client-facing
    // generate-contract destination lives on the production proposal
    // domain, not necessarily the origin this app is currently served from.
    window.location.href = `${redirectUri}/generate-contract?${params.toString()}`;
  };

  const steps = [
    { label: "Proposal", component: <ProposalPdfStep theme={theme} /> },
    ...(isPackageBased
      ? [
          {
            label: "Pricing Table",
            component: (
              <ProposalPricingTableStep
                theme={theme}
                isActive={activeStep === PRICING_STEP_INDEX}
                onSelectedPackageChange={setSelectedPackageKeyID}
              />
            ),
          },
        ]
      : []),
    ...(hasInputFields
      ? [
          {
            label: "Input Fields",
            component: <ProposalInputFieldsStep theme={theme} />,
          },
        ]
      : []),
  ];

  const stepLabels = steps.map((step) => step.label);
  const stepComponents = steps.map((step) => step.component);

  return (
    <ProposalLayout theme={theme}>
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <ProposalHeader
          theme={theme}
          title={proposal.title}
          logo={proposal.themeSettings?.logoUrl}
        />
      </div>

      <div
        className="flex flex-1 gap-3 overflow-hidden"
        style={{
          backgroundColor: theme.background,
        }}
      >
        {/* Sidebar for the PDF step and the Pricing Table step */}
        {(activeStep === 0 || activeStep === PRICING_STEP_INDEX) && (
          <aside
            className="hidden lg:flex lg:w-80 lg:flex-shrink-0 overflow-y-auto border-r"
            style={{
              backgroundColor: theme.background,
              borderColor: theme.border,
            }}
          >
            <ProposalSidebar theme={theme} proposal={proposal} />
          </aside>
        )}

        {/* Step Content */}
        <main
          className="flex-1 overflow-hidden"
          style={{
            backgroundColor: theme.background,
          }}
        >
          {/* Package proposals skip a visible Services step entirely, but the
              Pricing Table still needs the admin's default selections
              hydrated into redux — so the step stays mounted here,
              permanently hidden, purely to run its data-fetch/hydration
              effects in the background (mirrors StandardProposal.jsx /
              ProposalAmendment.jsx). */}
          {isPackageBased && (
            <div className="hidden">
              <ProposalServicesStep theme={theme} />
            </div>
          )}

          {stepComponents.map((component, index) => (
            <div
              key={index}
              className={index === activeStep ? "contents" : "hidden"}
            >
              {component}
            </div>
          ))}
        </main>
      </div>

      <ProposalFooter theme={theme}>
        {acceptError && (
          <div className="mb-2 text-right text-sm text-red-600">
            {acceptError}
          </div>
        )}
        <ProposalStepper
          theme={theme}
          steps={stepLabels}
          onNext={handleBeforeNextStep}
          onFinish={isPackageBased ? handleAccept : handleSave}
          finishLabel={isPackageBased ? "Accept" : "Save"}
        />
      </ProposalFooter>
    </ProposalLayout>
  );
}
