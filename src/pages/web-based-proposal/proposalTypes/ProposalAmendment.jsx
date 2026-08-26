import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProposalFooter from "../layout/ProposalFooter";
import ProposalHeader from "../layout/ProposalHeader";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalSidebar from "../layout/ProposalSidebar";
import ProposalStepper from "../layout/ProposalStepper";
import ProposalInputFieldsStep from "../steps/ProposalInputFieldsStep";
import ProposalPdfStep from "../steps/ProposalPdfStep";
import ProposalServicesStep from "../steps/ProposalServicesStep";
import ProposalPricingTableStep from "../steps/ProposalPricingTableStep";
import ProposalAdditionalInformationStep from "../steps/ProposalAdditionalInformationStep";
import {
  selectActiveStep,
  updateTotalSteps,
} from "../../../redux/reducer/webProposal/stepper";
import {
  selectQuoteModel,
  addUpdateQuote,
} from "../../../redux/reducer/webProposal";
import {
  selectSelectedServiceIDs,
  selectServicesFieldErrors,
  selectLockedServiceIDs,
  setServicesSelectionError,
  setServicesFieldErrorsVisible,
} from "../../../redux/reducer/webProposal/services";
import {
  getAdditionalInformationList,
  getAdditionalInformationFieldErrors,
  getVisibleAdditionalInformationItems,
  selectAdditionalInformationList,
  selectHasAdditionalInformation,
  setAdditionalInformationValidationVisible,
} from "../../../redux/reducer/webProposal/additionalInformation";
import {
  selectHasInputFields,
  selectInputFieldsList,
  getInputFieldsFieldErrors,
  setInputFieldsValidationVisible,
} from "../../../redux/reducer/webProposal/inputFields";
import { QUOTE_TYPE_ID } from "../../../Middleware/enums";
import { redirectUri } from "../../../Base-Url/Base_Url";
import { resolveServicePackageKeyID } from "../utils/resolveServicePackageKeyID";
import { buildAddUpdateQuotePayload } from "../utils/buildAddUpdateQuotePayload";

export default function ProposalAmendment({ theme, proposal, services }) {
  const dispatch = useDispatch();
  const activeStep = useSelector(selectActiveStep);
  const quoteModel = useSelector(selectQuoteModel);
  const [acceptError, setAcceptError] = useState(null);
  // Mirrors ProposalPricingTableStep's own selection state (via
  // onSelectedPackageChange below) purely so Next/Amend can be gated on
  // whether a package has actually been selected yet — same pattern as
  // StandardProposal.jsx / ProposalInputForm.jsx.
  const [selectedPackageKeyID, setSelectedPackageKeyID] = useState(null);
  const selectedServiceIDs = useSelector(selectSelectedServiceIDs);
  const servicesFieldErrors = useSelector(selectServicesFieldErrors);
  const hasAdditionalInformation = useSelector(selectHasAdditionalInformation);
  const hasInputFields = useSelector(selectHasInputFields);
  const additionalInformationList = useSelector(
    selectAdditionalInformationList,
  );
  const lockedServiceIDs = useSelector(selectLockedServiceIDs);
  const inputFieldsList = useSelector(selectInputFieldsList);

  // Package proposals ship with the admin's fixed default services and give
  // the client no service picker at all — the Services step is dropped from
  // the stepper entirely (see isPackageType below).
  const isPackageType = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isCustomPackageType =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  const isPackageBased = isPackageType || isCustomPackageType;

  // Package proposals are priced against a fixed package/discount rather
  // than the per-service driver values Additional Information exists to
  // capture, so the step is skipped entirely — never inserted into the
  // stepper, never navigable to.
  //
  // Custom Package is different: the admin's locked default services are
  // still priced against a fixed package, but the client can add their own
  // services on top of that package, and one of those could carry its own
  // additional-information requirement (a global pricing driver). The step
  // is only inserted when that's actually the case — i.e. at least one
  // visible field belongs to a service the client added themselves, not one
  // of the admin's locked defaults — so a Custom Package proposal with no
  // client-added services (or none needing extra info) still skips it
  // exactly like before.
  const hasClientAddedAdditionalInformation =
    isCustomPackageType &&
    getVisibleAdditionalInformationItems(additionalInformationList).some(
      (item) => !lockedServiceIDs.has(item.serviceID),
    );
  const additionalInfoStepInserted = isPackageType
    ? false
    : isCustomPackageType
      ? hasClientAddedAdditionalInformation
      : hasAdditionalInformation;

  // Base step order is fixed, so the final index of any step can be derived
  // up front from its position here plus whether Additional Information gets
  // spliced in after Services — needed below to tell the Pricing Table step
  // when it becomes the active step.
  const BASE_STEP_LABELS = isPackageType
    ? ["Proposal", "Pricing Table", "Input Fields"]
    : ["Proposal", "Services", "Pricing Table", "Input Fields"];
  const SERVICES_STEP_INDEX = BASE_STEP_LABELS.indexOf("Services");
  // Additional Information normally follows Services; Package proposals have
  // no Services step, so it slots in right after Proposal instead.
  const ADDITIONAL_INFO_INSERT_INDEX = isPackageType
    ? 1
    : SERVICES_STEP_INDEX + 1;
  const PRICING_STEP_INDEX =
    BASE_STEP_LABELS.indexOf("Pricing Table") +
    (additionalInfoStepInserted ? 1 : 0);
  const INPUT_FIELDS_STEP_INDEX =
    BASE_STEP_LABELS.indexOf("Input Fields") +
    (additionalInfoStepInserted ? 1 : 0);

  // Single source of truth pairing each step's label with its component, so
  // the two can never drift out of sync (steps not yet built get a `null`
  // component but still reserve their place in the flow).
  const baseSteps = [
    { label: "Proposal", component: <ProposalPdfStep theme={theme} /> },
    ...(isPackageType
      ? []
      : [
          {
            label: "Services",
            component: <ProposalServicesStep theme={theme} />,
          },
        ]),
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

    ...(hasInputFields
      ? [
          {
            label: "Input Fields",
            component: <ProposalInputFieldsStep theme={theme} />,
          },
        ]
      : []),
  ];

  const steps = additionalInfoStepInserted
    ? [
        ...baseSteps.slice(0, ADDITIONAL_INFO_INSERT_INDEX),
        {
          label: "Additional Information",
          component: (
            <ProposalAdditionalInformationStep
              theme={theme}
              // Custom Package: the admin's locked default services keep
              // their pre-set values shown but not editable; only fields
              // belonging to a service the client added themselves are
              // live. Every other proposal type has no locked services, so
              // this is an empty set and every field stays editable exactly
              // as before.
              lockedServiceIDs={isCustomPackageType ? lockedServiceIDs : undefined}
            />
          ),
        },
        ...baseSteps.slice(ADDITIONAL_INFO_INSERT_INDEX),
      ]
    : baseSteps;

  const stepLabels = steps.map((step) => step.label);
  const stepComponents = steps.map((step) => step.component);

  const ADDITIONAL_INFO_STEP_INDEX = ADDITIONAL_INFO_INSERT_INDEX;

  // For every other proposal type this fetch happens when the client clicks
  // Next out of the Services step (see the SERVICES_STEP_INDEX branch of
  // handleBeforeNextStep below). Package proposals have no Services step to
  // leave, so without this neither the (read-only) Additional Information
  // step nor the Pricing Table would ever learn a selected service's global
  // pricing driver value — those services would reach
  // GetCalculatedServicesPriceByPackages with no driver row at all and come
  // back unpriced.
  const additionalInfoFetchedRef = useRef(false);
  useEffect(() => {
    if (!isPackageType) return;
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
  }, [isPackageType, quoteModel, selectedServiceIDs, dispatch]);

  const handleBeforeNextStep = async (currentStepIndex) => {
    // Package/Custom Package quotes must have a package selected before
    // leaving the Pricing Table step — otherwise Additional Information/
    // Input Fields (or the eventual Amend) would have nothing to price/
    // contract against.
    if (currentStepIndex === PRICING_STEP_INDEX && isPackageBased) {
      if (!selectedPackageKeyID) {
        setAcceptError("Please select a package to continue.");
        return false;
      }
      setAcceptError(null);
    }

    if (hasInputFields && currentStepIndex === INPUT_FIELDS_STEP_INDEX) {
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
    }

    if (
      additionalInfoStepInserted &&
      currentStepIndex === ADDITIONAL_INFO_STEP_INDEX
    ) {
      // Custom Package: locked fields are read-only, so a stale/incomplete
      // admin default there must never block the client from proceeding —
      // only fields belonging to a service the client added themselves can
      // actually be fixed, so only those are checked.
      const validatableList = isCustomPackageType
        ? additionalInformationList.filter(
            (item) => !lockedServiceIDs.has(item.serviceID),
          )
        : additionalInformationList;
      const fieldErrors = getAdditionalInformationFieldErrors(validatableList);
      if (Object.keys(fieldErrors).length > 0) {
        dispatch(setAdditionalInformationValidationVisible(true));
        return false;
      }
      dispatch(setAdditionalInformationValidationVisible(false));
      return true;
    }

    if (currentStepIndex !== SERVICES_STEP_INDEX) return true;

    if (selectedServiceIDs.length === 0) {
      dispatch(setServicesSelectionError(true));
      return false;
    }
    dispatch(setServicesSelectionError(false));

    const hasFieldErrors =
      Object.keys(servicesFieldErrors?.recurring || {}).length > 0 ||
      Object.keys(servicesFieldErrors?.oneOff || {}).length > 0;
    if (hasFieldErrors) {
      dispatch(setServicesFieldErrorsVisible(true));
      return false;
    }
    dispatch(setServicesFieldErrorsVisible(false));

    let list = [];
    try {
      list = await dispatch(
        getAdditionalInformationList({
          organisationKeyID: quoteModel?.organisationKeyID,
          userKeyID: quoteModel?.userKeyID,
          quoteKeyID: quoteModel?.quoteKeyID,
          clientID: quoteModel?.clientID,
          servicesIDs: selectedServiceIDs,
          servicePackageIDs: quoteModel?.servicePackageID,
        }),
      ).unwrap();
    } catch (err) {
      // Proceed without the Additional Information step if the lookup fails.
      list = [];
    }

    // Mirrors additionalInfoStepInserted above: for Custom Package, only a
    // client-added service's field counts toward inserting the step — a
    // freshly re-fetched `list` (not yet in redux) needs the same filter.
    const visibleItems = getVisibleAdditionalInformationItems(list);
    const hasVisibleAdditionalInformation = isCustomPackageType
      ? visibleItems.some((item) => !lockedServiceIDs.has(item.serviceID))
      : visibleItems.length > 0;
    dispatch(
      updateTotalSteps(
        baseSteps.length + (hasVisibleAdditionalInformation ? 1 : 0),
      ),
    );

    return true;
  };

  // Redirect below mirrors StandardProposal.jsx's handleAccept exactly, so
  // every Web-Based Proposal type lands on the same generate-contract flow
  // after its final action.
  const handleAmendProposal = async () => {
    const quoteKeyID = quoteModel?.quoteKeyID;
    // themeSettings was already fetched by GetOrganisationThemeSettings on
    // page load (see WebBasedProposal in index.jsx) — reuse it instead of
    // calling the endpoint again here.
    const themeSettings = proposal.themeSettings;
    const serviceChargeTypeID = themeSettings?.serviceChargeTypeID;

    if (!quoteKeyID || serviceChargeTypeID == null) {
      setAcceptError("Failed to amend proposal. Please try again.");
      return;
    }

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

    // Base request is the complete GetQuoteModel response. Package
    // Amendment never lets the client add/remove services, so the base
    // payload's services/additionalInformation/package data is left exactly
    // as GetQuoteModel returned it for every amendment case here — only the
    // globalPricingDriverIDsWithValues entries the client actually filled in
    // on the Input Fields step are patched on top.
    let amendedQuoteKeyID;
    try {
      // On success, AddUpdateQuote's responseData.data is the new
      // quoteKeyID for this amendment (the addUpdateQuote thunk already
      // unwraps to responseData.data) — Generate Contract must be called
      // with that one, not the original quoteModel.quoteKeyID, since an
      // amendment persists as a new quote record.
      amendedQuoteKeyID = await dispatch(
        addUpdateQuote({
          ...buildAddUpdateQuotePayload(quoteModel, inputFieldsList),
          isAmend: true,
        }),
      ).unwrap();
    } catch (err) {
      setAcceptError("Failed to amend proposal. Please try again.");
      return;
    }

    if (!amendedQuoteKeyID) {
      setAcceptError("Failed to amend proposal. Please try again.");
      return;
    }

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
      quoteKeyID: amendedQuoteKeyID,
      ServiceChargeTypeID: String(serviceChargeTypeID),
      Action: "Accepted",
      ContractSignatoryKeyID: themeSettings?.contractSignatoryKeyID ?? "",
    });
    if (servicePackageKeyID) {
      params.set("ServicePackageKeyID", servicePackageKeyID);
    }

    // eslint-disable-next-line no-debugger
    debugger; // TEMP: inspect the resolved generate-contract params before navigating away.

    // Full navigation (not react-router's navigate) — the client-facing
    // generate-contract destination lives on the production proposal
    // domain, not necessarily the origin this app is currently served from.
    window.location.href = `${redirectUri}/generate-contract?${params.toString()}`;
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
        {/* Sidebar shown for the PDF step and the Pricing Table step */}
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
          {/* Package proposals skip the Services step entirely (no service
              picker is ever shown), but the Pricing Table still needs the
              admin's default selections hydrated into redux — so the step
              stays mounted here, permanently hidden, purely to run its
              data-fetch/hydration effects in the background. */}
          {isPackageType && (
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
          onFinish={handleAmendProposal}
          finishLabel="Amend Proposal"
        />
      </ProposalFooter>
    </ProposalLayout>
  );
}
