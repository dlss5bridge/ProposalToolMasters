/* global $ */
import React, { useState, useRef, useContext } from "react";
import "./PricingSettingStyle.css";
import { useEffect } from "react";
import {
  AddUpdatePricingSetting,
  GetPricingSettingModel,
} from "../../../redux/Services/Setting/PricingSettingApi";
import {
  GetServiceFeeInflationList,
  AddUpdateServiceFeeInflation,
  DeleteAllServiceFeeInflationConfiguration,
  AcceptServiceFeeInflationSAChanges,
  DeclineServiceFeeInflation,
} from "../../../redux/Services/Config/ServicesApi";
import { useSelector } from "react-redux";
import SuccessModal from "../../../components/SuccessModal";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import Footer from "../../../components/Footer";
import Select from "react-select";
import Utils from "../../../Middleware/Utils";
import ConfirmModel from "../../../components/ConfirmationBox";
import SAPredefinedChangesNotifyMessageModel from "../../../components/SAPredefinedChangesNotifyMessageModel";
import ConfirmSAChangesModel from "../../../components/AcceptSuperAdminChangesConfirmation";

const Pricing_Settings = () => {
  const moduleName = "FeeInflation";
  // A] States Declaration :
  const [activeTab, setActiveTab] = useState("PricingSetting");
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [dismissModal, setDismissModal] = useState(null);
  const [prevError, SetPrevError] = useState("");
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState(
    Utils.Payment_Frequency[0],
  );
  const masterProposalType = Utils.select_Quote_Type.find(
    (item) => item.value === 4,
  )?.label;
  const [pricingSettingObj, setPricingSettingObj] = useState({
    userKeyID: null,
    minOneOffPriceForQC: "",
    minMonthlyPriceForQC: "",
    maxDiscountForQC: null,
    paymentFrequencyID: null,
    enableMasterProposalType: false,
    defaultProposalFormatID: null,
  });
  const [ServiceFeeInflationConfig, setServiceFeeInflationConfig] = useState({
    OrganisationKeyID: null,
    UserKeyID: null,
    ServiceFeeInflationList: [], // full list from API
    HasExistingConfig: false,
    SelectionError: "", // error message related to service selection
    SelectedServices: [], // array of selected service objects
    InflationRule: {
      // single rule applied to all selected services
      operator: null, // '+' | '-' | '*' | '/' | null
      value: null, // decimal or null
    },
  });
  const [modelRequestData, setModelRequestData] = useState({
    message: null,
    status: null,
    Action: null,
    keyID: null,
    SearchKeyword: "",
    RefId: null,
  });
  const [SAConfirmStatus, setSAConfirmStatus] = useState(true); // true = accept, false = decline
  const [SAConfirmBatchID, setSAConfirmBatchID] = useState(null);
  // const ProposalObject = {
  //   Payment_Frequency: 2 // Example initial value, adjust as needed
  // };

  useEffect(() => {
    if (pricingSettingObj.paymentFrequencyID !== null) {
      const foundFrequency = Utils.Payment_Frequency.find(
        (item) => item.value === pricingSettingObj.paymentFrequencyID,
      );
      setSelectedFrequency(foundFrequency);
    }
  }, [pricingSettingObj.paymentFrequencyID]);
  const [PrevPricingSettingObj, setPrevPricingSettingObj] = useState({
    userKeyID: null,
    minOneOffPriceForQC: "",
    minMonthlyPriceForQC: "",
    maxDiscountForQC: "",
    paymentFrequencyID: null,
    enableMasterProposalType: false,
    defaultProposalFormatID: null,
    remainingESignatures: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const {
    setLoader,
    setTopbar,
    proposalName,
    EngagementName,
    staticCurrencySymbols,
    userAccessData,
  } = useContext(AuthContextProvider);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [isFormChanged, setIsFormChanged] = useState(false);
  // B] Initial useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    setTopbar("block");
  }, []);

  useEffect(() => {
    if (common.organisationKeyID !== null) {
      GetPricingSettingModelData(common.organisationKeyID);
    }
  }, [common.organisationKeyID]);

  const getProposalFormatOptions = () => {
    if (PrevPricingSettingObj.remainingESignatures !== true) {
      return Utils.PreviewSelection.filter((x) => x.value === 3); //TODO:change to 3 after web based developement
    }
    return Utils.PreviewSelection;
  };

  // const getProposalFormatValue = () => {
  //   if(common.enableEL === 1 && activeOrganizationSubscriptionPlan?.prepareContract === true) {
  //     return Utils.PreviewSelection.find(x => x.value === (pricingSettingObj.defaultProposalFormatID ?? 1));
  //   }
  //   return Utils.PreviewSelection.find(x => x.value === 2);
  // }

  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  const GetPricingSettingModelData = async (id) => {
    if (!id) {
      return;
    }
    try {
      const data = await GetPricingSettingModel(id);

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          SetPrevError(false);
          setPricingSettingObj({
            ...pricingSettingObj,
            userKeyID: common.userKeyID,
            minOneOffPriceForQC: ModelData.minOneOffPriceForQC,
            minMonthlyPriceForQC: ModelData.minMonthlyPriceForQC,
            maxDiscountForQC: ModelData.maxDiscountForQC,
            organisationKeyID: ModelData.organisationKeyID,
            paymentFrequencyID: ModelData.paymentFrequencyID,
            enableMasterProposalType: ModelData.enableMasterProposalType,
            defaultProposalFormatID: ModelData.defaultProposalFormatID,
            remainingESignatures: ModelData.remainingESignatures,
          });
          setPrevPricingSettingObj({
            ...pricingSettingObj,
            userKeyID: common.userKeyID,
            minOneOffPriceForQC: ModelData.minOneOffPriceForQC,
            minMonthlyPriceForQC: ModelData.minMonthlyPriceForQC,
            maxDiscountForQC: ModelData.maxDiscountForQC,
            organisationKeyID: ModelData.organisationKeyID,
            paymentFrequencyID: ModelData.paymentFrequencyID,
            enableMasterProposalType: ModelData.enableMasterProposalType,
            defaultProposalFormatID: ModelData.defaultProposalFormatID,
            remainingESignatures: ModelData.remainingESignatures,
          });
        }
      } else {
        SetPrevError(false);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GetServiceFeeInflationConfigData = async () => {
    if (!common.organisationKeyID || !common.userKeyID) {
      return;
    }
    try {
      const data = await GetServiceFeeInflationList({
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
      });
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ListData = data?.data?.responseData?.data;
          console.log("ListData", ListData);
          setServiceFeeInflationConfig((prev) => ({
            ...prev,
            OrganisationKeyID: common.organisationKeyID,
            UserKeyID: common.userKeyID,
            ServiceFeeInflationList: ListData,

            // auto select configured services
            SelectedServices: [],
            HasExistingConfig: ListData.some(
              (s) => s.operator !== null && s.value !== null,
            ),
            // auto populate first rule
            InflationRule: {
              operator: null,
              value: null,
            },
          }));
        }
      } else {
        setServiceFeeInflationConfig({
          ...ServiceFeeInflationConfig,
          // IsLoading: false,
        });
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Submit Service Fee Inflation rules
  const SubmitServiceFeeInflation = async () => {
    setErrorMessage("");
    if (
      !ServiceFeeInflationConfig.SelectedServices ||
      ServiceFeeInflationConfig.SelectedServices.length === 0
    ) {
      setErrorMessage("Please select one or more services to configure.");
      return;
    }
    if (
      !ServiceFeeInflationConfig.InflationRule.operator ||
      ServiceFeeInflationConfig.InflationRule.value === null
    ) {
      setErrorMessage(
        "Please choose an operator and enter a value for the rule.",
      );
      return;
    }

    setLoader(true);
    try {
      const serviceIDs = ServiceFeeInflationConfig.SelectedServices.map(
        (s) => s.serviceID ?? s.serviceID ?? s.ServiceID,
      ).join(",");

      const apiParams = {
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        operator: ServiceFeeInflationConfig.InflationRule.operator,
        value: ServiceFeeInflationConfig.InflationRule.value,
        serviceIDs: serviceIDs,
      };

      const response = await AddUpdateServiceFeeInflation(apiParams);
      setLoader(false);
      if (response?.data?.statusCode === 200) {
        setOpenSuccessModal(true);
        setIsAddUpdateActionDone(true);
        // refresh list
        GetServiceFeeInflationConfigData();
      } else {
        setErrorMessage(
          response?.data?.errorMessage ||
            response?.response?.data?.errorMessage,
        );
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
    }
  };

  // Delete all Services and Configurations
  const DeleteServiceFeeInflationConfig = async () => {
    console.log("DeleteServiceFeeInflationConfig", modelRequestData);
    if (!common.organisationKeyID || !common.userKeyID) {
      return;
    }
    try {
      const data = await DeleteAllServiceFeeInflationConfiguration(
        common.organisationKeyID,
        common.userKeyID,
        modelRequestData.batchID,
      );
      if (data?.data?.statusCode === 200) {
        setOpenSuccessModal(true);
        setIsAddUpdateActionDone(true);
        GetServiceFeeInflationConfigData();
        $("#" + "confirm").modal("hide");
      } else {
        setErrorMessage(
          data?.data?.errorMessage || data?.response?.data?.errorMessage,
        );
      }
    } catch (error) {
      console.error(error);
      setLoader(false);
    }
  };
  // 2) Add Update Button Click Function
  const PricingSettingAddUpdateBtnClicked = () => {
    if (
      pricingSettingObj.maxDiscountForQC ==
        PrevPricingSettingObj.maxDiscountForQC &&
      pricingSettingObj.minMonthlyPriceForQC ==
        PrevPricingSettingObj.minMonthlyPriceForQC &&
      pricingSettingObj.minOneOffPriceForQC ==
        PrevPricingSettingObj.minOneOffPriceForQC &&
      pricingSettingObj.paymentFrequencyID ==
        PrevPricingSettingObj.paymentFrequencyID &&
      pricingSettingObj.enableMasterProposalType ==
        PrevPricingSettingObj.enableMasterProposalType &&
      pricingSettingObj.defaultProposalFormatID ==
        PrevPricingSettingObj.defaultProposalFormatID
    ) {
      SetPrevError(true);
      return false;
    }

    const ApiRequest_ParamsObj = {
      // global level params: fixed
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      // form level params: fixed
      minOneOffPriceForQC: pricingSettingObj.minOneOffPriceForQC || null,
      minMonthlyPriceForQC: pricingSettingObj.minMonthlyPriceForQC || null,
      maxDiscountForQC: pricingSettingObj.maxDiscountForQC || null,
      paymentFrequencyID: pricingSettingObj.paymentFrequencyID || null,
      enableMasterProposalType:
        pricingSettingObj.enableMasterProposalType || false,
      defaultProposalFormatID: pricingSettingObj.defaultProposalFormatID,
    };

    setErrorMessage("");
    AddUpdatePricingSettingData(ApiRequest_ParamsObj);
  };

  // Add or Update Pricing Setting Data
  const AddUpdatePricingSettingData = async (apiRequestParams) => {
    setLoader(true);
    try {
      let url = "/AddUpdatePricingSettings"; // Default URL for Adding Data
      if (apiRequestParams.Action === "Update") {
        url = `/AddUpdatePricingSettings?Action=${apiRequestParams.Action}`; // URL for Updating Data
      }
      const response = await AddUpdatePricingSetting(url, apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.Action === "Update") {
            setOpenSuccessModal(true);
            setIsAddUpdateActionDone(true);
            GetPricingSettingModelData(common.organisationKeyID);
          } else {
            setOpenSuccessModal(true);
            setIsAddUpdateActionDone(true);
            GetPricingSettingModelData(common.organisationKeyID);
          }
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const TabHandle = async (tab) => {
    if (tab === "PricingSetting") {
      setActiveTab(tab);
      if (common.organisationKeyID !== null) {
        GetPricingSettingModelData(common.organisationKeyID);
      }
    } else if (tab === "FeeInflation") {
      try {
        const data = await GetServiceFeeInflationConfigData(
          common.organisationKeyID,
        );
      } catch (error) {
        setLoader(false);
        console.log(error);
        setErrorMessage(true);
      }
    }
  };

  // handle Function
  const handleClose = () => {
    $("#" + "confirm").modal("hide");
    setOpenSuccessModal(false);
  };
  const handlePaymentFrequencyChange = (selectedOption) => {
    setSelectedFrequency(selectedOption);
    setPricingSettingObj((prevState) => ({
      ...prevState,
      paymentFrequencyID: selectedOption.value,
    }));
  };

  //Design part :
  return (
    <div>
      <div class="page-content mt-2 page-background">
        <div class="container">
          <ul className="nav nav-tabs" role="tablist">
            {/* <div class="page-title-cls">Pricing Settings</div> */}
            <li className="nav-item">
              <a
                className={`nav-link tab_nav ${
                  activeTab === "PricingSetting" ? "active" : ""
                }`}
                data-bs-toggle="tab"
                href="#PricingSetting"
                role="tab"
                aria-selected={activeTab === "PricingSetting"}
                onClick={() => {
                  setActiveTab("PricingSetting");
                  // setSelectedRows([]);
                  TabHandle("PricingSetting");
                }}
              >
                <b>Pricing Setting </b>
              </a>
            </li>
            {common.organisationKeyID !== null && (
              <li className="nav-item">
                <a
                  className={`nav-link tab_nav ${
                    activeTab === "FeeInflation" ? "active" : ""
                  }`}
                  data-bs-toggle="tab"
                  href="#FeeInflation"
                  role="tab"
                  aria-selected={activeTab === "FeeInflation"}
                  onClick={() => {
                    setActiveTab("FeeInflation");
                    // setSelectedRows([]);
                    TabHandle("FeeInflation");
                  }}
                >
                  <b>Service Fee Inflation </b>
                </a>
              </li>
            )}
          </ul>
        </div>
        {activeTab === "PricingSetting" && (
          <div class="container">
            <div class="row">
              <div class="col-12 pricing_settings Pricing-container-card">
                <div class="card">
                  <div class="card-body bg-white">
                    <div className="row">
                      {/* Left side */}
                      <div class="col-lg-6 col-md-6 col-sm-12">
                        <div class="row fieldset">
                          <div class="fieldset  col-md-6 col-sm-12">
                            <label class="fieldset-label table-content-font ">
                              Min. One-Off Price for {proposalName}/
                              {EngagementName} (£)
                            </label>
                          </div>
                          <div class="col-lg-12 col-md-12 col-sm-12 fieldset">
                            <input
                              className="input-text table-content-font"
                              type="text"
                              placeholder="Enter Min. One-Off Price"
                              value={pricingSettingObj.minOneOffPriceForQC
                                ?.toString()
                                ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              onChange={(e) => {
                                SetPrevError(false);
                                // Ensure that the input only contains numeric characters
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
                                        12,
                                      )}.${decimalPart.slice(0, 2)}`
                                    : `${integerPart.slice(0, 12)}`;

                                setRequireErrorMessage(false);
                                setPricingSettingObj({
                                  ...pricingSettingObj,
                                  minOneOffPriceForQC: formattedInput,
                                });
                              }}
                            />
                          </div>

                          <div class="fieldset col-12 col-md-12 col-sm-12">
                            <label class="fieldset-label table-content-font PricingSetting-Proposal">
                              Min. Monthly Price for {proposalName}/
                              {EngagementName} (£)
                            </label>
                          </div>
                          <div class="col-lg-12 col-md-12 col-sm-12 fieldset">
                            <input
                              class="input-text table-content-font"
                              type="text"
                              placeholder="Enter Min. Monthly Price"
                              value={pricingSettingObj.minMonthlyPriceForQC
                                ?.toString()
                                ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              onChange={(e) => {
                                SetPrevError(false);
                                // Ensure that the input only contains numeric and dot characters
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
                                        12,
                                      )}.${decimalPart.slice(0, 2)}`
                                    : integerPart.slice(0, 12);

                                setRequireErrorMessage(false);
                                setPricingSettingObj({
                                  ...pricingSettingObj,
                                  minMonthlyPriceForQC: formattedInput,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right side */}
                      <div class="col-lg-6 col-md-6 col-sm-12">
                        <div class="row fieldset">
                          <div class="fieldset col-12">
                            <label class="fieldset-label table-content-font PricingSetting-Proposal">
                              Max. Discount (%) for {proposalName}/
                              {EngagementName}
                            </label>
                          </div>
                          <div class="col-lg-12 fieldset">
                            <input
                              className="input-text table-content-font"
                              digitOnly={true}
                              type="text" // Use type="text" instead of type="number" to allow custom validation
                              pattern="\d{0,3}(\.\d{0,2})?" // Pattern to match the allowed format
                              placeholder="Enter Max. Discount (%)"
                              maxLength={6} // Allowing 3 digits before the decimal and 2 after
                              value={pricingSettingObj.maxDiscountForQC}
                              onChange={(e) => {
                                const inputValue = e.target.value.replace(
                                  /[^0-9.]/g,
                                  "",
                                );

                                // Validate if the input is a valid percentage
                                const isValidPercentage =
                                  /^\d{0,3}(\.\d{0,2})?$/.test(inputValue) &&
                                  inputValue <= 100;

                                // Update state only if the input is a valid percentage
                                if (isValidPercentage || inputValue === "") {
                                  setPricingSettingObj({
                                    ...pricingSettingObj,
                                    maxDiscountForQC: inputValue,
                                  });
                                } else {
                                  // Handle the case when the input is not a valid percentage
                                  // You can choose to clear the input or keep the previous value
                                  // In this example, I'm keeping the previous value
                                  setPricingSettingObj({
                                    ...pricingSettingObj,
                                    maxDiscountForQC:
                                      pricingSettingObj.maxDiscountForQC,
                                  });
                                }
                              }}
                            />
                          </div>
                          {/* Select  */}
                          <div class="fieldset col-12">
                            <label class="fieldset-label table-content-font PricingSetting-Proposal">
                              Payment Frequency
                            </label>
                          </div>
                          <div class="col-lg-12 fieldset input-group">
                            <Select
                              className="phone-input-country-code selectDropDown Drop-down-width"
                              value={selectedFrequency}
                              onChange={handlePaymentFrequencyChange}
                              options={Utils.Payment_Frequency}
                            />
                          </div>
                          <div class="col-lg-2 col-md-4 col-sm-12"></div>
                          <div class="col-lg-2 col-md-4 col-sm-12"></div>
                        </div>
                      </div>
                      <div class="fieldset col-6">
                        <label class=" fieldset-label pe-2">
                          Enable {masterProposalType}
                        </label>
                        <input
                          type="checkbox"
                          className="check check_tick"
                          style={{ verticalAlign: "middle" }}
                          checked={pricingSettingObj.enableMasterProposalType}
                          onChange={(e) => {
                            setPricingSettingObj({
                              ...pricingSettingObj,
                              enableMasterProposalType: e.target.checked,
                            });
                          }}
                        />
                      </div>
                      <div class="fieldset col-6">
                        <label class=" fieldset-label pe-2">
                          Default Proposal Format
                        </label>
                        <Select
                          className="phone-input-country-code selectDropDown Drop-down-width pt-2"
                          options={getProposalFormatOptions()}
                          value={Utils.PreviewSelection.find(
                            (x) =>
                              x.value ===
                              pricingSettingObj.defaultProposalFormatID,
                          )}
                          // isDisabled={PrevPricingSettingObj.defaultProposalFormatID === 2}
                          onChange={(selectedOption) => {
                            setPricingSettingObj({
                              ...pricingSettingObj,
                              defaultProposalFormatID: selectedOption.value,
                            });
                          }}
                        />
                      </div>

                      <div class="fieldset col-6">
                        <label class=" fieldset-label pe-2">
                          Proposal Types
                        </label>
                        <Select
                          className="phone-input-country-code selectDropDown Drop-down-width pt-2"
                          options={Utils?.webBasedProposalTypes}
                          value={Utils.webBasedProposalTypes.find(
                            (x) =>
                              x.value === pricingSettingObj?.proposalTypeID,
                          )}
                          onChange={(selectedOption) => {
                            setPricingSettingObj({
                              ...pricingSettingObj,
                              proposalTypeID: selectedOption.value,
                            });
                          }}
                        />
                      </div>

                      <div class="fieldset col-6">
                        <label class=" fieldset-label pe-2">
                          Global {proposalName} Variables
                        </label>
                        <Select
                          isMulti
                          className="phone-input-country-code selectDropDown Drop-down-width pt-2"
                          options={Utils?.webBasedProposalTypes}
                          value={Utils.webBasedProposalTypes.find(
                            (x) =>
                              x.value === pricingSettingObj?.proposalTypeID,
                          )}
                          onChange={(selectedOption) => {
                            setPricingSettingObj({
                              ...pricingSettingObj,
                              proposalTypeID: selectedOption.value,
                            });
                          }}
                        />
                      </div>

                      <div className="text-center">
                        {prevError && (
                          <label className="validation">
                            You haven't changed any value
                          </label>
                        )}
                      </div>
                      {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
                        <div class="col-lg-12 text-end">
                          <label className="validation">{errorMessage}</label>
                          <button
                            style={{ fontSize: "14px", marginTop: "30px" }}
                            className="btn btn-primary create-item-btn"
                            onClick={() => {
                              PricingSettingAddUpdateBtnClicked();
                            }}
                          >
                            <span>Submit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "FeeInflation" && (
          <div className="container">
            <SAPredefinedChangesNotifyMessageModel
              Params={{
                SAChanges:
                  ServiceFeeInflationConfig.ServiceFeeInflationList.some(
                    (s) => s.notifySAChanges,
                  ),
              }}
            />
            {/* ── Header ── */}
            <div className="row">
              <div className="col-12 mt-3">
                <strong>
                  Configure a price adjustment rule for one or more services.
                  <br />
                  Select the services you want to apply an inflation rule to,
                  then choose an operator and value:
                </strong>
              </div>
            </div>

            {/* ── Service Select ── */}
            <div className="row mt-3">
              <div className="col-md-3">
                <label className="form-label">Select Services</label>
              </div>
              <div className="col-md-6">
                <Select
                  isMulti
                  options={ServiceFeeInflationConfig.ServiceFeeInflationList.filter(
                    (s) => {
                      // Fixed price services (pricingTypeID !== formula type) that are
                      // already configured must not appear in the dropdown again
                      const isFixed = s.pricingTypeID !== 2; // use your actual constant
                      const isAlreadyConfigured =
                        s.operator !== null && s.value !== null;
                      if (isFixed && isAlreadyConfigured) return false;
                      return true;
                    },
                  ).map((s) => ({
                    value: s.serviceID,
                    label: s.serviceName,
                    isConfigured: s.operator !== null && s.value !== null,
                    data: s,
                  }))}
                  value={ServiceFeeInflationConfig.SelectedServices.map(
                    (s) => ({
                      value: s.serviceID,
                      label: s.serviceName,
                      isConfigured: s.operator !== null && s.value !== null,
                      data: s,
                    }),
                  )}
                  onChange={(selected) => {
                    // const isDeselectAll =
                    //   (!selected || selected.length === 0) &&
                    //   ServiceFeeInflationConfig.HasExistingConfig;

                    // if (isDeselectAll) {
                    //   setServiceFeeInflationConfig((prev) => ({
                    //     ...prev,
                    //     SelectionError: "At least one service must be selected.",
                    //   }));
                    //   return;
                    // }

                    setServiceFeeInflationConfig((prev) => ({
                      ...prev,
                      SelectedServices: selected
                        ? selected.map((s) => s.data)
                        : [],
                      SelectionError: "",
                    }));
                  }}
                  formatOptionLabel={(option) => (
                    <div className="d-flex align-items-center justify-content-between">
                      <span>{option.label}</span>
                      {option.isConfigured && (
                        <span className="badge bg-success ms-2">
                          Configured
                        </span>
                      )}
                    </div>
                  )}
                  isClearable
                  placeholder="Search and select services..."
                />
              </div>
              {ServiceFeeInflationConfig.SelectionError && (
                <label className="validation">
                  {ServiceFeeInflationConfig.SelectionError}
                </label>
              )}
            </div>

            {/* ── Inflation Rule Config ── */}
            {ServiceFeeInflationConfig.SelectedServices.length > 0 && (
              <div className="row mt-4">
                <div className="col-12 mb-2">
                  <label className="form-label">Inflation Configuration</label>
                </div>

                {/* Operator Buttons */}
                <div className="col-12 mb-3">
                  <div className="d-flex gap-2">
                    {[
                      { symbol: "+", label: "Add" },
                      { symbol: "-", label: "Subtract" },
                      { symbol: "*", label: "Markup %" },
                      { symbol: "/", label: "Discount %" },
                    ].map((op) => (
                      <button
                        key={op.symbol}
                        type="button"
                        className={`btn ${
                          ServiceFeeInflationConfig.InflationRule.operator ===
                          op.symbol
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                          setServiceFeeInflationConfig({
                            ...ServiceFeeInflationConfig,
                            InflationRule: {
                              ...ServiceFeeInflationConfig.InflationRule,
                              operator: op.symbol,
                              value: null,
                            },
                          })
                        }
                      >
                        <div>{op.symbol}</div>
                        <small>{op.label}</small>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Value Input */}
                {ServiceFeeInflationConfig.InflationRule.operator && (
                  <div className="col-md-4 col-12 mb-3">
                    <label className="form-label">
                      {ServiceFeeInflationConfig.InflationRule.operator ===
                        "+" ||
                      ServiceFeeInflationConfig.InflationRule.operator === "-"
                        ? "Amount"
                        : "Percentage (%)"}
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      placeholder={
                        ServiceFeeInflationConfig.InflationRule.operator ===
                          "+" ||
                        ServiceFeeInflationConfig.InflationRule.operator === "-"
                          ? "Enter flat amount"
                          : "Enter percentage e.g. 10"
                      }
                      value={
                        ServiceFeeInflationConfig.InflationRule.value ?? ""
                      }
                      onChange={(e) =>
                        setServiceFeeInflationConfig({
                          ...ServiceFeeInflationConfig,
                          InflationRule: {
                            ...ServiceFeeInflationConfig.InflationRule,
                            value:
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                    {ServiceFeeInflationConfig.InflationRule.value > 0 && (
                      <small className="text-muted mt-1 d-block">
                        {ServiceFeeInflationConfig.InflationRule.operator ===
                          "+" &&
                          `price + ${ServiceFeeInflationConfig.InflationRule.value}`}
                        {ServiceFeeInflationConfig.InflationRule.operator ===
                          "-" &&
                          `price − ${ServiceFeeInflationConfig.InflationRule.value}`}
                        {ServiceFeeInflationConfig.InflationRule.operator ===
                          "*" &&
                          `price × ${(1 + ServiceFeeInflationConfig.InflationRule.value / 100).toFixed(2)}`}
                        {ServiceFeeInflationConfig.InflationRule.operator ===
                          "/" &&
                          `price ÷ ${(1 + ServiceFeeInflationConfig.InflationRule.value / 100).toFixed(2)}`}
                      </small>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Submit / Delete Buttons ── */}
            {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
              <div className="col-12 text-end mt-3">
                <label className="validation">{errorMessage}</label>
                <button
                  style={{
                    fontSize: "14px",
                    marginTop: "10px",
                    marginRight: "10px",
                  }}
                  className="btn btn-primary create-item-btn"
                  onClick={() => SubmitServiceFeeInflation()}
                >
                  <span>Submit</span>
                </button>

                {/* {(ServiceFeeInflationConfig.HasExistingConfig ||
          ServiceFeeInflationConfig.SelectedServices.length > 0) && (
          <button
            className="btn btn-danger btn-sm mt-2"
            data-bs-toggle="modal"
            data-bs-target="#ConfirmModel"
            onClick={() =>
              setModelRequestData({
                Action: "DeleteServiceFeeInflationConfig",
                message:
                  "This will delete all existing service fee inflation configurations. Are you sure you want to proceed?",
              })
            }
          >
            Delete Configuration
          </button>
        )} */}
              </div>
            )}

            {/* ── Configured Rules Table ── */}
            {(() => {
              const configured =
                ServiceFeeInflationConfig.ServiceFeeInflationList.filter(
                  (s) => s.operator !== null && s.value !== null,
                );

              if (configured.length === 0) return null;

              // Group by batchID alone now — operator/value are guaranteed identical
              // within a batch (they were submitted together), and batchID is the
              // true unit of accept/delete/decline.
              const grouped = configured.reduce((acc, s) => {
                const key = s.batchID;
                if (!acc[key]) {
                  acc[key] = {
                    operator: s.operator,
                    value: s.value,
                    batchID: s.batchID,
                    isPredefined: s.isPredefined,
                    notifySAChanges: false,
                    services: [],
                  };
                }
                if (s.notifySAChanges) acc[key].notifySAChanges = true;
                acc[key].services.push({
                  serviceID: s.serviceID,
                  serviceName: s.serviceName,
                });
                return acc;
              }, {});

              const rows = Object.values(grouped);

              const operatorLabel = (op, val) => {
                if (op === "+") return `+ ${val} (flat add)`;
                if (op === "-") return `− ${val} (flat subtract)`;
                if (op === "*")
                  return `× ${(1 + val / 100).toFixed(2)} (${val}% markup)`;
                if (op === "/")
                  return `÷ ${(1 + val / 100).toFixed(2)} (${val}% discount)`;
                return `${op} ${val}`;
              };

              return (
                <div className="row mt-4">
                  <div className="col-12">
                    <label className="form-label">
                      Configured Inflation Rules
                    </label>
                    <table className="table table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "35%", color: "white" }}>
                            Inflation Rule
                          </th>
                          <th style={{ color: "white" }}>Services</th>
                          {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
                            <th
                              style={{ width: "160px", color: "white" }}
                              className="text-center"
                            >
                              Action
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.batchID}>
                            <td
                              className="align-middle"
                              style={{ fontSize: "14px" }}
                            >
                              <code className="fw-bold">
                                {operatorLabel(row.operator, row.value)}
                              </code>
                              {row.notifySAChanges && (
                                <span className="badge bg-warning text-dark ms-2">
                                  Removed by Superadmin
                                </span>
                              )}
                            </td>
                            <td
                              className="align-middle text-white"
                              style={{ fontSize: "14px" }}
                            >
                              <div className="d-flex flex-wrap gap-1">
                                {row.services.map((svc) => (
                                  <span
                                    key={svc.serviceID}
                                    className="badge bg-secondary text-white"
                                  >
                                    {svc.serviceName}
                                  </span>
                                ))}
                              </div>
                            </td>
                            {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
                              <td className="text-center align-middle">
                                {row.notifySAChanges ? (
                                  <div className="d-flex gap-1 justify-content-center">
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => {
                                        setSAConfirmStatus(true); // Accept
                                        setSAConfirmBatchID(row.batchID);
                                        $("#" + "ConfirmSAChangesModel").modal(
                                          "show",
                                        );
                                      }}
                                    >
                                      Accept &amp; Remove
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => {
                                        setSAConfirmStatus(false); // Decline
                                        setSAConfirmBatchID(row.batchID);
                                        $("#" + "ConfirmSAChangesModel").modal(
                                          "show",
                                        );
                                      }}
                                    >
                                      Decline &amp; Keep Anyway
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn btn-danger text-white btn-outline-danger btn-sm"
                                    data-bs-toggle="modal"
                                    data-bs-target="#ConfirmModel"
                                    onClick={() =>
                                      setModelRequestData({
                                        Action: "DeleteServiceFeeInflationRule",
                                        batchID: row.batchID,
                                        message: `This will delete the inflation rule. Are you sure?`,
                                      })
                                    }
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            <ConfirmSAChangesModel
              ModelId={null}
              Status={SAConfirmStatus}
              modelRequestData={{ Action: "Update" }}
              openSuccessModal={false}
              openErrorModal={false}
              UpdatedChanges={async () => {
                $("#" + "ConfirmSAChangesModel").modal("hide");
                setLoader(true);
                try {
                  const apiCall = SAConfirmStatus
                    ? AcceptServiceFeeInflationSAChanges
                    : DeclineServiceFeeInflation;

                  const response = await apiCall({
                    organisationKeyID: common.organisationKeyID,
                    userKeyID: common.userKeyID,
                    batchID: SAConfirmBatchID,
                  });

                  if (response?.data?.statusCode === 200) {
                    GetServiceFeeInflationConfigData(); // re-fetch to reflect new state
                  } else {
                    setErrorMessage(
                      response?.data?.errorMessage ||
                        "Unable to process this action.",
                    );
                  }
                } catch (error) {
                  console.error(error);
                  setErrorMessage("Unable to process this action.");
                } finally {
                  setLoader(false);
                }
              }}
            />
          </div>
        )}
      </div>
      <Footer />
      <button class="btn btn-danger btn-icon" id="back-to-top">
        <i class="ri-arrow-up-line"></i>
      </button>
      <ConfirmModel
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
        setModelRequestData={setModelRequestData}
        UpdatedStatus={
          modelRequestData.Action === "DeleteServiceFeeInflationRule"
            ? DeleteServiceFeeInflationConfig
            : null
        }
      />
      <SuccessModal
        handleClose={handleClose}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={"Update"}
        message={"Pricing setting"}
      />
    </div>
  );
};

export default Pricing_Settings;
