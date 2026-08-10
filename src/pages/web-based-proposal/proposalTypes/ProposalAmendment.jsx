import { useEffect, useRef } from "react";
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
  amendProposal,
} from "../../../redux/reducer/webProposal";
import {
  selectSelectedServiceIDs,
  selectServicesFieldErrors,
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

export default function ProposalAmendment({ theme, proposal, services }) {
  const dispatch = useDispatch();
  const activeStep = useSelector(selectActiveStep);
  const quoteModel = useSelector(selectQuoteModel);
  const selectedServiceIDs = useSelector(selectSelectedServiceIDs);
  const servicesFieldErrors = useSelector(selectServicesFieldErrors);
  const hasAdditionalInformation = useSelector(selectHasAdditionalInformation);
  const hasInputFields = useSelector(selectHasInputFields);
  const additionalInformationList = useSelector(
    selectAdditionalInformationList,
  );
  const inputFieldsList = useSelector(selectInputFieldsList);

  // Package proposals ship with the admin's fixed default services and give
  // the client no service picker at all — the Services step is dropped from
  // the stepper entirely (see isPackageType below).
  const isPackageType = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isCustomPackageType =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;

  // Package and Custom Package proposals are priced against a fixed
  // package/discount rather than the per-service driver values Additional
  // Information exists to capture, so the step is skipped entirely for both
  // — never inserted into the stepper, never navigable to.
  const additionalInfoStepInserted =
    hasAdditionalInformation && !isPackageType && !isCustomPackageType;

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
          component: <ProposalAdditionalInformationStep theme={theme} />,
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
      }),
    );
  }, [isPackageType, quoteModel, selectedServiceIDs, dispatch]);

  const handleBeforeNextStep = async (currentStepIndex) => {
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
      const fieldErrors = getAdditionalInformationFieldErrors(
        additionalInformationList,
      );
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
        }),
      ).unwrap();
    } catch (err) {
      // Proceed without the Additional Information step if the lookup fails.
      list = [];
    }

    const hasVisibleAdditionalInformation =
      getVisibleAdditionalInformationItems(list).length > 0;
    dispatch(
      updateTotalSteps(
        baseSteps.length + (hasVisibleAdditionalInformation ? 1 : 0),
      ),
    );

    return true;
  };

  // Placeholder endpoint until the real "Amend Proposal" API is ready — see
  // AmendWebProposal in ProposalApi.jsx.
  const handleAmendProposal = async () => {
    try {
      await dispatch(
        amendProposal({ quoteKeyID: quoteModel?.quoteKeyID }),
      ).unwrap();
    } catch (err) {
      // Endpoint is a placeholder for now, so failures are expected.
    }
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
