/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, isValid, format } from "date-fns";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Trash2,
  Eye,
  Pencil,
  UserRoundCog,
  Link2,
  ArrowRightLeft,
  ChevronDown,
} from "lucide-react";

import "./ProspectsFigma.css";

import { AuthContextProvider } from "../../AuthContext/AuthContext";
import FilterModel from "../../components/FilterModel";
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
import DeleteDriverModal from "../../components/DeleteDriverModel";
import {
  CreateXeroContactFromOutbooks,
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

  const {
    prospectName,
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
  const pageSize = isMobile ? isMobileRecords : desktopRecords;

  const [activeTab, setActiveTab] = useState("Prospect");
  const [errorMessage, setErrorMessage] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
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

  const [currentPage, setCurrentPage] = useState(1);
  const [SingleCurrentPage, setSingleCurrentPage] = useState(1);
  const [prospectListCount, setProspectListCount] = useState(0);
  const [apiProspectListCount, setApiProspectListCount] = useState(0);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [SingleSearchKeyword, setSingleSearchKeyword] = useState("");

  const [businessNatureID, setBusinessNatureID] = useState(null);
  const [prospectType, setProspectType] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openDeleteDriverModel, setOpenDeleteDriverModel] = useState(false);

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

  const [shouldFetch, setShouldFetch] = useState(false);
  const [contactDetails, setContactDetails] = useState();
  const [openIntegrationDialog, setOpenIntegrationDialog] = useState(false);
  const [invalidFieldIds, setInvalidFieldIds] = useState([]);

  const formattedErrorMessage = handleErrorMessage(errorMessage);

  // ===================== useEffects =====================

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

  // ===================== helpers =====================

  const formatNumber = (num, decimalPlaces) => {
    if (num == null || num === "") return "";

    const n = parseFloat(num);

    if (isNaN(n)) return "";

    const str = n.toFixed(decimalPlaces);
    const [intPart, fracPart] = str.split(".");

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
    val = val.replace(/[^0-9.]/g, "");

    if (val.startsWith(".")) {
      val = val.replace(".", "");
    }

    const parts = val.split(".");

    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }

    if (decimalPlaces === 0) {
      val = val.replace(/\./g, "");
    } else {
      const [intPart, decPart] = val.split(".");

      if (decPart !== undefined) {
        val = intPart + "." + decPart.slice(0, decimalPlaces);
      }
    }

    return val;
  };

  const getInitials = (name = "") => {
    const words = String(name).trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return "?";

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const getAvatarClass = (name = "") => {
    const palette = [
      "avatar-teal",
      "avatar-green",
      "avatar-red",
      "avatar-orange",
      "avatar-cyan",
      "avatar-purple",
      "avatar-slate",
    ];

    const hash = String(name)
      .split("")
      .reduce((total, char) => total + char.charCodeAt(0), 0);

    return palette[hash % palette.length];
  };

  const getAddedDate = (prospect) => {
    const raw =
      prospect?.createdOn ||
      prospect?.createdDate ||
      prospect?.createdAt ||
      prospect?.addedOn;

    if (!raw) return "";

    const parsed = new Date(raw);

    if (Number.isNaN(parsed.getTime())) return "";

    return `Added ${format(parsed, "MMM dd, yyyy")}`;
  };

  const getDisplayEmail = (emailID) => {
    const emailArray = emailID ? emailID.split(", ") : [];

    return {
      displayEmail: emailArray.length > 0 ? emailArray[0] : "",
      hasMoreEmails: emailArray.length > 1,
    };
  };

  const hasBookkeepingIntegration =
    bookkeeping && Object.values(bookkeeping).some((value) => value);

  // ===================== API calls =====================

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
            const clientListData = data.data.responseData.data;
            const totalCount = data.data.totalCount;
            setProspectListCount(totalCount);
            setListCount(totalCount);

            if (pageNoList > 0 && clientListData.length === 0) {
              let newPaneNo = Number(pageNoList);

              if (newPaneNo > 1) {
                newPaneNo -= 1;
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
            setClientList(clientListData);
            setTotalRecords(clientListData.length);
          }
        } else {
          if (getClientsListApiCallCount < maxCountToRecallApi) {
            getClientsListApiCallCount += 1;

            setTimeout(() => {
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
            const clientListData = data.data.responseData.data;
            const totalCount = data.data.totalCount;
            setApiProspectListCount(totalCount);
            setListCount(totalCount);

            if (pageNoList > 0 && clientListData.length === 0) {
              let newPaneNo = Number(pageNoList);

              if (newPaneNo > 1) {
                newPaneNo -= 1;
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
            setSingleClientList(clientListData);
          }
        } else {
          if (getClientsListApiCallCount < maxCountToRecallApi) {
            getClientsListApiCallCount += 1;

            setTimeout(() => {
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
      const invalidFields = prospectVariables
        .filter((variable) => {
          const type = Number(variable.dataType);

          if (type === 2) {
            const val = Number(variable.value);

            if (variable.value === "" || isNaN(val)) return true;

            const validQuantity = variable.quantity?.some((quantity) => {
              const from = Number(quantity.quantityFrom);
              const to = Number(quantity.quantityTo);

              return !isNaN(from) && !isNaN(to) && val >= from && val <= to;
            });

            return !validQuantity;
          }

          if (type === 4) {
            if (variable.isOther) return !variable.otherValue;
            return !variable.value;
          }

          if (type === 3) {
            return !variable.value;
          }

          return false;
        })
        .map((variable) => variable.globalVariableID);

      if (invalidFields.length > 0) {
        setInvalidFieldIds(invalidFields);
        return;
      }

      const payload = {
        clientKeyID: selectedProspectKeyID,
        userKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID,
        variables: prospectVariables.map((variable) => ({
          prospectVariableKeyID: variable.prospectVariableKeyID,
          globalPricingDriverID: variable.globalVariableID,
          value: (() => {
            const resolved = variable.isOther
              ? variable.otherValue
              : variable.value;

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
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
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

              const label = `${formatNumber(
                item.slabFrom,
                item.decimalPlaces ?? 2,
              )} - ${formatNumber(item.slabTo, item.decimalPlaces ?? 2)}`;

              return label === variable.value;
            });

            if (matchedSlab) {
              return {
                ...variable,
                isOther: false,
                otherValue: "",
              };
            }

            const isOther = hasOtherSlab && !!variable.value;

            return {
              ...variable,
              isOther,
              otherValue: isOther ? variable.value : "",
              value: isOther ? "Other" : variable.value,
            };
          }

          const defaultSlab = variable.slab.find((item) => item.isDefault);

          if (!defaultSlab) {
            return {
              ...variable,
              isOther: false,
              otherValue: "",
            };
          }

          if (defaultSlab.slabTypeID === 2) {
            return {
              ...variable,
              value: "Other",
              isOther: true,
              otherValue: "",
            };
          }

          const label = `${formatNumber(
            defaultSlab.slabFrom,
            defaultSlab.decimalPlaces ?? 2,
          )} - ${formatNumber(
            defaultSlab.slabTo,
            defaultSlab.decimalPlaces ?? 2,
          )}`;

          return {
            ...variable,
            value: label,
            isOther: false,
            otherValue: "",
          };
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

      const variables = formatted.map((variable) =>
        initializeVariable(variable),
      );

      setProspectVariables(variables);
      setSelectedProspectKeyID(clientKeyID);
      setShowVarModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  // ===================== row actions =====================

  const ClientEditBtnClicked = (prospect) => {
    setModelRequestData({
      ...modelRequestData,
      clientName: prospect.clientName,
      clientKeyID: prospect.clientKeyID,
      Action: "Update",
    });
  };

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

            const clientExistsInModule =
              data.data.responseData.clientExistsInModule;

            if (clientExistsInModule.length > 0) {
              setModelRequestData({
                ...modelRequestData,
                Action: "ClientDelete",
                message: `Cannot delete ${prospectName} as it already have linked records.`,
                clientExistsInModule,
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
              if (Data?.response?.data?.errorMessage?.includes("Prospect")) {
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
          setOpenErrorModal(true);
          setErrorMessage(res?.response?.data?.message);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setAuthLoadingRow(null);
        setLoader(false);
      }
    } else if (modelRequestData.Action === "Add Contact") {
      const now = Date.now();

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
          setOpenSuccessModal(true);

          setModelRequestData({
            ...modelRequestData,
            Action: "AddContact",
            message: "Record added successfully",
          });

          dispatch(
            fetchContactsLookup({
              organisationKeyID,
              activePlatform,
            }),
          );
        } else {
          setOpenErrorModal(true);
          setErrorMessage(res?.response?.data?.message);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setAuthLoadingRow(null);
        setLoader(false);
      }
    } else if (modelRequestData.Action === "Add Contact Mapping") {
      const payload =
        activePlatform === "Xero"
          ? {
              xeroContactId: contactDetails?.value || null,
              clientId: modelRequestData?.clientID || null,
              organisationKeyId: organisationKeyID,
              activePlatform,
            }
          : {
              qbCustomerId: contactDetails?.value || null,
              clientId: modelRequestData?.clientID || null,
              organisationKeyId: organisationKeyID,
              activePlatform,
            };

      dispatch(addContactMapping({ ...payload }))
        .unwrap()
        .then(() => {
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

  // ===================== controls =====================

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
      clientKeyID: Prospect.clientKeyID,
      Action: "View",
    });
  };

  const AddClientBtn = () => {
    setModelRequestData({
      ...modelRequestData,
      clientKeyID: null,
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

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await getClientsListData(pageNumber);
  };

  const handleSinglePageChange = async (pageNumber) => {
    setSingleCurrentPage(pageNumber);

    await getClientsListSingleApiData(pageNumber);
  };

  const TabHandle = (tab) => {
    if (tab === "Web Prospect") {
      setActiveTab(tab);

      setSingleCurrentPage(1);

      getClientsListSingleApiData(1);
    } else {
      setActiveTab(tab);

      setCurrentPage(1);

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
    if (selectedRows.length === visibleRows.length && visibleRows.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(visibleRows.map((item) => item.clientKeyID));
    }
  };

  const handleCloseDeleteProspect = () => {
    $("#" + "DeleteDriverModel").modal("hide");
    $("#" + "ConfirmModel").modal("hide");
    setOpenDeleteDriverModel(false);
  };

  const handleNameSort = () => {
    const current = primarySortDirectionObj.ProspectNameSort;

    const next =
      current === "desc" ? "asc" : current === "asc" ? "desc" : "asc";

    setSortType("ClientName");
    handleSort(next, "ClientName");
  };

  const handleTypeSort = () => {
    const current = primarySortDirectionObj.ProspectTypeSort;

    const next =
      current === "desc" ? "asc" : current === "asc" ? "desc" : "asc";

    setSortType("ClientType");
    handleSort(next, "ClientType");
  };

  const renderProspectName = (Prospect) => {
    const addedDate = getAddedDate(Prospect);

    return (
      <div className="prospect-person">
        {/* <div
          className={`prospect-avatar ${getAvatarClass(Prospect.clientName)}`}
        >
          {getInitials(Prospect.clientName)}
        </div> */}

        <div className="prospect-person__copy">
          <button
            type="button"
            className="prospect-name-button"
            onClick={() => handleViewProspectDetails(Prospect)}
          >
            {Prospect.clientName}
          </button>

          {addedDate && (
            <span className="prospect-added-date">{addedDate}</span>
          )}
        </div>
      </div>
    );
  };

  const renderEmail = (Prospect) => {
    const { displayEmail, hasMoreEmails } = getDisplayEmail(Prospect.emailID);

    if (hasMoreEmails) {
      return (
        <Tooltip title={Prospect.emailID} arrow>
          <span className="prospect-email">
            {displayEmail}
            <strong>...</strong>
          </span>
        </Tooltip>
      );
    }

    return <span className="prospect-email">{displayEmail}</span>;
  };

  const renderStatus = (Prospect, isApiProspect) => {
    const canChangeStatus = isApiProspect
      ? userAccessData.Admin_Prospect_CanDelete &&
        activeOrganizationSubscriptionPlan.apiIntegration
      : userAccessData.Admin_Prospect_CanDelete;

    return (
      <div className="prospect-status">
        {canChangeStatus ? (
          <Tooltip title={getCrudButtonToolTipName("Change Status")}>
            <FormGroup className="prospect-status__switch">
              <FormControlLabel
                className="prospect-status__switch-label"
                control={
                  <Android12Switch
                    onClick={() =>
                      setModelRequestData({
                        ...modelRequestData,
                        status: Prospect.statusName,
                        clientKeyID: Prospect.clientKeyID,
                        clientName: Prospect.clientName,
                        userKeyID: common.userKeyID,
                        Action: "Status",
                        ...(isApiProspect ? { tabName: "API Prospect" } : {}),
                      })
                    }
                    checked={Prospect.statusName === "Active"}
                    data-bs-toggle="modal"
                    data-bs-target="#ConfirmModel"
                  />
                }
              />
            </FormGroup>
          </Tooltip>
        ) : null}

        <span
          className={`prospect-status__text ${
            Prospect.statusName === "Active" ? "is-active" : "is-inactive"
          }`}
        >
          {Prospect.statusName}
        </span>
      </div>
    );
  };

  const renderActionMenu = (Prospect, isApiProspect) => {
    return (
      <div className="dropdown prospect-actions">
        <button
          type="button"
          className="prospect-actions__trigger"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-label={`Actions for ${Prospect.clientName}`}
        >
          <MoreVertical size={19} strokeWidth={2} />
        </button>

        <ul className="dropdown-menu dropdown-menu-end prospect-actions__menu">
          <li>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleViewProspectDetails(Prospect)}
            >
              <Eye size={15} />
              <span>View</span>
            </button>
          </li>

          {userAccessData.Admin_Prospect_CanEdit &&
            (!isApiProspect ||
              activeOrganizationSubscriptionPlan.apiIntegration) && (
              <li>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => ClientEditBtnClicked(Prospect)}
                >
                  <Pencil size={15} />
                  <span>Edit</span>
                </button>
              </li>
            )}

          {!isApiProspect && (
            <li>
              <button
                type="button"
                className="dropdown-item"
                onClick={() =>
                  GetClientGlobalVariablesData(Prospect.clientKeyID)
                }
              >
                <UserRoundCog size={15} />
                <span>{prospectName} Variables</span>
              </button>
            </li>
          )}

          {userAccessData.Admin_Prospect_CanDelete &&
            (!isApiProspect ||
              activeOrganizationSubscriptionPlan.apiIntegration) && (
              <li>
                <button
                  type="button"
                  className="dropdown-item text-danger"
                  data-bs-toggle="modal"
                  data-bs-target="#ConfirmModel"
                  onClick={() =>
                    setModelRequestData({
                      ...modelRequestData,
                      clientKeyID: Prospect.clientKeyID,
                      clientName: Prospect.clientName,
                      userKeyID: common.userKeyID,
                      Action: "Delete",
                    })
                  }
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              </li>
            )}

          {!isApiProspect && hasBookkeepingIntegration && (
            <>
              <li>
                <button
                  type="button"
                  className="dropdown-item"
                  data-bs-toggle="modal"
                  data-bs-target="#ConfirmModel"
                  onClick={() =>
                    setModelRequestData({
                      ...modelRequestData,
                      Action: "Redirect",
                      clientKeyID: Prospect.clientKeyID,
                    })
                  }
                >
                  <Link2 size={15} />
                  <span>Connect To {activePlatform || ""}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="dropdown-item"
                  data-bs-toggle="modal"
                  data-bs-target="#ConfirmModel"
                  onClick={() =>
                    setModelRequestData({
                      ...modelRequestData,
                      Action: "Add Contact",
                      clientKeyID: Prospect.clientKeyID,
                    })
                  }
                >
                  <ArrowRightLeft size={15} />
                  <span>Add To {activePlatform || ""}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="dropdown-item"
                  data-bs-toggle="modal"
                  data-bs-target="#ConfirmModel"
                  onClick={() =>
                    setModelRequestData({
                      ...modelRequestData,
                      Action: "Add Contact Mapping",
                      clientID: Prospect.clientID,
                    })
                  }
                >
                  <Link2 size={15} />
                  <span>Map Contact & Client</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    );
  };

  const renderProspectVariablesModal = () => {
    if (!showVarModal) return null;

    // UI only: small caption shown under each variable name
    const pvTypeLabels = {
      2: "Number",
      3: "Dropdown",
      4: "Range",
      5: "Text",
      6: "Date",
    };

    return (
      <div
        className="modal show pv-overlay"
        style={{
          display: "block",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 9999,
        }}
        onClick={() => setShowVarModal(false)}
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered pv-dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content prospect-variable-modal pv-modal">
            <div className="modal-header pv-header">
              <span className="pv-header-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
                  <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
                  <line x1="9.5" y1="9.5" x2="14.5" y2="14.5" />
                  <line x1="14.5" y1="9.5" x2="9.5" y2="14.5" />
                </svg>
              </span>

              <h5 className="modal-title pv-title">
                Prospect Variables
                {/* {prospectVariables?.length > 0 && (
                  <span className="pv-count">{prospectVariables.length}</span>
                )} */}
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={() => setShowVarModal(false)}
              />
            </div>

            {prospectVariables == null || prospectVariables?.length === 0 ? (
              <div className="modal-body pv-body pv-empty">
                <div className="pv-empty-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>

                <h6 className="text-danger mb-2">
                  Please add at least one Global Prospect Variable
                </h6>

                <p className="text-muted helpMessage">
                  Note: You can add these in{" "}
                  <strong>
                    Configure &#8594; Variables &#8594; Global Pricing Drivers
                  </strong>
                  <br />
                  inside tab <strong>Global Prospect Variables</strong>
                </p>
              </div>
            ) : (
              <>
                <div className="modal-body pv-body">
                  {prospectVariables.map((variable) => (
                    <div
                      className="row mb-3 pv-field"
                      key={
                        variable.globalVariableKeyID ||
                        variable.globalVariableID
                      }
                    >
                      <div className="col-md-3 d-flex align-items-center pv-field-label">
                        <label className="form-label mb-0">
                          {variable.globalVariableName}
                        </label>
                        {/* {pvTypeLabels[variable.dataType] && (
                          <span className="pv-type">
                            {pvTypeLabels[variable.dataType]}
                          </span>
                        )} */}
                      </div>

                      <div className="col-lg-9 col-md-9 col-sm-12">
                        {variable.dataType == 2 && (
                          <>
                            <input
                              type="number"
                              className="input-text"
                              placeholder={variable?.globalVariableName}
                              value={
                                variable.value === null ? "" : variable.value
                              }
                              onChange={(e) => {
                                setProspectVariables((prev) =>
                                  prev.map((v) =>
                                    v.globalVariableID ===
                                    variable.globalVariableID
                                      ? {
                                          ...v,
                                          value: e.target.value,
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
                                {variable.value === ""
                                  ? "This field is required"
                                  : `Value must be between ${variable.quantity
                                      ?.map(
                                        (q) =>
                                          `${q.quantityFrom} - ${q.quantityTo}`,
                                      )
                                      .join(", ")}`}
                              </span>
                            )}
                          </>
                        )}

                        {variable.dataType == 3 && (
                          <>
                            <Select
                              className="w-100"
                              classNamePrefix="pv-select"
                              options={variable.variation?.map((item) => ({
                                value: item.variationName,
                                label: item.variationName,
                              }))}
                              value={
                                variable.value
                                  ? {
                                      value: variable.value,
                                      label: variable.value,
                                    }
                                  : null
                              }
                              onChange={(selected) => {
                                setProspectVariables((prev) =>
                                  prev.map((v) =>
                                    v.globalVariableID ===
                                    variable.globalVariableID
                                      ? {
                                          ...v,
                                          value: selected?.value,
                                        }
                                      : v,
                                  ),
                                );
                              }}
                            />

                            {invalidFieldIds.includes(
                              variable.globalVariableID,
                            ) &&
                              !variable.value && (
                                <span className="text-danger">
                                  This field is required
                                </span>
                              )}
                          </>
                        )}

                        {variable.dataType == 6 && (
                          <DatePicker
                            className="input-text"
                            selected={
                              variable.value
                                ? parseStoredDate(
                                    variable.value,
                                    variable.date?.[0]?.dateFormat ||
                                      "dd-MM-yyyy",
                                  )
                                : null
                            }
                            dateFormat={
                              variable.date?.[0]?.dateFormat || "dd-MM-yyyy"
                            }
                            onChange={(date) => {
                              const formatStr =
                                variable.date?.[0]?.dateFormat || "dd-MM-yyyy";

                              const formatted = date
                                ? format(date, formatStr)
                                : null;

                              setProspectVariables((prev) =>
                                prev.map((v) =>
                                  v.globalVariableID ===
                                  variable.globalVariableID
                                    ? {
                                        ...v,
                                        value: formatted,
                                      }
                                    : v,
                                ),
                              );
                            }}
                            minDate={getMinDate(
                              variable.date,
                              variable.date?.[0]?.dateFormat,
                            )}
                            maxDate={getMaxDate(
                              variable.date,
                              variable.date?.[0]?.dateFormat,
                            )}
                            placeholderText="Select any date"
                          />
                        )}

                        {variable.dataType == 5 && (
                          <input
                            className="input-text"
                            type="text"
                            value={variable?.value || ""}
                            onChange={(e) => {
                              let value = e.target.value;

                              const textConfig = variable.text?.[0];

                              const allowedSpecialChars =
                                textConfig?.allowedSpecialCharacters || "";

                              const escapedChars = allowedSpecialChars.replace(
                                /[-/\\^$*+?.()|[\]{}]/g,
                                "\\$&",
                              );

                              const regex = new RegExp(
                                `[^a-zA-Z0-9${escapedChars}]`,
                                "g",
                              );

                              value = value.replace(regex, "");

                              setProspectVariables((prev) =>
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
                            maxLength={variable?.text?.[0]?.textLength || 100}
                          />
                        )}

                        {variable.dataType == 4 && (
                          <>
                            <Select
                              className="w-100"
                              classNamePrefix="pv-select"
                              options={variable.slab?.map((item) => ({
                                value:
                                  item.slabTypeID === 2
                                    ? "Other"
                                    : `${formatNumber(
                                        item.slabFrom,
                                        item.decimalPlaces ?? 2,
                                      )} - ${formatNumber(
                                        item.slabTo,
                                        item.decimalPlaces ?? 2,
                                      )}`,
                                label:
                                  item.slabTypeID === 2
                                    ? "Other"
                                    : `${formatNumber(
                                        item.slabFrom,
                                        item.decimalPlaces ?? 2,
                                      )} - ${formatNumber(
                                        item.slabTo,
                                        item.decimalPlaces ?? 2,
                                      )}`,
                                slabKeyID: item.slabKeyID,
                              }))}
                              value={
                                variable.value
                                  ? {
                                      value: variable.value,
                                      label: variable.value,
                                    }
                                  : null
                              }
                              onChange={(selected) => {
                                setProspectVariables((prev) =>
                                  prev.map((v) =>
                                    v.globalVariableID ===
                                    variable.globalVariableID
                                      ? {
                                          ...v,
                                          value: selected?.value,
                                          isOther: selected?.label === "Other",
                                          otherValue:
                                            selected?.value === "Other"
                                              ? v.otherValue
                                              : "",
                                        }
                                      : v,
                                  ),
                                );
                              }}
                            />

                            {variable.isOther && (
                              <input
                                type="text"
                                className="input-text mt-2"
                                value={variable.otherValue || ""}
                                onChange={(e) => {
                                  let val = e.target.value;

                                  val = formatDecimalInput(
                                    val,
                                    variable.slab?.decimalPlaces ?? 2,
                                  );

                                  setProspectVariables((prev) =>
                                    prev.map((v) =>
                                      v.globalVariableID ===
                                      variable.globalVariableID
                                        ? {
                                            ...v,
                                            otherValue: val,
                                          }
                                        : v,
                                    ),
                                  );
                                }}
                                placeholder="Enter Value"
                              />
                            )}

                            {invalidFieldIds.includes(
                              variable.globalVariableID,
                            ) &&
                              !variable.value && (
                                <span className="text-danger">
                                  This field is required
                                </span>
                              )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-footer pv-footer">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowVarModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm create-item-btn"
                    onClick={handleVariablesDataSubmit}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const prospectTotalPages = Math.ceil(prospectListCount / pageSize);

  const apiProspectTotalPages = Math.ceil(apiProspectListCount / pageSize);

  return (
    <>
      <div className="prospects-figma">
        <div className="prospects-figma__inner">
          <div className="prospects-tabs">
            <button
              type="button"
              className={`prospects-tabs__item ${
                activeTab === "Prospect" ? "is-active" : ""
              }`}
              onClick={() => {
                setActiveTab("Prospect");
                TabHandle("Prospect");
              }}
            >
              {moduleName}
            </button>

            {singleclientList?.length > 0 && (
              <button
                type="button"
                className={`prospects-tabs__item ${
                  activeTab === "Web Prospect" ? "is-active" : ""
                }`}
                onClick={() => TabHandle("Web Prospect")}
              >
                API {moduleName}
              </button>
            )}
          </div>

          <section className="prospects-panel">
            <div className="prospects-toolbar">
              <div className="prospects-toolbar__left">
                <div className="prospects-search">
                  <Search
                    className="prospects-search__icon"
                    size={18}
                    strokeWidth={1.9}
                  />

                  <input
                    type="text"
                    value={
                      activeTab === "Prospect"
                        ? searchKeyword
                        : SingleSearchKeyword
                    }
                    onChange={(e) =>
                      handleSearch(
                        e,
                        activeTab === "Prospect" ? "Prospect" : "Web",
                      )
                    }
                    placeholder={
                      isMobile
                        ? "Search"
                        : getPlaceholderTextName("Search", moduleName)
                    }
                  />
                </div>

                {activeTab === "Prospect" && (
                  <>
                    <Tooltip
                      title={getCrudButtonToolTipName("Filter", moduleName)}
                    >
                      <button
                        type="button"
                        className={`prospects-filter-btn ${
                          isFilterApply ? "is-active" : ""
                        }`}
                        data-bs-toggle="modal"
                        data-bs-target="#FilterModel"
                      >
                        <SlidersHorizontal size={17} strokeWidth={1.9} />
                        <span>Filter</span>
                      </button>
                    </Tooltip>

                    {isFilterApply && (
                      <button
                        type="button"
                        className="prospects-clear-filter"
                        onClick={ClearFilter}
                      >
                        Clear Filter
                      </button>
                    )}
                  </>
                )}

                {activeTab === "Web Prospect" && (
                  <Tooltip
                    title={getCrudButtonToolTipName(
                      "Delete Selcted",
                      prospectName,
                    )}
                  >
                    <button
                      type="button"
                      className="prospects-delete-selected"
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
                      <Trash2 size={17} strokeWidth={1.9} />
                      <span>Delete Selected</span>
                    </button>
                  </Tooltip>
                )}
              </div>

              {activeTab === "Prospect" && (
                <div className="prospects-toolbar__right">
                  <div className="prospects-contact-select">
                    <Select
                      classNamePrefix="prospect-contact"
                      options={contactsLookup}
                      getOptionLabel={(e) => e.label}
                      getOptionValue={(e) => e.value}
                      onChange={(selectedOption) => {
                        setContactDetails(selectedOption);
                      }}
                      placeholder="Select contact"
                    />
                  </div>

                  {userAccessData.Admin_Prospect_CanAdd && (
                    <Tooltip
                      title={getCrudButtonToolTipName("Add", moduleName)}
                    >
                      <button
                        type="button"
                        className="prospects-add-btn"
                        onClick={AddClientBtn}
                      >
                        <Plus size={17} strokeWidth={2} />
                        <span>{getCrudButtonTextName("Add", moduleName)}</span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>

            <div className="prospects-table-wrap">
              <table className="prospects-table">
                <thead>
                  <tr>
                    <th className="prospects-table__name">
                      <div className="prospects-table__header-label">
                        {activeTab === "Web Prospect" && (
                          <input
                            type="checkbox"
                            checked={
                              visibleRows.length > 0 &&
                              selectedRows.length === visibleRows.length
                            }
                            onChange={handleSelectAll}
                            aria-label="Select all prospects"
                          />
                        )}

                        <span>{prospectName} Name</span>

                        <button
                          type="button"
                          className={`prospects-sort ${
                            primarySortDirectionObj.ProspectNameSort === "desc"
                              ? "is-desc"
                              : ""
                          }`}
                          onClick={handleNameSort}
                          aria-label={`Sort ${prospectName} name`}
                        >
                          <ChevronDown size={15} strokeWidth={2} />
                        </button>
                      </div>
                    </th>

                    <th>Email</th>

                    <th>
                      <div className="prospects-table__header-label">
                        <span>{prospectName} Type</span>

                        <button
                          type="button"
                          className={`prospects-sort ${
                            primarySortDirectionObj.ProspectTypeSort === "desc"
                              ? "is-desc"
                              : ""
                          }`}
                          onClick={handleTypeSort}
                          aria-label={`Sort ${prospectName} type`}
                        >
                          <ChevronDown size={15} strokeWidth={2} />
                        </button>
                      </div>
                    </th>

                    <th>Status</th>

                    <th className="prospects-table__actions-heading">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(activeTab === "Prospect" ? clientList : singleclientList)
                    .slice(0, isMobile ? isMobileRecords : desktopRecords)
                    .map((Prospect) => {
                      const isApiProspect = activeTab === "Web Prospect";

                      return (
                        <tr key={Prospect.clientID || Prospect.clientKeyID}>
                          <td>
                            <div className="prospect-name-cell">
                              {isApiProspect && (
                                <input
                                  type="checkbox"
                                  checked={selectedRows.includes(
                                    Prospect.clientKeyID,
                                  )}
                                  onChange={() =>
                                    handleRowSelect(Prospect.clientKeyID)
                                  }
                                  aria-label={`Select ${Prospect.clientName}`}
                                />
                              )}

                              {renderProspectName(Prospect)}
                            </div>
                          </td>

                          <td>{renderEmail(Prospect)}</td>

                          <td>
                            <span className="prospect-type-pill">
                              {Prospect.businessTypeName}
                            </span>
                          </td>

                          <td>{renderStatus(Prospect, isApiProspect)}</td>

                          <td className="prospects-table__actions-cell">
                            {renderActionMenu(Prospect, isApiProspect)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {activeTab === "Prospect" && totalRecords <= 0 && (
              <div className="prospects-no-results">
                <NoResultFoundModel
                  name={prospectName}
                  totalRecords={totalRecords}
                />
              </div>
            )}

            {/* Normal Prospect Pagination */}
            {activeTab === "Prospect" && prospectListCount > pageSize && (
              <div className="prospects-pagination">
                <PaginationComponent
                  totalCount={prospectListCount}
                  totalPages={prospectTotalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* API Prospect Pagination */}
            {activeTab === "Web Prospect" &&
              apiProspectListCount > pageSize && (
                <div className="prospects-pagination">
                  <PaginationComponent
                    totalCount={apiProspectListCount}
                    totalPages={apiProspectTotalPages}
                    currentPage={SingleCurrentPage}
                    onPageChange={handleSinglePageChange}
                  />
                </div>
              )}
          </section>
        </div>

        {renderProspectVariablesModal()}

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

        <Footer />
      </div>
    </>
  );
};

export default Prospects;
