/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AcceptSuperAdminChangesConfirmation from "../../../components/AcceptSuperAdminChangesConfirmation";
import "../email_template/EmailTemplate.css";
import "../Reminder/ReminderEmailTemplate/AddReminderTemplate-redesign.css";
import "./AddNewTemplatePdf-redesign.css";
import { Row, Col } from "reactstrap";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import SAPredefinedChangesNotifyMessageModel from "../../../components/SAPredefinedChangesNotifyMessageModel";
import {
  AddUpdateTemplateData,
  AddUpdateTemplatePDF,
  GetTemplatePdfModel,
} from "../../../redux/Services/Config/TemplateApi";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import SuccessModal from "../../../components/SuccessModal";
import { GetBusinessTypeLookupList } from "../../../redux/Services/Master/BusinessTypeLookupListApi";
import BackButtonSvg from "../../../components/BackButtonSvg";
import { NotifySuperAdminPredefinedChangesToAdmin } from "../../../redux/Services/Setting/NotificationApi";
import { DeclineSuperAdminChanges } from "../../../redux/Services/Config/ServiceCategoryApi";
import ErrorModel from "../../../components/ErrorModel";
import FileTablePreview from "../../../components/FileTablePreview";
function Add_New_Templates_Pdf(props) {
  //Declare State:
  const moduleName = "Template";
  const {
    setTopbar,
    setLoader,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    scrollUpDownByElementID,
  } = useContext(AuthContextProvider);
  const navigate = useNavigate();
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const location = useLocation();
  const [dismissModal, setDismissModal] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [templateElementList, setTemplateElementList] = useState([
    {
      TTETMapID: null, //Template's Template Element Type Mapping Id.
      templateElementTypeID: 2,
      headings: null,
      shortDesc: null,
      htmlContent: null,
    },
  ]);
  const [selectedFile, setSelectedFile] = useState({
    fileName: null,
    size: null,
  });
  const [modelRequestData, setModelRequestData] = useState({
    Action: null,
    message: "",
    ServiceName: [],
    name: null,
  });
  const [modelAction, setModelAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [Status, setStatus] = React.useState(false);
  const [BusinessTypeLookupList, setBusinessTypeLookupList] = useState([]);
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);

  const [TemplateObj, setTemplateObj] = useState({
    // keyID: null,
    organisationID: null,
    orgBusinessTypeID: common.businessTypeID,
    status: 1,
    createdByID: null,
    isDefault: false,
    templateName: undefined,
    templateTypeID: null,
    pdf: null,
    templatePdfTitle: null,
    businessTypeID: null,
    isPredefined: null,
    templatePdfKeyID: null,
    professionTypeList: [],
  });

  // A]  useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    setModelAction(
      location.state?.templatePdfKeyID === null ? "Add" : "Update"
    ); //Do not change this naming convention
    GetBusinessTypeLookupListData();
    setTopbar("none");

    if (location.state?.templatePdfKeyID !== null) {
      GetTemplatePdfModalData(
        location.state?.templatePdfKeyID,
        location.state?.Type
      );
      setModelRequestData({
        ...modelRequestData,
        Action: "update",
      });
    }
  }, [location.state]);

  const SetInitialModelData = () => {
    setTemplateObj({
      templatePdfKeyID: null,
      organisationID: null,
      createdByID: null,
      templateName: undefined,
      templateTypeID: null,
      businessTypeID: common.businessTypeID,
      pdf: null,
      isPredefined: null,
      professionTypeList: [],
    });
    setErrorMessage("");
  };
  // E] Event Handling Functions will call here.
  // 1) On Change Select Profession Type
  const handleClose = async () => {
    if (isCheck) {
      setLoader(true);
      const Notification = await NotifySuperAdminPredefinedChangesToAdmin({
        userKeyID: common.userKeyID,
        moduleKeyID: TemplateObj.templatePdfKeyID,
        moduleName: "Predefined-Template-PDF",
      });
      if (Notification?.data?.statusCode === 200) {
        setLoader(false);
        setModelAction("NotificationSend");
        setOpenSuccessModal(true);
        setIsCheck(false);
      }
    } else {
      $("#" + props.id).modal("hide");
      $("#" + "ConfirmSAChangesModel").modal("hide");
      setErrorMessage(false);
      setOpenSuccessModal(false);
      navigate("/templates", { state: "Templates PDF" });
    }
  };

  const DeclineSuperAdminChangesData = async (Decline) => {
    if (Decline === "Decline") {
      // $('#' + props.id).modal('hide')

      setStatus(false);
      $("#" + "ConfirmSAChangesModel").modal("show");
      return;
    }
    setLoader(true);
    try {
      const apiRequestParams = {
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        moduleKeyID: location.state?.templatePdfKeyID,
        moduleName: "Predefined-Template-PDF",
        //Predefined-ServiceCategory, Predefined-GlobalConstant, Predefined-GlobalPricingDriver,
        //Predefined-PL-EL-Template, Predefined-TnC-Template, Predefined-Email-Template,
        //Predefined-Service, Predefined-ServicePackage
      };
      const response = await DeclineSuperAdminChanges(apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.Action === null) {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/templates");
          } else {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/templates");
          }
        } else {
          setErrorMessage(true);
          $("#" + "ConfirmSAChangesModel").modal("hide");
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleConfirmButton = () => {
    $("#" + "ConfirmSAChangesModel").modal("hide");
    if (Status) {
      TemplateAddUpdateBtnClicked(true);
    } else {
      DeclineSuperAdminChangesData();
    }
  };
  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  const GetTemplatePdfModalData = async (TemplatePdfKeyID, GetSAChanges) => {
    if (!TemplatePdfKeyID) {
      return;
    }
    try {
      setLoader(true);
      const data = await GetTemplatePdfModel(TemplatePdfKeyID, GetSAChanges);
      if (data?.data?.statusCode === 200) {
        debugger;
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setTemplateObj({
            ...TemplateObj,
            // keyID: ModelData.keyID,
            organisationID: ModelData.organisationID,
            createdByID: ModelData.createdByID,
            templatePdfTitle: ModelData.templatePdfTitle,
            isDefault: ModelData.isDefault,
            pdf: ModelData.pdf,
            templateTypeID: ModelData.templateTypeID,
            clientBusinessTypeID: ModelData.clientBusinessTypeID,
            orgBusinessTypeID: ModelData.orgBusinessTypeID,
            isPredefined: ModelData.isPredefined,
            professionTypeList: ModelData.professionTypeList,
            templatePdfKeyID: ModelData.templatePdfKeyID,
          });
          setTemplateElementList(
            ...templateElementList,
            ModelData.templateElementList
          );
          setSelectedFile({
            fileName: ModelData.templatePdfTitle,
            size: ModelData.pdf.size,
          });
          setTemplateElementList([
            {
              TTETMapID:
                ModelData.templateElementList[templateElementList?.length - 1]
                  .ttetMapID,
              headings:
                ModelData.templateElementList[templateElementList?.length - 1]
                  .headings,
              templateElementTypeID:
                ModelData.templateElementList[templateElementList?.length - 1]
                  .templateElementTypeID,
              htmlContent:
                ModelData.templateElementList[templateElementList?.length - 1]
                  .htmlContent,
              shortDesc:
                ModelData.templateElementList[templateElementList?.length - 1]
                  .shortDesc,
            },
          ]);
        }
        setLoader(false);
      } else {
        setErrorMessage(data?.data?.errorMessage);
        setLoader(false);
      }
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
  };

  // 2) Add Update Button Click Function
  const TemplateAddUpdateBtnClicked = (Accept) => {
    if (Accept === "Accept") {
      $("#" + "ConfirmSAChangesModel").modal("show");

      setStatus(true);
      return;
    }

    // Check Validations will be done here
    if (
      TemplateObj.templatePdfTitle === undefined ||
      TemplateObj.templatePdfTitle === null ||
      TemplateObj.templatePdfTitle === ""
    ) {
      setRequireErrorMessage(true);
      scrollUpDownByElementID("TemplatePdfTitleDiv");
      return false; // Return false or handle your error logic here if needed.
    } else if (TemplateObj.pdf === null && !selectedFile.fileName) {
      // Check if PDF file is not selected
      setRequireErrorMessage(true);

      return false;
    }
    scrollUpDownByElementID("ErrorMessage");
    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      //global level params : fixed
      acceptSAChanges: Accept,
      OrganisationKeyID: common.organisationKeyID,
      templatePdfKeyID: TemplateObj.templatePdfKeyID,
      userKeyID: common.userKeyID,
      templatePdfTitle: TemplateObj.templatePdfTitle,
    };
    AddUpdateTemplateDataPdf(ApiRequest_ParamsObj);
  };

  // Add or Update Service Template Data
  const AddUpdateTemplateDataPdf = async (apiRequestParams) => {
    setLoader(true);
    try {
      let url = "/AddUpdateImportTemplatePDF"; // Default URL for Adding Data
      if (apiRequestParams.templatePdfKeyID !== null) {
        url = `/AddUpdateImportTemplatePDF?templatePdfKeyID=${apiRequestParams.templatePdfKeyID}`; // URL for Updating Data
      }
      const response = await AddUpdateTemplateData(url, apiRequestParams);
      if (response) {
        if (response?.data?.statusCode === 200) {
          const TemplatePdfKeyID = response.data.responseData.data;
          const formData = new FormData();
          const isBinary =
            selectedFile.fileName instanceof Blob ||
            selectedFile.fileName instanceof File;
          // Instead, you should append the entire file
          if (isBinary) {
            formData.set("file", selectedFile.fileName); // Append the file itself
            const uploadResponse = await AddUpdateTemplatePDF(
              selectedFile.size,
              TemplatePdfKeyID,
              formData
            );

            if (uploadResponse) {
              if (apiRequestParams.templatePdfKeyID === null) {
                $("#" + props.id).modal("show");
                setOpenSuccessModal(true);
                setLoader(false);
                // navigate("/terms-and-conditions");
              } else {
                setOpenSuccessModal(true);
                setLoader(false);
                // navigate("/terms-and-conditions");
              }
            } else {
              setErrorMessage(uploadResponse?.response?.data?.errorMessage);
              setLoader(false);
            }
          } else {
            setOpenSuccessModal(true);
            setLoader(false);
          }
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
          setLoader(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  // handle function
  const handlePdfDelete = () => {
    setTemplateObj({
      ...TemplateObj,
      pdf: null,
    });
    setSelectedFile({
      fileName: null,
      size: null,
    });
  };

  // handle function
  const handleSubmit = () => {
    setTopbar("block");
    navigate("/templates", { state: "Templates PDF" });
    SetInitialModelData();
  };

  // handle Upload file
  const handleFileUpload = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any existing error message
    setRequireErrorMessage(false);

    const file = e.target.files[0];

    if (file) {
      // Validate file extension
      const fileNameParts = file.name.split(".");
      const fileExtension =
        fileNameParts[fileNameParts.length - 1].toLowerCase();
      const allowedExtensions = ["pdf", "csv", "xls", "xlsx"];

      if (!allowedExtensions.includes(fileExtension)) {
        setErrorMessage(
          "Invalid file type. Only PDF, CSV, and Excel files are allowed."
        );
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB.");
        return;
      }

      // File is valid
      setSelectedFile({
        fileName: file,
        size: file.size,
      });
    }
  };

  //2) BusinessType Lookup List Api
  const GetBusinessTypeLookupListData = async () => {
    try {
      const data = await GetBusinessTypeLookupList();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let BusinessTypeListData = data?.data?.responseData?.data;
          BusinessTypeListData = BusinessTypeListData.map((BusinessType) => ({
            value: BusinessType.businessTypeID,
            label: BusinessType.businessTypeName,
          }));
          setBusinessTypeLookupList(BusinessTypeListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container-fluid new-item-page-container rt-form tpd-form">
      <div class="new-item-page-nav"></div>
      <div class="new-item-page-content">
        <div class="row form-row">
          <div class="col-lg-12">
            <h3 class="modal-title" id="exampleModalLabel">
              <BackButtonSvg onClick={handleSubmit} />
              {modelAction === "Add"
                ? getCrudPopUpTitleName("Add", moduleName)
                : getCrudPopUpTitleName("Update", moduleName)}
            </h3>
            <div class="separator mb-3"></div>
            <div className="template-height scrollbar" id="style-1">
              <div class="tab-content">
                <div className="rt-card">
                <div className="rt-card__head">
                  <span className="rt-card__icon">
                    <i className="ri-file-list-3-line"></i>
                  </span>
                  <div>
                    <h4 className="rt-card__title">Template Details</h4>
                    <p className="rt-card__desc">
                      Give this file-based template a clear title.
                    </p>
                  </div>
                </div>
                <div className="rt-fields">
                <>
                  <div className="row fieldset" id="TemplatePdfTitleDiv">
                    <SAPredefinedChangesNotifyMessageModel
                      Params={{
                        moduleName: moduleName,
                        SAChanges: location.state?.Type,
                      }}
                    />
                    <div className="col-lg-3 template-label text-left">
                      <div className="mb-1">
                        <label htmlFor="useremail" className="form-label">
                          Template Title
                          <span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-9">
                      <div className="">
                        <div className="input-group">
                          <input
                            type="text"
                            className="input-text"
                            placeholder="Enter Template Title"
                            value={TemplateObj.templatePdfTitle || ""} // Ensure the value is not undefined
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              const trimmedValue = inputValue.replace(
                                /^\s+/g,
                                ""
                              );
                              const capitalizedValue =
                                trimmedValue.charAt(0).toUpperCase() +
                                trimmedValue.slice(1);
                              setTemplateObj({
                                ...TemplateObj,
                                templatePdfTitle: capitalizedValue,
                              });
                              setErrorMessage("");
                            }} // Call handleTemplateNameChange on input change
                            maxLength={100}
                          />
                        </div>
                        {requireErrorMessage &&
                        (TemplateObj.templatePdfTitle === "" ||
                          TemplateObj.templatePdfTitle === null ||
                          TemplateObj.templatePdfTitle === undefined) ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                </>
                </div>
                </div>
                <div className="rt-card tpd-file">
                <div className="rt-card__head">
                  <span className="rt-card__icon">
                    <i className="ri-upload-cloud-2-line"></i>
                  </span>
                  <div>
                    <h4 className="rt-card__title">Template File</h4>
                    <p className="rt-card__desc">
                      Upload a PDF, CSV or Excel file and check the preview.
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-3 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">
                        Preview Template
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>

                  <div className="col-lg-9">
                    <div className="mb-3">
                      <div>
                        <div className="col-lg-9">
                          {TemplateObj.pdf === null ? (
                            selectedFile.fileName && (
                              <button
                                onClick={handlePdfDelete}
                                style={{
                                  marginBottom: "5px",
                                  fontSize: "75%",
                                }}
                                className="btn btn-sm btn-danger remove-item-btn "
                              >
                                <i class="bi bi-trash3 margin-right"></i> Delete
                              </button>
                            )
                          ) : (
                            <button
                              onClick={handlePdfDelete}
                              style={{
                                marginBottom: "5px",
                                fontSize: "75%",
                              }}
                              className="btn btn-sm btn-danger remove-item-btn "
                            >
                              <i class="bi bi-trash3 margin-right"></i> Delete
                            </button>
                          )}
                        </div>
                      </div>
                      {TemplateObj.pdf === null ? (
                        <>
                          {selectedFile.fileName ? (
                            <>
                              <div className="input-group mt-3">
                                {(() => {
                                  const file = selectedFile.fileName;
                                  const fileExtension = file.name
                                    .split(".")
                                    .pop()
                                    .toLowerCase();

                                  if (fileExtension === "pdf") {
                                    return (
                                      <iframe
                                        title="PDF Viewer"
                                        src={URL.createObjectURL(file)}
                                        width="100%"
                                        height="600px"
                                      ></iframe>
                                    );
                                  }

                                  if (
                                    ["csv", "xls", "xlsx"].includes(
                                      fileExtension
                                    )
                                  ) {
                                    return (
                                      <div
                                        className="table-responsive"
                                        style={{
                                          maxHeight: "600px",
                                          overflowY: "auto",
                                        }}
                                      >
                                        <p>
                                          <strong>Preview:</strong> {file.name}
                                        </p>
                                        <FileTablePreview
                                          file={file}
                                          extension={fileExtension}
                                        />
                                      </div>
                                    );
                                  }

                                  return (
                                    <p className="text-danger">
                                      Unsupported file format.
                                    </p>
                                  );
                                })()}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="input-group">
                                <input
                                  type="file"
                                  accept=".pdf, .csv, .xls, .xlsx"
                                  onChange={(e) => {
                                    e.preventDefault();
                                    const file = e.target.files[0];

                                    if (file) {
                                      const fileNameParts =
                                        file.name.split(".");
                                      const fileExtension =
                                        fileNameParts[
                                          fileNameParts.length - 1
                                        ].toLowerCase();
                                      const allowedExtensions = [
                                        "pdf",
                                        "csv",
                                        "xls",
                                        "xlsx",
                                      ];

                                      if (
                                        !allowedExtensions.includes(
                                          fileExtension
                                        )
                                      ) {
                                        console.error(
                                          "Please select a PDF, CSV, or Excel file (.xls, .xlsx)."
                                        );
                                        return;
                                      }

                                      handleFileUpload(e);
                                    }
                                  }}
                                />
                              </div>
                              <div className="text-muted helpMessage">
                                Supported file types are .PDF, CSV, and Excel
                                (.xls, .xlsx) up to a file size of 10MB.
                              </div>
                              {requireErrorMessage &&
                              !selectedFile.fileName &&
                              TemplateObj.pdf === null ? (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : null}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="input-group">
                            {/* Embed the PDF using an iframe */}
                            <iframe
                              title="PDF Viewer"
                              src={TemplateObj.pdf}
                              width="100%"
                              height="500px" // You can adjust the height as needed
                            ></iframe>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </div>
              <label
                style={{ display: "flex", justifyContent: "center" }}
                className="validation mt-2"
                id="ErrorMessage"
              >
                {/* {errorMessage} */}
                {common.professionTypeLists?.length <= 1 &&
                errorMessage?.includes(
                  `Please don't choose this profession type`
                )
                  ? errorMessage.split(".")[0]
                  : errorMessage}
              </label>
            </div>

            <Row className="modal-footer rt-footer">
              <Col
                style={{ paddingTop: "14px" }}
                className="hstack gap-2 justify-content-end"
              >
                {location.state?.Type ? (
                  <>
                    <button
                      type="submit"
                      class="btn btn-md btn-success accept-item-btn"
                      onClick={() => {
                        TemplateAddUpdateBtnClicked("Accept");
                      }}
                    >
                      <span>Accept</span>
                    </button>
                    <button
                      type="submit"
                      class="btn btn-md btn-success declined-item-btn"
                      // data-bs-dismiss="modal"
                      onClick={() => DeclineSuperAdminChangesData("Decline")}
                    >
                      <span>Decline</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSubmit}
                      style={{ float: "right", paddingTop: "5px" }}
                      className="btn btn-md btn-light"
                    >
                      <span>{getCrudButtonTextName("Cancel")}</span>
                    </button>

                    <button
                      onClick={(e) => TemplateAddUpdateBtnClicked()}
                      style={{ float: "right", paddingTop: "5px" }}
                      className="btn btn-md btn-success create-item-btn"
                    >
                      <span>
                        {modelAction === "Add"
                          ? getCrudButtonTextName("Add", moduleName)
                          : getCrudButtonTextName("Update", moduleName)}
                      </span>
                    </button>
                  </>
                )}
              </Col>
            </Row>
            {/* <!-- end tab content --> */}
          </div>
          {/* <!-- end card body --> */}
        </div>
        {/* <!-- end card --> */}
      </div>
      <AcceptSuperAdminChangesConfirmation
        openErrorModal={openErrorModal}
        ModelId={props.id}
        Status={Status}
        openSuccessModal={openSuccessModal}
        modelRequestData={location.state}
        UpdatedChanges={handleConfirmButton}
      />
      <SuccessModal
        handleClose={handleClose}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        setIsCheck={setIsCheck}
        isCheck={isCheck}
        message={`${moduleName} ${TemplateObj.templatePdfTitle}`}
      />
      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleClose}
        ErrorMessage={errorMessage}
      />
    </div>
  );
}

export default Add_New_Templates_Pdf;
