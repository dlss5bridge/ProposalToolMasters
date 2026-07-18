import ProposalLayout from "../layout/ProposalLayout";
import PdfViewer from "../pdf/PdfViewer";
import DynamicInputForm from "../forms/DynamicInputForm";

export default function StandardProposalWithInputs() {
  return (
    <ProposalLayout title="Accounting Proposal" showSidebar={false}>
      <PdfViewer />

      <DynamicInputForm />
    </ProposalLayout>
  );
}
