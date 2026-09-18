import { useEffect, useRef, useState } from "react";
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
import {
  selectSelectedServiceIDs,
  selectLockedServiceIDs,
  selectRecurringSelections,
  selectOneOffSelections,
  selectRecurringServices,
  selectOneOffServices,
  selectServiceMappingWithPackagesList,
} from "../../../redux/reducer/webProposal/services";
import {
  getAdditionalInformationList,
  getAdditionalInformationFieldErrors,
  getVisibleAdditionalInformationItems,
  selectAdditionalInformationList,
  setAdditionalInformationValidationVisible,
} from "../../../redux/reducer/webProposal/additionalInformation";
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
import ProposalAdditionalInformationStep from "../steps/ProposalAdditionalInformationStep";
import { QUOTE_TYPE_ID } from "../../../Middleware/enums";
import { redirectUri } from "../../../Base-Url/Base_Url";
import { resolveServicePackageKeyID } from "../utils/resolveServicePackageKeyID";

export default function StandardProposalWithInputs({ proposal, theme }) {
  const dispatch = useDispatch();
  const activeStep = useSelector(selectActiveStep);
  const hasInputFields = useSelector(selectHasInputFields);
  const quoteModel = useSelector(selectQuoteModel);
  const inputFieldsList = useSelector(selectInputFieldsList);
  const selectedServiceIDs = useSelector(selectSelectedServiceIDs);
  const additionalInformationList = useSelector(
    selectAdditionalInformationList,
  );
  const lockedServiceIDs = useSelector(selectLockedServiceIDs);
  const recurringSelections = useSelector(selectRecurringSelections);
  const oneOffSelections = useSelector(selectOneOffSelections);
  const recurringServices = useSelector(selectRecurringServices);
  const oneOffServices = useSelector(selectOneOffServices);
  const serviceMappingWithPackagesList = useSelector(
    selectServiceMappingWithPackagesList,
  );

  const isPackageType = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isCustomPackageType =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  const isPackageBased = isPackageType || isCustomPackageType;

  const [acceptError, setAcceptError] = useState(null);
  // Tracks ProposalPricingTableStep's selection so the finish action can be
  // gated on a package actually being picked.
  const [selectedPackageKeyID, setSelectedPackageKeyID] = useState(null);

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

  // Additional Information slots in right after Proposal when present;
  // Pricing Table and Input Fields shift accordingly.
  const ADDITIONAL_INFO_STEP_INDEX = 1;
  const PRICING_STEP_INDEX = additionalInfoStepInserted ? 2 : 1;
  const INPUT_FIELDS_STEP_INDEX = isPackageBased
    ? PRICING_STEP_INDEX + 1
    : additionalInfoStepInserted
      ? 2
      : 1;

  const handleBeforeNextStep = (currentStepIndex) => {
    if (
      additionalInfoStepInserted &&
      currentStepIndex === ADDITIONAL_INFO_STEP_INDEX
    ) {
      // Custom Package: locked fields are read-only, so only client-added
      // services' fields are validated.
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
    }

    // Package/Custom Package quotes need a package selected before leaving
    // Pricing Table, or later steps have nothing to price against.
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

  // "Save" action for the plain (non-package) flow — Package/Custom Package
  // quotes finish via handleAccept instead. This proposal type never shows a
  // Services or Additional Information step, so isAmend is always false and
  // buildAddUpdateQuotePayload just preserves GetQuoteModel's values as-is.
  const handleSave = async () => {
    const quoteKeyID = quoteModel?.quoteKeyID;
    // Already fetched on page load (WebBasedProposal in index.jsx).
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
        addUpdateQuote({
          ...buildAddUpdateQuotePayload(
            quoteModel,
            inputFieldsList,
            undefined,
            additionalInformationList,
            undefined,
            false,
          ),
          isAmend: false,
        }),
      ).unwrap();
    } catch (err) {
      setAcceptError("Failed to save proposal. Please try again.");
      return;
    }

    // eslint-disable-next-line no-debugger
    debugger; // TEMP: inspect AddUpdateQuote payload/response before navigating away.

    setAcceptError(null);

    // No ServicePackageKeyID here — this is a Service-based (non-package)
    // proposal, so there's nothing to resolve.
    const params = new URLSearchParams({
      quoteKeyID,
      ServiceChargeTypeID: String(serviceChargeTypeID),
      Action: "Accepted",
      ContractSignatoryKeyID: themeSettings?.contractSignatoryKeyID ?? "",
    });

    // Full navigation, not react-router — generate-contract lives on the
    // production proposal domain, not necessarily this app's origin.
    window.location.href = `${redirectUri}/generate-contract?${params.toString()}`;
  };

  // /generate-contract calls GenerateContractFromProposal on mount and hands
  // off to SignEasy, so accepting here just navigates there.
  const handleAccept = async () => {
    const quoteKeyID = quoteModel?.quoteKeyID;
    // Already fetched on page load (WebBasedProposal in index.jsx).
    const themeSettings = proposal.themeSettings;
    const serviceChargeTypeID = themeSettings?.serviceChargeTypeID;

    if (!quoteKeyID || serviceChargeTypeID == null) {
      setAcceptError("Failed to accept proposal. Please try again.");
      return;
    }

    // Package/Custom Package needs a package selected on Pricing Table
    // before acceptance — the Select Package button there only picks, it
    // never submits.
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

    // Only the Input Fields entries the client filled in get patched onto
    // the GetQuoteModel response; isAmend stays false for the same reason
    // as handleSave above.
    try {
      await dispatch(
        addUpdateQuote({
          ...buildAddUpdateQuotePayload(
            quoteModel,
            inputFieldsList,
            undefined,
            additionalInformationList,
            {
              recurringSelections,
              oneOffSelections,
              recurringServices,
              oneOffServices,
              serviceMappingWithPackagesList,
            },
            false,
          ),
          isAmend: false,
        }),
      ).unwrap();
    } catch (err) {
      setAcceptError("Failed to accept proposal. Please try again.");
      return;
    }

    // eslint-disable-next-line no-debugger
    debugger; // TEMP: inspect AddUpdateQuote payload/response before navigating away.

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

    // Full navigation, not react-router — generate-contract lives on the
    // production proposal domain, not necessarily this app's origin.
    window.location.href = `${redirectUri}/generate-contract?${params.toString()}`;
  };

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
        {/* Sidebar (logo/description) — shown on every step. */}
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
          onFinish={isPackageBased ? handleAccept : handleSave}
          finishLabel={isPackageBased ? "Accept" : "Save"}
        />
      </ProposalFooter>
    </ProposalLayout>
  );
}
