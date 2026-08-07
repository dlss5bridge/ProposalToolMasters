import { useDispatch, useSelector } from "react-redux";

import { selectActiveStep } from "../../../redux/reducer/webProposal/stepper";
import { selectHasInputFields } from "../../../redux/reducer/webProposal/inputFields";
import {
  selectQuoteModel,
  saveProposalInputFields,
} from "../../../redux/reducer/webProposal";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalHeader from "../layout/ProposalHeader";
import ProposalFooter from "../layout/ProposalFooter";
import ProposalStepper from "../layout/ProposalStepper";
import ProposalSidebar from "../layout/ProposalSidebar";

import ProposalPdfStep from "../steps/ProposalPdfStep";
import ProposalInputFieldsStep from "../steps/ProposalInputFieldsStep";

export default function StandardProposalWithInputs({ proposal, theme }) {
  const dispatch = useDispatch();
  const activeStep = useSelector(selectActiveStep);
  const hasInputFields = useSelector(selectHasInputFields);
  const quoteModel = useSelector(selectQuoteModel);

  // Placeholder endpoint until the real "Save" API is ready — see
  // SaveWebProposalInputFields in ProposalApi.jsx.
  const handleSave = async () => {
    try {
      await dispatch(
        saveProposalInputFields({ quoteKeyID: quoteModel?.quoteKeyID }),
      ).unwrap();
    } catch (err) {
      // Endpoint is a placeholder for now, so failures are expected.
    }
  };

  const steps = [
    { label: "Proposal", component: <ProposalPdfStep theme={theme} /> },
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
        {/* Sidebar only for the PDF step */}
        {activeStep === 0 && (
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
          onFinish={handleSave}
          finishLabel="Save"
        />
      </ProposalFooter>
    </ProposalLayout>
  );
}
