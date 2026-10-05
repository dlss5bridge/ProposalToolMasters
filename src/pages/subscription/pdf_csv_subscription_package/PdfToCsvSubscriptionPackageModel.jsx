/* global $ */
import React, { useEffect, useState, useRef, useContext } from "react";
import Select from "react-select";
import { useLocation } from "react-router-dom";
import SuccessModal from "../../../components/SuccessModal";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import { Row, Col } from "reactstrap";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import { useSelector } from "react-redux";
import {
  AddUpdateSubscriptionPackage,
  GetSubscriptionPackageModel,
} from "../../../redux/Services/Subscription/PackageApi";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import BackButtonSvg from "../../../components/BackButtonSvg";
import Android12Switch from "../../../components/AndroidSwitch";
import "../../configure/Reminder/ReminderEmailTemplate/AddReminderTemplate-redesign.css";
import "./PdfToCsvSubscriptionPackageModel-redesign.css";
import DropDown from "../../../components/DropDown";
import { PdfToCsvValidityList } from "../../../Middleware/Utils";
import {
  addUpdatePDFToCSVSubscriptionPackage,
  GetPDFToCSVSubscriptionPackageModel,
} from "../../../redux/Services/PDFToCSVAPI/PDFToCSVAPI";

function PdfToCsvSubscriptionPackageModel(props) {
  const moduleName = "PDF To CSV Subscription Package";
  // Declare all State
  const [modelAction, setModelAction] = useState("");
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [
    requireErrorMessageForESignature,
    setRequireErrorMessageForESignature,
  ] = useState(false);
  const SubscriptionContainerRef = useRef(null);
  const [DiscountPriceError, setDiscountPriceError] = useState(false);
  const [subscriptionPackageObj, setSubscriptionPackageObj] = useState({
    packageName: "",
    validityID: null,
    packagePrice: null,
    packageDiscountedPrice: null,
    pages: null,
    months: null,
  });

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const {
    setLoader,
    proposalName,
    EngagementName,
    scrollUpDownByElementID,
    scrollUptoCurrentPosition,
    setTopbar,
    getCrudPopUpTitleName,
  } = useContext(AuthContextProvider);

  //c]Declare UseEffect

  console.log(location.state);

  useEffect(() => {
    setTopbar("none");
  }, []);
  useEffect(() => {
    setModelAction(
      location?.state?.Action === undefined || location?.state?.Action === null
        ? "Add"
        : "Update",
    ); //Do not change this naming convention

    // setModelAction(props.modelRequestData?.Action === null ? "Add" : "Update"); //Do not change this naming convention
    if (location.state?.subscriptionPackageKeyID !== null) {
      GetPDFToCSVSubscriptionPackageModelData(location.state?.pcspKeyID);
    }
  }, [location.state]);

  // C] This function will clear all data from popup model
  const SetInitialModelData = () => {
    setSubscriptionPackageObj({
      ...subscriptionPackageObj,
      packageName: null,
      packagePrice: null,
      packageDiscountedPrice: null,
      pages: null,
    });
    setErrorMessage("");
    setRequireErrorMessage(false);
  };

  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  const GetPDFToCSVSubscriptionPackageModelData = async (id) => {
    if (!id) {
      return;
    }
    //..............Subscription package Edit Data Api...................

    try {
      const data = await GetPDFToCSVSubscriptionPackageModel(
        id,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setSubscriptionPackageObj({
            ...subscriptionPackageObj,
            packageName: ModelData.packageName,
            validityID: ModelData.validityID,
            packagePrice: ModelData.price,
            packageDiscountedPrice: ModelData.discountedPrice,
            pages: ModelData.pages,
            months: ModelData.months,
          });
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //2]Add Update Button Click Function
  const SubscriptionPackageAddUpdateBtnClicked = () => {
    //Check Validations will be done here

    if (
      subscriptionPackageObj.packageName === undefined ||
      subscriptionPackageObj.packageName === "" ||
      subscriptionPackageObj.packageName === null
    ) {
      scrollUpDownByElementID("PackageName");
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    if (
      subscriptionPackageObj.packagePrice === undefined ||
      subscriptionPackageObj.packagePrice === "" ||
      subscriptionPackageObj.packagePrice === null
    ) {
      scrollUpDownByElementID("validity");
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    // if (
    //   subscriptionPackageObj.packageDiscountedPrice === undefined ||
    //   subscriptionPackageObj.packageDiscountedPrice === "" ||
    //   subscriptionPackageObj.packageDiscountedPrice === null
    // ) {
    //   scrollUpDownByElementID("discountedPrice");
    //   setRequireErrorMessage(true);
    //   return false;
    // } else {
    //   setRequireErrorMessage("");
    // }
    if (
      subscriptionPackageObj.validityID === undefined ||
      subscriptionPackageObj.validityID === "" ||
      subscriptionPackageObj.validityID === null
    ) {
      scrollUpDownByElementID("validity");
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    if (
      subscriptionPackageObj.pages === undefined ||
      subscriptionPackageObj.pages === "" ||
      subscriptionPackageObj.pages === null
    ) {
      scrollUpDownByElementID("discountedPrice");
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    if (subscriptionPackageObj.validityID === 1) {
      if (
        subscriptionPackageObj.months === undefined ||
        subscriptionPackageObj.months === "" ||
        subscriptionPackageObj.months === null
      ) {
        scrollUpDownByElementID("months");
        setRequireErrorMessage(true);
        return false; // Return false or handle your error logic here if needed.
      }
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }

    scrollUpDownByElementID("ErrorMessage");
    // Clear the error message and set close to true if there are no errors.
    setErrorMessage("");

    // Preparing Object For Add Update and if any modification then it will done here
    const parseNumber = (value) =>
      typeof value === "string"
        ? parseFloat(value.replace(/,/g, "")) || 0
        : value || 0;

    const parseInteger = (value) =>
      typeof value === "string"
        ? parseInt(value.replace(/,/g, ""), 10) || 0
        : value || 0;

    const ApiRequest_ParamsObj = {
      userKeyID: common.userKeyID,
      pcspKeyID: location.state?.pcspKeyID || null,
      packageName: subscriptionPackageObj.packageName,
      validityID: subscriptionPackageObj.validityID,
      price: parseNumber(subscriptionPackageObj.packagePrice),
      discountedPrice: parseNumber(subscriptionPackageObj.packagePrice),
      pages: parseInteger(subscriptionPackageObj.pages),
      months:
        subscriptionPackageObj.validityID === 1
          ? parseInteger(subscriptionPackageObj.months)
          : null,
    };

    AddUpdatePDFToCSVSubscriptionPackageData(ApiRequest_ParamsObj);
    console.log(ApiRequest_ParamsObj);
  };

  // 3) Add Update Subscription package Data Api
  const AddUpdatePDFToCSVSubscriptionPackageData = async (
    ApiRequest_ParamsObj,
  ) => {
    // debugger;
    setLoader(true);
    try {
      const response =
        await addUpdatePDFToCSVSubscriptionPackage(ApiRequest_ParamsObj);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (location.state.Action === null) {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
            navigate("/pdf-csv-sub-package");
          } else {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
            navigate("/pdf-csv-sub-package");
          }
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleClose = () => {
    $("#" + props.id).modal("hide");
    setOpenSuccessModal(false);
    SetInitialModelData();
    navigate("/pdf-csv-sub-package");
  };
  const handlePrepareQuoteChange = (e) => {
    const prepareQuoteValue = !subscriptionPackageObj.prepareQuote;
    setSubscriptionPackageObj({
      ...subscriptionPackageObj,
      prepareQuote: prepareQuoteValue,
      sendQuote: prepareQuoteValue ? subscriptionPackageObj.sendQuote : false,
    });
  };
  const handleApiIntegrationChange = (e) => {
    const prepareQuoteValue = !subscriptionPackageObj.apiIntegration;
    setSubscriptionPackageObj({
      ...subscriptionPackageObj,
      apiIntegration: prepareQuoteValue,
    });
  };
  const handleSendQuoteChange = (e) => {
    if (subscriptionPackageObj.prepareQuote) {
      setSubscriptionPackageObj({
        ...subscriptionPackageObj,
        sendQuote: !subscriptionPackageObj.sendQuote,
      });
    }
  };

  const handlePrepareELChange = (e) => {
    const prepareElValue = !subscriptionPackageObj.prepareContract;
    setSubscriptionPackageObj({
      ...subscriptionPackageObj,
      prepareContract: prepareElValue,
      sendContract: prepareElValue
        ? subscriptionPackageObj.sendContract
        : false,
      eSignaturePerMonth: prepareElValue
        ? subscriptionPackageObj.eSignaturePerMonth
        : "",
    });
  };

  const handleSendELChange = (e) => {
    if (subscriptionPackageObj.prepareContract) {
      const sendContract = !subscriptionPackageObj.sendContract;
      setSubscriptionPackageObj({
        ...subscriptionPackageObj,
        sendContract: sendContract,
        eSignaturePerMonth: sendContract
          ? subscriptionPackageObj.eSignaturePerMonth
          : "",
        // signContract: sendContract === "YES" ? true : false,
      });
    }
  };

  const handleSubmit = () => {
    setTopbar("block");
    navigate("/pdf-csv-sub-package");
    SetInitialModelData();
  };

  const handleSelectChange = (value) => {
    setSubscriptionPackageObj((prev) => ({
      ...prev,
      validityID: value.value,
    }));
  };

  return (
    <div
      ref={SubscriptionContainerRef}
      onClick={(e) => scrollUptoCurrentPosition(e, SubscriptionContainerRef)}
    >
      <div class="container-fluid new-item-page-container rt-form pdfsub-form">
        <div class="new-item-page-nav"></div>
        <div class="new-item-page-content">
          <div class="row form-row">
            <div class="col-lg-12">
              <h3 class="modal-title">
                <BackButtonSvg onClick={handleSubmit} />
                {modelAction === "Add"
                  ? getCrudPopUpTitleName("Add", moduleName)
                  : getCrudPopUpTitleName("Update", moduleName)}
              </h3>
              <div class="separator mb-3"></div>

              <div className="template-height scrollbar" id="style-1">
                <div className="rt-card__head">
                  <span className="rt-card__icon">
                    <i className="ri-file-excel-2-line"></i>
                  </span>
                  <div>
                    <h4 className="rt-card__title">Package Details</h4>
                    <p className="rt-card__desc">
                      Name, page limit, validity and price of this PDF to CSV
                      package.
                    </p>
                  </div>
                </div>
                <div class="tab-content">
                  <div className="row" id="PackageName">
                    <div className="col-lg-6">
                      <label>
                        {moduleName} Name
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                    <div className="col-12 ">
                      <input
                        type="text"
                        className="input-text"
                        placeholder={`${moduleName} Name`}
                        value={subscriptionPackageObj?.packageName}
                        onChange={(e) => {
                          setErrorMessage("");
                          let inputValue = e.target.value;
                          // Truncate input if length exceeds 30 characters
                          if (inputValue.length > 30) {
                            inputValue = inputValue.slice(0, 30);
                          }

                          const isValidName =
                            /^[a-zA-Z]+(?:[a-zA-Z0-9\s]*)$/.test(inputValue) &&
                            !/^\d+$/.test(inputValue);
                          if (isValidName || inputValue === "") {
                            const capitalizedValue =
                              inputValue.charAt(0).toUpperCase() +
                              inputValue.slice(1);
                            setSubscriptionPackageObj({
                              ...subscriptionPackageObj,
                              packageName: capitalizedValue,
                            });
                          }
                        }}
                      />

                      {requireErrorMessage &&
                      subscriptionPackageObj.packageName === "" ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div className="row p-2">
                    <div className="fieldset-group ">
                      <label className="fieldset-group-label required">
                        Package Parameters
                      </label>
                      <div class="row" id="validity">
                        {/* Pages */}
                        <div
                          className="col-2"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {PdfToCsvValidityList.value === 1 ? (
                            <label className="text-center">
                              Monthly Pages
                              <span className="text-danger">*</span>
                            </label>
                          ) : (
                            <label className="text-center">
                              Pages
                              <span className="text-danger">*</span>
                            </label>
                          )}
                        </div>
                        <div className="col-4 ">
                          <input
                            type="text"
                            className="input-text"
                            placeholder="Pages"
                            value={subscriptionPackageObj?.pages}
                            onChange={(e) => {
                              setErrorMessage("");
                              let inputValue = e.target.value;

                              // Remove leading zeros (except when "0." is being typed)
                              if (!inputValue.startsWith("0.")) {
                                inputValue = inputValue.replace(/^0+/, "");
                              }

                              // Remove non-numeric characters except decimal point
                              inputValue = inputValue.replace(/[^\d.]/g, "");

                              // Limit to 12 digits before the decimal point
                              // if (inputValue.includes(".")) {
                              //   const [integerPart, decimalPart] =
                              //     inputValue.split(".");
                              //   inputValue = `${integerPart.slice(
                              //     0,
                              //     7
                              //   )}.${decimalPart.slice(0, 2)}`;
                              // } else {
                              //   inputValue = inputValue.slice(0, 7);
                              // }

                              // Format with UK-style commas (1,000.00)
                              // let formattedValue = inputValue;
                              // if (inputValue !== "") {
                              //   const [intPart, decPart] =
                              //     inputValue.split(".");
                              //   const formattedInt =
                              //     Number(intPart).toLocaleString("en-UK");
                              //   formattedValue =
                              //     decPart !== undefined
                              //       ? `${formattedInt}.${decPart}`
                              //       : formattedInt;
                              // }

                              setSubscriptionPackageObj({
                                ...subscriptionPackageObj,
                                pages: inputValue,
                              });
                            }}
                          />

                          {requireErrorMessage &&
                          (subscriptionPackageObj.pages === "" ||
                            subscriptionPackageObj.pages === undefined ||
                            subscriptionPackageObj.pages === null) ? (
                            <label className="validation">
                              {ERROR_MESSAGES}
                            </label>
                          ) : (
                            ""
                          )}
                        </div>
                        <div
                          class="col-2 text-right"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingBottom: "10px",
                          }}
                        >
                          <label
                            htmlFor="serviceCategoryNameField"
                            class="fieldset-label required"
                          >
                            Validity<span className="text-danger">*</span>
                          </label>
                        </div>
                        <div class="col-4" style={{ paddingBottom: "10px" }}>
                          <div className="input-group new-user-select">
                            <DropDown
                              className="phone-input-country-code selectDropDown Drop-down-width"
                              options={PdfToCsvValidityList}
                              value={PdfToCsvValidityList.find(
                                (item) =>
                                  item.value ===
                                  subscriptionPackageObj.validityID,
                              )}
                              onChange={handleSelectChange}
                            />
                            {requireErrorMessage &&
                            (subscriptionPackageObj.validityID === "" ||
                              subscriptionPackageObj.validityID === undefined ||
                              subscriptionPackageObj.validityID === null) ? (
                              <label className="validation">
                                {ERROR_MESSAGES}
                              </label>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row" id="discountedPrice">
                        {/* Months */}
                        {subscriptionPackageObj.validityID === 1 && (
                          <>
                            <div
                              className="col-2"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <label className="text-center">
                                Months
                                <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-4 ">
                              <input
                                type="text"
                                className="input-text"
                                placeholder="Months"
                                value={
                                  subscriptionPackageObj?.months
                                    ? subscriptionPackageObj?.months
                                    : null
                                }
                                onChange={(e) => {
                                  setErrorMessage("");
                                  let inputValue = e.target.value;

                                  // Remove non-digit characters
                                  inputValue = inputValue.replace(/[^\d]/g, "");

                                  // Convert to number to validate the range
                                  const numericValue = parseInt(inputValue, 10);

                                  // Allow clearing or valid month (1–12)
                                  if (
                                    inputValue === "" ||
                                    (!isNaN(numericValue) &&
                                      numericValue >= 1 &&
                                      numericValue <= 12)
                                  ) {
                                    setSubscriptionPackageObj({
                                      ...subscriptionPackageObj,
                                      months: inputValue, // Keep the user input as string
                                    });
                                  }
                                }}
                              />

                              {requireErrorMessage &&
                              subscriptionPackageObj.validityID === 1 &&
                              (subscriptionPackageObj.months === "" ||
                                subscriptionPackageObj.months === undefined ||
                                subscriptionPackageObj.months === null) ? (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </>
                        )}

                        {/* Price */}
                        <div
                          className="col-2"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <label className="text-center">
                            Price
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <div
                          className="col-4 "
                          style={{ marginBottom: "10px" }}
                        >
                          <input
                            type="text"
                            className="input-text"
                            placeholder="Price"
                            value={subscriptionPackageObj?.packagePrice}
                            onChange={(e) => {
                              setErrorMessage("");
                              let inputValue = e.target.value;

                              // Remove leading zeros (except when "0." is being typed)
                              if (!inputValue.startsWith("0.")) {
                                inputValue = inputValue.replace(/^0+/, "");
                              }

                              // Remove non-numeric characters except decimal point
                              inputValue = inputValue.replace(/[^\d.]/g, "");

                              // Limit to 12 digits before the decimal point
                              if (inputValue.includes(".")) {
                                const [integerPart, decimalPart] =
                                  inputValue.split(".");
                                inputValue = `${integerPart.slice(
                                  0,
                                  7,
                                )}.${decimalPart.slice(0, 2)}`;
                              } else {
                                inputValue = inputValue.slice(0, 7);
                              }

                              // Format with UK-style commas (1,000.00)
                              let formattedValue = inputValue;
                              if (inputValue !== "") {
                                const [intPart, decPart] =
                                  inputValue.split(".");
                                const formattedInt =
                                  Number(intPart).toLocaleString("en-UK");
                                formattedValue =
                                  decPart !== undefined
                                    ? `${formattedInt}.${decPart}`
                                    : formattedInt;
                              }

                              setSubscriptionPackageObj({
                                ...subscriptionPackageObj,
                                packagePrice: formattedValue,
                              });
                            }}
                          />

                          {requireErrorMessage &&
                          (subscriptionPackageObj.packagePrice === "" ||
                            subscriptionPackageObj.packagePrice === null ||
                            subscriptionPackageObj.packagePrice ===
                              undefined) ? (
                            <label className="validation">
                              {ERROR_MESSAGES}
                            </label>
                          ) : (
                            ""
                          )}
                        </div>
                        {/* Discounted price */}
                        {/* <div
                          className="col-2"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <label className="text-center">
                            Discounted Price
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <div
                          className="col-4 "
                          style={{ marginBottom: "10px" }}
                        >
                          <input
                            type="text"
                            className="input-text"
                            placeholder="Discounted Price"
                            value={
                              subscriptionPackageObj?.packageDiscountedPrice
                            }
                            onChange={(e) => {
                              setErrorMessage("");
                              let inputValue = e.target.value;

                              // Remove leading zeros (except when "0." is being typed)
                              if (!inputValue.startsWith("0.")) {
                                inputValue = inputValue.replace(/^0+/, "");
                              }

                              // Remove non-numeric characters except decimal point
                              inputValue = inputValue.replace(/[^\d.]/g, "");

                              // Limit to 12 digits before the decimal point
                              if (inputValue.includes(".")) {
                                const [integerPart, decimalPart] =
                                  inputValue.split(".");
                                inputValue = `${integerPart.slice(
                                  0,
                                  7
                                )}.${decimalPart.slice(0, 2)}`;
                              } else {
                                inputValue = inputValue.slice(0, 7);
                              }

                              // Format with UK-style commas (1,000.00)
                              let formattedValue = inputValue;
                              if (inputValue !== "") {
                                const [intPart, decPart] =
                                  inputValue.split(".");
                                const formattedInt =
                                  Number(intPart).toLocaleString("en-UK");
                                formattedValue =
                                  decPart !== undefined
                                    ? `${formattedInt}.${decPart}`
                                    : formattedInt;
                              }

                              setSubscriptionPackageObj({
                                ...subscriptionPackageObj,
                                packageDiscountedPrice: formattedValue,
                              });
                            }}
                          />

                          {requireErrorMessage &&
                          (subscriptionPackageObj.packageDiscountedPrice ===
                            "" ||
                            subscriptionPackageObj.packageDiscountedPrice ===
                              undefined ||
                            subscriptionPackageObj.packageDiscountedPrice ===
                              null) ? (
                            <label className="validation">
                              {ERROR_MESSAGES}
                            </label>
                          ) : (
                            ""
                          )}
                        </div> */}
                      </div>

                      {/* Months */}
                      {/* {subscriptionPackageObj.validityID === 1 && (
                        <div className="row mb-2" id="months">
                          <div
                            className="col-2"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <label className="text-center">
                              Months
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                          <div className="col-4 ">
                            <input
                              type="text"
                              className="input-text"
                              placeholder="Months"
                              value={
                                subscriptionPackageObj?.months
                                  ? subscriptionPackageObj?.months
                                  : null
                              }
                              onChange={(e) => {
                                setErrorMessage("");
                                let inputValue = e.target.value;

                                // Remove non-digit characters
                                inputValue = inputValue.replace(/[^\d]/g, "");

                                // Convert to number to validate the range
                                const numericValue = parseInt(inputValue, 10);

                                // Allow clearing or valid month (1–12)
                                if (
                                  inputValue === "" ||
                                  (!isNaN(numericValue) &&
                                    numericValue >= 1 &&
                                    numericValue <= 12)
                                ) {
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    months: inputValue, // Keep the user input as string
                                  });
                                }
                              }}
                            />

                            {requireErrorMessage &&
                            subscriptionPackageObj.validityID === 1 &&
                            (subscriptionPackageObj.months === "" ||
                              subscriptionPackageObj.months === undefined ||
                              subscriptionPackageObj.months === null) ? (
                              <label className="validation">
                                {ERROR_MESSAGES}
                              </label>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
              <label
                style={{ display: "flex", justifyContent: "center" }}
                className="validation mt-2"
                id="ErrorMessage"
              >
                {errorMessage}
              </label>
              <Row class="modal-footer">
                <Col
                  style={{ paddingTop: "14px" }}
                  class="hstack gap-2 justify-content-end"
                >
                  <button
                    type="submit"
                    style={{ float: "right", paddingTop: "5px" }}
                    className="btn btn-md btn-success create-item-btn"
                    onClick={SubscriptionPackageAddUpdateBtnClicked}
                    disabled={DiscountPriceError}
                  >
                    <span>
                      {modelAction === "Add" ? "Add " + moduleName : "Update"}
                    </span>
                  </button>

                  <button
                    style={{
                      float: "right",
                      paddingTop: "5px",
                      marginRight: "10px",
                    }}
                    onClick={handleSubmit}
                    class="btn btn-md btn-light"
                  >
                    <span>Cancel</span>
                  </button>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        handleClose={HandleClose}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={`Subscription package ${subscriptionPackageObj.packageName}`}
      />
    </div>
  );
}

export default PdfToCsvSubscriptionPackageModel;
