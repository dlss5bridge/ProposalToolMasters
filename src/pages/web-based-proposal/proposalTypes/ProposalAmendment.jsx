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
  selectRecurringSelections,
  selectOneOffSelections,
  selectDefaultRecurringSelections,
  selectDefaultOneOffSelections,
  selectRecurringServices,
  selectOneOffServices,
  selectServicesPricing,
  selectServicesCurrencyID,
  selectServicesVatPercentage,
  selectServicesPackageList,
  selectServiceMappingWithPackagesList,
  setServicesSelectionError,
  setServicesFieldErrorsVisible,
} from "../../../redux/reducer/webProposal/services";
import {
  getAdditionalInformationList,
  getAdditionalInformationFieldErrors,
  getVisibleAdditionalInformationItems,
  selectAdditionalInformationList,
  selectDefaultAdditionalInformationList,
  selectHasAdditionalInformation,
  setAdditionalInformationValidationVisible,
  additionalInformationEntriesMatch,
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
import {
  buildAddUpdateQuotePayload,
  buildSelectedServicesListFromSelections,
} from "../utils/buildAddUpdateQuotePayload";
import { selectionsMatch } from "../steps/ProposalPricingTableStep";
import { generateAmendmentPdfUrl } from "../pdf/generateAmendmentPdf";

export default function ProposalAmendment({ theme, proposal, services }) {
  const dispatch = useDispatch();
  const activeStep = useSelector(selectActiveStep);
  const quoteModel = useSelector(selectQuoteModel);
  const [acceptError, setAcceptError] = useState(null);
  // Tracks ProposalPricingTableStep's selection so Next/Amend can be gated
  // on a package actually being picked.
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
  const recurringSelections = useSelector(selectRecurringSelections);
  const oneOffSelections = useSelector(selectOneOffSelections);
  const defaultRecurringSelections = useSelector(
    selectDefaultRecurringSelections,
  );
  const defaultOneOffSelections = useSelector(selectDefaultOneOffSelections);
  const defaultAdditionalInformationList = useSelector(
    selectDefaultAdditionalInformationList,
  );
  const recurringServices = useSelector(selectRecurringServices);
  const oneOffServices = useSelector(selectOneOffServices);
  const servicesPricing = useSelector(selectServicesPricing);
  const servicesCurrencyID = useSelector(selectServicesCurrencyID);
  const servicesVatPercentage = useSelector(selectServicesVatPercentage);
  const servicesPackageList = useSelector(selectServicesPackageList);
  const serviceMappingWithPackagesList = useSelector(
    selectServiceMappingWithPackagesList,
  );

  // Package proposals use the admin's fixed default services, so there's no
  // service picker step at all.
  const isPackageType = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isCustomPackageType =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  const isPackageBased = isPackageType || isCustomPackageType;

  // Package is priced against a fixed package/discount, so Additional
  // Information never applies. Custom Package still has locked default
  // services on a fixed package, but the client can add their own on top —
  // the step only shows up if one of those client-added services actually
  // needs a pricing driver value.
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

  // Base step order, used to derive each step's final index once Additional
  // Information is spliced in.
  const BASE_STEP_LABELS = isPackageType
    ? ["Proposal", "Pricing Table", "Input Fields"]
    : ["Proposal", "Services", "Pricing Table", "Input Fields"];
  const SERVICES_STEP_INDEX = BASE_STEP_LABELS.indexOf("Services");
  // Additional Information normally follows Services; Package has no
  // Services step, so it slots in right after Proposal instead.
  const ADDITIONAL_INFO_INSERT_INDEX = isPackageType
    ? 1
    : SERVICES_STEP_INDEX + 1;
  const PRICING_STEP_INDEX =
    BASE_STEP_LABELS.indexOf("Pricing Table") +
    (additionalInfoStepInserted ? 1 : 0);
  const INPUT_FIELDS_STEP_INDEX =
    BASE_STEP_LABELS.indexOf("Input Fields") +
    (additionalInfoStepInserted ? 1 : 0);

  // Pairs each step's label with its component so they can't drift apart.
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
              // Custom Package: locked default services show their values
              // read-only; only client-added services stay editable.
              lockedServiceIDs={
                isCustomPackageType ? lockedServiceIDs : undefined
              }
            />
          ),
        },
        ...baseSteps.slice(ADDITIONAL_INFO_INSERT_INDEX),
      ]
    : baseSteps;

  const stepLabels = steps.map((step) => step.label);
  const stepComponents = steps.map((step) => step.component);

  const ADDITIONAL_INFO_STEP_INDEX = ADDITIONAL_INFO_INSERT_INDEX;

  // Standard Package has no Services step to trigger this fetch on Next, so
  // it needs to happen here instead — otherwise Pricing Table would never
  // learn the selected services' global pricing driver values.
  //
  // Custom Package does have a Services step, but the stepper's tabs let the
  // client jump straight to Pricing Table without going through it, so the
  // same fetch is needed as a safety net there too.
  const additionalInfoFetchedRef = useRef(false);
  // Custom Package only: tracks which service IDs we've already fetched
  // Additional Information for, since the client can add new services after
  // the first fetch (via the stepper tabs, bypassing handleBeforeNextStep's
  // own refetch on Services' Next).
  const additionalInfoFetchedServiceIDsRef = useRef(new Set());
  useEffect(() => {
    if (!isPackageBased) return;
    if (!quoteModel?.quoteKeyID || selectedServiceIDs.length === 0) return;

    if (isCustomPackageType) {
      const hasNewServiceID = selectedServiceIDs.some(
        (id) => !additionalInfoFetchedServiceIDsRef.current.has(id),
      );
      if (!hasNewServiceID) return;
      additionalInfoFetchedServiceIDsRef.current = new Set(selectedServiceIDs);
    } else {
      if (additionalInfoFetchedRef.current) return;
      additionalInfoFetchedRef.current = true;
    }

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
  }, [
    isPackageBased,
    isCustomPackageType,
    quoteModel,
    selectedServiceIDs,
    dispatch,
  ]);

  const handleBeforeNextStep = async (currentStepIndex) => {
    // Package/Custom Package quotes need a package selected before leaving
    // Pricing Table, or later steps have nothing to price against.
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
      // Custom Package: locked fields are read-only, so only client-added
      // services' fields are validated — a stale admin default shouldn't
      // block the client.
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

    // Same Custom Package filter as additionalInfoStepInserted above,
    // applied to this freshly fetched list (not yet in redux).
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

  const handleAmendProposal = async () => {
    const quoteKeyID = quoteModel?.quoteKeyID;
    // Already fetched on page load (WebBasedProposal in index.jsx).
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

    // Package can't be amended (no Services/Additional Information steps),
    // so it's always false. Service and Custom Package count as an
    // amendment only if the client actually changed something from the
    // admin's defaults.
    const hasBeenAmended =
      !selectionsMatch(recurringSelections, defaultRecurringSelections) ||
      !selectionsMatch(oneOffSelections, defaultOneOffSelections) ||
      !additionalInformationEntriesMatch(
        additionalInformationList,
        defaultAdditionalInformationList,
      );
    const isAmend = isPackageType ? false : hasBeenAmended;

    // Only an actually amended proposal needs selectedServicesList rebuilt
    // from the live selections rather than the stale quoteModel copy.
    const selectedServicesListOverride = isAmend
      ? buildSelectedServicesListFromSelections({
          recurringSelections,
          oneOffSelections,
          recurringServices,
          oneOffServices,
          pricing: servicesPricing,
        })
      : undefined;

    const amendmentPayload = buildAddUpdateQuotePayload(
      quoteModel,
      inputFieldsList,
      selectedServicesListOverride,
      additionalInformationList,
      {
        recurringSelections,
        oneOffSelections,
        recurringServices,
        oneOffServices,
        pricing: servicesPricing,
        currencyID: servicesCurrencyID,
        vatPercentage: servicesVatPercentage,
        servicePackageList: servicesPackageList,
        serviceMappingWithPackagesList,
      },
      isAmend,
    );

    // Regenerate the PDF only for an actual amendment (see
    // generateAmendmentPdf.js) — must finish before addUpdateQuote below,
    // since amendmentPayload.quotePDFUrl needs the merged result.
    let finalPayload = amendmentPayload;
    if (isAmend) {
      let mergedPdfUrl;
      try {
        mergedPdfUrl = await generateAmendmentPdfUrl({
          quoteModel,
          accentColor: theme?.primary,
          quotationFinalAmountList: amendmentPayload.quotationFinalAmountList,
          recurringSelections,
          oneOffSelections,
          additionalInformationList,
          pricing: servicesPricing,
          currencyID: servicesCurrencyID,
          servicePackageList: servicesPackageList,
          serviceMappingWithPackagesList,
        });
      } catch (err) {
        mergedPdfUrl = null;
      }

      if (!mergedPdfUrl) {
        setAcceptError(
          "Failed to generate the amendment PDF. Please try again.",
        );
        return;
      }

      finalPayload = { ...amendmentPayload, quotePDFUrl: mergedPdfUrl };
    }

    let amendedQuoteKeyID;
    try {
      // An amendment persists as a new quote record, so Generate Contract
      // needs the returned quoteKeyID, not the original.
      debugger; // eslint-disable-line no-debugger -- inspect addUpdateQuote payload on amendment accept
      amendedQuoteKeyID = await dispatch(
        addUpdateQuote({
          ...finalPayload,
          isAmend,
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

    // Mirrors the email accept link's query params. ServicePackageKeyID
    // needs a lookup (see resolveServicePackageKeyID) and is omitted for
    // Service-based proposals, which have no packages.
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
    // generate-contract itself redirects to payment before showing the sign
    // step when this is true (see GetSendToSignEasyData there) — mirrors
    // StandardProposal.jsx's own accept flow.
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
