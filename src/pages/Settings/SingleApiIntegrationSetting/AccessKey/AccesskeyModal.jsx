/* global $ */
import React, { useEffect, useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { ERROR_MESSAGES } from "../../../../components/GlobalMessage";
import { AddUpdateAccessKey } from "../../../../redux/Services/Setting/AccessKeyApi";
import SuccessModal from "../../../../components/SuccessModal";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import dayjs from "dayjs";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import Select from "react-select";
import { GetAllOrganisationLookupList, GetOrganisationLookupList } from "../../../../redux/Services/Master/OrganisationLookupList";
const AccesskeyModal = (props) => {
  // A] States Declaration :
  const moduleName = "Access Key";
  const modalRef = useRef(null);
  const [dismissModal, setDismissModal] = useState(null);
  const [OrganisationList, setOrganisationsList] = useState([]);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [modelAction, setModelAction] = useState("");
  const [accessKeyObj, setAccessKeyObj] = useState({
    accessKeyKeyID: null,
    organisationKeyID: null,
    userKeyID: null,
    accessKeyName: undefined,
    ExpiryDate: null
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [RequireErrorMessage, setRequireErrorMessage] = useState(false);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const {
    setLoader,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
  } = useContext(AuthContextProvider);

  // B] Initial useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    setModelAction(props.modelRequestData.Action === null ? "Add" : "Update"); //Do not change this naming convention
  }, [props.modelRequestData]);

  useEffect(() => {
    if (common.userKeyID) {
      GetOrganisationsListData(common.userKeyID)
    }
  }, [common.userKeyID]);

  // D] Calling CRUD Api here
  const GetOrganisationsListData = async (KeyID) => {
    if (common.token === "") {
      return
    }
    try {
      setLoader(true);
      const response = await GetAllOrganisationLookupList(KeyID);
      if (response?.data?.statusCode === 200) {
        setLoader(false);
        let modelData = response.data.responseData.data
        modelData = modelData.map((item) => ({
          value: item.organisationKeyID,
          label: item.organisationName
        }))
        setOrganisationsList(modelData)
      } else {
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
    }
  }
  // 2) Add Update Button Click Function
  const AccessKeyAddUpdateBtnClicked = () => {
    //Check Validations will be done here
    if (
      accessKeyObj.accessKeyName === undefined ||
      accessKeyObj.accessKeyName === "" ||
      accessKeyObj.accessKeyName === null ||
      accessKeyObj.ExpiryDate === undefined ||
      accessKeyObj.ExpiryDate === "" ||
      accessKeyObj.ExpiryDate === null
    ) {
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(false); // Clear the error message if there are no errors.
    }

    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      //global level params : fixed
      Action: props.modelRequestData.Action,
      organisationKeyID: accessKeyObj.organisationKeyID,
      userKeyID: common.userKeyID,

      //form level params : fixed
      // AccessKeyKeyID: accessKeyObj.AccessKeyKeyID,
      AccessKeyKeyID: props.modelRequestData.accessKeyKeyID,
      expiryDate: accessKeyObj.ExpiryDate,
      //form level params : will change according to module
      accessKeyName: accessKeyObj.accessKeyName,
    };
    AddUpdateAccessKeyData(ApiRequest_ParamsObj);
  };

  // Add or Update Access Key Data
  const AddUpdateAccessKeyData = async (apiRequestParams) => {
    setLoader(true);
    try {
      let url = "/AddAccessKey"; // Default URL for Adding Data
      if (apiRequestParams.AccessKeyKeyID !== null) {
        url = `/AddAccessKey?AccessKeyKeyID=${apiRequestParams.AccessKeyKeyID}`; // URL for Updating Data
      }
      const response = await AddUpdateAccessKey(url, apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.AccessKeyKeyID === null) {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          } else {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          }
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFromDateChange = (newValue) => {
    if (newValue) {
      const formattedDate = dayjs(newValue).format("YYYY-MM-DD");
      setAccessKeyObj({
        ...accessKeyObj,
        ExpiryDate: formattedDate,
      });

    } else {
      // The picker's clear (x) button sends null: empty the date.
      setAccessKeyObj({
        ...accessKeyObj,
        ExpiryDate: null,
      });
    }
  };
  // handleFunction
  const handleClose = () => {
    $("#" + props.id).modal("hide");
    setOpenSuccessModal(false);
    setRequireErrorMessage(false)
  };

  //Variable value
  const OrganisationValue = OrganisationList.find((item) => item.value === accessKeyObj.organisationKeyID)
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
      <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content access-key-uses-modal access-key-form-modal">
          {/*Heading Start */}
          <div class="modal-header access-key-uses-modal__head">
            <div className="access-key-uses-modal__head-text">
              <span className="access-key-uses-modal__icon">
                <i className="bi bi-key-fill"></i>
              </span>
              <div>
                <h5 class="modal-title" id="exampleModalLabel">
                  {modelAction === "Add"
                    ? getCrudPopUpTitleName("Add", moduleName)
                    : getCrudPopUpTitleName("Update", moduleName)}
                </h5>
                <p className="access-key-uses-modal__subtitle">
                  Choose the organisation, name the key and set when it
                  expires
                </p>
              </div>
            </div>
            {/* Close Button Start */}
            <button
              type="button"
              class="btn-close"
              // data-bs-dismiss="modal"
              aria-label="Close"
              id="close-modal"
              onClick={() => handleClose()}
            >
              {/* Close Button End */}
            </button>
          </div>
          {/*Heading End */}

          <div class="modal-body akf-body">
            <div class="p-3">
              <div class="row fieldset">
                <div class="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label class="form-label">
                    Organisation Name
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                  <div className="input-group">
                    <Select
                      classNamePrefix="app-select"
                      className=" selectDropDown Drop-down-width"
                      value={OrganisationValue}
                      onChange={(e) => {
                        setAccessKeyObj({
                          ...accessKeyObj,
                          organisationKeyID: e.value,
                        });
                      }}
                      options={OrganisationList}
                      aria-label="Select Payment Gateway"
                    />
                  </div>
                </div>
              </div>
              <div class="row fieldset">
                <div class="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="customerName-field">
                    Access Key Name
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                  <input
                    style={{ padding: "5px" }}
                    type="text"
                    id="customerName-field"
                    class="input-text"
                    placeholder="Access Key Name"
                    value={accessKeyObj.accessKeyName}
                    onChange={(e) => {
                      setErrorMessage("");
                      const inputValue = e.target.value;
                      const trimmedValue = inputValue.replace(/^\s+/g, "");
                      if (/^\d/.test(trimmedValue)) {
                        return;
                      }
                      const capitalizedValue =
                        trimmedValue.charAt(0).toUpperCase() +
                        trimmedValue.slice(1);
                      setAccessKeyObj({
                        ...accessKeyObj,
                        accessKeyName: capitalizedValue,
                      });
                    }}
                    maxLength={50}
                  />
                  {RequireErrorMessage && (accessKeyObj.accessKeyName === undefined ||
                    accessKeyObj.accessKeyName === "" ||
                    accessKeyObj.accessKeyName === null) ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <div class="row fieldset">
                <div class="col-lg-4 col-md-4 col-sm-12 text-start text-md-end">
                  <label htmlFor="customerName-field">
                    Expiry Date
                    <span className="text-danger">*</span>
                  </label>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                  <DatePicker
                    format="dd/MM/y"
                    dayPlaceholder="dd"
                    monthPlaceholder="mm"
                    yearPlaceholder="yyyy"
                    className="engagementCalender"
                    label="From Date"
                    value={accessKeyObj.ExpiryDate
                      ? dayjs(accessKeyObj.ExpiryDate)
                      : null
                    }
                    minDate={new Date()}  // Set minDate to today, preventing past date selection
                    maxDate={null}        // You can remove or keep this depending on whether you want to limit the max date
                    onChange={handleFromDateChange}
                    renderInput={(params) => (
                      <input {...params.inputProps} />
                    )}
                    popperPlacement="bottom-start"
                  />

                  {RequireErrorMessage && (
                    accessKeyObj.ExpiryDate === undefined ||
                    accessKeyObj.ExpiryDate === "" ||
                    accessKeyObj.ExpiryDate === null
                  ) ? (
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
          <div class="modal-footer access-key-uses-modal__footer">
            <div class="hstack gap-2 justify-content-end">
              <button
                type="button"
                class="btn btn-light"
                // data-bs-dismiss="modal"
                onClick={() => handleClose()}
              // onClick={() => SetInitialModelData()}
              >
                {getCrudButtonTextName("Cancel")}
              </button>
              <button
                type="submit"
                class="btn btn-success create-item-btn"
                id="add-btn"
                onClick={() => {
                  AccessKeyAddUpdateBtnClicked();
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
            setDismissModal={setDismissModal}
            setOpenSuccessModal={setOpenSuccessModal}
            openSuccessModal={openSuccessModal}
            modelAction={modelAction}
            message={`${moduleName} ${accessKeyObj.accessKeyName}`}
          />
        </div>
      </div>
    </div>
  );
};

export default AccesskeyModal;
