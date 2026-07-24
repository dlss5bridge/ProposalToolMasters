import { useSelector } from "react-redux";
import ProposalFooter from "../layout/ProposalFooter";
import ProposalHeader from "../layout/ProposalHeader";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalSidebar from "../layout/ProposalSidebar";
import ProposalStepper from "../layout/ProposalStepper";
import ProposalInputFieldsStep from "../steps/ProposalInputFieldsStep";
import ProposalPdfStep from "../steps/ProposalPdfStep";
import ProposalServicesStep from "../steps/ProposalServicesStep";
import { selectActiveStep } from "../../../redux/reducer/webProposal/stepper";
import { Services } from "../steps/ProposalServicesStep/data/data";
export default function ProposalAmendment({ theme, proposal, services }) {
  const activeStep = useSelector(selectActiveStep);

  const stepComponents = [
    <ProposalPdfStep theme={theme} />,
    <ProposalInputFieldsStep theme={theme} />,
    // <ProposalBasicInformationStep theme={theme} />,
    <ProposalServicesStep theme={theme} Services={Services} />,
    // <ProposalPricingTableStep theme={theme} />,
    // <ProposalPreviewStep theme={theme} />,
    // <ProposalSignStep theme={theme} />,
  ];
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
          {stepComponents[activeStep]}
        </main>
      </div>

      <ProposalFooter theme={theme}>
        <ProposalStepper theme={theme} steps={proposal.steps} />
      </ProposalFooter>
    </ProposalLayout>
  );
}
