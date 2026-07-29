import { useDispatch, useSelector } from "react-redux";
import ProposalFooter from "../layout/ProposalFooter";
import ProposalHeader from "../layout/ProposalHeader";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalSidebar from "../layout/ProposalSidebar";
import ProposalStepper from "../layout/ProposalStepper";
import ProposalInputFieldsStep from "../steps/ProposalInputFieldsStep";
import ProposalPdfStep from "../steps/ProposalPdfStep";
import ProposalServicesStep from "../steps/ProposalServicesStep";
import ProposalAdditionalInformationStep from "../steps/ProposalAdditionalInformationStep";
import {
  selectActiveStep,
  updateTotalSteps,
} from "../../../redux/reducer/webProposal/stepper";
import { selectQuoteModel } from "../../../redux/reducer/webProposal";
import { selectSelectedServiceIDs } from "../../../redux/reducer/webProposal/services";
import {
  getAdditionalInformationList,
  selectHasAdditionalInformation,
} from "../../../redux/reducer/webProposal/additionalInformation";
import { Services } from "../steps/ProposalServicesStep/data/data";

const BASE_STEP_LABELS = [
  "Proposal",
  "Input Fields",
  "Services",
  "Pricing Table",
  "Preview",
  "Sign",
];
const SERVICES_STEP_INDEX = 2;

export default function ProposalAmendment({ theme, proposal, services }) {
  const dispatch = useDispatch();
  const activeStep = useSelector(selectActiveStep);
  const quoteModel = useSelector(selectQuoteModel);
  const selectedServiceIDs = useSelector(selectSelectedServiceIDs);
  const hasAdditionalInformation = useSelector(selectHasAdditionalInformation);

  const stepLabels = hasAdditionalInformation
    ? [
        ...BASE_STEP_LABELS.slice(0, SERVICES_STEP_INDEX + 1),
        "Additional Information",
        ...BASE_STEP_LABELS.slice(SERVICES_STEP_INDEX + 1),
      ]
    : BASE_STEP_LABELS;

  const stepComponents = [
    <ProposalPdfStep theme={theme} />,
    <ProposalInputFieldsStep theme={theme} />,
    // <ProposalBasicInformationStep theme={theme} />,
    <ProposalServicesStep theme={theme} Services={Services} />,
    ...(hasAdditionalInformation
      ? [<ProposalAdditionalInformationStep theme={theme} />]
      : []),
    // <ProposalPricingTableStep theme={theme} />,
    // <ProposalPreviewStep theme={theme} />,
    // <ProposalSignStep theme={theme} />,
  ];

  const handleBeforeNextStep = async (currentStepIndex) => {
    if (currentStepIndex !== SERVICES_STEP_INDEX) return true;

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

    dispatch(
      updateTotalSteps(BASE_STEP_LABELS.length + (list.length > 0 ? 1 : 0)),
    );

    return true;
  };

  return (
    <ProposalLayout theme={theme}>
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <ProposalHeader theme={theme} title={proposal.title} />
      </div>

      <div
        className="flex flex-1 overflow-hidden"
        style={{
          backgroundColor: theme.background,
        }}
      >
        {/* Sidebar only for PDF step */}
        {activeStep === 0 && (
          <aside
            className="hidden lg:flex lg:w-1/3 border-r p-5"
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
