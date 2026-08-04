/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, isValid, format } from "date-fns";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import FilterModel from "../../components/FilterModel";
import CommonButtonComponent from "../../components/CommonButtonComponent";
import {
  GetClientList,
  DeleteClient,
  ClientChangeStatus,
  DeleteSingleApiClient,
  GetClientGlobalVariables,
  AddUpdateClientGlobalVariables,
} from "../../redux/Services/client/clientAPI";
import SuccessModal from "../../components/SuccessModal";
import ErrorModel from "../../components/ErrorModel";
import ConfirmModel from "../../components/ConfirmationBox";
import NoResultFoundModel from "../../components/NoResultFoundModel";
import PaginationComponent from "../../components/PaginationModel";
import Footer from "../../components/Footer";
import Android12Switch from "../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import RecordsAvailablePopupModel from "../../components/RecordsAvailablePopupModel";
import DeleteDriverModal from "../../components/DeleteDriverModel";
import {
  CreateXeroContactFromOutbooks,
  GetAllCachedXeroContacts,
  GetAllClientLookupList,
  ProspectConnectionAuthentication,
} from "../../redux/Services/Xero/XeroApi";
import IntegrationDialog from "./IntegrationDialog";
import {
  addContactMapping,
  fetchContactsLookup,
} from "../../redux/reducer/quickBookSlice";

const Prospects = () => {
  const lastClickRef = useRef(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let getClientsListApiCallCount = 0;
  const common = useSelector((state) => state.Storage);
  const organisationKeyID = useSelector(
    (state) => state.Storage,
  )?.organisationKeyID;
  const status = useSelector((state) => state.auth.bookkeeping);

  const activePlatform = Object.keys(status || {}).find((key) => status[key]);

  const contactsLookup = useSelector((state) => state.quickBook.contactsLookup);
  const bookkeeping = useSelector((state) => state.auth.bookkeeping);

  const [activeTab, setActiveTab] = useState("Prospect");
  const [errorMessage, setErrorMessage] = useState("");
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [singleclientList, setSingleClientList] = useState([]);
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    ProspectNameSort: null,
    ProspectTypeSort: null,
  });
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [sortType, setSortType] = useState("");
  const [totalRecords, setTotalRecords] = useState(-1);
  const {
    prospectName,
    bookKeepingGateway,
    setBookKeepingGateway,
    setLoader,
    setTopbar,
    maxCountToRecallApi,
    totalPage,
    isMobile,
    setListCount,
    listCount,
    desktopRecords,
    isMobileRecords,
    getCrudButtonTextName,
    getPlaceholderTextName,
    getCrudButtonToolTipName,
    userAccessData,
    handleErrorMessage,
    activeOrganizationSubscriptionPlan,
  } = useContext(AuthContextProvider);
  const moduleName = `${prospectName}`;
  const [currentPage, setCurrentPage] = useState(1);
  const [SingleCurrentPage, setSingleCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [SingleSearchKeyword, setSingleSearchKeyword] = useState("");
  const [businessNatureID, setBusinessNatureID] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [prospectType, setProspectType] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openDeleteDriverModel, setOpenDeleteDriverModel] =
    React.useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    clientKeyID: null,
    status: null,
    Action: "",
    clientName: null,
    userKeyID: null,
    clientExistsInModule: [],
    message: null,
    tabName: null,
  });
  const [prospectVariables, setProspectVariables] = useState([]);
  const [selectedProspectKeyID, setSelectedProspectKeyID] = useState(null);
  const [showVarModal, setShowVarModal] = useState(false);
  const [authLoadingRow, setAuthLoadingRow] = useState(null);
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [contactsLookupList, setContactsLookupList] = useState([]);
  const [contactDetails, setContactDetails] = useState();
  const [openIntegrationDialog, setOpenIntegrationDialog] = useState(false);
  const [invalidFieldIds, setInvalidFieldIds] = useState([]);
  //=====================useEffects==============================
  useEffect(() => {
    setTopbar("block");
    getClientsListData(1, null, null, null);
    getClientsListSingleApiData(1, null, null, null);
    dispatch(fetchContactsLookup({ organisationKeyID, activePlatform }));
  }, []);

  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        getClientsListData(1, null, null, null);
      } else {
        getClientsListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  useEffect(() => {
    if (shouldFetch) {
      getClientsListData(
        1,
        searchKeyword,
        primarySortDirection,
        sortType,
        null,
        null,
      );
      setShouldFetch(false);
    }
  }, [shouldFetch, searchKeyword, primarySortDirection, sortType]);

  useEffect(() => {
    if (
      modelRequestData.Action === "Update" ||
      modelRequestData.Action === "View" ||
      modelRequestData.Action === null
    ) {
      if (
        modelRequestData.Action === "Update" &&
        modelRequestData.clientKeyID !== null
      ) {
        setTopbar("none");
        navigate("/create-new-client", { state: modelRequestData });
      } else if (modelRequestData.Action === "View") {
        navigate("/view-prospects", { state: modelRequestData });
      } else if (
        modelRequestData.clientKeyID === null &&
        modelRequestData.Action === null
      ) {
        setTopbar("none");
        navigate("/create-new-client", { state: modelRequestData });
      }
    }
  }, [modelRequestData]);

  const formatNumber = (num, decimalPlaces) => {
    if (num == null || num === "") return ""; // empty safety
    const n = parseFloat(num); // ensure it's a number
    if (isNaN(n)) return "";
    const str = n.toFixed(decimalPlaces); // fix decimals
    const [intPart, fracPart] = str.split(".");
    // add commas only to integer part
    return (
      intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (decimalPlaces > 0 ? "." + fracPart : "")
    );
  };

  const parseStoredDate = (dateStr, formatStr) => {
    if (!dateStr) return null;

    try {
      const parsed = parse(dateStr, formatStr, new Date());
      return isValid(parsed) ? parsed : null;
    } catch (err) {
      console.error("Invalid date string:", dateStr, "with format:", formatStr);
      return null;
    }
  };

  const getMinDate = (blocks, formatStr) => {
    console.log(blocks);
    if (!blocks?.length) return null;
    const firstBlock = blocks[0].blocks[0];
    const fromDate = firstBlock.fromDate
      ? parseStoredDate(firstBlock.fromDate, formatStr)
      : null;
    return fromDate instanceof Date && !isNaN(fromDate) ? fromDate : null;
  };

  const getMaxDate = (blocks, formatStr) => {
    if (!blocks?.length) return null;
    const lastBlock = blocks[0]?.blocks[blocks.length - 1];
    const toDate = lastBlock.toDate
      ? parseStoredDate(lastBlock.toDate, formatStr)
      : null;
    return toDate instanceof Date && !isNaN(toDate) ? toDate : null;
  };
  
  const formatDecimalInput = (val, decimalPlaces) => {
    // Remove anything that isn't a digit or a dot
    val = val.replace(/[^0-9.]/g, "");

    if (val.startsWith(".")) {
      val = val.replace(".", "");
    }

    // Allow only one decimal point
    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }

    if (decimalPlaces === 0) {
      val = val.replace(/\./g, "");
    } else {
      // Restrict digits after the decimal point to decimalPlaces
      const [intPart, decPart] = val.split(".");
      if (decPart !== undefined) {
        val = intPart + "." + decPart.slice(0, decimalPlaces);
      }
    }

    return val;
  };

  const handleView = (item) => {};

  const getClientsListData = async (
    i,
    searchKeywordValue,
    sortValue,
    ProspectSortType,
    businessNatureId,
    businessTypeId,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetClientList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName: sortType == "" ? ProspectSortType : sortType,
        businessTypeID:
          businessTypeId == undefined ? prospectType : businessTypeId,
        businessNatureID:
          businessNatureId == undefined ? businessNatureID : businessNatureId,
        clientFor: "Outbooks",
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getClientsListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const clientList = data?.data?.responseData?.data;
            const totalCount = data.data.totalCount;
            if (pageNoList > 0 && clientList.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              getClientsListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                ProspectSortType,
              );
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setClientList(clientList);
            setTotalRecords(clientList.length);
          }
        } else {
          if (getClientsListApiCallCount < maxCountToRecallApi) {
            getClientsListApiCallCount += 1;
            setTimeout(function () {
              getClientsListData(
                i,
                searchKeywordValue,
                sortValue,
                ProspectSortType,
              );
            }, 2000);
          } else {
            setLoader(false);
          }

          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getClientsListSingleApiData = async (
    i,
    searchKeywordValue,
    sortValue,
    ProspectSortType,
    businessNatureId,
    businessTypeId,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetClientList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName: sortType == "" ? ProspectSortType : sortType,
        businessTypeID:
          businessTypeId == undefined ? prospectType : businessTypeId,
        businessNatureID:
          businessNatureId == undefined ? businessNatureID : businessNatureId,
        clientFor: "SingleApi",
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getClientsListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const clientList = data?.data?.responseData?.data;
            const totalCount = data.data.totalCount;
            if (pageNoList > 0 && clientList.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              getClientsListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                ProspectSortType,
              );
              setSingleCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setSingleClientList(clientList);
            // setTotalRecords(clientList.length);
          }
        } else {
          if (getClientsListApiCallCount < maxCountToRecallApi) {
            getClientsListApiCallCount += 1;
            setTimeout(function () {
              getClientsListSingleApiData(
                i,
                searchKeywordValue,
                sortValue,
                ProspectSortType,
              );
            }, 2000);
          } else {
            setLoader(false);
          }

          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleVariablesDataSubmit = async () => {
    try {
      debugger;
      // handle all validations
      const invalidFields = prospectVariables
        .filter((v) => {
          const type = Number(v.dataType);

          if (type === 2) {
            const val = Number(v.value);
            if (v.value === "" || isNaN(val)) return true;

            const isValid = v.quantity?.some((q) => {
              const from = Number(q.quantityFrom);
              const to = Number(q.quantityTo);

              return !isNaN(from) && !isNaN(to) && val >= from && val <= to;
            });

            return !isValid;
          }

          if (type === 4) {
            if (v.isOther) return !v.otherValue;
            return !v.value;
          }

          if (type === 3) {
            return !v.value;
          }

          return false;
        })
        .map((v) => v.globalVariableID);

      if (invalidFields.length > 0) {
        setInvalidFieldIds(invalidFields);
        return;
      }

      const payload = {
        clientKeyID: selectedProspectKeyID,
        userKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID,
        variables: prospectVariables.map((v) => ({
          prospectVariableKeyID: v.prospectVariableKeyID,
          globalPricingDriverID: v.globalVariableID,
          value: (() => {
            const resolved = v.isOther ? v.otherValue : v.value;
            return resolved !== null && resolved !== undefined
              ? String(resolved)
              : null;
          })(),
          isActive: true,
        })),
      };

      setLoader(true);
      const response = await AddUpdateClientGlobalVariables(payload);
      const result = response?.data?.responseData?.data;

      if (result) {
        setLoader(false);
        setShowVarModal(false);
        setProspectVariables([]);
        setSelectedProspectKeyID(null);
        // toast/alert success if you have one
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
    } finally {
      // setVarSubmitLoading(false);
    }
  };

  const GetClientGlobalVariablesData = async (clientKeyID) => {
    try {
      const data = await GetClientGlobalVariables(clientKeyID);
      const responseData = data?.data?.responseData?.data;

      const formatted = responseData.map((item) => ({
        globalVariableKeyID: item.globalVariableKeyID,
        globalVariableID: item.globalVariableID,
        globalVariableName: item.globalVariableName,
        dataType: item.dataType,
        value: item.value ?? "",
        variation: item.variation,
        slab: item.slab,
        text: item.text,
        date: item.date,
        quantity: item.quantity,
      }));

      const initializeVariable = (variable) => {
        const hasExistingValue =
          variable.value !== null &&
          variable.value !== undefined &&
          variable.value !== "";

        if (variable.dataType == 4 && variable.slab) {
          const hasOtherSlab = variable.slab.some(
            (item) => item.slabTypeID === 2,
          );

          if (hasExistingValue) {
            const matchedSlab = variable.slab.find((item) => {
              if (item.slabTypeID === 2) return false;
              const label = `${formatNumber(item.slabFrom, item.decimalPlaces ?? 2)} - ${formatNumber(item.slabTo, item.decimalPlaces ?? 2)}`;
              return label === variable.value;
            });

            if (matchedSlab) {
              return { ...variable, isOther: false, otherValue: "" };
            }

            const isOther = hasOtherSlab && !!variable.value;
            return {
              ...variable,
              isOther,
              otherValue: isOther ? variable.value : "",
              value: isOther ? "Other" : variable.value,
            };
          }

          // default slab fallback
          const defaultSlab = variable.slab.find((item) => item.isDefault);

          if (!defaultSlab) {
            return { ...variable, isOther: false, otherValue: "" };
          }

          if (defaultSlab.slabTypeID === 2) {
            return {
              ...variable,
              value: "Other",
              isOther: true,
              otherValue: "",
            };
          }

          const label = `${formatNumber(defaultSlab.slabFrom, defaultSlab.decimalPlaces ?? 2)} - ${formatNumber(defaultSlab.slabTo, defaultSlab.decimalPlaces ?? 2)}`;
          return { ...variable, value: label, isOther: false, otherValue: "" };
        }

        if (variable.dataType == 3 && variable.variation) {
          if (hasExistingValue) return variable;

          const defaultVariation = variable.variation.find(
            (item) => item.isDefault,
          );
          return {
            ...variable,
            value: defaultVariation ? defaultVariation.variationName : "",
          };
        }

        return variable;
      };

      let variables = formatted.map((variable) => initializeVariable(variable));
      console.log(variables);
      setProspectVariables(variables);
      setSelectedProspectKeyID(clientKeyID);
      setShowVarModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  
  // 2) On Click Client Edit Button
  const ClientEditBtnClicked = (prospect) => {
    setModelRequestData({
      ...modelRequestData,
      clientName: prospect.clientName,
      clientKeyID: prospect.clientKeyID, // Change ClientKeyID to clientKeyID
      Action: "Update",
    });
  };

  // Update Function Modal
  // 2) On Click Service Category Status Button
  const ClientDeleteData = async () => {
    setLoader(true);

    if (modelRequestData.Action === "Delete") {
      try {
        if (selectedRows.length !== 0) {
          const data = await DeleteSingleApiClient({
            userKeyID: common.userKeyID,
            clientKeyIDs: selectedRows,
          });
          if (data?.data?.statusCode === 200) {
            setLoader(false);
            // debugger;
            let clientExistsInModule =
              data.data.responseData.clientExistsInModule;

            if (clientExistsInModule.length > 0) {
              // moduleList.map()
              setModelRequestData({
                ...modelRequestData,
                Action: "ClientDelete",
                message: `Cannot delete ${prospectName} as it already have linked records.`,
                clientExistsInModule: clientExistsInModule,
              });
              $("#" + "DeleteDriverModel").modal("show");
              $("#" + "ConfirmModel").modal("hide");
            } else {
              setOpenSuccessModal(true);
              getClientsListSingleApiData(currentPage);
            }
          } else {
            setLoader(false);
            setErrorMessage(data?.data?.errorMessage);
            setOpenErrorModal(true);
          }
        } else {
          const Data = await DeleteClient(
            modelRequestData.clientKeyID,
            modelRequestData.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              setOpenSuccessModal(true);
            } else {
              if (Data?.response?.data?.errorMessage.includes("Prospect")) {
                let ErrorMessage = Data?.response?.data?.errorMessage;
                ErrorMessage = ErrorMessage.replace("Prospect", prospectName);
                setErrorMessage(ErrorMessage);
              } else {
                setErrorMessage(Data?.response?.data?.errorMessage);
              }
              setOpenErrorModal(true);
            }
            getClientsListData(currentPage);
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Status") {
      try {
        const Data = await ClientChangeStatus(
          modelRequestData.clientKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            setOpenSuccessModal(true);
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
        }
        if (modelRequestData.tabName === "API Prospect") {
          getClientsListSingleApiData(currentPage);
        } else {
          getClientsListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Redirect") {
      const now = Date.now();

      // Throttle (1.5 sec)
      if (now - lastClickRef.current < 1500) return;
      lastClickRef.current = now;

      try {
        setAuthLoadingRow(modelRequestData.clientKeyID);
        const res = await ProspectConnectionAuthentication(
          organisationKeyID,
          modelRequestData.clientKeyID,
          activePlatform,
        );

        if (res?.status === 200) {
          const url = res.data.connectionUrl;
          window.open(url, "_blank", "noopener,noreferrer");
          setOpenSuccessModal(true);
        } else {
          console.log("res", res);
          setOpenErrorModal(true);
          setErrorMessage(res.response.data.message);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setAuthLoadingRow(null);

        setLoader(false);
      }
    } else if (modelRequestData.Action === "Add Contact") {
      const now = Date.now();

      // Throttle (1.5 sec)
      if (now - lastClickRef.current < 1500) return;
      lastClickRef.current = now;

      try {
        setAuthLoadingRow(modelRequestData.clientKeyID);
        const res = await CreateXeroContactFromOutbooks(
          { clientKeyId: modelRequestData.clientKeyID },
          organisationKeyID,
          activePlatform,
        );

        if (res?.status === 201) {
          // const url = res.data.connectionUrl;
          // window.open(url, "_blank", "noopener,noreferrer");
          setOpenSuccessModal(true);
          setModelRequestData({
            ...modelRequestData,
            Action: "AddContact",
            message: "Record added successfully",
          });
          dispatch(fetchContactsLookup({ organisationKeyID, activePlatform }));
        } else {
          console.log("res", res);
          setOpenErrorModal(true);
          setErrorMessage(res.response.data.message);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setAuthLoadingRow(null);

        setLoader(false);
      }
    } else if (modelRequestData.Action === "Add Contact Mapping") {
      debugger;
      const payload =
        activePlatform === "Xero"
          ? {
              xeroContactId: contactDetails?.value || null,
              clientId: modelRequestData?.clientID || null,
              // userId:
              organisationKeyId: organisationKeyID,
              activePlatform,
            }
          : {
              qbCustomerId: contactDetails?.value || null,
              clientId: modelRequestData?.clientID || null,
              //userId: 1
              organisationKeyId: organisationKeyID,
              activePlatform,
            };
      dispatch(addContactMapping({ ...payload }))
        .unwrap()
        .then((res) => {
          setOpenSuccessModal(true);
        })
        .catch((err) => {
          setErrorMessage(err?.error || "Something went wrong");
          setOpenErrorModal(true);
        })
        .finally(() => {
          setLoader(false);
        });
    }
  };

  // E] Sorting & handle Function
  const handleSort = (sortValue, ProspectSortType) => {
    if (ProspectSortType == "ClientName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProspectNameSort: sortValue,
      });
      setCurrentPage(1);
      getClientsListData(1, searchKeyword, sortValue, ProspectSortType);
    } else if (ProspectSortType == "ClientType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProspectTypeSort: sortValue,
      });
      setCurrentPage(1);
      getClientsListData(1, searchKeyword, sortValue, ProspectSortType);
    }
  };
  const handleViewProspectDetails = (Prospect) => {
    setModelRequestData({
      ...modelRequestData,
      clientKeyID: Prospect.clientKeyID, // Change ClientKeyID to clientKeyID
      Action: "View",
    });
  };

  const AddClientBtn = () => {
    setModelRequestData({
      ...modelRequestData,
      clientKeyID: null, // Change ClientKeyID to clientKeyID
      Action: null,
    });
  };

  const handleClose = () => {
    setModelRequestData({
      clientKeyID: null,
      Action: "",
      clientName: null,
    });
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const handleSearch = (e, tab) => {
    const searchKeywordValue = e.target.value;
    if (tab === "Prospect") {
      setSearchKeyword(searchKeywordValue);
      setCurrentPage(1);
      getClientsListData(1, searchKeywordValue);
    } else {
      setSingleSearchKeyword(searchKeywordValue);
      setSingleCurrentPage(1);
      getClientsListSingleApiData(1, searchKeywordValue);
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await getClientsListData(pageNumber); // Call your function with the selected page number
  };

  const TabHandle = (tab) => {
    if (tab === "Web Prospect") {
      setActiveTab(tab);
      getClientsListSingleApiData(1);
    } else {
      setActiveTab(tab);
      getClientsListData(1);
    }
  };
 

  const ApplyFilter = () => {
    if (
      (businessNatureID !== null && businessNatureID !== "") ||
      (prospectType !== null && prospectType !== "")
    ) {
      setIsFilterApply(true);
    } else {
      setIsFilterApply(false);
    }
    getClientsListData(
      1,
      searchKeyword,
      primarySortDirection,
      sortType,
      businessNatureID,
      prospectType,
    );
  };
  const ClearFilter = () => {
    setIsFilterApply(false);
    setBusinessNatureID(null);
    setProspectType(null);
    setShouldFetch(true);
  };

  const visibleRows = singleclientList.slice(
    0,
    isMobile ? isMobileRecords : desktopRecords,
  );

  const handleRowSelect = (clientKeyID) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(clientKeyID)
        ? prevSelected.filter((id) => id !== clientKeyID)
        : [...prevSelected, clientKeyID],
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === visibleRows.length) {
      setSelectedRows([]); // Deselect all
    } else {
      setSelectedRows(visibleRows.map((item) => item.clientKeyID)); // Select all
    }
  };
  const handleCloseDeleteProspect = () => {
    $("#" + "DeleteDriverModel").modal("hide");
    $("#" + "ConfirmModel").modal("hide");
    setOpenDeleteDriverModel(false);
  };

  return (
    <>
      <div className="container-fluid">
        {/* <div class="main-content"> */}
        <div class="services page-background">
          <div class="">
            <div class="row">
              <div class="col-lg-12">
                <div class="card">
                  {/* end card header  */}
                  <div class="card-body mb-2">
                    <div id="customerList" style={{ marginTop: "3rem" }}>
                      <div class="bg-light border-bottom px-2">
                        {/* <div className="container"> */}
                        <div className="row">
                          <div className="col-md-12 p-0">
                            <ul className="nav nav-tabs" role="tablist">
                              <li className="nav-item">
                                <a
                                  className={`nav-link tab_nav ${
                                    activeTab === "Prospect" ? "active" : ""
                                  }`}
                                  data-bs-toggle="tab"
                                  href="#Prospect"
                                  role="tab"
                                  aria-selected={activeTab === "Prospect"}
                                  onClick={() => {
                                    setActiveTab("Prospect");
                                    TabHandle("Prospect");
                                  }}
                                >
                                  <b>{moduleName} </b>
                                </a>
                              </li>
                              {singleclientList?.length > 0 && (
                                <li className="nav-item">
                                  <a
                                    className={`nav-link tab_nav ${
                                      activeTab === "Web Prospect"
                                        ? "active"
                                        : ""
                                    }`}
                                    data-bs-toggle="tab"
                                    href="#Web Prospect"
                                    role="tab"
                                    aria-selected={activeTab === "Web Prospect"}
                                    onClick={() => TabHandle("Web Prospect")}
                                  >
                                    <b>API {moduleName}</b>
                                  </a>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                        {/* </div> */}
                      </div>
                      {/* <div class="row g-4"></div> */}
                      <div class="table-responsive table-card mb-3 mt-2 table-padding">
                        <div className="row">
                          {/* <div class="col-md-3 col-lg-3 col-12  mb-2"> */}
                          {activeTab === "Web Prospect" && (
                            <div class="col-md-3 col-lg-3 col-12  mb-2">
                              <div className="d-flex justify-content-between">
                                <div
                                  class="search-box col-md-3 col-3 width-searchbox me-2"
                                  style={{}}
                                >
                                  <i className="ri-search-line search-icon"></i>
                                  <input
                                    type="text"
                                    class="form-control search"
                                    value={SingleSearchKeyword}
                                    onChange={(e) => {
                                      handleSearch(e, "Web");
                                    }}
                                    placeholder={
                                      isMobile
                                        ? "Search"
                                        : getPlaceholderTextName(
                                            "Search",
                                            moduleName,
                                          )
                                    }
                                  />
                                </div>

                                <div className=" ">
                                  <Tooltip
                                    title={getCrudButtonToolTipName(
                                      "Delete Selcted",
                                      prospectName,
                                    )}
                                  >
                                    <div>
                                      <button
                                        className={
                                          selectedRows.length !== 0
                                            ? "btn btn-md btn-success create-item-btn filter me-2"
                                            : "btn btn-md btn-success create-item-btn-apply filter me-2"
                                        }
                                        disabled={selectedRows.length === 0}
                                        data-bs-toggle="modal"
                                        data-bs-target="#ConfirmModel"
                                        onClick={() =>
                                          setModelRequestData({
                                            ...modelRequestData,
                                            Action: "Delete",
                                          })
                                        }
                                      >
                                        <i
                                          className={
                                            selectedRows.length !== 0
                                              ? "ri-delete-bin-5-fill align-bottom "
                                              : "ri-delete-bin-5-fill align-bottom Filter-apply-color"
                                          }
                                        ></i>
                                      </button>
                                    </div>
                                  </Tooltip>
                                </div>
                              </div>{" "}
                            </div>
                          )}

                          {activeTab === "Prospect" && (
                            <div class="col-md-3 col-lg-3 col-3  mb-2">
                              <div className="d-flex justify-content-start">
                                <div
                                  class="search-box  width-searchbox "
                                  id="w-100"
                                  style={{ marginRight: "10px" }}
                                >
                                  <i className="ri-search-line search-icon"></i>
                                  <input
                                    type="text"
                                    class="form-control search"
                                    value={searchKeyword}
                                    onChange={(e) => {
                                      handleSearch(e, "Prospect");
                                    }}
                                    placeholder={
                                      isMobile
                                        ? "Search"
                                        : getPlaceholderTextName(
                                            "Search",
                                            moduleName,
                                          )
                                    }
                                  />
                                </div>
                                <div className=" d-flex align-items-start justify-content-start ">
                                  {/* <Tooltip
                                    title={getCrudButtonToolTipName(
                                      "Export",
                                      moduleName
                                    )}
                                  >
                                    <div>
                                      <button
                                        class="btn btn-md btn-success create-item-btn-apply filter me-2"
                                        onClick={handleExport}
                                      >
                                        {/* <i class="ri-pencil-fill"></i> */}
                                  {/* <span
                                          style={{
                                            marginRight: "0px",
                                            width: "42px",
                                            fontSize: "15px",
                                          }}
                                        ></span>
                                        <i class="ri-file-excel-2-fill  Filter-apply-color"></i>
                                      </button>
                                    </div>
                                  </Tooltip> */}
                                  <Tooltip
                                    title={getCrudButtonToolTipName(
                                      "Filter",
                                      moduleName,
                                    )}
                                  >
                                    <div>
                                      <button
                                        className={
                                          isFilterApply
                                            ? "btn btn-md btn-success create-item-btn filter me-2"
                                            : "btn btn-md btn-success create-item-btn-apply filter me-2"
                                        }
                                        data-bs-toggle="modal"
                                        data-bs-target="#FilterModel"
                                      >
                                        <i
                                          className={
                                            isFilterApply
                                              ? "ri-filter-fill align-bottom "
                                              : "ri-filter-fill align-bottom Filter-apply-color"
                                          }
                                        ></i>
                                      </button>
                                    </div>
                                  </Tooltip>
                                  {isFilterApply ? (
                                    <Tooltip title={"Clear Filter"}>
                                      <div>
                                        <button
                                          className="btn btn-md btn-success create-Filter-item-btn "
                                          onClick={ClearFilter} // Corrected from onclick to onClick
                                        >
                                          <span className="text-nowrap">
                                            Clear Filter
                                          </span>
                                        </button>
                                      </div>
                                    </Tooltip>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {activeTab === "Web Prospect" && (
                            <div className="d-flex justify-content-start"></div>
                          )}
                          {/* </div> */}
                          {activeTab === "Prospect" && (
                            <div className="col-lg-9 col-md-9 col-3 text-nowrap mb-2">
                              <div className="d-flex justify-content-end align-items-center gap-2">
                                <div style={{ minWidth: "200px" }}>
                                  <Select
                                    className="user-role-select"
                                    options={contactsLookup}
                                    getOptionLabel={(e) => e.label}
                                    getOptionValue={(e) => e.value}
                                    onChange={(selectedOption) => {
                                      setContactDetails(selectedOption);
                                    }}
                                  />
                                </div>

                                <div>
                                  {userAccessData.Admin_Prospect_CanAdd && (
                                    <CommonButtonComponent
                                      title={getCrudButtonToolTipName(
                                        "Add",
                                        moduleName,
                                      )}
                                      AddBtn={() => AddClientBtn()}
                                      name={getCrudButtonTextName(
                                        "Add",
                                        moduleName,
                                      )}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Table Of Template and Template Pdf */}
                        <div
                          className={`tab-pane ${
                            activeTab === "Web Prospect" ? "active" : ""
                          }`}
                          id="base-justified-home"
                        >
                          {activeTab === "Web Prospect" && (
                            <table
                              class="table align-middle table-nowrap"
                              id="customerTable"
                            >
                              <thead class="table-light table-header-font">
                                <tr className="head-row">
                                  <td
                                    className="tr-table-class text-white"
                                    style={{ width: "30%" }}
                                  >
                                    <input
                                      type="checkbox"
                                      className="me-2"
                                      checked={
                                        selectedRows.length ===
                                        visibleRows.length
                                      }
                                      onChange={handleSelectAll}
                                    />
                                    {prospectName} Name{" "}
                                    {primarySortDirectionObj.ProspectNameSort ===
                                      "desc" && (
                                      <i
                                        onClick={() => {
                                          setSortType("ClientName");
                                          handleSort("asc", "ClientName");
                                        }}
                                        style={{ cursor: "pointer" }}
                                        class="fas fa-sort-alpha-up ml-1"
                                      ></i>
                                    )}
                                    {(primarySortDirectionObj.ProspectNameSort ===
                                      null ||
                                      primarySortDirectionObj.ProspectNameSort ===
                                        "asc") && (
                                      <i
                                        onClick={() => {
                                          setSortType("ClientName");
                                          handleSort(
                                            primarySortDirectionObj.ProspectNameSort ===
                                              null
                                              ? "asc"
                                              : "desc",
                                            "ClientName",
                                          );
                                        }}
                                        style={{ cursor: "pointer" }}
                                        class="fas fa-sort-alpha-down ml-1"
                                      ></i>
                                    )}
                                  </td>
                                  <td className="tr-table-class text-white">
                                    Email
                                  </td>
                                  <td className="tr-table-class text-white">
                                    {prospectName} Type{" "}
                                    {primarySortDirectionObj.ProspectTypeSort ===
                                      "desc" && (
                                      <i
                                        onClick={() => {
                                          setSortType("ClientType");
                                          handleSort("asc", "ClientType");
                                        }}
                                        style={{ cursor: "pointer" }}
                                        class="fas fa-sort-alpha-up ml-1"
                                      ></i>
                                    )}
                                    {(primarySortDirectionObj.ProspectTypeSort ===
                                      null ||
                                      primarySortDirectionObj.ProspectTypeSort ===
                                        "asc") && (
                                      <i
                                        onClick={() => {
                                          setSortType("ClientType");
                                          handleSort(
                                            primarySortDirectionObj.ProspectTypeSort ===
                                              null
                                              ? "asc"
                                              : "desc",
                                            "ClientType",
                                          );
                                        }}
                                        style={{ cursor: "pointer" }}
                                        class="fas fa-sort-alpha-down ml-1"
                                      ></i>
                                    )}
                                  </td>
                                  <td className="tr-table-class text-white">
                                    Status
                                  </td>
                                  <td className="tr-table-class text-white">
                                    {userAccessData.Admin_Prospect_CanView && (
                                      <>Action</>
                                    )}
                                  </td>
                                </tr>
                              </thead>
                              <tbody class="list form-check-all">
                                {singleclientList
                                  .slice(
                                    0,
                                    isMobile ? isMobileRecords : desktopRecords,
                                  )
                                  .map((Prospect) => {
                                    const emailArray = Prospect.emailID
                                      ? Prospect.emailID.split(", ")
                                      : [];
                                    const displayEmail =
                                      emailArray.length > 0
                                        ? emailArray[0]
                                        : "";
                                    const hasMoreEmails = emailArray.length > 1;
                                    return (
                                      <>
                                        <tr
                                          class="table_new"
                                          key={Prospect.clientID}
                                        >
                                          <td className="table-content-font">
                                            <input
                                              type="checkbox"
                                              checked={selectedRows.includes(
                                                Prospect.clientKeyID,
                                              )}
                                              onChange={() =>
                                                handleRowSelect(
                                                  Prospect.clientKeyID,
                                                )
                                              }
                                            />
                                            {Prospect.clientName}
                                          </td>
                                          <td className="table-content-font">
                                            {/* {Prospect.emailID}
                                             */}

                                            {hasMoreEmails ? (
                                              <Tooltip
                                                title={Prospect.emailID}
                                                arrow
                                              >
                                                <span>
                                                  {displayEmail}{" "}
                                                  <strong>...</strong>
                                                </span>
                                              </Tooltip>
                                            ) : (
                                              <span>{displayEmail}</span>
                                            )}
                                          </td>
                                          <td className="table-content-font">
                                            {Prospect.businessTypeName}
                                          </td>
                                          <td className="Switch">
                                            <div
                                              style={{ alignItems: "none" }}
                                              class="d-flex gap-2 "
                                            >
                                              <div style={{ width: "50px" }}>
                                                {" "}
                                                {Prospect.statusName}
                                              </div>
                                              {userAccessData.Admin_Prospect_CanDelete &&
                                                activeOrganizationSubscriptionPlan.apiIntegration && (
                                                  <Tooltip
                                                    title={getCrudButtonToolTipName(
                                                      "Change Status",
                                                    )}
                                                  >
                                                    <FormGroup>
                                                      <FormControlLabel
                                                        control={
                                                          <Android12Switch
                                                            onClick={() =>
                                                              setModelRequestData(
                                                                {
                                                                  ...modelRequestData,
                                                                  status:
                                                                    Prospect.statusName,
                                                                  clientKeyID:
                                                                    Prospect.clientKeyID,
                                                                  clientName:
                                                                    Prospect.clientName,
                                                                  userKeyID:
                                                                    common.userKeyID,
                                                                  Action:
                                                                    "Status",
                                                                  tabName:
                                                                    "API Prospect",
                                                                },
                                                              )
                                                            }
                                                            checked={
                                                              Prospect.statusName ===
                                                              "Active"
                                                            }
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#ConfirmModel"
                                                          />
                                                        }
                                                      />
                                                    </FormGroup>
                                                  </Tooltip>
                                                )}
                                            </div>
                                          </td>
                                          <td>
                                            <div class="d-flex gap-2">
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  "View",
                                                  moduleName,
                                                )}
                                              >
                                                <div class="view">
                                                  <button
                                                    class="btn btn-md btn-success create-item-btn view"
                                                    onClick={() =>
                                                      handleViewProspectDetails(
                                                        Prospect,
                                                      )
                                                    }
                                                  >
                                                    <span
                                                      style={{
                                                        marginRight: "4px",
                                                      }}
                                                    >
                                                      View
                                                    </span>
                                                    <i class="bi bi-eye"></i>
                                                  </button>
                                                </div>
                                              </Tooltip>

                                              {userAccessData.Admin_Prospect_CanEdit &&
                                                activeOrganizationSubscriptionPlan.apiIntegration && (
                                                  <Tooltip
                                                    title={getCrudButtonToolTipName(
                                                      "Update",
                                                      moduleName,
                                                    )}
                                                  >
                                                    <div class="edit">
                                                      <button
                                                        class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                        onClick={() =>
                                                          ClientEditBtnClicked(
                                                            Prospect,
                                                          )
                                                        }
                                                      >
                                                        <i class="ri-pencil-fill"></i>
                                                      </button>
                                                    </div>
                                                  </Tooltip>
                                                )}
                                              {userAccessData.Admin_Prospect_CanDelete &&
                                                activeOrganizationSubscriptionPlan.apiIntegration && (
                                                  <Tooltip
                                                    title={getCrudButtonToolTipName(
                                                      "Delete",
                                                      moduleName,
                                                    )}
                                                  >
                                                    <div class="remove">
                                                      <button
                                                        class="btn btn-sm btn-danger remove-item-btn actionButtonsStyle"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#ConfirmModel"
                                                        onClick={() =>
                                                          setModelRequestData({
                                                            ...modelRequestData,
                                                            clientKeyID:
                                                              Prospect.clientKeyID,
                                                            clientName:
                                                              Prospect.clientName,
                                                            userKeyID:
                                                              common.userKeyID,
                                                            Action: "Delete",
                                                          })
                                                        }
                                                      >
                                                        <i class="ri-delete-bin-5-fill"></i>
                                                      </button>
                                                    </div>
                                                  </Tooltip>
                                                )}
                                            </div>
                                          </td>
                                        </tr>
                                      </>
                                    );
                                  })}
                              </tbody>
                            </table>
                          )}
                        </div>
                        <div
                          className={`tab-pane ${
                            activeTab === "Prospect" ? "active" : ""
                          }`}
                          id="base-justified-home"
                        >
                          {activeTab === "Prospect" && (
                            <table
                              class="table align-middle table-nowrap"
                              id="customerTable"
                            >
                              <thead class="table-light table-header-font">
                                <tr className="head-row">
                                  <td
                                    className="tr-table-class text-white"
                                    style={{ width: "30%" }}
                                  >
                                    {prospectName} Name{" "}
                                    {primarySortDirectionObj.ProspectNameSort ===
                                      "desc" && (
                                      <i
                                        onClick={() => {
                                          setSortType("ClientName");
                                          handleSort("asc", "ClientName");
                                        }}
                                        style={{ cursor: "pointer" }}
                                        class="fas fa-sort-alpha-up ml-1"
                                      ></i>
                                    )}
                                    {(primarySortDirectionObj.ProspectNameSort ===
                                      null ||
                                      primarySortDirectionObj.ProspectNameSort ===
                                        "asc") && (
                                      <i
                                        onClick={() => {
                                          setSortType("ClientName");
                                          handleSort(
                                            primarySortDirectionObj.ProspectNameSort ===
                                              null
                                              ? "asc"
                                              : "desc",
                                            "ClientName",
                                          );
                                        }}
                                        style={{ cursor: "pointer" }}
                                        class="fas fa-sort-alpha-down ml-1"
                                      ></i>
                                    )}
                                  </td>
                                  <td className="tr-table-class text-white">
                                    Email
                                  </td>
                                  <td className="tr-table-class text-white">
                                    {prospectName} Type{" "}
                                    {primarySortDirectionObj.ProspectTypeSort ===
                                      "desc" && (
                                      <i
                                        onClick={() => {
                                          setSortType("ClientType");
                                          handleSort("asc", "ClientType");
                                        }}
                                        style={{ cursor: "pointer" }}
                                        class="fas fa-sort-alpha-up ml-1"
                                      ></i>
                                    )}
                                    {(primarySortDirectionObj.ProspectTypeSort ===
                                      null ||
                                      primarySortDirectionObj.ProspectTypeSort ===
                                        "asc") && (
                                      <i
                                        onClick={() => {
                                          setSortType("ClientType");
                                          handleSort(
                                            primarySortDirectionObj.ProspectTypeSort ===
                                              null
                                              ? "asc"
                                              : "desc",
                                            "ClientType",
                                          );
                                        }}
                                        style={{ cursor: "pointer" }}
                                        class="fas fa-sort-alpha-down ml-1"
                                      ></i>
                                    )}
                                  </td>
                                  <td className="tr-table-class text-white">
                                    Status
                                  </td>
                                  <td className="tr-table-class text-white">
                                    {userAccessData.Admin_Prospect_CanView && (
                                      <>Action</>
                                    )}
                                  </td>
                                </tr>
                              </thead>
                              <tbody class="list form-check-all">
                                {clientList
                                  .slice(
                                    0,
                                    isMobile ? isMobileRecords : desktopRecords,
                                  )
                                  .map((Prospect) => {
                                    const emailArray = Prospect.emailID
                                      ? Prospect.emailID.split(", ")
                                      : [];
                                    const displayEmail =
                                      emailArray.length > 0
                                        ? emailArray[0]
                                        : "";
                                    const hasMoreEmails = emailArray.length > 1;
                                    return (
                                      <>
                                        <tr
                                          class="table_new"
                                          key={Prospect.clientID}
                                        >
                                          <td className="table-content-font">
                                            {Prospect.clientName}
                                          </td>
                                          <td className="table-content-font">
                                            {/* {Prospect.emailID}
                                             */}

                                            {hasMoreEmails ? (
                                              <Tooltip
                                                title={Prospect.emailID}
                                                arrow
                                              >
                                                <span>
                                                  {displayEmail}{" "}
                                                  <strong>...</strong>
                                                </span>
                                              </Tooltip>
                                            ) : (
                                              <span>{displayEmail}</span>
                                            )}
                                          </td>
                                          <td className="table-content-font">
                                            {Prospect.businessTypeName}
                                          </td>
                                          <td className="Switch">
                                            <div
                                              style={{ alignItems: "none" }}
                                              class="d-flex gap-2 "
                                            >
                                              <div style={{ width: "50px" }}>
                                                {" "}
                                                {Prospect.statusName}
                                              </div>
                                              {userAccessData.Admin_Prospect_CanDelete && (
                                                <Tooltip
                                                  title={getCrudButtonToolTipName(
                                                    "Change Status",
                                                  )}
                                                >
                                                  <FormGroup>
                                                    <FormControlLabel
                                                      control={
                                                        <Android12Switch
                                                          onClick={() =>
                                                            setModelRequestData(
                                                              {
                                                                ...modelRequestData,
                                                                status:
                                                                  Prospect.statusName,
                                                                clientKeyID:
                                                                  Prospect.clientKeyID,
                                                                clientName:
                                                                  Prospect.clientName,
                                                                userKeyID:
                                                                  common.userKeyID,
                                                                Action:
                                                                  "Status",
                                                              },
                                                            )
                                                          }
                                                          checked={
                                                            Prospect.statusName ===
                                                            "Active"
                                                          }
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                        />
                                                      }
                                                    />
                                                  </FormGroup>
                                                </Tooltip>
                                              )}
                                            </div>
                                          </td>
                                          {/* <td>
                                            <div class="d-flex gap-2">
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  "View",
                                                  moduleName,
                                                )}
                                              >
                                                <div class="view">
                                                  <button
                                                    class="btn btn-md btn-success create-item-btn view"
                                                    onClick={() =>
                                                      handleViewProspectDetails(
                                                        Prospect,
                                                      )
                                                    }
                                                  >
                                                    <span
                                                      style={{
                                                        marginRight: "4px",
                                                      }}
                                                    >
                                                      View
                                                    </span>
                                                    <i class="bi bi-eye"></i>
                                                  </button>
                                                </div>
                                              </Tooltip>

                                              {userAccessData.Admin_Prospect_CanEdit && (
                                                <Tooltip
                                                  title={getCrudButtonToolTipName(
                                                    "Update",
                                                    moduleName,
                                                  )}
                                                >
                                                  <div class="edit">
                                                    <button
                                                      class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                      onClick={() =>
                                                        ClientEditBtnClicked(
                                                          Prospect,
                                                        )
                                                      }
                                                    >
                                                      <i class="ri-pencil-fill"></i>
                                                    </button>
                                                  </div>
                                                </Tooltip>
                                              )}
                                              {userAccessData.Admin_Prospect_CanDelete && (
                                                <Tooltip
                                                  title={getCrudButtonToolTipName(
                                                    `Delete ${prospectName}`,
                                                  )}
                                                >
                                                  <div class="remove">
                                                    <button
                                                      class="btn btn-sm btn-danger remove-item-btn actionButtonsStyle"
                                                      data-bs-toggle="modal"
                                                      data-bs-target="#ConfirmModel"
                                                      onClick={() =>
                                                        setModelRequestData({
                                                          ...modelRequestData,
                                                          clientKeyID:
                                                            Prospect.clientKeyID,
                                                          clientName:
                                                            Prospect.clientName,
                                                          userKeyID:
                                                            common.userKeyID,
                                                          Action: "Delete",
                                                        })
                                                      }
                                                    >
                                                      <i class="ri-delete-bin-5-fill"></i>
                                                    </button>
                                                  </div>
                                                </Tooltip>
                                              )}

                                              <Tooltip
                                                title={getCrudButtonToolTipName(`Authenticate with Xero`)}
                                              >
                                                <div className="remove">
                                                  <button
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#ConfirmModel"
                                                    className="btn btn-sm btn-success edit-item-btn actionButtonsStyle d-flex align-items-center justify-content-center"
                                                    onClick={() => {
                                                      setModelRequestData({
                                                        ...modelRequestData,
                                                        Action: "Redirect",
                                                        clientKeyID: Prospect.clientKeyID
                                                      })
                                                      // handleAuthenticateXero(Prospect)
                                                    }}
                                                    disabled={authLoadingRow === Prospect.clientKeyID}
                                                  >
                                                    {authLoadingRow === Prospect.clientKeyID ? (
                                                      <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                      <i className="ri-links-line"></i>
                                                    )}
                                                  </button>
                                                </div>
                                              </Tooltip>

                                              <Tooltip
                                                title={getCrudButtonToolTipName(`Migrate with Xero`)}
                                              >
                                                <div className="add">
                                                  <button
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#ConfirmModel"
                                                    className="btn btn-sm btn-success edit-item-btn actionButtonsStyle d-flex align-items-center justify-content-center"
                                                    onClick={() => {
                                                      setModelRequestData({
                                                        ...modelRequestData,
                                                        Action: "Add Contact",
                                                        clientKeyID: Prospect.clientKeyID
                                                      })

                                                    }}
                                                    disabled={authLoadingRow === Prospect.clientKeyID}
                                                  >
                                                    {authLoadingRow === Prospect.clientKeyID ? (
                                                      <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                      <i className="ri-file-transfer-line"></i>
                                                    )}
                                                  </button>
                                                </div>
                                              </Tooltip>

                                            </div>
                                          </td> */}

                                          <td className="table-content-font">
                                            <div className="d-flex gap-2">
                                              <div className="dropdown">
                                                <button
                                                  className="btn btn-md btn-success create-item-btn"
                                                  type="button"
                                                  data-bs-toggle="dropdown"
                                                  aria-expanded="false"
                                                >
                                                  <span>
                                                    Actions <ExpandMoreIcon />
                                                  </span>
                                                </button>

                                                <ul
                                                  className="dropdown-menu"
                                                  aria-labelledby="dropdownMenuButton"
                                                  style={{ fontSize: "12px" }}
                                                >
                                                  {/* View */}
                                                  <li>
                                                    <a
                                                      className="dropdown-item cursor-pointer"
                                                      onClick={() =>
                                                        handleViewProspectDetails(
                                                          Prospect,
                                                        )
                                                      }
                                                    >
                                                      <i className="bi bi-eye me-2"></i>
                                                      View
                                                    </a>
                                                  </li>

                                                  {/* Edit */}
                                                  {userAccessData.Admin_Prospect_CanEdit && (
                                                    <li>
                                                      <a
                                                        className="dropdown-item cursor-pointer"
                                                        onClick={() =>
                                                          ClientEditBtnClicked(
                                                            Prospect,
                                                          )
                                                        }
                                                      >
                                                        <span className="d-flex">
                                                          {" "}
                                                          <i className="ri-pencil-fill me-2"></i>
                                                          Edit
                                                        </span>
                                                      </a>
                                                    </li>
                                                  )}

                                                  {/* prospect variables start */}
                                                  <li>
                                                    {/* <Tooltip title={`Edit ${proposalName}`} placement="right"> */}
                                                    <a
                                                      className="dropdown-item"
                                                      onClick={() => {
                                                        GetClientGlobalVariablesData(
                                                          Prospect.clientKeyID,
                                                        );
                                                      }}
                                                    >
                                                      <i
                                                        className="ri-user-fill"
                                                        style={{
                                                          marginRight: "2px",
                                                        }}
                                                      ></i>{" "}
                                                      {prospectName} Variables
                                                    </a>
                                                    {/* </Tooltip> */}
                                                  </li>
                                                  {/* prospect variables end  */}
                                                  {/* Delete */}
                                                  {userAccessData.Admin_Prospect_CanDelete && (
                                                    <li>
                                                      <a
                                                        className="dropdown-item cursor-pointer"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#ConfirmModel"
                                                        onClick={() =>
                                                          setModelRequestData({
                                                            ...modelRequestData,
                                                            clientKeyID:
                                                              Prospect.clientKeyID,
                                                            clientName:
                                                              Prospect.clientName,
                                                            userKeyID:
                                                              common.userKeyID,
                                                            Action: "Delete",
                                                          })
                                                        }
                                                      >
                                                        <span className="d-flex">
                                                          {" "}
                                                          <i className="ri-delete-bin-5-fill me-2"></i>
                                                          Delete
                                                        </span>
                                                      </a>
                                                    </li>
                                                  )}

                                                  {/* Authenticate Xero */}
                                                  {bookkeeping &&
                                                    Object.values(
                                                      bookkeeping,
                                                    ).some((val) => val) && (
                                                      <li>
                                                        <a
                                                          className="dropdown-item cursor-pointer"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                          onClick={() =>
                                                            setModelRequestData(
                                                              {
                                                                ...modelRequestData,
                                                                Action:
                                                                  "Redirect",
                                                                clientKeyID:
                                                                  Prospect.clientKeyID,
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <span className="d-flex">
                                                            {" "}
                                                            <i className="ri-links-line me-2"></i>
                                                            Connect To{" "}
                                                            {activePlatform ||
                                                              ""}
                                                          </span>
                                                        </a>
                                                      </li>
                                                    )}

                                                  {/* Migrate Xero */}

                                                  {bookkeeping &&
                                                    Object.values(
                                                      bookkeeping,
                                                    ).some((val) => val) && (
                                                      <li>
                                                        <a
                                                          className="dropdown-item cursor-pointer"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                          onClick={() =>
                                                            setModelRequestData(
                                                              {
                                                                ...modelRequestData,
                                                                Action:
                                                                  "Add Contact",
                                                                clientKeyID:
                                                                  Prospect.clientKeyID,
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <span className="d-flex">
                                                            {" "}
                                                            <i className="ri-file-transfer-line me-2"></i>
                                                            {`Add To ${activePlatform || ""}`}
                                                          </span>
                                                        </a>
                                                      </li>
                                                    )}

                                                  {/* <li>
                                                    <a
                                                      className="dropdown-item"
                                                      onClick={() =>
                                                        setOpenIntegrationDialog(
                                                          true,
                                                        )
                                                      }
                                                    >
                                                      <span className="d-flex">
                                                        <i className="ri-links-line me-2"></i>
                                                        Bookkeeping
                                                      </span>
                                                    </a>
                                                  </li> */}

                                                  {bookkeeping &&
                                                    Object.values(
                                                      bookkeeping,
                                                    ).some((val) => val) && (
                                                      <li>
                                                        <a
                                                          className="dropdown-item cursor-pointer"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                          onClick={() => {
                                                            setModelRequestData(
                                                              {
                                                                ...modelRequestData,
                                                                Action:
                                                                  "Add Contact Mapping",
                                                                clientID:
                                                                  Prospect.clientID,
                                                                // xeroContactId: contactDetails.value
                                                              },
                                                            );
                                                          }}
                                                        >
                                                          <span className="d-flex">
                                                            <i className="ri-links-line me-2"></i>
                                                            Map Contact & Client{" "}
                                                            {/* mappings/{organisationKeyId} */}
                                                          </span>
                                                        </a>
                                                      </li>
                                                    )}
                                                </ul>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      </>
                                    );
                                  })}
                              </tbody>
                            </table>
                          )}
                          {showVarModal && (
                            <div
                              className="modal show"
                              style={{
                                display: "block",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                zIndex: 9999,
                              }}
                              onClick={() => setShowVarModal(false)}
                            >
                              <div
                                className="modal-dialog modal-md modal-dialog-centered"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title">
                                      Prospect Variables
                                    </h5>
                                    <button
                                      className="btn-close"
                                      onClick={() => setShowVarModal(false)}
                                    />
                                  </div>
                                  {prospectVariables == null ||
                                  prospectVariables?.length === 0 ? (
                                    <>
                                      <div className="modal-body">
                                        <h6 className="text-danger mb-2">
                                          Please add at least one Global
                                          Prospect Variable
                                        </h6>
                                        <p className="text-muted helpMessage">
                                          Note: You can add these in{" "}
                                          <strong>
                                            Configure &#8594; Variables &#8594;
                                            Global Pricing Drivers
                                          </strong>
                                          <br /> inside tab{" "}
                                          <strong>
                                            Global Prospect Variables
                                          </strong>
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="modal-body">
                                        {prospectVariables.map(
                                          (variable, index) => (
                                            <div
                                              className="row mb-2"
                                              key={variable.globalVariableKeyID}
                                            >
                                              <div className="col-md-3 d-flex align-items-center">
                                                <label className="form-label mb-0">
                                                  {variable.globalVariableName}
                                                </label>
                                              </div>
                                              {/* <div className="col-md-7">
                                                {renderInput(variable,index)}
                                              </div> */}
                                              {variable.dataType == 2 && (
                                                <>
                                                  {/* <div className="col-md-3 col-sm-12 text-start text-md-end">
                                                    <div class=""></div>
                                                  </div> */}

                                                  <div
                                                    id={`${variable?.globalVariableName}`}
                                                    className="col-lg-9 col-md-6 col-sm-6"
                                                  >
                                                    <div class="mb-1">
                                                      <div class="input-group">
                                                        <input
                                                          type="number"
                                                          class="input-text"
                                                          placeholder={
                                                            variable?.globalVariableName
                                                          }
                                                          value={
                                                            variable.value ===
                                                            null
                                                              ? ""
                                                              : variable.value
                                                          }
                                                          onChange={(e) => {
                                                            setProspectVariables(
                                                              (prev) =>
                                                                prev.map((v) =>
                                                                  v.globalVariableID ===
                                                                  variable.globalVariableID
                                                                    ? {
                                                                        ...v,
                                                                        value:
                                                                          e
                                                                            .target
                                                                            .value,
                                                                      }
                                                                    : v,
                                                                ),
                                                            );
                                                          }}
                                                        />
                                                        {invalidFieldIds.includes(
                                                          variable.globalVariableID,
                                                        ) && (
                                                          <span className="text-danger">
                                                            {variable.value ===
                                                            "" ? (
                                                              <>
                                                                This field is
                                                                required
                                                              </>
                                                            ) : (
                                                              <>
                                                                Value must be
                                                                between{" "}
                                                                {variable.quantity
                                                                  .map(
                                                                    (q) =>
                                                                      `${q.quantityFrom} - ${q.quantityTo}`,
                                                                  )
                                                                  .join(", ")}
                                                              </>
                                                            )}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </>
                                              )}
                                              {variable.dataType == 3 && (
                                                <>
                                                  {/* <div className="col-md-3 col-sm-12 text-start text-md-end">
                                                    <div class=""></div>
                                                  </div> */}
                                                  <div
                                                    id={`${variable?.globalVariableName}`}
                                                    className="col-lg-9 col-md-9 col-sm-12"
                                                  >
                                                    <div class="mb-1">
                                                      <div class="input-group">
                                                        <Select
                                                          className="w-100"
                                                          options={variable.variation?.map(
                                                            (item) => ({
                                                              value:
                                                                item.variationName, // use variationValue as the key
                                                              label:
                                                                item.variationName,
                                                            }),
                                                          )}
                                                          value={
                                                            variable.value
                                                              ? {
                                                                  value:
                                                                    variable.value,
                                                                  label:
                                                                    variable.value,
                                                                }
                                                              : null
                                                          }
                                                          onChange={(
                                                            selected,
                                                          ) => {
                                                            setProspectVariables(
                                                              (prev) =>
                                                                prev.map((v) =>
                                                                  v.globalVariableID ===
                                                                  variable.globalVariableID
                                                                    ? {
                                                                        ...v,
                                                                        value:
                                                                          selected?.value,
                                                                      }
                                                                    : v,
                                                                ),
                                                            );
                                                          }}
                                                        />
                                                      </div>
                                                      {invalidFieldIds.includes(
                                                        variable.globalVariableID,
                                                      ) && (
                                                        <span className="text-danger">
                                                          {!variable.value ? (
                                                            <>
                                                              This field is
                                                              required
                                                            </>
                                                          ) : (
                                                            ""
                                                          )}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </>
                                              )}
                                              {variable.dataType == 6 && (
                                                <>
                                                  {/* <div className="col-md-3 col-sm-12 text-start text-md-end">
                                                    <div class=""></div>
                                                  </div> */}
                                                  <div
                                                    id={`${variable?.globalVariableName}`}
                                                    className="col-lg-9 col-md-9 col-sm-12"
                                                  >
                                                    <div className="mb-1">
                                                      <div class="input-group">
                                                        <DatePicker
                                                          className="input-text"
                                                          selected={
                                                            variable.value
                                                              ? parseStoredDate(
                                                                  variable.value,
                                                                  variable
                                                                    .date?.[0]
                                                                    ?.dateFormat ||
                                                                    "dd-MM-yyyy",
                                                                )
                                                              : null
                                                          }
                                                          dateFormat={
                                                            variable.date?.[0]
                                                              ?.dateFormat ||
                                                            "dd-MM-yyyy"
                                                          }
                                                          onChange={(date) => {
                                                            const formatStr =
                                                              variable.date?.[0]
                                                                ?.dateFormat ||
                                                              "dd-MM-yyyy";

                                                            const formatted =
                                                              date
                                                                ? format(
                                                                    date,
                                                                    formatStr,
                                                                  )
                                                                : null;

                                                            setProspectVariables(
                                                              (prev) =>
                                                                prev.map((v) =>
                                                                  v.globalVariableID ===
                                                                  variable.globalVariableID
                                                                    ? {
                                                                        ...v,
                                                                        value:
                                                                          formatted,
                                                                      }
                                                                    : v,
                                                                ),
                                                            );
                                                          }}
                                                          minDate={getMinDate(
                                                            variable.date,
                                                            variable.date?.[0]
                                                              ?.dateFormat,
                                                          )}
                                                          maxDate={getMaxDate(
                                                            variable.date,
                                                            variable.date?.[0]
                                                              ?.dateFormat,
                                                          )}
                                                          placeholderText="Select any date"
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </>
                                              )}

                                              {variable.dataType == 5 && (
                                                <>
                                                  {/* <div className="col-md-3 col-sm-12 text-start text-md-end"></div> */}
                                                  <div
                                                    id={`${variable?.globalVariableName}`}
                                                    className="col-lg-9 col-md-9 col-sm-12"
                                                  >
                                                    <div className="mb-1">
                                                      <div class="input-group">
                                                        <input
                                                          className="input-text"
                                                          type="text"
                                                          value={
                                                            variable?.value ||
                                                            null
                                                          }
                                                          onChange={(e) => {
                                                            let value =
                                                              e.target.value;

                                                            const textConfig =
                                                              variable
                                                                .text?.[0];
                                                            const allowedSpecialChars =
                                                              textConfig?.allowedSpecialCharacters ||
                                                              "";

                                                            // Escape special characters for regex
                                                            const escapedChars =
                                                              allowedSpecialChars.replace(
                                                                /[-/\\^$*+?.()|[\]{}]/g,
                                                                "\\$&",
                                                              );

                                                            // Allow only alphanumeric + allowed special chars
                                                            const regex =
                                                              new RegExp(
                                                                `[^a-zA-Z0-9${escapedChars}]`,
                                                                "g",
                                                              );

                                                            value =
                                                              value.replace(
                                                                regex,
                                                                "",
                                                              );

                                                            setProspectVariables(
                                                              (prev) =>
                                                                prev.map((v) =>
                                                                  v.globalVariableID ===
                                                                  variable.globalVariableID
                                                                    ? {
                                                                        ...v,
                                                                        value,
                                                                      }
                                                                    : v,
                                                                ),
                                                            );
                                                          }}
                                                          placeholder="Enter Text"
                                                          maxLength={
                                                            variable?.text?.[0]
                                                              ?.textLength ||
                                                            100
                                                          }
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </>
                                              )}

                                              {/* working here  */}
                                              {variable.dataType == 4 && (
                                                <>
                                                  {/* <div className="col-md-3 col-sm-12 text-start text-md-end">
                                                    <div class="col-md-5 col-sm-12 text-start text-md-start">
                                                  </div> */}
                                                  <div
                                                    id={`${variable?.globalVariableName}`}
                                                    className="col-lg-9 col-md-9 col-sm-12"
                                                  >
                                                    <div class="mb-1">
                                                      <div class="input-group">
                                                        <Select
                                                          className="w-100"
                                                          options={variable.slab?.map(
                                                            (item) => ({
                                                              value:
                                                                item.slabTypeID ===
                                                                2
                                                                  ? "Other"
                                                                  : `${formatNumber(item.slabFrom, item.decimalPlaces ?? 2)} - ${formatNumber(item.slabTo, item.decimalPlaces ?? 2)}`,
                                                              label:
                                                                item.slabTypeID ===
                                                                2
                                                                  ? "Other"
                                                                  : `${formatNumber(item.slabFrom, item.decimalPlaces ?? 2)} - ${formatNumber(item.slabTo, item.decimalPlaces ?? 2)}`,
                                                              slabKeyID:
                                                                item.slabKeyID,
                                                            }),
                                                          )}
                                                          value={
                                                            variable.value
                                                              ? {
                                                                  value:
                                                                    variable.value,
                                                                  label:
                                                                    variable.value,
                                                                }
                                                              : null
                                                          }
                                                          onChange={(
                                                            selected,
                                                          ) => {
                                                            setProspectVariables(
                                                              (prev) =>
                                                                prev.map((v) =>
                                                                  v.globalVariableID ===
                                                                  variable.globalVariableID
                                                                    ? {
                                                                        ...v,
                                                                        value:
                                                                          selected?.value, // slabValue stored
                                                                        isOther:
                                                                          selected?.label ===
                                                                          "Other",
                                                                        otherValue:
                                                                          selected?.value ===
                                                                          "Other"
                                                                            ? v.otherValue
                                                                            : "",
                                                                      }
                                                                    : v,
                                                                ),
                                                            );
                                                          }}
                                                        />
                                                      </div>
                                                      {variable.isOther && (
                                                        <input
                                                          type="text"
                                                          className="input-text mt-2"
                                                          value={
                                                            variable.otherValue ||
                                                            ""
                                                          }
                                                          onChange={(e) => {
                                                            let val = e.target.value;
                                                            val = formatDecimalInput(val, variable.slab?.decimalPlaces ?? 2);

                                                            setProspectVariables((prev) =>
                                                              prev.map((v) =>
                                                                v.globalVariableID === variable.globalVariableID
                                                                  ? { ...v, otherValue: val }
                                                                  : v,
                                                              ),
                                                            );
                                                          }}
                                                          placeholder="Enter Value"
                                                        />
                                                      )}
                                                      {invalidFieldIds.includes(
                                                        variable.globalVariableID,
                                                      ) && (
                                                        <span className="text-danger">
                                                          {!variable.value ? (
                                                            <>
                                                              This field is
                                                              required
                                                            </>
                                                          ) : (
                                                            ""
                                                          )}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  {variable?.slab?.find(
                                                    (s) =>
                                                      s.slabID ===
                                                        variable.value &&
                                                      s.slabTypeID === 2,
                                                  ) && (
                                                    <>
                                                      <div className="col-md-3 col-sm-12 text-start text-md-end"></div>

                                                      <div
                                                        id={`${variable?.globalVariableName}`}
                                                        className="col-lg-9 col-md-9 col-sm-12"
                                                      >
                                                        <div className="mb-1 d-flex flex-column justify-content-end h-100">
                                                          <div className="input-group">
                                                            <input
                                                              type="text"
                                                              value={
                                                                variable.otherValue ||
                                                                ""
                                                              }
                                                              onChange={(e) => {
                                                                let val = e.target.value;
                                                                val = formatDecimalInput(val, variable.slab?.decimalPlaces ?? 2);

                                                                setProspectVariables((prev) =>
                                                                  prev.map((v) =>
                                                                    v.globalVariableID === variable.globalVariableID
                                                                      ? { ...v, otherValue: val }
                                                                      : v,
                                                                  ),
                                                                );
                                                              }}
                                                              className="input-text mt-2"
                                                              placeholder={
                                                                variable.globalVariableName
                                                              }
                                                            />
                                                          </div>
                                                          {invalidFieldIds.includes(
                                                            variable.globalVariableID,
                                                          ) && (
                                                            <span className="text-danger">
                                                              {!variable.value ? (
                                                                <>
                                                                  This field is
                                                                  required
                                                                </>
                                                              ) : (
                                                                ""
                                                              )}
                                                            </span>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          ),
                                        )}
                                      </div>

                                      <div className="modal-footer">
                                        <button
                                          className="btn btn-sm btn-secondary"
                                          onClick={() => setShowVarModal(false)}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          className="btn btn-sm create-item-btn"
                                          onClick={() =>
                                            handleVariablesDataSubmit()
                                          }
                                        >
                                          Submit
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {activeTab === "Prospect" && (
                          <div>
                            {totalRecords <= 0 && (
                              <NoResultFoundModel
                                name={prospectName}
                                totalRecords={totalRecords}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* {activeTab === "Prospect" && (
                    <div>
                      {listCount > Number(pageSize) && (
                        <PaginationComponent
                          totalCount={listCount}
                          totalPages={isMobile
                            ? Math.ceil(listCount / isMobileRecords)
                            : Math.ceil(listCount / ((desktopRecords > 5 && window.innerHeight == 652) ? 5 : desktopRecords))}
                          currentPage={currentPage}
                          onPageChange={handlePageChange}
                        />
                      )}
                    </div>
                  )} */}
                  {listCount > pageSize && (
                    <PaginationComponent
                      totalCount={listCount}
                      totalPages={totalPage}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                  {/* */}

                  {/* end card  */}
                </div>
                {/* end col */}
              </div>
              {/* end col  */}
            </div>
            {/* end row */}
          </div>
          {/* container-fluid  */}
        </div>
        {/* End Page-content */}
        {/* </div> */}
        <ConfirmModel
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={ClientDeleteData}
          handleClose={handleClose}
        />
        <ErrorModel
          ErrorModel={openErrorModal}
          handleClose={handleClose}
          ErrorMessage={formattedErrorMessage}
        />
        <DeleteDriverModal
          handleClose={handleCloseDeleteProspect}
          setOpenSuccessModal={setOpenDeleteDriverModel}
          openDeleteDriverModel={openDeleteDriverModel}
          modelRequestData={modelRequestData}
        />
        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={`${
            modelRequestData.Action === "Delete"
              ? selectedRows.length !== 0
                ? prospectName
                : `${moduleName} ${modelRequestData.clientName}`
              : modelRequestData.message
                ? modelRequestData.message
                : "Status has been changed successfully!"
          }`}
        />

        <FilterModel
          class="modal fade"
          id="FilterModel"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          ModuleName={moduleName}
          isFilterApply={isFilterApply}
          setIsFilterApply={setIsFilterApply}
          ApplyFilter={ApplyFilter}
          businessNatureID={businessNatureID}
          setBusinessNatureID={setBusinessNatureID}
          prospectType={prospectType}
          setProspectType={setProspectType}
        />

        <IntegrationDialog
          open={openIntegrationDialog}
          onClose={() => setOpenIntegrationDialog(false)}
        />
      </div>
      <Footer />
    </>
  );
};

export default Prospects;
