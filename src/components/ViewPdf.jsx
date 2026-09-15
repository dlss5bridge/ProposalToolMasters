import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { GetQuoteContractViewPDFurl } from "../redux/Services/Proposal/ProposalApi";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { useSelector } from "react-redux";
import PdfViewer from "./PdfViewers";
import "./ViewPdf-redesign-v2.css";

const ViewPdf = () => {
  const location = useLocation();

  const { setLoader, setTopbar, isMobile } = useContext(AuthContextProvider);
  const [MergePdfUrl, setMergePdfUrl] = useState("");
  const common = useSelector((state) => state.Storage);

  useEffect(() => {
    setTopbar("none");

    if (
      location?.state?.quoteKeyID === undefined &&
      location?.state?.contractKeyID === undefined
    ) {
      setMergePdfUrl(location?.state);
    }

    if (location?.state?.quoteKeyID) {
      const { ModuleName, quoteKeyID } = location.state;

      getQuoteContractViewPDFurlData(
        common.userKeyID,
        common.organisationKeyID,
        ModuleName,
        quoteKeyID,
      );
    }

    if (location?.state?.contractKeyID) {
      const { ModuleName, contractKeyID } = location.state;

      getQuoteContractViewPDFurlData(
        common.userKeyID,
        common.organisationKeyID,
        ModuleName,
        contractKeyID,
      );
    }
  }, [location.state]);

  const getQuoteContractViewPDFurlData = async (
    userKeyID,
    organisationKeyID,
    ModuleName,
    quoteKeyID,
  ) => {
    setLoader(true);

    try {
      const response = await GetQuoteContractViewPDFurl(
        userKeyID,
        organisationKeyID,
        ModuleName,
        quoteKeyID,
      );

      const data = response.data;

      if (data.statusCode === 200) {
        setLoader(false);

        const pdfUrl = data.responseData.data;

        setMergePdfUrl(pdfUrl);
      } else {
        console.error("Error fetching data from the API");
        setLoader(false);
      }
    } catch (error) {
      console.error("Error fetching data from the API", error);
      setLoader(false);
    }
  };

  return (
    <div className="view-pdf-redesign">
      {MergePdfUrl && (
        <>
          {!isMobile && (
            <div className="view-pdf-header">
              <div className="view-pdf-header-copy">
                <span className="view-pdf-header-icon" aria-hidden="true">
                  <span className="view-pdf-icon-sheet">
                    <span>PDF</span>
                  </span>
                </span>

                <div>
                  <h1>Document Preview</h1>
                  <p>Review the generated PDF document.</p>
                </div>
              </div>

              <div className="view-pdf-header-badge">
                <span className="view-pdf-header-badge-dot"></span>
                PDF Preview
              </div>
            </div>
          )}

          <div
            className={`view-pdf-preview-shell ${
              isMobile ? "view-pdf-preview-shell-mobile" : ""
            }`}
          >
            {isMobile ? (
              <PdfViewer isVisible={true} pdfFile={MergePdfUrl} />
            ) : (
              <div className="view-pdf-frame-wrap">
                <iframe
                  title="PDF Viewer"
                  src={MergePdfUrl}
                  className="view-pdf-frame"
                ></iframe>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewPdf;
