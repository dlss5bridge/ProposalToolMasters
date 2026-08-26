import { useState } from "react";
import { useSelector } from "react-redux";

import ProposalHeader from "../layout/ProposalHeader";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalFooter from "../layout/ProposalFooter";
import ProposalStepper from "../layout/ProposalStepper";
import ProposalSidebar from "../layout/ProposalSidebar";
import ProposalPdfStep from "../steps/ProposalPdfStep";
import ProposalPricingTableStep from "../steps/ProposalPricingTableStep";
import ProposalServicesStep from "../steps/ProposalServicesStep";
import { selectActiveStep } from "../../../redux/reducer/webProposal/stepper";
import { QUOTE_TYPE_ID } from "../../../Middleware/enums";
import { redirectUri } from "../../../Base-Url/Base_Url";
import { resolveServicePackageKeyID } from "../utils/resolveServicePackageKeyID";

export default function StandardProposal({ proposal, theme }) {
  const activeStep = useSelector(selectActiveStep);
  const [acceptError, setAcceptError] = useState(null);
  // Mirrors ProposalPricingTableStep's own selection state (via
  // onSelectedPackageChange below) purely so the footer Accept button here
  // can be gated on whether a package has actually been selected yet — the
  // Pricing Table step remains the single source of truth for the selection
  // itself.
  const [selectedPackageKeyID, setSelectedPackageKeyID] = useState(null);

  const quoteModel = proposal.quoteModel;
  const isPackageType = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isCustomPackageType =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  const isPackageBased = isPackageType || isCustomPackageType;

  // Same "Accept" destination the admin-side proposal email button links to
  // (see PreviewComponentpdf.jsx's AcceptRecurringUrl/AcceptOneOffUrl) —
  // /generate-contract itself calls GenerateContractFromProposal on mount,
  // generates the contract PDF, and hands off to SignEasy, so accepting here
  // just navigates there with the same query params instead of duplicating
  // that flow.
  const handleAccept = () => {
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
    // Pricing Table step before the proposal can be accepted — the Accept
    // Package/Select Package button there only picks a package, it never
    // submits, so this is the one gate that actually blocks acceptance.
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

    // This proposal type has no data the client can change (no Input
    // Fields, package selection is fixed to the admin's default), so there
    // is nothing to persist via AddUpdateQuote — go straight to
    // Generate Contract.
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

  // Package/Custom Package proposals need a Pricing Table step so the client
  // can review the calculated package price before accepting — every other
  // Standard Proposal has nothing to step through, so `steps` stays a single
  // entry and ProposalStepper collapses to a plain Accept button on its own.
  const PRICING_STEP_INDEX = 1;
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
        {/* Sidebar */}
        <aside
          className="hidden lg:flex lg:w-80 lg:flex-shrink-0 overflow-y-auto border-r"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
          <ProposalSidebar theme={theme} proposal={proposal} />
        </aside>

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
              effects in the background (mirrors ProposalAmendment.jsx). */}
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
          onFinish={() => handleAccept()}
          finishLabel="Accept"
        />
      </ProposalFooter>
    </ProposalLayout>
  );
}
