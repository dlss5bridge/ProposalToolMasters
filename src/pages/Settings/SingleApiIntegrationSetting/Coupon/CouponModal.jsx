/* global $ */
import React, { useEffect, useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { ERROR_MESSAGES } from "../../../../components/GlobalMessage";
import { AddUpdateCouponCode, GetCouponCodeModel } from "../../../../redux/Services/Setting/CouponApi";
import SuccessModal from "../../../../components/SuccessModal";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import dayjs from "dayjs";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "./CouponCode.css"
import Utils from "../../../../Middleware/Utils";
import BinarySelect from "../../../../components/BinarySelect";
const AccesskeyModal = (props) => {
  // A] States Declaration :
  const moduleName = "Coupon";
  const modalRef = useRef(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [modelAction, setModelAction] = useState("");
  const [couponObj, setCouponObj] = useState({
    userKeyID: null,
    couponKeyID: null,
    couponCode: undefined,
    couponAmt: null,
    minELValue: null,
    couponTypeID: null,
    validityCount: null,
    description: null,
    startDate: null,
    endDate: null
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [RequireErrorMessage, setRequireErrorMessage] = useState(false);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const {
    setLoader,
    EngagementName,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
  } = useContext(AuthContextProvider);

  // B] Initial useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    setModelAction(props.modelRequestData.Action === null ? "Add" : "Update"); //Do not change this naming convention
    SetInitialModelData()
    if (props.modelRequestData.couponKeyID !== undefined && props.modelRequestData.couponKeyID !== null && props.modelRequestData.Action === "Update") {
      GetCouponCodeModelData(props.modelRequestData.couponKeyID)
    }
  }, [props.modelRequestData]);

  // C] This function will clear all data from popup model
  const SetInitialModelData = () => {
    setCouponObj({
      ...couponObj,
      userKeyID: "",
      couponKeyID: null,
      couponCode: '',
      couponAmt: "",
      minELValue: "",
      couponTypeID: "",
      validityCount: "",
      description: "",
      startDate: null,
      endDate: null
    });
    setErrorMessage("");
    setRequireErrorMessage(false);
  };

  // D] Calling CRUD Api here

  // 2) Add Update Button Click Function
  const CouponAddUpdateBtnClicked = () => {
    //Check Validations will be done here
    debugger
    if (couponObj.couponCode === "" ||
      couponObj.couponCode === undefined ||
      couponObj.couponCode === null ||
      couponObj.couponAmt === "" ||
      couponObj.couponAmt === undefined ||
      couponObj.couponAmt === null ||
      couponObj.minELValue === "" ||
      couponObj.minELValue === undefined ||
      couponObj.minELValue === null ||
      couponObj.couponTypeID === "" ||
      couponObj.couponTypeID === undefined ||
      couponObj.couponTypeID === null ||
      couponObj.validityCount === "" ||
      couponObj.validityCount === undefined ||
      couponObj.validityCount === null ||
      couponObj.startDate === "" ||
      couponObj.startDate === undefined ||
      couponObj.startDate === null ||
      couponObj.endDate === "" ||
      couponObj.endDate === undefined ||
      couponObj.endDate === null ||
      couponObj.description === "" ||
      couponObj.description === undefined ||
      couponObj.description === null ||
      (couponObj.couponTypeID == 1 && Number(couponObj.minELValue) < Number(couponObj.couponAmt)) ||
      (couponObj.couponTypeID == 2 && Number(couponObj.couponAmt) > 100)
    ) {
      setRequireErrorMessage(true);

      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }

    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      couponKeyID: couponObj.couponKeyID,
      couponCode: couponObj.couponCode,
      couponAmount: Number(couponObj.couponAmt),
      minContractValue: Number(couponObj.minELValue),
      couponTypeID: couponObj.couponTypeID,
      validityCount: Number(couponObj.validityCount),
      fromDate: couponObj.startDate,
      toDate: couponObj.endDate,
      description: couponObj.description
    };
    AddUpdateCouponData(ApiRequest_ParamsObj);
  };

  // Add or Update Coupon Data
  const AddUpdateCouponData = async (apiRequestParams) => {
    setLoader(true);
    try {
      const response = await AddUpdateCouponCode(apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          setOpenSuccessModal(true);
          props.setIsAddUpdateActionDone(true);
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const GetCouponCodeModelData = async (couponKeyID) => {
    const data = await GetCouponCodeModel(couponKeyID, common.userKeyID, common.organisationKeyID)
    if (data.data.statusCode === 200) {
      const ModalData = data.data.responseData.data

      setCouponObj({
        ...couponObj,
        couponKeyID: ModalData.couponKeyID,
        couponCode: ModalData.couponCode,
        couponAmt: ModalData.couponAmount,
        minELValue: ModalData.minContractValue,
        couponTypeID: ModalData.couponTypeID,
        validityCount: ModalData.validityCount,
        description: ModalData.description,
        startDate: ModalData.fromDate,
        endDate: ModalData.toDate
      })
    }
  }
  const handleFromDateChange = (newValue) => {
    if (newValue) {
      const formattedDate = dayjs(newValue).format("YYYY-MM-DD");
      setCouponObj({
        ...couponObj,
        startDate: formattedDate, // Start Date
      });
    }
  };

  // Handle changes for the End Date
  const handleToDateChange = (newValue) => {
    if (newValue) {
      const formattedDate = dayjs(newValue).format("YYYY-MM-DD");
      setCouponObj({
        ...couponObj,
        endDate: formattedDate, // End Date
      });
    }
  };
  // handleFunction
  const handleClose = () => {
    $("#" + props.id).modal("hide");
    setOpenSuccessModal(false);
  };

  const CouponTypeValue = Utils.CouponTypeIDs.find(item => item.value == couponObj.couponTypeID)
  //Design part :
  return (
    <div
      style={{ display: openSuccessModal && "none" }}
      class={props.class}
      id={props.id}
      ref={modalRef}
      tabIndex={props.tabIndex}
      aria-labelledby={props.aria_labelledby}
      aria-hidden={props.aria_hidden}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div class="modal-dialog modal-md modal-dialog-centered pricing-driver-popup">
        <div class="modal-content">
          {/*Heading Start */}
          <div class="modal-header bg-light p-3">
            <h5 class="modal-title" id="exampleModalLabel">
              {modelAction === "Add"
                ? getCrudPopUpTitleName("Add", moduleName)
                : getCrudPopUpTitleName("Update", moduleName)}
            </h5>
            {/* Close Button Start */}
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={SetInitialModelData}
              id="close-modal"
            >
              {/* Close Button End */}
            </button>
          </div>
          {/*Heading End */}

          <div class="modal-body gpd-scroll">
            <div class="p-3">
              <div class="row fieldset">
                <div class="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="customerName-field">
                    Coupon Code
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                  <input
                    type="text"
                    id="customerName-field"
                    class="input-text"
                    placeholder="Coupon Code"
                    value={couponObj.couponCode}
                    onChange={(e) => {
                      setErrorMessage("");
                      const inputValue = e.target.value;
                      const trimmedValue = inputValue.replace(/^\s+/g, "");
                      if (/^\d/.test(trimmedValue)) {
                        return;
                      }
                      const capitalizedValue =
                        trimmedValue.toUpperCase()
                      setCouponObj({
                        ...couponObj,
                        couponCode: capitalizedValue,
                      });
                    }}
                    maxLength={50}
                  />
                  {RequireErrorMessage && (couponObj.couponCode === "" || couponObj.couponCode === undefined || couponObj.couponCode === null) ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div class="row fieldset">
                <div class="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="customerName-field">
                    Coupon Type
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                  <div class="input-group">
                    <BinarySelect
                      options={Utils.CouponTypeIDs}
                      value={CouponTypeValue}
                      onChange={(e) => {

                        setCouponObj({
                          ...couponObj,
                          couponTypeID: e.value,
                        });
                      }}
                      ariaLabel="Coupon Type"
                    />
                    {RequireErrorMessage && (couponObj.couponTypeID === "" || couponObj.couponTypeID === undefined || couponObj.couponTypeID === null) ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
              <div class="row fieldset">
                <div class="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="customerName-field">
                    Min. {EngagementName} Value
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                  <input
                    type="text"
                    id="customerName-field"
                    class="input-text"
                    placeholder={`Min. ${EngagementName} Value`}
                    value={couponObj.minELValue?.toString()
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    onChange={(e) => {
                      const sanitizedInput = e.target.value
                        .replace(/[^0-9.]/g, "") // Allow only numeric and dot characters
                        .slice(0, 16); // Limit to 7 characters (5 digits + 1 dot + 1 decimal)

                      // Split the input into integer and decimal parts
                      const [integerPart, decimalPart] =
                        sanitizedInput.split(".");

                      // Combine integer and decimal parts with appropriate precision
                      const formattedInput =
                        decimalPart !== undefined
                          ? `${integerPart.slice(
                            0,
                            12
                          )}.${decimalPart.slice(0, 2)}`
                          : integerPart.slice(0, 12);
                      setCouponObj({
                        ...couponObj,
                        minELValue: formattedInput,
                      });
                    }}
                    maxLength={50}
                  />
                  {RequireErrorMessage && (couponObj.minELValue === "" || couponObj.minELValue === undefined || couponObj.minELValue === null) ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div class="row fieldset">
                <div class="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="customerName-field">
                    Coupon Amount
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                  <input
                    type="text"
                    id="customerName-field"
                    class="input-text"
                    placeholder="Coupon Amount"
                    value={couponObj.couponAmt?.toString()
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    onChange={(e) => {
                      setErrorMessage("");
                      const sanitizedInput = e.target.value
                        .replace(/[^0-9.]/g, "") // Allow only numeric and dot characters
                        .slice(0, 16); // Limit to 7 characters (5 digits + 1 dot + 1 decimal)

                      // Split the input into integer and decimal parts
                      const [integerPart, decimalPart] =
                        sanitizedInput.split(".");

                      // Combine integer and decimal parts with appropriate precision
                      const formattedInput =
                        decimalPart !== undefined
                          ? `${integerPart.slice(
                            0,
                            12
                          )}.${decimalPart.slice(0, 2)}`
                          : integerPart.slice(0, 12);
                      setCouponObj({
                        ...couponObj,
                        couponAmt: formattedInput,
                      });
                    }}
                    maxLength={50}
                  />
                  {RequireErrorMessage && (couponObj.couponAmt === "" || couponObj.couponAmt === undefined || couponObj.couponAmt === null) ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    (RequireErrorMessage && couponObj.couponTypeID == 2 && Number(couponObj.couponAmt) > 100) ?
                      <label className="validation">Please set the coupon amount between 1% and 100%.</label> :
                      (couponObj.couponTypeID == 1 && Number(couponObj.minELValue) < Number(couponObj.couponAmt)) ? <label className="validation">Please set the coupon amount less than Min. {EngagementName} Value({couponObj.minELValue})</label> : ""
                  )}
                </div>
              </div>
              <div class="row fieldset">
                <div class="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="customerName-field">
                    Validity Count
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                  <input
                    // style={{ padding: "5px" }}
                    type="text"
                    id="customerName-field"
                    class="input-text"
                    placeholder="Validity Count"
                    value={couponObj.validityCount?.toString()
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    onChange={(e) => {
                      setErrorMessage("");
                      const sanitizedInput = e.target.value
                        .replace(/[^0-9]/g, "") // Allow only numeric and dot characters
                        .slice(0, 10); // Limit to 7 characters (5 digits + 1 dot + 1 decimal)

                      // Split the input into integer and decimal parts
                      const [integerPart, decimalPart] =
                        sanitizedInput.split(".");

                      // Combine integer and decimal parts with appropriate precision
                      const formattedInput =
                        decimalPart !== undefined
                          ? `${integerPart.slice(
                            0,
                            7
                          )}.${decimalPart.slice(0, 2)}`
                          : integerPart.slice(0, 7);
                      setCouponObj({
                        ...couponObj,
                        validityCount: formattedInput,
                      });
                    }}
                    maxLength={50}
                  />
                  {RequireErrorMessage && (couponObj.validityCount === "" || couponObj.validityCount === undefined || couponObj.validityCount === null) ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="row fieldset">
                <div className="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="validity-from-field">
                    Validity From Date
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div className="col-lg-8 col-md-8 col-sm-12">
                  <DatePicker
                    format="dd/MM/y"
                    dayPlaceholder="dd"
                    monthPlaceholder="mm"
                    yearPlaceholder="yyyy"
                    className="engagementCalender"
                    label="From Date"
                    value={couponObj.startDate ? dayjs(couponObj.startDate).toDate() : null}
                    minDate={new Date()} // Prevent past date selection
                    maxDate={couponObj.endDate ? dayjs(couponObj.endDate).toDate() : null} // Set maxDate based on endDate
                    onChange={handleFromDateChange}
                    renderInput={(params) => <input {...params.inputProps} />}
                    popperPlacement="bottom-start"
                  />
                  {RequireErrorMessage && !couponObj.startDate ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="row fieldset">
                <div className="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="validity-to-field">
                    Validity To Date
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div className="col-lg-8 col-md-8 col-sm-12">
                  <DatePicker
                    format="dd/MM/y"
                    dayPlaceholder="dd"
                    monthPlaceholder="mm"
                    yearPlaceholder="yyyy"
                    className="engagementCalender"
                    label="To Date"
                    value={couponObj.endDate ? dayjs(couponObj.endDate).toDate() : null}
                    minDate={couponObj.startDate ? dayjs(couponObj.startDate).toDate() : new Date()} // Set minDate based on startDate
                    maxDate={null} // Allow any future date
                    onChange={handleToDateChange}
                    renderInput={(params) => <input {...params.inputProps} />}
                    popperPlacement="bottom-start"
                  />
                  {RequireErrorMessage && !couponObj.endDate ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <div class="row fieldset">
                <div class="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="customerName-field">
                    Description
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                  <textarea
                    class="input-text"
                    placeholder="Description"
                    value={couponObj.description}
                    onChange={(e) => {
                      const capitalizedValue =
                        e.target.value.charAt(0).toUpperCase() +
                        e.target.value.slice(1);
                      setCouponObj({
                        ...couponObj,
                        description: capitalizedValue,
                      });
                    }}
                    maxLength={250}
                  ></textarea>

                  {RequireErrorMessage && (couponObj.description === "" || couponObj.description === undefined || couponObj.description === null) ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <label
                style={{ display: "flex", justifyContent: "center" }}
                className="validation"
              >
                {errorMessage}
              </label>
            </div>
          </div>

          {/*Modal body End */}
          {/*Footer body button Start */}
          <div class="modal-footer">
            <div class="hstack gap-2 justify-content-end">
              <button
                type="button"
                class="btn btn-light"
                data-bs-dismiss="modal"
                onClick={() => SetInitialModelData()}
              >
                {getCrudButtonTextName("Cancel")}
              </button>
              <button
                type="submit"
                class="btn btn-success create-item-btn"
                id="add-btn"
                onClick={() => {
                  CouponAddUpdateBtnClicked();
                }}
              >
                <span>
                  {" "}
                  {modelAction === "Add"
                    ? getCrudButtonTextName("Add", moduleName)
                    : getCrudButtonTextName("Update", moduleName)}
                </span>
              </button>
            </div>
          </div>
          <SuccessModal
            handleClose={handleClose}
            setOpenSuccessModal={setOpenSuccessModal}
            openSuccessModal={openSuccessModal}
            modelAction={modelAction}
            message={`${moduleName} ${couponObj.couponCode}`}
          />
        </div>
      </div>
    </div>
  );
};

export default AccesskeyModal;
