import ProposalFooter from "../layout/ProposalFooter";
import ProposalHeader from "../layout/ProposalHeader";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalSidebar from "../layout/ProposalSidebar";
import ProposalStepper from "../layout/ProposalStepper";
import PdfViewer from "../pdf/PdfViewer";

export default function StandardProposalWithInputs({ proposal, theme }) {
  return (
    <ProposalLayout theme={theme}>
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <ProposalHeader theme={theme} title={proposal.title} />
      </div>

      {/* Main Content */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{
          backgroundColor: theme.background,
        }}
      >
        {/* Sidebar */}
        <aside
          className="hidden lg:flex lg:w-1/3 overflow-y-auto border-r p-5"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
          <ProposalSidebar theme={theme} proposal={proposal} />
        </aside>

        {/* Right Section */}
        <main
          className="flex-1 overflow-hidden p-5"
          style={{
            backgroundColor: theme.background,
          }}
        >
          <div className="mx-auto h-full">
            <div
              className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-lg"
              style={{
                borderColor: theme.border,
              }}
            >
              <div
                className="h-1.5"
                style={{
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                }}
              />

              <div className="flex-1 overflow-hidden">
                <PdfViewer theme={theme} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Full Width Footer */}
      <ProposalFooter theme={theme}>
        <ProposalStepper theme={theme} steps={proposal.steps} activeStep={0} />
      </ProposalFooter>
    </ProposalLayout>
  );
}
