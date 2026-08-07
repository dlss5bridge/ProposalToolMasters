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
import { selectQuoteModel } from "../../../redux/reducer/webProposal";
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
import { Services } from "../steps/ProposalServicesStep/data/data";

export default function ProposalAmendment({ theme, proposal, services }) {
  const dispatch = useDispatch();
  const activeStep = useSelector(selectActiveStep);
  const quoteModel = useSelector(selectQuoteModel);
  const selectedServiceIDs = useSelector(selectSelectedServiceIDs);
  const servicesFieldErrors = useSelector(selectServicesFieldErrors);
  const hasAdditionalInformation = useSelector(selectHasAdditionalInformation);
  const additionalInformationList = useSelector(
    selectAdditionalInformationList,
  );

  // Base step order is fixed, so the final index of any step can be derived
  // up front from its position here plus whether Additional Information gets
  // spliced in after Services — needed below to tell the Pricing Table step
  // when it becomes the active step.
  const BASE_STEP_LABELS = [
    "Proposal",
    "Services",
    "Pricing Table",
    "Input Fields",
  ];
  const SERVICES_STEP_INDEX = BASE_STEP_LABELS.indexOf("Services");
  const PRICING_STEP_INDEX =
    BASE_STEP_LABELS.indexOf("Pricing Table") +
    (hasAdditionalInformation ? 1 : 0);

  // Single source of truth pairing each step's label with its component, so
  // the two can never drift out of sync (steps not yet built get a `null`
  // component but still reserve their place in the flow).
  const baseSteps = [
    { label: "Proposal", component: <ProposalPdfStep theme={theme} /> },
    {
      label: "Services",
      component: <ProposalServicesStep theme={theme} Services={Services} />,
    },
    {
      label: "Pricing Table",
      component: (
        <ProposalPricingTableStep
          theme={theme}
          isActive={activeStep === PRICING_STEP_INDEX}
        />
      ),
    },

    {
      label: "Input Fields",
      component: <ProposalInputFieldsStep theme={theme} />,
    },
  ];

  const steps = hasAdditionalInformation
    ? [
        ...baseSteps.slice(0, SERVICES_STEP_INDEX + 1),
        {
          label: "Additional Information",
          component: <ProposalAdditionalInformationStep theme={theme} />,
        },
        ...baseSteps.slice(SERVICES_STEP_INDEX + 1),
      ]
    : baseSteps;

  const stepLabels = steps.map((step) => step.label);
  const stepComponents = steps.map((step) => step.component);

  const ADDITIONAL_INFO_STEP_INDEX = SERVICES_STEP_INDEX + 1;

  const handleBeforeNextStep = async (currentStepIndex) => {
    if (
      hasAdditionalInformation &&
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
        />
      </ProposalFooter>
    </ProposalLayout>
  );
}
