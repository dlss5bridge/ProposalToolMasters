import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ProposalHeader from "../layout/ProposalHeader";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalFooter from "../layout/ProposalFooter";
import ProposalStepper from "../layout/ProposalStepper";
import ProposalSidebar from "../layout/ProposalSidebar";
import ProposalPdfStep from "../steps/ProposalPdfStep";
import ProposalPricingTableStep from "../steps/ProposalPricingTableStep";
import ProposalServicesStep from "../steps/ProposalServicesStep";
import ProposalAdditionalInformationStep from "../steps/ProposalAdditionalInformationStep";
import { selectActiveStep } from "../../../redux/reducer/webProposal/stepper";
import {
  selectSelectedServiceIDs,
  selectLockedServiceIDs,
} from "../../../redux/reducer/webProposal/services";
import {
  getAdditionalInformationList,
  getAdditionalInformationFieldErrors,
  getVisibleAdditionalInformationItems,
  selectAdditionalInformationList,
  setAdditionalInformationValidationVisible,
} from "../../../redux/reducer/webProposal/additionalInformation";
import { QUOTE_TYPE_ID } from "../../../Middleware/enums";
import { redirectUri } from "../../../Base-Url/Base_Url";
import { resolveServicePackageKeyID } from "../utils/resolveServicePackageKeyID";

export default function StandardProposal({ proposal, theme }) {
  const dispatch = useDispatch();
  const activeStep = useSelector(selectActiveStep);
  const [acceptError, setAcceptError] = useState(null);
  // Tracks ProposalPricingTableStep's selection so the footer Accept button
  // can be gated on a package actually being picked.
  const [selectedPackageKeyID, setSelectedPackageKeyID] = useState(null);
  const selectedServiceIDs = useSelector(selectSelectedServiceIDs);
  const additionalInformationList = useSelector(
    selectAdditionalInformationList,
  );
  const lockedServiceIDs = useSelector(selectLockedServiceIDs);

  const quoteModel = proposal.quoteModel;
  const isPackageType = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isCustomPackageType =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  const isPackageBased = isPackageType || isCustomPackageType;

  // Custom Package only: locked default services are priced against a fixed
  // package, but the client can add their own on top — the step only shows
  // up if one of those client-added services needs a pricing driver value.
  const hasClientAddedAdditionalInformation =
    isCustomPackageType &&
    getVisibleAdditionalInformationItems(additionalInformationList).some(
      (item) => !lockedServiceIDs.has(item.serviceID),
    );
  const additionalInfoStepInserted = hasClientAddedAdditionalInformation;

  // No visible Services step here to trigger this fetch on leaving, so it
  // fires as soon as the default selections have hydrated instead.
  const additionalInfoFetchedRef = useRef(false);
  useEffect(() => {
    if (!isPackageBased) return;
    if (additionalInfoFetchedRef.current) return;
    if (!quoteModel?.quoteKeyID || selectedServiceIDs.length === 0) return;

    additionalInfoFetchedRef.current = true;
    dispatch(
      getAdditionalInformationList({
        organisationKeyID: quoteModel?.organisationKeyID,
        userKeyID: quoteModel?.userKeyID,
        quoteKeyID: quoteModel?.quoteKeyID,
        clientID: quoteModel?.clientID,
        servicesIDs: selectedServiceIDs,
        servicePackageIDs: quoteModel?.servicePackageID,
      }),
    );
  }, [isPackageBased, quoteModel, selectedServiceIDs, dispatch]);

  // /generate-contract calls GenerateContractFromProposal on mount and hands
  // off to SignEasy, so accepting here just navigates there.
  const handleAccept = () => {
    const quoteKeyID = quoteModel?.quoteKeyID;
    // Already fetched on page load (WebBasedProposal in index.jsx).
    const themeSettings = proposal.themeSettings;
    const serviceChargeTypeID = themeSettings?.serviceChargeTypeID;

    if (!quoteKeyID || serviceChargeTypeID == null) {
      setAcceptError("Failed to accept proposal. Please try again.");
      return;
    }

    // Package/Custom Package needs a package selected on Pricing Table
    // before acceptance — the Accept/Select Package button there only
    // picks, it never submits.
    if (isPackageBased && !selectedPackageKeyID) {
      setAcceptError("Please select a package to continue.");
      return;
    }

    // Nothing here for the client to change, so there's nothing to persist
    // via AddUpdateQuote — go straight to Generate Contract.
    setAcceptError(null);

    // ServicePackageKeyID needs a lookup (see resolveServicePackageKeyID)
    // and is omitted for Service-based proposals, which have no packages.
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
    // generate-contract reads this query param to decide whether to
    // redirect to payment before showing the sign step — see
    // GetSendToSignEasyData's paymentBeforeContractSign check there.
    params.set(
      "paymentBeforeContractSign",
      String(themeSettings?.isCollectPaymentBeforeProposalAmendment === true),
    );

    // Full navigation, not react-router — generate-contract lives on the
    // production proposal domain, not necessarily this app's origin.
    // TODO: need to remove later — dev-tunnel URL for testing the
    // payment-before-sign loader locally instead of redirectUri.
    window.location.href = `${redirectUri}/generate-contract?${params.toString()}`;
    // window.location.href = `https://9nptb6lw-3000.inc1.devtunnels.ms/generate-contract?${params.toString()}`;
  };

  // Non-package proposals have nothing to step through, so ProposalStepper
  // collapses to a plain Accept button. Additional Information (Custom
  // Package only) slots in right after Proposal, ahead of Pricing Table.
  const ADDITIONAL_INFO_STEP_INDEX = 1;
  const PRICING_STEP_INDEX = additionalInfoStepInserted ? 2 : 1;
  const steps = [
    { label: "Proposal", component: <ProposalPdfStep theme={theme} /> },
    ...(additionalInfoStepInserted
      ? [
          {
            label: "Additional Information",
            component: (
              <ProposalAdditionalInformationStep
                theme={theme}
                lockedServiceIDs={lockedServiceIDs}
              />
            ),
          },
        ]
      : []),
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

  // Custom Package: locked fields are read-only, so only client-added
  // services' fields are validated.
  const handleBeforeNextStep = (currentStepIndex) => {
    if (
      !additionalInfoStepInserted ||
      currentStepIndex !== ADDITIONAL_INFO_STEP_INDEX
    ) {
      return true;
    }

    const validatableList = additionalInformationList.filter(
      (item) => !lockedServiceIDs.has(item.serviceID),
    );
    const fieldErrors = getAdditionalInformationFieldErrors(validatableList);
    if (Object.keys(fieldErrors).length > 0) {
      dispatch(setAdditionalInformationValidationVisible(true));
      return false;
    }
    dispatch(setAdditionalInformationValidationVisible(false));
    return true;
  };

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
          {/* Package proposals have no visible Services step, but Pricing
              Table still needs the default selections hydrated into redux —
              so it stays mounted here, hidden, just to run that effect. */}
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
          onFinish={() => handleAccept()}
          finishLabel="Accept"
        />
      </ProposalFooter>
    </ProposalLayout>
  );
}
