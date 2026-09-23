/* global $ */
import React, { useContext, useState, useEffect, useRef } from "react";
import { useLocation, Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { resetState, updateState } from "../redux/Persist";
import DashboardSvg from "../../src/assets/images/Navbar Icons/Dashboard Icon.svg";
import ProspectSvg from "../../src/assets/images/Navbar Icons/Prospect Icon.svg";
import ProposalSvg from "../../src/assets/images/Navbar Icons/Proposal Icon.svg";
import EngagementSvg from "../../src/assets/images/Navbar Icons/Engagement Letter Icon.svg";
import ConfigSvg from "../../src/assets/images/Navbar Icons/Configure Icon.svg";
import SettingSvg from "../../src/assets/images/Navbar Icons/Settings Icon.svg";
import {
  NotificationCount,
  VanishCount,
} from "../redux/Services/Setting/NotificationApi";
import { Box, Button, Drawer, Tooltip } from "@mui/material";
import { ColorContext } from "../AuthContext/ColorContext";
import {
  GetOrganisationLookupList,
  OrganisationLoginUpdate,
} from "../redux/Services/Master/OrganisationLookupList";
import { USER_ROLE_TYPE } from "../Middleware/enums";
import ResetPasswordModal from "../Auth/ResetPassword/ResetPasswordModal";
import profile from "../../src/assets/images/profile.jpg";
import LogoutModal from "./LogoutModal";
import "../components/UpdateImageModel/UploadImageStyle.css";
import SuccessModal from "./SuccessModal";
import SetTimeoutComponent from "./SetTimeoutComponent";
import ProposalThemeSettingModal from "./ProposalThemeSettingModal";
import UserModelNew from "./UserModelNew";
import ViewPlan from "./ViewPlan";

const Topbar = () => {
  // A] States Declaration
  const {
    currentCardColor,
    handleOnChangeCard,
    handleSetDefault,
    UpdateThemeSettingsData,
    OnChangeTopbarTextColor,
    TopTextColor,
    currentTopbarTextColor,
    OnChangeTopbarColor,
    currentTopbarColor,
    TopbarStyle,
    UserDefaultTheme,
    setIsAddUpdateDone,
    isAddUpdateDone,
  } = useContext(ColorContext);
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const settingsRef = useRef(null);
  const workflowRef = useRef(null);
  const saWorkflowRef = useRef(null);
  const [isHoveredDashboard, setIsHoveredDashboard] = useState(false);
  const [isHoveredProspect, setIsHoveredProspect] = useState(false);
  const [isHoveredProposal, setIsHoveredProposal] = useState(false);
  const [isHoveredEngagement, setIsHoveredEngagement] = useState(false);
  const [isHoveredPdfToCsv, setIsHoveredPdfToCsv] = useState(false);
  const [isHoveredConfigure, setIsHoveredConfigure] = useState(false);
  const [isHoveredSetting, setIsHoveredSetting] = useState(false);
  const [isHoveredWorkflow, setIsHoveredWorkflow] = useState(false);
  const [isHoveredSAWorkflow, setIsHoveredSAWorkflow] = useState(false);
  const [isHoveredDashboards, setIsHoveredDashboards] = useState(false);
  const [isHoveredOrganization, setIsHoveredOrganization] = useState(false);
  const [isHoveredUser, setIsHoveredUser] = useState(false);
  const [isHoveredSubscription, setIsHoveredSubscription] = useState(false);
  const [isHoveredUserRole, setIsHoveredUserRole] = useState(false);
  const [isOpenSessionTimeout, setIsOpenSessionTimeout] = useState(false);
  const [organisationsList, setOrganisationsList] = useState([]);
  const [dismissModal, setDismissModal] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openPurchaseModal, setOpenPurchaseModal] = React.useState(false);
  const [modelAction, setModelAction] = useState("");

  const dispatch = useDispatch();
  let getOrganisationLookupListApiCallCount = 0;
  const {
    activeOrganizationSubscriptionPlan,
    setActiveOrganization,
    isAddUpdatePurchaseDone,
    setIsAddUpdatePurchaseDone,
    maxCountToRecallApi,
    topbar,
    setLoader,
    prospectName,
    updatedProspectName,
    handleInputChange,
    proposalName,
    updatedProposalName,
    handleInputChangeProposal,
    updatedEngagementName,
    EngagementName,
    handleInputChangeEngagement,
    handleNameChangeProposal,
    handleNameChangeEngagement,
    handleNameChange,
    handleReloadClick,
    handleSetDefaultVariables,
    DefaultVariables,
    RequireErrorMessage,
    setRequireErrorMessage,
    setInitializeValidationError,
    userAccessData,
    accessCount,
    setEngagementName,
    setProposalName,
    setProspectName,
    setOrgLoaderList,
    setActiveOrganizationSubscriptionPlan,
  } = useContext(AuthContextProvider);
  const common = useSelector((state) => state.Storage);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpens, setIsOpens] = useState(false);
  const [activeOrganizationKeyId, setActiveOrganizationKeyId] = useState(null);
  const [isUserRoleDropdownOpen, setIsUserRoleDropdownOpen] = useState(false);
  const [isSettingDropdownOpen, setIsSettingDropdownOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWorkflowDropdownOpen, setIsWorkflowDropdownOpen] = useState(false);
  const [isSAWorkflowDropdownOpen, setIsSAWorkflowDropdownOpen] =
    useState(false);
  const [activeSAWorkflowSubList, setActiveSAWorkflowSubList] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [notificationCount, setNotificationCount] = useState(0);
  const isMobile = window.innerWidth <= 767;
  const dropdownButton = document.getElementById("page-header-user-dropdown");
  const style = {
    backgroundColor: windowWidth < 1200 ? "inherit" : "",
    border: "none",
  };
  useEffect(() => {
    if (common.token && topbar === "block") {
      NotificationCountData();
    }
    // NotificationVanishCount()
    let OrganisationLocalList = localStorage.getItem("OrganisationLocalList");
    if (OrganisationLocalList === undefined || OrganisationLocalList === null) {
      GetOrganisationsListData(common.userKeyID);
    } else {
      OrganisationLocalListData();
    }
    setIsAddUpdatePurchaseDone(false);
  }, [common.userKeyID, common.organisationKeyID, isAddUpdatePurchaseDone]);

  useEffect(() => {
    if (isMobile) {
      const hamburger = document.querySelector(".hamburger-icon");
      hamburger.classList.contains("open")
        ? hamburger.classList.remove("open")
        : hamburger.classList.remove("dsf");
      document.body.classList.remove("menu");
    }
  }, [common.organisationKeyID]);

  useEffect(() => {
    if (isAddUpdateDone) {
      GetOrganisationsListData(common.userKeyID);
    }
    setIsAddUpdateDone(false);
  }, [isAddUpdateDone]);
  useEffect(() => {
    if (common.organisationKeyID == "") {
      const interval = setInterval(() => {
        OrganisationLocalListData(); // Call the function to update organisationsList from localStorage
      }, 1000); // Update every 2 seconds
      // Cleanup function to clear the interval when component unmounts or when the dependency array changes
      return () => clearInterval(interval);
    }
  }, [common.organisationKeyID]);
  const handleOpenSessionModel = () => {
    setIsOpenSessionTimeout(true);
  };

  const handleCloseSessionModel = () => {
    setIsOpenSessionTimeout(false);
  };
  const NotificationCountData = async () => {
    setLoader(true);
    try {
      const Data = await NotificationCount(
        common.userKeyID,
        common.organisationKeyID,
      );
      if (Data) {
        setLoader(false);
        if (Data?.data?.statusCode === 200) {
          let Count = Data.data.responseData.data;
          setNotificationCount(Count);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const NotificationVanishCount = async () => {
    setLoader(true);
    try {
      const Data = await VanishCount(
        common.userKeyID,
        common.organisationKeyID,
      );
      if (Data) {
        setLoader(false);
        if (Data?.data?.statusCode === 200) {
          setNotificationCount(0);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const closeNav = (event) => {
    if (isMobile || window.innerWidth <= 1024) {
      // Only proceed if the dropdown is currently open
      if (document.body.classList.contains("menu")) {
        setIsDropdownOpen(false);
        const hamburger = document.querySelector(".hamburger-icon");
        hamburger?.classList.remove("open");
        document.body.classList.remove("menu");
        // Remove event listeners
        document.body.removeEventListener("click", handleClickOutside);
        const dropdownButton = document.getElementById(
          "page-header-user-dropdown",
        );
        dropdownButton.removeEventListener("click", handleCloseDropdown);
      }
    }
  };
  const togglenav = (event) => {
    // Adjust the breakpoint according to your design
    if (isMobile || window.innerWidth <= 1024) {
      setIsDropdownOpen(false);

      const hamburger = document.querySelector(".hamburger-icon");
      hamburger?.classList.toggle("open");
      document.body.classList.contains("menu")
        ? document.body.classList.remove("menu")
        : document.body.classList.add("menu");
      // Add event listener to close dropdown when clicking outside of it
      document.body.addEventListener("click", handleClickOutside);
      // Add event listener to close dropdown when clicking on the button inside the dropdown
      const dropdownButton = document.getElementById(
        "page-header-user-dropdown",
      );
      dropdownButton.addEventListener("click", handleCloseDropdown);

      // const notificationDropdownButton = document.getElementById(
      //   "page-header-notifications-dropdown"
      // );
      // notificationDropdownButton.addEventListener("click", handleCloseDropdown);
    }
  };
  const handleClickOutside = (event) => {
    // debugger
    const navbarHeader = document.querySelector(".navbar-header");
    const hamburger = document.querySelector(".hamburger-icon");
    const selectBox = document.querySelector(".nav-select");
    // Check if the clicked element is outside of the navbar-header, hamburger icon, and select box
    if (
      !navbarHeader?.contains(event.target) &&
      !hamburger?.contains(event.target) &&
      !selectBox?.contains(event.target)
    ) {
      // Close the dropdown menu
      document.body.classList.remove("menu");
      hamburger.classList.remove("open");
      // Remove the event listener to avoid unnecessary checks
      document.body.removeEventListener("click", handleClickOutside);
      dropdownButton.removeEventListener("click", handleCloseDropdown);
      // notificationDropdownButton.removeEventListener(
      //   "click",
      //   handleCloseDropdown
      // );
    }
  };
  const handleCloseDropdown = (event) => {
    // Close the dropdown menu
    document.body.classList.remove("menu");
    const hamburger = document.querySelector(".hamburger-icon");
    hamburger.classList.remove("open");
    // Remove the event listener to avoid unnecessary checks
    document.body.removeEventListener("click", handleClickOutside);
  };

  const handleCloseModel = () => {
    setShowModal(false);
  };

  const toggleSettingDropdown = () => {
    const list = document.getElementById("Subscription");
    setIsSettingDropdownOpen(!isSettingDropdownOpen);
    if (!isSettingDropdownOpen) {
      list.style.display = "block";
      list.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      list.style.display = "none";
    }
  };

  const toggleUserRoleDropdown = () => {
    const list = document.getElementById("UserRole");
    setIsUserRoleDropdownOpen(!isUserRoleDropdownOpen);
    if (!isUserRoleDropdownOpen) {
      list.style.display = "block";
      list.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      list.style.display = "none";
    }
  };

  // onchange color handle function
  const updateVariableFun = async () => {
    if (
      (updatedEngagementName === updatedProposalName &&
        updatedEngagementName &&
        updatedProposalName) ||
      (updatedEngagementName === updatedProspectName &&
        updatedEngagementName &&
        updatedProspectName) ||
      (updatedProposalName === updatedProspectName &&
        updatedProposalName &&
        updatedProspectName)
    ) {
      setRequireErrorMessage(true);
      return false;
    } else if (
      (!updatedEngagementName &&
        !updatedProposalName &&
        !updatedProspectName) ||
      (updatedEngagementName === "" &&
        updatedProposalName === "" &&
        updatedProspectName === "")
    ) {
      setRequireErrorMessage(true);
      return false;
    } else {
      setRequireErrorMessage(false);
      $("#" + "SetPersonalizeSettingModal").modal("hide");
      await handleNameChange();
      await handleNameChangeProposal();
      await handleNameChangeEngagement();
      await UpdateThemeSettingsData("Variable names ");
    }
  };

  // onchange select Organisation handle function
  const OnOrganisationsChange = async (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "1") {
      navigate("/create-new-practice", { state: 0 });
    } else {
      const valuesArray = selectedValue.split(",");

      let organisationData;
      if (valuesArray[0] == "null") {
        organisationData = await organisationsList.find((item) => {
          return null == item.organisationKeyID;
        });
      } else {
        organisationData = await organisationsList.find((item) => {
          return valuesArray[0] == item.organisationKeyID;
        });
      }
      if (organisationData) {
        const personalizeSettings = organisationData.personalizeSetting || [];
        personalizeSettings.forEach((setting) => {
          switch (setting.settingName) {
            case "VariableEngagementName":
              setEngagementName(setting.settingValue);
              break;
            case "VariableProposalName":
              setProposalName(setting.settingValue);
              break;
            case "VariableProspectName":
              setProspectName(setting.settingValue);
              break;
            default:
              // Handle other settings if needed
              break;
          }
        });
      } else {
        // Reset state variables if no organization is selected
        setEngagementName("");
        setProposalName("");
        setProspectName("");
      }
      const organisationKeyID =
        organisationData?.organisationKeyID === undefined
          ? null
          : organisationData?.organisationKeyID;
      if (organisationKeyID !== null) {
        await OrganisationLoginUpdate(common.userKeyID, organisationKeyID);
      }

      //alert("OnOrganisationsChange : "+JSON.stringify(selectedOrg))
      localStorage.setItem(
        "userAccess",
        JSON.stringify(organisationData.accessList),
      );
      setActiveOrganization(organisationData.accessList);
      localStorage.setItem(
        "subscriptionPlan",
        JSON.stringify(organisationData.subscriptionPlan),
      );
      setActiveOrganizationSubscriptionPlan(organisationData.subscriptionPlan);
      setActiveOrganizationKeyId(organisationData.organisationKeyID);

      dispatch(
        updateState({
          businessTypeID:
            organisationData?.businessTypeID === undefined
              ? null
              : organisationData?.businessTypeID,
          organisationKeyID:
            organisationData?.organisationKeyID === undefined
              ? null
              : organisationData?.organisationKeyID,
          professionTypeLists:
            organisationData?.professionTypeLists === null
              ? []
              : organisationData?.professionTypeLists,
          enableEL: organisationData?.enableEL,
          currencyID: organisationData?.currencyID,
        }),
      );

      navigate("/");
      if (
        organisationData.subscriptionPlan.isPlanActive !== true ||
        (organisationData.subscriptionPlan.isPlanActive === true &&
          organisationData.subscriptionPlan.yearlyValuePlan < 1)
      ) {
      } else {
        clearTimeout(timeoutId);
        setShowModal(false);
      }

      togglenav();
    }
  };

  // Topbar drop Down menu hide and show function
  // A] config list
  const closeDropdown = (id) => {
    const list = document.getElementById(id);
    if (list) {
      list.style.display = "none";
      togglenav();
    }
  };

  const showConfigList = () => {
    const configs = document.getElementById("config");
    configs.style.display = "block";
  };

  const showConfigSubList = (id) => {
    const list = document.getElementById(id);
    list.style.display = "block";
  };

  const hideConfigList = () => {
    const configs = document.getElementById("config");
    configs.style.display = "none";
    //setSubListVisible(false);
  };

  const hideConfigSubList = (id) => {
    const configs = document.getElementById(id);
    configs.style.display = "none";
  };

  const toggleConfigSubList = (id) => {
    if (isMobile) {
      const list = document.getElementById(id);
      const allLists = document.querySelectorAll(".subList");

      allLists.forEach((element) => {
        if (element.classList.contains("d-block") && element.id !== id) {
          element.classList.remove("d-block");
          element.classList.add("d-none");
        }
      });

      if (list.classList.contains("d-block")) {
        list.classList.remove("d-block");
        list.classList.add("d-none");
      } else {
        list.classList.add("d-block");
        list.classList.remove("d-none");
      }
    }
  };

  const showSAWorkflowSubList = (id) => {
    const list = document.getElementById(id);
    if (list) list.style.display = "block";
  };

  const hideSAWorkflowSubList = (id) => {
    const list = document.getElementById(id);
    if (list) list.style.display = "none";
  };

  const showUserSettingList = () => {
    setIsUserRoleDropdownOpen(true);
  };
  //show function for setting
  const showSettingList = () => {
    setIsSettingDropdownOpen(true);
  };

  const toggleSettingList = () => {
    const list = document.getElementById("Setting");

    if (list.style.display !== "block") {
      list.style.display = "block";
      list.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      list.style.display = "none";
    }
  };

  //show  function for setting sub list
  const showSettingSubList = (id) => {
    const list = document.getElementById(id);
    list.style.display = "block";
  };

  // hide function for setting
  const hideSettingList = () => {
    setIsSettingDropdownOpen(false);
  };
  // hide function for setting sub list
  const hideSettingSubList = (id) => {
    const configs = document.getElementById(id);
    configs.style.display = "none";
  };

  const toggleSettingSubList = (id) => {
    if (isMobile) {
      const list = document.getElementById(id);
      const allLists = document.querySelectorAll(".subList");

      allLists.forEach((element) => {
        if (element.classList.contains("d-block") && element.id !== id) {
          element.classList.remove("d-block");
          element.classList.add("d-none");
        }
      });

      if (list.classList.contains("d-block")) {
        list.classList.remove("d-block");
        list.classList.add("d-none");
      } else {
        list.classList.add("d-block");
        list.classList.remove("d-none");
        list.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleClose = () => {
    $("#" + "SetPersonalizeSettingModal").modal("hide");
    setOpenSuccessModal(false);
    setOpenPurchaseModal(false);
  };

  const toggleConfigList = () => {
    const list = document.getElementById("config");
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      list.style.display = "block";
      list.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      list.style.display = "none";
    }
  };

  const hideUserRoleList = () => {
    setIsUserRoleDropdownOpen(false);
  };

  const showWorkflowList = () => {
    setIsWorkflowDropdownOpen(true);
    workflowRef.current?.setAttribute("aria-expanded", "true");
  };

  const hideWorkflowList = () => {
    setIsWorkflowDropdownOpen(false);
    workflowRef.current?.setAttribute("aria-expanded", "false");
  };

  const toggleWorkflowList = () => {
    const nextState = !isWorkflowDropdownOpen;
    setIsWorkflowDropdownOpen(nextState);
    workflowRef.current?.setAttribute("aria-expanded", String(nextState));
  };

  const showSAWorkflowList = () => {
    setIsSAWorkflowDropdownOpen(true);
    saWorkflowRef.current?.setAttribute("aria-expanded", "true");
  };

  const hideSAWorkflowList = () => {
    setIsSAWorkflowDropdownOpen(false);
    saWorkflowRef.current?.setAttribute("aria-expanded", "false");
    setActiveSAWorkflowSubList("");
  };

  const toggleSAWorkflowList = () => {
    const nextState = !isSAWorkflowDropdownOpen;
    setIsSAWorkflowDropdownOpen(nextState);
    saWorkflowRef.current?.setAttribute("aria-expanded", String(nextState));
  };

  const toggleSAWorkflowSubList = (id) => {
    setActiveSAWorkflowSubList((prev) => (prev === id ? "" : id));
  };
  // logout function
  const Logout = () => {
    localStorage.removeItem("userAccess");
    localStorage.removeItem("OrganisationLocalList");
    localStorage.removeItem("userThemeSettingLocalStorage");
    localStorage.removeItem("logoutMilliseconds");
    localStorage.removeItem("subscriptionPlan");
    localStorage.removeItem("accessCount");
    localStorage.clear();
    handleReloadClick();
    dispatch(resetState());
    navigate("/login");
  };

  // Notification function
  const Notifications = () => {
    setNotificationCount(0); // Immediately set count to 0 on click
    NotificationVanishCount(); // Call API to vanish the count
    NotificationCountData();
    navigate("/notification"); // Call API to fetch the updated count
  };

  const OrganisationLocalListData = async () => {
    let OrganisationList = localStorage.getItem("OrganisationLocalList");
    if (OrganisationList) {
      // Parse the JSON string to a JavaScript object
      let OrganisationListData = JSON.parse(OrganisationList);
      setOrganisationsList(OrganisationListData);
      // Check if userThemeSettings is not null or undefined
      let organisationData;
      if (common.organisationKeyID == null) {
        organisationData = await OrganisationListData.find((item) => {
          return null == item.organisationKeyID;
        });
      } else if (common.organisationKeyID == "") {
        organisationData = OrganisationListData[0];
      } else {
        organisationData = await OrganisationListData.find((item) => {
          return (
            common.organisationKeyID?.toUpperCase() ==
            item.organisationKeyID?.toUpperCase()
          );
        });
      }
      if (organisationData == undefined) {
        return;
      }
      localStorage.setItem(
        "userAccess",
        JSON.stringify(organisationData.accessList),
      );
      setActiveOrganization(organisationData.accessList);

      if (organisationData) {
        const personalizeSettings = organisationData.personalizeSetting || [];
        personalizeSettings.forEach((setting) => {
          switch (setting.settingName) {
            case "VariableEngagementName":
              setEngagementName(setting.settingValue);
              break;
            case "VariableProposalName":
              setProposalName(setting.settingValue);
              break;
            case "VariableProspectName":
              setProspectName(setting.settingValue);
              break;
            default:
              // Handle other settings if needed
              break;
          }
        });
      } else {
        // Reset state variables if no organization is selected
        setEngagementName("");
        setProposalName("");
        setProspectName("");
      }

      if (OrganisationListData) {
        setOrganisationsList(OrganisationListData);
        if (common.organisationKeyID === "") {
          dispatch(
            updateState({
              businessTypeID: organisationData.businessTypeID,
              organisationKeyID: organisationData.organisationKeyID,
              professionTypeLists: organisationData.professionTypeLists,
              organisationCount: OrganisationListData.length,
              enableEL: organisationData.enableEL,
              currencyID: organisationData.currencyID,
            }),
          );
        }
      }
    }
  };

  // 1) Get Organisations List Data
  const GetOrganisationsListData = async (KeyID) => {
    if (common.token === "") {
      return;
    }
    try {
      setLoader(true);
      const response = await GetOrganisationLookupList(KeyID);
      if (response?.data?.statusCode === 200) {
        setLoader(false);
        getOrganisationLookupListApiCallCount = 0;
        if (response?.data?.responseData?.data) {
          const totalCount = response.data.totalCount;
          const OrganisationsListData = response.data.responseData.data;
          localStorage.removeItem("OrganisationLocalList");
          localStorage.setItem(
            "OrganisationLocalList",
            JSON.stringify(OrganisationsListData),
          );
          setOrganisationsList(OrganisationsListData);

          let organisationData = [];
          if (common.organisationKeyID == null) {
            organisationData = await OrganisationsListData.find((item) => {
              return null == item.organisationKeyID;
            });
          } else if (common.organisationKeyID == "") {
            organisationData = OrganisationsListData[0];
          } else {
            organisationData = await OrganisationsListData.find((item) => {
              return (
                common.organisationKeyID?.toUpperCase() ==
                item.organisationKeyID?.toUpperCase()
              );
            });
          }
          if (organisationData == undefined) {
            return;
          }
          if (organisationData.length == 0) {
            return;
          }
          localStorage.setItem(
            "userAccess",
            JSON.stringify(organisationData.accessList),
          );
          setActiveOrganization(organisationData.accessList);
          localStorage.setItem(
            "subscriptionPlan",
            JSON.stringify(organisationData.subscriptionPlan),
          );
          setActiveOrganizationSubscriptionPlan(
            organisationData.subscriptionPlan,
          );

          if (organisationData) {
            const personalizeSettings =
              organisationData.personalizeSetting || [];
            personalizeSettings.forEach((setting) => {
              switch (setting.settingName) {
                case "VariableEngagementName":
                  setEngagementName(setting.settingValue);
                  break;
                case "VariableProposalName":
                  setProposalName(setting.settingValue);
                  break;
                case "VariableProspectName":
                  setProspectName(setting.settingValue);
                  break;
                default:
                  // Handle other settings if needed
                  break;
              }
            });
            setOrgLoaderList(true);
          } else {
            // Reset state variables if no organization is selected
            setOrgLoaderList(true);
            setEngagementName("");
            setProposalName("");
            setProspectName("");
          }
          setLoader(false);
          if (organisationData.organisationKeyID !== null) {
            await OrganisationLoginUpdate(
              common.userKeyID,
              organisationData.organisationKeyID,
            );
          }
          if (organisationData) {
            setOrgLoaderList(true);
            dispatch(
              updateState({
                businessTypeID: organisationData.businessTypeID,
                organisationKeyID: organisationData.organisationKeyID,
                professionTypeLists:
                  organisationData.professionTypeLists === null
                    ? []
                    : organisationData.professionTypeLists,
                enableEL: organisationData.enableEL,
                currencyID: organisationData.currencyID,
              }),
            );
          } else if (
            getOrganisationLookupListApiCallCount < maxCountToRecallApi
          ) {
            setOrgLoaderList(true);
            getOrganisationLookupListApiCallCount += 1;
            setTimeout(function () {
              GetOrganisationsListData(KeyID);
            }, 2000);
          }
        }
      }
    } catch (error) {
      setOrgLoaderList(true);
      console.log(error);
    }
  };

  // side bar close open function
  const ToggleDrawer = (anchor, open, close) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
    UserDefaultTheme();
  };

  // Color function sidebar menu
  const List = (anchor) => (
    <>
      <div
        class="d-flex align-items-center bg-gradient offcanvas-header sidebar-header"
        style={{ backgroundColor: " rgb(51, 53, 71)" }}
      >
        <h5 class="m-0 me-2" style={{ color: "#ffff" }}>
          Theme Customizer
        </h5>
        <button
          type="button"
          onClick={ToggleDrawer(anchor, false)}
          class="btn btn-md btn-success create-item-btn"
        >
          <span> Close</span>
        </button>
      </div>
      <Box
        className="color-sidebar"
        sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 275 }}
        role="presentation"
        onClick={() => {
          ToggleDrawer(anchor, true);
        }}
        onKeyDown={ToggleDrawer(anchor, false)}
        onKeyPress={ToggleDrawer(anchor, true)}
      >
        <div className="row">
          <div className="col-8" style={{ marginTop: "10px" }}>
            {" "}
            <h6 class="fw-semibold fs-15">Color Scheme:</h6>
          </div>
          <div className="col-4 float">
            <h6 class="fw-semibold fs-15">
              <button
                type="button"
                onClick={() => handleSetDefault()}
                style={{ backgroundColor: "#ebebebe0", fontSize: "small" }}
                className="btn "
              >
                Default
              </button>
            </h6>
          </div>
        </div>
        <p class="text-muted fs-13 sidebar-sub-title">Set your color scheme</p>
        <div className="row">
          <div className="col-md-6">
            <input
              type="color"
              class="form-control"
              id="exampleColorInput contactNumber"
              value={currentTopbarColor}
              onChange={(event) => {
                // event.stopPropagation();
                OnChangeTopbarColor(event);
              }}
            />
            <h5 class="fs-13 text-center mt-2">Header Bg-Color</h5>
          </div>
          <div className="col-md-6">
            <input
              type="color"
              class="form-control"
              id="exampleColorInput contactNumber"
              value={currentTopbarTextColor}
              onChange={(event) => {
                OnChangeTopbarTextColor(event);
              }}
            />
            <h5 class="fs-13 text-center mt-2">Header Text Color</h5>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <input
              type="color"
              class="form-control"
              id="exampleColorInput contactNumber"
              value={currentCardColor}
              onChange={(event) => {
                handleOnChangeCard(event);
              }}
            />
            <h5 class="fs-13 text-center mt-2">Card Bg-Color</h5>
          </div>
        </div>
      </Box>
      <Box
        className="color-sidebar ApplyChanges"
        sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 275 }}
        role="presentation"
      >
        <div style={{ width: "100%" }} className="row">
          <div className="col-md-12">
            <button
              type="button"
              onClick={() => {
                UpdateThemeSettingsData("Theme");
                setState({ ...state, [anchor]: false }); // Close the drawer
              }}
              style={{
                backgroundColor: "#ebebebe0",
                fontSize: "small",
                width: "100%",
              }}
              class="btn btn-md btn-success create-item-btn"
            >
              <span> Apply Changes</span>
            </button>
          </div>
        </div>
      </Box>
    </>
  );

  const toggleSelect = (event) => {
    event.stopPropagation();
    setIsOpens(!isOpens);
  };

  // Top bar menu start
  //Design part :
  return (
    <div className="container" style={{ display: topbar }}>
      <div className="row">
        <header
          id="page-topbar"
          style={TopbarStyle} // set display block and none using authcontext
        >
          <div class="layout-width">
            <div class="navbar-header1">
              <div class="d-flex">
                <div
                  class="navbar-menu topdropdowm"
                  style={{
                    position: "fixed",
                    top: "10px",
                    backgroundColor: TopbarStyle.backgroundColor,
                  }}
                >
                  <div class="container">
                    <div class="row">
                      <ul class="navbar-nav d-none d-md-block" id="navbar-nav">
                        <li class="nav-item edit-dropdown-cls">
                          {accessCount !== 0 && (
                            <>
                              <div
                                style={{
                                  position: "relative",
                                  display: "inline-block",
                                }}
                              >
                                {/* Organisation List */}
                                <select
                                  className="nav-select form-select"
                                  onChange={(e) => OnOrganisationsChange(e)}
                                  value={`${common.organisationKeyID},${common.businessTypeID},${common.enableEL}`}
                                  style={{
                                    cursor: "pointer",
                                    padding: "8px 15px 8px 12px",
                                  }}
                                  onClick={toggleSelect} // Add onClick event to toggle select
                                  onBlur={() => setIsOpens(false)} // Add onBlur event to close select when clicked outside
                                >
                                  {organisationsList.map((organisations) => (
                                    <option
                                      key={organisations.organisationKeyID}
                                      value={`${organisations.organisationKeyID},${organisations.businessTypeID},${organisations.enableEL}`}
                                    >
                                      {organisations.organisationName}
                                    </option>
                                  ))}

                                  <option value="1">Create New Practice</option>
                                </select>
                                <i
                                  className={
                                    isOpens
                                      ? "  ri-arrow-up-s-line"
                                      : " ri-arrow-down-s-line "
                                  }
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    right: "5px",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    pointerEvents: "none",
                                    zIndex: "1000",
                                    backgroundColor: "#1b1c25",
                                    color: "white",
                                    ...(isOpens ? { fontWeight: "bold" } : {}),
                                  }}
                                ></i>
                              </div>

                              <div className="edit-topbar">
                                <div
                                  onClick={() => (
                                    navigate("/create-new-practice"),
                                    togglenav()
                                  )}
                                  title="Create New Practice "
                                >
                                  <i
                                    style={{
                                      cursor: "pointer",
                                      color: TopTextColor.color,
                                    }}
                                    class="fa fa-regular fa fa-circle-plus"
                                  ></i>
                                </div>
                              </div>
                              {common.organisationKeyID !== null && (
                                <div className="update-practice-details">
                                  <div
                                    onClick={() =>
                                      navigate(
                                        "/update-practice-details",
                                        closeNav(),
                                      )
                                    }
                                    title="Update Practice"
                                  >
                                    <i
                                      style={{
                                        cursor: "pointer",
                                        color: TopTextColor.color,
                                      }}
                                      class="ri-pencil-fill"
                                    ></i>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="navbar-header ">
              <button
                type="button"
                onClick={togglenav}
                class="btn btn-sm px-2  fs-16 header-item vertical-menu-btn topnav-hamburger"
                id="topnav-hamburger-icon"
              >
                <span class="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
              <ul class="d-md-none d-block navbar-nav" id="navbar-nav">
                <li class="nav-item edit-dropdown-cls">
                  {accessCount !== 0 && (
                    <>
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        {/* Organisation List */}
                        <select
                          className="nav-select form-select c-select"
                          onChange={(e) => OnOrganisationsChange(e)}
                          value={`${common.organisationKeyID},${common.businessTypeID},${common.enableEL}`}
                          style={{
                            cursor: "pointer",
                            padding: "8px 15px 8px 12px",
                          }}
                          onClick={toggleSelect} // Add onClick event to toggle select
                          onBlur={() => setIsOpens(false)} // Add onBlur event to close select when clicked outside
                        >
                          {organisationsList.map((organisations) => (
                            <option
                              key={organisations.organisationKeyID}
                              value={`${organisations.organisationKeyID},${organisations.businessTypeID},${organisations.enableEL}`}
                            >
                              {organisations.organisationName}
                            </option>
                          ))}

                          <option value="1">Create New Practice</option>
                        </select>
                        <i
                          className={
                            isOpens
                              ? "  ri-arrow-up-s-line"
                              : " ri-arrow-down-s-line "
                          }
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "5px",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            pointerEvents: "none",
                            zIndex: "1000",
                            backgroundColor: "#1b1c25",
                            color: "white",
                            ...(isOpens ? { fontWeight: "bold" } : {}),
                          }}
                        ></i>
                      </div>

                      <div className="edit-topbar">
                        <div
                          onClick={() => (
                            navigate("/create-new-practice"),
                            togglenav()
                          )}
                          title="Create New Practice "
                        >
                          <i
                            style={{
                              cursor: "pointer",
                              color: TopTextColor.color,
                            }}
                            class="fa fa-regular fa fa-circle-plus"
                          ></i>
                        </div>
                      </div>
                      {common.organisationKeyID !== null && (
                        <div className="update-practice-details">
                          <div
                            onClick={() =>
                              navigate("/update-practice-details", closeNav())
                            }
                            title="Update Practice"
                          >
                            <i
                              style={{
                                cursor: "pointer",
                                color: TopTextColor.color,
                              }}
                              class="ri-pencil-fill"
                            ></i>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </li>
              </ul>
              {common.organisationKeyID !== null && (
                <div class="d-flex">
                  <div
                    class="navbar-menu"
                    style={{ backgroundColor: TopbarStyle.backgroundColor }}
                  >
                    <div class="container">
                      <div class="row" style={{ marginTop: "5px" }}>
                        <ul
                          className={`changed-nav navbar-nav${
                            isDropdownOpen ? " open" : ""
                          } `}
                          id="navbar-UL-nav"
                        >
                          <li class="menu-title">
                            <span data-key="t-menu">Menu</span>
                          </li>
                          {/* Dashboard Start */}
                          {userAccessData.Dashboard_CanView && (
                            <li class="nav-item">
                              <NavLink
                                to="/"
                                exact
                                onClick={() => {
                                  NotificationCountData();
                                  togglenav();
                                }}
                                className="nav-link menu-link"
                                activeclassname="active"
                                onMouseOver={() => setIsHoveredDashboard(true)}
                                onMouseOut={() => setIsHoveredDashboard(false)}
                                style={{
                                  color: isHoveredDashboard
                                    ? "#438eff"
                                    : TopTextColor.color,
                                }}
                              >
                                <img
                                  src={DashboardSvg}
                                  alt="Dashboard"
                                  style={{ width: "16px", marginRight: "5px" }}
                                />
                                {/* <i class="bi bi-graph-up mr-2"></i> */}
                                <span data-key="t-dashboard">Dashboard</span>
                              </NavLink>
                            </li>
                          )}
                          {/* Dashboard end */}
                          {/* Prospect/Client Start */}
                          {userAccessData.Admin_Prospect_CanView && (
                            // hasAccess(1, 4)
                            <li class="nav-item">
                              <NavLink
                                to="/prospects"
                                onClick={() => {
                                  NotificationCountData();
                                  togglenav();
                                }}
                                className="nav-link menu-link"
                                activeclassname="active"
                                onMouseOver={() => setIsHoveredProspect(true)}
                                onMouseOut={() => setIsHoveredProspect(false)}
                                style={{
                                  color: isHoveredProspect
                                    ? "#438eff"
                                    : TopTextColor.color,
                                }}
                              >
                                <img
                                  src={ProspectSvg}
                                  alt="ProspectSvg"
                                  style={{ width: "16px", marginRight: "5px" }}
                                />
                                <span data-key="t-dashboard">
                                  {prospectName}
                                </span>{" "}
                              </NavLink>
                            </li>
                          )}
                          {/* Prospect End */}
                          {/* proposalName latter Start */}
                          {userAccessData.Admin_Proposal_CanView && (
                            <li class="nav-item">
                              <NavLink
                                to="/proposals"
                                activeclassname="active"
                                onClick={() => {
                                  NotificationCountData();
                                  togglenav();
                                }}
                                className="nav-link menu-link"
                                onMouseOver={() => setIsHoveredProposal(true)}
                                onMouseOut={() => setIsHoveredProposal(false)}
                                style={{
                                  color: isHoveredProposal
                                    ? "#438eff"
                                    : TopTextColor.color,
                                }}
                              >
                                {" "}
                                <img
                                  src={ProposalSvg}
                                  alt="ProposalSvg"
                                  style={{ width: "16px", marginRight: "5px" }}
                                />
                                {/* <i class="bi bi-card-list mr-2"  ></i>{" "} */}
                                <span data-key="t-dashboard">
                                  {proposalName}
                                </span>{" "}
                              </NavLink>
                            </li>
                          )}
                          {/*proposalName  latter End */}
                          {/* Engagement latter Start */}
                          {common.enableEL == 1 &&
                            userAccessData.Admin_Engagement_Latter_CanView && (
                              <li class="nav-item">
                                <NavLink
                                  to="/engagement-letters"
                                  onClick={() => {
                                    NotificationCountData();
                                    togglenav();
                                  }}
                                  activeclassname="active"
                                  className="nav-link menu-link"
                                  onMouseOver={() =>
                                    setIsHoveredEngagement(true)
                                  }
                                  onMouseOut={() =>
                                    setIsHoveredEngagement(false)
                                  }
                                  style={{
                                    color: isHoveredEngagement
                                      ? "#438eff"
                                      : TopTextColor.color,
                                  }}
                                >
                                  {" "}
                                  <img
                                    src={EngagementSvg}
                                    alt="EngagementSvg"
                                    style={{
                                      width: "16px",
                                      marginRight: "5px",
                                    }}
                                  />
                                  {/* <i class="bi bi-envelope-paper mr-2"  ></i>{" "} */}
                                  <span data-key="t-dashboard">
                                    {" "}
                                    {EngagementName}
                                  </span>{" "}
                                </NavLink>
                              </li>
                            )}

                          {/* Engagement latter End */}
                          {/* Admin Config Modal Start */}
                          {userAccessData.Admin_Config_CanView && (
                            <li
                              class="nav-item"
                              onMouseLeave={() => hideConfigList()}
                              onMouseEnter={() => showConfigList()}
                            >
                              <a
                                class="nav-link menu-link collapsed"
                                data-bs-toggle="collapse"
                                role="button"
                                aria-expanded="false"
                                onClick={toggleConfigList}
                                aria-controls="sidebarPages"
                                onMouseOver={() => setIsHoveredConfigure(true)}
                                onMouseOut={() => setIsHoveredConfigure(false)}
                                ref={settingsRef}
                                style={{
                                  color: isHoveredConfigure
                                    ? "#438eff"
                                    : TopTextColor.color,
                                }}
                              >
                                {/* <i class="bi bi-tools mr-2"></i>{" "} */}

                                <img
                                  src={ConfigSvg}
                                  alt="ConfigSvg"
                                  style={{ width: "16px", marginRight: "5px" }}
                                />
                                <span data-key="t-pages">Configure</span>
                              </a>
                              <div
                                id="config"
                                style={{
                                  display: isDropdownOpen ? "block" : "none",
                                  border: "none",
                                }}
                                class="collapse menu-dropdown menu_dropdown Responsive-Config-service-package"
                              >
                                <ul class="nav nav-sm flex-column">
                                  {/* Admin Config Modal SubList Start */}
                                  {userAccessData.Admin_Config_ServiceCat_CanView && (
                                    <li
                                      class="nav-item"
                                      onMouseLeave={() =>
                                        hideConfigSubList("servicesAndPackage")
                                      }
                                      onMouseEnter={() =>
                                        showConfigSubList("servicesAndPackage")
                                      }
                                    >
                                      <a
                                        href="#sidebarProfile"
                                        class="nav-link collapsed"
                                        data-bs-toggle="collapse"
                                        role="button"
                                        aria-expanded="false"
                                        aria-controls="sidebarProfile"
                                        onClick={() =>
                                          toggleConfigSubList(
                                            "servicesAndPackage",
                                          )
                                        }
                                      >
                                        Services/Packages
                                      </a>
                                      <div
                                        class="subList collapse menu-dropdown Service-package-bgColor"
                                        style={style}
                                        id="servicesAndPackage" // sub list id pass
                                      >
                                        <ul class="nav nav-sm flex-column">
                                          {/* Admin Config Modal SubList of SubList Start */}
                                          <li class="nav-item ">
                                            <NavLink
                                              to="/service-category"
                                              onClick={togglenav}
                                            >
                                              <a
                                                onClick={() => {
                                                  closeDropdown("config");
                                                  NotificationCountData();
                                                  togglenav();
                                                }} // pass main list id
                                                style={{ whiteSpace: "nowrap" }}
                                                class="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Service Categories
                                              </a>
                                            </NavLink>
                                          </li>
                                          <li class="nav-item ">
                                            <NavLink
                                              to="/services"
                                              // onClick={togglenav}
                                            >
                                              <a
                                                onClick={() => {
                                                  closeDropdown("config");
                                                  NotificationCountData();
                                                }}
                                                class="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Services
                                              </a>
                                            </NavLink>
                                          </li>
                                          <li class="nav-item ">
                                            <NavLink
                                              to="/packages"
                                              // onClick={togglenav}
                                            >
                                              <a
                                                onClick={() => {
                                                  closeDropdown("config");
                                                  NotificationCountData();
                                                }}
                                                class="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Packages
                                              </a>
                                            </NavLink>
                                          </li>
                                          {/* Admin Config Modal SubList of SubList End */}
                                        </ul>
                                      </div>
                                    </li>
                                  )}

                                  {/* Admin Config Modal sec SubList  Start */}
                                  {userAccessData.Admin_Config_Global_Constant_CanView && (
                                    <li
                                      class="nav-item"
                                      onMouseLeave={() =>
                                        hideConfigSubList("variable")
                                      }
                                      onMouseEnter={() =>
                                        showConfigSubList("variable")
                                      }
                                    >
                                      <a
                                        href="#sidebarProfile"
                                        class="nav-link collapsed"
                                        data-bs-toggle="collapse"
                                        role="button"
                                        aria-expanded="false"
                                        aria-controls="sidebarProfile"
                                        data-key="t-profile"
                                        onClick={() =>
                                          toggleConfigSubList("variable")
                                        }
                                      >
                                        Variables
                                      </a>
                                      <div
                                        id="variable"
                                        style={style}
                                        class="subList collapse menu-dropdown Responsive-Config-Variables"
                                      >
                                        <ul class="nav nav-sm flex-column">
                                          <li class="nav-item ">
                                            <NavLink
                                              to="/global-constant"
                                              // onClick={togglenav}
                                            >
                                              <a
                                                onClick={() => {
                                                  closeDropdown("config");
                                                  NotificationCountData();
                                                }}
                                                style={{ whiteSpace: "nowrap" }}
                                                class="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Global Constants
                                              </a>
                                            </NavLink>
                                          </li>
                                          <li class="nav-item ">
                                            <NavLink
                                              to="/global-pricing-driver"
                                              // onClick={togglenav}
                                            >
                                              <a
                                                style={{ whiteSpace: "nowrap" }}
                                                onClick={() => {
                                                  closeDropdown("config");
                                                  NotificationCountData();
                                                }}
                                                class="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Global Pricing Drivers
                                              </a>
                                            </NavLink>
                                          </li>
                                        </ul>
                                      </div>
                                    </li>
                                  )}
                                  {userAccessData.Admin_Config_Email_Template_CanView && (
                                    <li
                                      class="nav-item"
                                      onMouseLeave={() =>
                                        hideConfigSubList("Template")
                                      }
                                      onMouseEnter={() =>
                                        showConfigSubList("Template")
                                      }
                                    >
                                      <a
                                        href="#sidebarProfile"
                                        class="nav-link collapsed"
                                        data-bs-toggle="collapse"
                                        role="button"
                                        aria-expanded="false"
                                        aria-controls="sidebarProfile"
                                        data-key="t-profile"
                                        onClick={() =>
                                          toggleConfigSubList("Template")
                                        }
                                      >
                                        Templates
                                      </a>
                                      <div
                                        style={style}
                                        class="subList collapse menu-dropdown"
                                        id="Template"
                                      >
                                        <ul class="nav nav-sm flex-column Responsive-Config-Variables ">
                                          <li class="nav-item ">
                                            <NavLink
                                              to="/templates"
                                              // onClick={togglenav}
                                            >
                                              <a
                                                style={{ whiteSpace: "nowrap" }}
                                                onClick={() => {
                                                  closeDropdown("config");
                                                  NotificationCountData();
                                                }}
                                                class="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                {proposalName}/{EngagementName}
                                              </a>
                                            </NavLink>
                                          </li>
                                          <li class="nav-item ">
                                            <NavLink
                                              to="/terms-and-conditions"
                                              // onClick={togglenav}
                                            >
                                              <a
                                                style={{ whiteSpace: "nowrap" }}
                                                onClick={() => {
                                                  closeDropdown("config");
                                                  NotificationCountData();
                                                }}
                                                class="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Terms & Conditions
                                              </a>
                                            </NavLink>
                                          </li>
                                          <li class="nav-item ">
                                            <NavLink
                                              to="/email-template"
                                              // onClick={togglenav}
                                            >
                                              <a
                                                onClick={() => {
                                                  closeDropdown("config");
                                                  NotificationCountData();
                                                }}
                                                class="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Email Templates
                                              </a>
                                            </NavLink>
                                          </li>
                                        </ul>
                                      </div>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </li>
                          )}
                          {/* Admin Config Modal End */}

                          {userAccessData.Admin_Config_Email_Template_CanView && (
                            <li
                              class="nav-item"
                              onMouseLeave={hideWorkflowList}
                              onMouseEnter={showWorkflowList}
                            >
                              <a
                                class="nav-link menu-link collapsed"
                                data-bs-toggle="collapse"
                                role="button"
                                aria-expanded={isWorkflowDropdownOpen}
                                aria-controls="workflow"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleWorkflowList();
                                }}
                                onMouseOver={() => setIsHoveredWorkflow(true)}
                                onMouseOut={() => setIsHoveredWorkflow(false)}
                                ref={workflowRef}
                                style={{
                                  color: isHoveredWorkflow
                                    ? "#438eff"
                                    : TopTextColor.color,
                                }}
                              >
                                <img
                                  src={SettingSvg}
                                  alt="WorkflowSvg"
                                  style={{ width: "16px", marginRight: "5px" }}
                                />
                                <span data-key="t-pages">
                                  Workflows
                                  <span className="menu-arrow" />
                                </span>
                              </a>
                              <div
                                id="workflow"
                                style={{
                                  ...style,
                                  display: isWorkflowDropdownOpen
                                    ? "block"
                                    : "none",
                                }}
                                class="collapse menu-dropdown Responsive-Config-service-package"
                              >
                                <ul class="nav nav-sm flex-column">
                                  <li
                                    class="nav-item"
                                    onMouseLeave={() =>
                                      hideSAWorkflowSubList("workflow")
                                    }
                                    onMouseEnter={() =>
                                      showSAWorkflowSubList("workflow")
                                    }
                                  >
                                    <NavLink to="/reminder-email-template">
                                      <a
                                        onClick={() => {
                                          closeDropdown("workflow");
                                          NotificationCountData();
                                        }}
                                        class="nav-link"
                                        data-key="t-simple-page"
                                      >
                                        Email Templates
                                      </a>
                                    </NavLink>
                                  </li>
                                  <li class="nav-item">
                                    <NavLink to="/reminder">
                                      <a
                                        onClick={() => {
                                          closeDropdown("workflow");
                                          NotificationCountData();
                                        }}
                                        class="nav-link"
                                        data-key="t-simple-page"
                                      >
                                        Reminders
                                      </a>
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                            </li>
                          )}

                          {/* Setting Admin Modal */}
                          {userAccessData.Admin_Setting_CanView && (
                            <li
                              class="nav-item serviceicon"
                              // style={{
                              //   paddingLeft:
                              //     windowWidth <= 767 ? "0px" : "10px",
                              // }}
                              onMouseLeave={() => hideSettingList()}
                              onMouseEnter={() => showSettingList()}
                            >
                              <a
                                href="#sidebarSignUp1"
                                data-bs-toggle="collapse"
                                class="nav-link menu-link collapsed"
                                role="button"
                                aria-expanded="false"
                                aria-controls="sidebarSignUp1"
                                data-key="t-signup"
                                onClick={() => toggleSettingList()}
                                onMouseOver={() => setIsHoveredSetting(true)}
                                onMouseOut={() => setIsHoveredSetting(false)}
                                ref={settingsRef}
                                style={{
                                  color: isHoveredSetting
                                    ? "#438eff"
                                    : TopTextColor.color,
                                }}
                              >
                                <img
                                  src={SettingSvg}
                                  alt="SettingSvg"
                                  style={{ width: "16px", marginRight: "5px" }}
                                />
                                <span data-key="t-dashboard">
                                  Settings
                                </span>{" "}
                              </a>
                              <div
                                class="subList collapse menu-dropdown menu_dropdown"
                                id="Setting"
                                style={{
                                  ...style,
                                  display: isSettingDropdownOpen
                                    ? "block"
                                    : "none",
                                }}
                              >
                                <ul class="nav nav-sm flex-column">
                                  {userAccessData.Admin_Setting_user_CanView && (
                                    <li class="nav-item ">
                                      <Link to="/users" onClick={togglenav}>
                                        <a
                                          onClick={() => {
                                            toggleSettingList("Setting");
                                            NotificationCountData();
                                          }}
                                          class="nav-link"
                                          data-key="t-basic-2"
                                        >
                                          Users
                                        </a>
                                      </Link>
                                    </li>
                                  )}
                                  {/* {userAccessData.Admin_Setting_AccessKeyCanView && (
                                    <li class="nav-item ">
                                      <Link
                                        to="/access-key"
                                        onClick={togglenav}
                                      >
                                        <a
                                          onClick={() => {
                                            toggleSettingList("Setting");
                                            NotificationCountData();
                                          }}
                                          class="nav-link"
                                          data-key="t-basic-4"
                                        >
                                          Access Keys
                                        </a>
                                      </Link>
                                    </li>
                                  )} */}
                                  {userAccessData.Admin_Setting_Practice_Config_CanView &&
                                    activeOrganizationSubscriptionPlan?.apiIntegration && (
                                      <li
                                        class="nav-item"
                                        onMouseLeave={() =>
                                          hideSettingSubList("WebIntegration")
                                        }
                                        onMouseEnter={() =>
                                          showSettingSubList("WebIntegration")
                                        }
                                        onClick={() =>
                                          toggleSettingSubList("WebIntegration")
                                        }
                                      >
                                        <a
                                          href="#sidebarProfile"
                                          class="nav-link collapsed"
                                          data-bs-toggle="collapse"
                                          role="button"
                                          aria-expanded="false"
                                          aria-controls="sidebarProfile"
                                          data-key="t-profile"
                                        >
                                          API Integration
                                        </a>
                                        <div
                                          class="subList collapse menu-dropdown"
                                          id="WebIntegration"
                                          style={style}
                                        >
                                          <ul class="nav nav-sm flex-column">
                                            <li class="nav-item">
                                              <Link
                                                to="/WebSetting"
                                                onClick={togglenav}
                                              >
                                                <a
                                                  onClick={() => {
                                                    toggleSettingList(
                                                      "Setting",
                                                    );
                                                    NotificationCountData();
                                                  }}
                                                  style={{
                                                    whiteSpace: "nowrap",
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-basic-3"
                                                >
                                                  Setting
                                                </a>
                                              </Link>
                                            </li>
                                            <li class="nav-item">
                                              <Link
                                                to="/AccessKey"
                                                onClick={togglenav}
                                              >
                                                <a
                                                  onClick={() => {
                                                    toggleSettingList(
                                                      "Setting",
                                                    );
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-basic-6"
                                                >
                                                  Access Key
                                                </a>
                                              </Link>
                                            </li>
                                            <li class="nav-item">
                                              <Link
                                                to="/coupon"
                                                onClick={togglenav}
                                              >
                                                <a
                                                  onClick={() => {
                                                    toggleSettingList(
                                                      "Setting",
                                                    );
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-basic-7"
                                                >
                                                  Coupons
                                                </a>
                                              </Link>
                                            </li>
                                          </ul>
                                        </div>
                                      </li>
                                    )}
                                  {userAccessData.Admin_Setting_Practice_Config_CanView && (
                                    <li
                                      class="nav-item"
                                      onMouseLeave={() =>
                                        hideSettingSubList("PracticeConfig")
                                      }
                                      onMouseEnter={() =>
                                        showSettingSubList("PracticeConfig")
                                      }
                                      onClick={() =>
                                        toggleSettingSubList("PracticeConfig")
                                      }
                                    >
                                      <a
                                        href="#sidebarProfile"
                                        class="nav-link collapsed"
                                        data-bs-toggle="collapse"
                                        role="button"
                                        aria-expanded="false"
                                        aria-controls="sidebarProfile"
                                        data-key="t-profile"
                                      >
                                        Practice Config
                                      </a>
                                      <div
                                        class="subList collapse menu-dropdown"
                                        id="PracticeConfig"
                                        style={style}
                                      >
                                        <ul class="nav nav-sm flex-column">
                                          <li class="nav-item">
                                            <Link
                                              to="/payment-gateway"
                                              onClick={togglenav}
                                            >
                                              <a
                                                onClick={() => {
                                                  toggleSettingList("Setting");
                                                  NotificationCountData();
                                                }}
                                                style={{ whiteSpace: "nowrap" }}
                                                class="nav-link"
                                                data-key="t-basic-3"
                                              >
                                                Payment Gateways
                                              </a>
                                            </Link>
                                          </li>
                                          <li class="nav-item">
                                            <Link
                                              to="/pricing-setting"
                                              onClick={togglenav}
                                            >
                                              <a
                                                onClick={() => {
                                                  toggleSettingList("Setting");
                                                  NotificationCountData();
                                                }}
                                                class="nav-link"
                                                data-key="t-basic-6"
                                              >
                                                Pricing Settings
                                              </a>
                                            </Link>
                                          </li>
                                          <li class="nav-item">
                                            <Link
                                              to="/email-config"
                                              onClick={togglenav}
                                            >
                                              <a
                                                onClick={() => {
                                                  toggleSettingList("Setting");
                                                  NotificationCountData();
                                                }}
                                                class="nav-link"
                                                data-key="t-basic-7"
                                              >
                                                Email Config
                                              </a>
                                            </Link>
                                          </li>
                                        </ul>
                                      </div>
                                    </li>
                                  )}
                                  {userAccessData.Admin_Activity_Log_CanView && (
                                    <li class="nav-item ">
                                      <Link
                                        to="/activity-logs"
                                        onClick={togglenav}
                                      >
                                        <a
                                          onClick={() => {
                                            toggleSettingList("Setting");
                                            NotificationCountData();
                                          }}
                                          class="nav-link"
                                          data-key="t-basic-4"
                                        >
                                          Activity Logs
                                        </a>
                                      </Link>
                                    </li>
                                  )}
                                  {userAccessData.Admin_Personalize_SettingCanView && (
                                    <li class="nav-item">
                                      <a
                                        onClick={() => {
                                          toggleSettingList("Setting");
                                          NotificationCountData();
                                          togglenav();
                                        }}
                                        class="nav-link"
                                        data-key="t-basic-7"
                                        data-bs-toggle="modal"
                                        data-bs-target="#SetPersonalizeSettingModal"
                                        style={{ cursor: "pointer" }}
                                      >
                                        <span
                                          class="align-middle"
                                          data-key="t-logout"
                                        >
                                          Personalize Setting
                                        </span>
                                      </a>
                                    </li>
                                  )}

                                  <li class="nav-item ">
                                    <Link
                                      to="/mySubscription"
                                      onClick={togglenav}
                                    >
                                      <a
                                        onClick={() => {
                                          toggleSettingList("Setting");
                                          NotificationCountData();
                                        }}
                                        class="nav-link"
                                        data-key="t-basic-4"
                                      >
                                        My Subscription
                                      </a>
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            </li>
                          )}

                          {/* PDF to CSV section starts */}

                          <li class="nav-item">
                            <NavLink
                              to="/pdf-to-csv"
                              onClick={() => {
                                NotificationCountData();
                                togglenav();
                              }}
                              activeclassname="active"
                              className="nav-link menu-link"
                              onMouseOver={() => setIsHoveredPdfToCsv(true)}
                              onMouseOut={() => setIsHoveredPdfToCsv(false)}
                              style={{
                                color: isHoveredPdfToCsv
                                  ? "#438eff"
                                  : TopTextColor.color,
                              }}
                            >
                              {" "}
                              <img
                                src={EngagementSvg}
                                alt="PdfToCsvSvg"
                                style={{
                                  width: "16px",
                                  marginRight: "5px",
                                }}
                              />
                              <span data-key="t-dashboard">
                                {" "}
                                PDF To CSV
                              </span>{" "}
                            </NavLink>
                          </li>

                          {/* PDF to CSV section ends */}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {common.roleTypeId == USER_ROLE_TYPE.SuperAdmin &&
                common.organisationKeyID === null && (
                  <div class="d-flex">
                    <div
                      class="navbar-menu pb-3"
                      style={{ backgroundColor: TopbarStyle.backgroundColor }}
                    >
                      <div class="container">
                        <div class="row" style={{ marginTop: "5px" }}>
                          <ul class="navbar-nav changed-nav" id="navbar-UL-nav">
                            <li class="menu-title">
                              <span data-key="t-menu">Menu</span>
                            </li>
                            {/* Dashboard Super Admin Modal */}
                            {userAccessData.Dashboard_CanView && (
                              <li class="nav-item user-name-sub-text">
                                <NavLink
                                  to="/"
                                  onClick={() => {
                                    togglenav();
                                    NotificationCountData();
                                  }}
                                  activeclassname="active"
                                  className="nav-link menu-link"
                                  onMouseOver={() =>
                                    setIsHoveredDashboards(true)
                                  }
                                  onMouseOut={() =>
                                    setIsHoveredDashboards(false)
                                  }
                                  style={{
                                    color: isHoveredDashboards
                                      ? "#438eff"
                                      : TopTextColor.color,
                                  }}
                                >
                                  <img
                                    src={DashboardSvg}
                                    alt="DashboardSvg"
                                    style={{
                                      width: "16px",
                                      marginRight: "5px",
                                    }}
                                  />
                                  {/* <i class="bi bi-graph-up mr-2"></i> */}
                                  <span data-key="t-dashboard">
                                    Dashboard
                                  </span>{" "}
                                </NavLink>
                              </li>
                            )}
                            {/* DashBoard End */}
                            {/* Organisation Super Admin Modal */}
                            {userAccessData.Organisation_CanView && (
                              <li class="nav-item user-name-sub-text">
                                <NavLink
                                  to="/organisations"
                                  onClick={() => {
                                    togglenav();
                                    NotificationCountData();
                                  }}
                                  activeclassname="active"
                                  className="nav-link menu-link"
                                  onMouseOver={() =>
                                    setIsHoveredOrganization(true)
                                  }
                                  onMouseOut={() =>
                                    setIsHoveredOrganization(false)
                                  }
                                  style={{
                                    color: isHoveredOrganization
                                      ? "#438eff"
                                      : TopTextColor.color,
                                  }}
                                >
                                  {" "}
                                  <i class="bi bi-buildings-fill mr-2"></i>{" "}
                                  <span data-key="t-dashboard">
                                    Organisations
                                  </span>{" "}
                                </NavLink>
                              </li>
                            )}

                            {/* Organisations End */}
                            {/* User Super Admin Modal */}
                            {userAccessData.User_CanView && (
                              <li class="nav-item">
                                <NavLink
                                  to="/invite-user"
                                  onClick={() => {
                                    togglenav();
                                    NotificationCountData();
                                  }}
                                  activeclassname="active"
                                  className="nav-link menu-link"
                                  onMouseOver={() => setIsHoveredUser(true)}
                                  onMouseOut={() => setIsHoveredUser(false)}
                                  style={{
                                    color: isHoveredUser
                                      ? "#438eff"
                                      : TopTextColor.color,
                                  }}
                                >
                                  {" "}
                                  <i class="bi bi-people-fill mr-2"></i>{" "}
                                  <span data-key="t-dashboard">Users</span>{" "}
                                </NavLink>
                              </li>
                            )}

                            {/* User Super Admin Modal end */}

                            {/*  Super Admin Config Modal Start */}
                            {userAccessData.SuperAdmin_Config_CanView && (
                              <li
                                class="nav-item"
                                onMouseLeave={() => hideConfigList()}
                                onMouseEnter={() => showConfigList()}
                              >
                                <a
                                  class="nav-link menu-link collapsed"
                                  href="#sidebarPages"
                                  data-bs-toggle="collapse"
                                  role="button"
                                  aria-expanded="false"
                                  aria-controls="sidebarPages"
                                  onClick={() => toggleConfigList()}
                                  onMouseOver={() =>
                                    setIsHoveredConfigure(true)
                                  }
                                  onMouseOut={() =>
                                    setIsHoveredConfigure(false)
                                  }
                                  style={{
                                    color: isHoveredConfigure
                                      ? "#438eff"
                                      : TopTextColor.color,
                                  }}
                                >
                                  <img
                                    src={ConfigSvg}
                                    alt="ConfigSvg"
                                    style={{
                                      width: "16px",
                                      marginRight: "5px",
                                    }}
                                  />
                                  {/* <i class="bi bi-tools mr-2"></i>{" "} */}
                                  <span data-key="t-pages">Configure</span>
                                </a>
                                <div
                                  id="config"
                                  style={{
                                    ...style,
                                    display: isDropdownOpen ? "block" : "none",
                                    border: "none",
                                  }}
                                  class="collapse menu-dropdown menu_dropdown Responsive-Config-service-package"
                                >
                                  <ul class="nav nav-sm flex-column">
                                    {/*  Super Admin Config SubList Modal Start */}
                                    {userAccessData.SuperAdmin_Config_ServicePackage_CanView && (
                                      <li
                                        class="nav-item"
                                        onMouseLeave={() =>
                                          hideConfigSubList(
                                            "PredefinedServicesAndPackage",
                                          )
                                        }
                                        onMouseEnter={() =>
                                          showConfigSubList(
                                            "PredefinedServicesAndPackage",
                                          )
                                        }
                                      >
                                        <a
                                          href="#sidebarProfile"
                                          class="nav-link collapsed"
                                          data-bs-toggle="collapse"
                                          role="button"
                                          aria-expanded="false"
                                          aria-controls="sidebarProfile"
                                          data-key="t-profile"
                                          onClick={() =>
                                            toggleConfigSubList(
                                              "PredefinedServicesAndPackage",
                                            )
                                          }
                                        >
                                          Organisations Services/Packages
                                        </a>
                                        <div
                                          class="subList collapse menu-dropdown"
                                          id="PredefinedServicesAndPackage"
                                          style={style}
                                        >
                                          <ul class="nav nav-sm flex-column">
                                            {/*  Super Admin Config SubList Of SubList Modal Start */}
                                            <li class="nav-item">
                                              <NavLink
                                                to="/service-category"
                                                onClick={togglenav}
                                              >
                                                <a
                                                  onClick={() => {
                                                    closeDropdown("config");
                                                    NotificationCountData();
                                                    togglenav();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations Service Categories
                                                </a>
                                              </NavLink>
                                            </li>
                                            <li class="nav-item">
                                              <NavLink to="/services">
                                                <a
                                                  onClick={() => {
                                                    closeDropdown("config");
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations Services
                                                </a>
                                              </NavLink>
                                            </li>
                                            <li class="nav-item">
                                              <NavLink to="/packages">
                                                <a
                                                  onClick={() => {
                                                    closeDropdown("config");
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations Packages
                                                </a>
                                              </NavLink>
                                            </li>
                                          </ul>
                                        </div>
                                      </li>
                                    )}
                                    {/*  Super Admin Config first SubList Modal End */}
                                    {/*  Super Admin Config Second SubList Modal start */}
                                    {userAccessData.SuperAdmin_Config_Global_Constant_CanView && (
                                      <li
                                        class="nav-item"
                                        onMouseLeave={() =>
                                          hideConfigSubList(
                                            "PredefinedVariable",
                                          )
                                        }
                                        onMouseEnter={() =>
                                          showConfigSubList(
                                            "PredefinedVariable",
                                          )
                                        }
                                      >
                                        <a
                                          href="#sidebarProfile"
                                          class="nav-link collapsed"
                                          data-bs-toggle="collapse"
                                          role="button"
                                          aria-expanded="false"
                                          aria-controls="sidebarProfile"
                                          data-key="t-profile"
                                          onClick={() =>
                                            toggleConfigSubList(
                                              "PredefinedVariable",
                                            )
                                          }
                                        >
                                          Organisations Variables
                                        </a>
                                        <div
                                          style={style}
                                          class="subList collapse menu-dropdown"
                                          id="PredefinedVariable"
                                        >
                                          <ul class="nav nav-sm flex-column">
                                            {/*  Super Admin Config Second SubList of subList Modal start */}
                                            <li class="nav-item">
                                              <NavLink to="/global-constant">
                                                <a
                                                  onClick={() => {
                                                    closeDropdown("config");
                                                    NotificationCountData();
                                                    // togglenav()
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations Global Constants
                                                </a>
                                              </NavLink>
                                            </li>
                                            <li class="nav-item">
                                              <NavLink to="/global-pricing-driver">
                                                <a
                                                  onClick={() => {
                                                    closeDropdown("config");
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations Global Pricing
                                                  Drivers
                                                </a>
                                              </NavLink>
                                            </li>
                                          </ul>
                                        </div>
                                      </li>
                                    )}
                                    {/*  Super Admin Config Sec SubList of subList Modal end  */}
                                    {/*  Super Admin Config Third SubList  Modal start */}
                                    {userAccessData.SuperAdmin_Config_Template_CanView && (
                                      <li
                                        class="nav-item"
                                        onMouseLeave={() =>
                                          hideConfigSubList(
                                            "PredefinedTemplate",
                                          )
                                        }
                                        onMouseEnter={() =>
                                          showConfigSubList(
                                            "PredefinedTemplate",
                                          )
                                        }
                                      >
                                        <a
                                          href="#sidebarProfile"
                                          class="nav-link collapsed"
                                          data-bs-toggle="collapse"
                                          role="button"
                                          aria-expanded="false"
                                          aria-controls="sidebarProfile"
                                          data-key="t-profile"
                                          onClick={() =>
                                            toggleConfigSubList(
                                              "PredefinedTemplate",
                                            )
                                          }
                                        >
                                          Organisations Templates
                                        </a>
                                        <div
                                          style={style}
                                          class="collapse menu-dropdown"
                                          id="PredefinedTemplate"
                                        >
                                          <ul class="nav nav-sm flex-column">
                                            {/*  Super Admin Config Third SubList of subList Modal start */}
                                            <li class="nav-item">
                                              <NavLink to="/templates">
                                                <a
                                                  onClick={() => {
                                                    closeDropdown("config");
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations {proposalName}/
                                                  {EngagementName}
                                                </a>
                                              </NavLink>
                                            </li>
                                            <li class="nav-item">
                                              <NavLink to="/terms-and-conditions">
                                                <a
                                                  onClick={() => {
                                                    closeDropdown("config");
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations Terms & Conditions
                                                </a>
                                              </NavLink>
                                            </li>
                                            <li class="nav-item">
                                              <NavLink to="/email-template">
                                                <a
                                                  onClick={() => {
                                                    closeDropdown("config");
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations Email Templates
                                                </a>
                                              </NavLink>
                                            </li>
                                          </ul>
                                        </div>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </li>
                            )}

                            {/*  Super Admin Config End */}
                            {/*  Super Admin Subscription Start */}
                            {userAccessData.Subscription_CanView && (
                              <li
                                class="nav-item"
                                style={{
                                  paddingLeft:
                                    windowWidth <= 767 ? "0px" : "10px",
                                }}
                                onMouseLeave={() => hideSettingList()}
                                onMouseEnter={() => showSettingList()}
                              >
                                <a
                                  href="#sidebarSignUp2"
                                  class="nav-link menu-link"
                                  role="button"
                                  data-bs-toggle="collapse"
                                  aria-expanded="false"
                                  aria-controls="sidebarSignUp2"
                                  data-key="t-signup"
                                  onClick={toggleSettingDropdown}
                                  onMouseOver={() =>
                                    setIsHoveredSubscription(true)
                                  }
                                  onMouseOut={() =>
                                    setIsHoveredSubscription(false)
                                  }
                                  style={{
                                    color: isHoveredSubscription
                                      ? "#438eff"
                                      : TopTextColor.color,
                                  }}
                                  // any issue arise ,undo this code

                                  // onMouseOver={() =>
                                  //   setIsHoveredSubscription(true)
                                  // }
                                  // onMouseOut={() =>
                                  //   setIsHoveredSubscription(false)
                                  // }
                                >
                                  <i class="bi bi-credit-card mr-2"></i>{" "}
                                  <span data-key="t-dashboard">
                                    Subscription
                                  </span>{" "}
                                </a>
                                <div
                                  style={{
                                    ...style,
                                    display: isSettingDropdownOpen
                                      ? "block"
                                      : "none",
                                  }}
                                  class="collapse menu-dropdown"
                                  id="Subscription"
                                >
                                  <ul class="nav nav-sm flex-column">
                                    {userAccessData.SuperAdmin_Config_Subscription_Package_CanView && (
                                      <li class="nav-item">
                                        <NavLink
                                          onClick={() => {
                                            closeDropdown("Subscription");
                                            NotificationCountData();
                                          }}
                                          to="/sub-package"
                                          activeclassname="active"
                                          className="nav-link menu-link"
                                        >
                                          Subscription Packages
                                        </NavLink>
                                      </li>
                                    )}
                                    {userAccessData.SuperAdmin_Config_Subscription_Package_CanView && (
                                      <li class="nav-item">
                                        <NavLink
                                          onClick={() => {
                                            closeDropdown("Subscription");
                                            NotificationCountData();
                                          }}
                                          to="/pdf-csv-sub-package"
                                          activeclassname="active"
                                          className="nav-link menu-link"
                                        >
                                          PDF to CSV Subscription Packages
                                        </NavLink>
                                      </li>
                                    )}
                                    {userAccessData.SuperAdmin_Config_Subscription_User_CanView && (
                                      <li class="nav-item">
                                        <NavLink
                                          onClick={() => {
                                            closeDropdown("Subscription");
                                            NotificationCountData();
                                          }}
                                          to="/user"
                                          activeclassname="active"
                                          className="nav-link menu-link"
                                        >
                                          Users
                                        </NavLink>
                                      </li>
                                    )}
                                    {userAccessData.SuperAdmin_Config_Subscription_Invoices_CanView && (
                                      <li class="nav-item">
                                        <NavLink
                                          onClick={() => {
                                            closeDropdown("Subscription");
                                            NotificationCountData();
                                          }}
                                          to="/invoices"
                                          activeclassname="active"
                                          className="nav-link menu-link"
                                        >
                                          Invoices
                                        </NavLink>
                                      </li>
                                    )}

                                    {/* Config End */}
                                  </ul>
                                </div>
                              </li>
                            )}
                            {userAccessData.SuperAdmin_Setting_CanView && (
                              <li
                                class="nav-item"
                                // style={{
                                //   paddingLeft:
                                //     windowWidth <= 767 ? "0px" : "10px",
                                // }}
                                onMouseLeave={() => hideUserRoleList()}
                                onMouseEnter={() => showUserSettingList()}
                              >
                                <a
                                  href="#sidebarSignUp3"
                                  class="nav-link menu-link"
                                  role="button"
                                  data-bs-toggle="collapse"
                                  aria-expanded="false"
                                  aria-controls="sidebarSignUp3"
                                  data-key="t-signup"
                                  onClick={toggleUserRoleDropdown}
                                  onMouseOver={() => setIsHoveredUserRole(true)}
                                  onMouseOut={() => setIsHoveredUserRole(false)}
                                  style={{
                                    color: isHoveredUserRole
                                      ? "#438EFF"
                                      : TopTextColor.color,
                                  }}
                                >
                                  <img
                                    src={SettingSvg}
                                    alt="SettingSvg"
                                    style={{
                                      width: "16px",
                                      marginRight: "5px",
                                    }}
                                  />
                                  <span data-key="t-dashboard">
                                    Settings
                                  </span>{" "}
                                </a>
                                <div
                                  style={{
                                    ...style,
                                    display: isUserRoleDropdownOpen
                                      ? "block"
                                      : "none",
                                    width: "200px",
                                  }}
                                  class="collapse menu-dropdown"
                                  id="UserRole"
                                >
                                  <ul class="nav nav-sm flex-column">
                                    {userAccessData.SuperAdmin_Setting_User_Role_CanView && (
                                      <li class="nav-item">
                                        <NavLink
                                          onClick={() => {
                                            closeDropdown("UserRole");
                                            NotificationCountData();
                                          }}
                                          to="/user-role"
                                          activeclassname="active"
                                          className="nav-link menu-link"
                                        >
                                          User Role
                                        </NavLink>
                                      </li>
                                    )}
                                    {userAccessData.SuperAdmin_Setting_Email_Template_CanView && (
                                      <li class="nav-item">
                                        <NavLink
                                          onClick={() => {
                                            closeDropdown("Subscription");
                                            NotificationCountData();
                                          }}
                                          to="/super-admin-email-template-list"
                                          activeclassname="active"
                                          className="nav-link menu-link"
                                        >
                                          Super Admin Email Template
                                        </NavLink>
                                      </li>
                                    )}
                                    {/* {userAccessData.SuperAdmin_Setting_Email_Template_CanView && ( */}
                                    <li class="nav-item">
                                      <NavLink
                                        onClick={() => {
                                          closeDropdown("Subscription");
                                          NotificationCountData();
                                        }}
                                        to="/activity-logs"
                                        activeclassname="active"
                                        className="nav-link menu-link"
                                      >
                                        Activity Logs
                                      </NavLink>
                                    </li>
                                    {/* )} */}
                                    {common.organisationKeyID == null && (
                                      <li class="nav-item">
                                        <Link
                                          to="/fee-inflation"
                                          onClick={togglenav}
                                        >
                                          <a
                                            onClick={() => {
                                              toggleSettingList("Setting");
                                              NotificationCountData();
                                            }}
                                            class="nav-link"
                                            data-key="t-basic-6"
                                          >
                                            Fee Inflation
                                          </a>
                                        </Link>
                                      </li>
                                    )}
                                    <li
                                      class="nav-item"
                                      onMouseLeave={() =>
                                        hideSettingSubList("WebIntegration")
                                      }
                                      onMouseEnter={() =>
                                        showSettingSubList("WebIntegration")
                                      }
                                      onClick={() =>
                                        toggleSettingSubList("WebIntegration")
                                      }
                                    >
                                      <a
                                        href="#sidebarProfile"
                                        class="nav-link collapsed"
                                        data-bs-toggle="collapse"
                                        role="button"
                                        aria-expanded="false"
                                        aria-controls="sidebarProfile"
                                        data-key="t-profile"
                                      >
                                        API Integration
                                      </a>
                                      <div
                                        class="subList collapse menu-dropdown"
                                        id="WebIntegration"
                                        style={style}
                                      >
                                        <ul class="nav nav-sm flex-column">
                                          <li class="nav-item">
                                            <Link
                                              to="/AccessKey"
                                              onClick={togglenav}
                                            >
                                              <a
                                                onClick={() => {
                                                  toggleSettingList("Setting");
                                                  NotificationCountData();
                                                }}
                                                class="nav-link"
                                                data-key="t-basic-6"
                                              >
                                                Access Key
                                              </a>
                                            </Link>
                                          </li>
                                        </ul>
                                      </div>
                                    </li>

                                    {userAccessData.SuperAdmin_Personalize_SettingCanView && (
                                      <li class="nav-item">
                                        <a
                                          onClick={() => {
                                            closeDropdown("Setting");
                                            NotificationCountData();
                                          }}
                                          class="nav-link"
                                          data-key="t-basic-7"
                                          data-bs-toggle="modal"
                                          data-bs-target="#SetPersonalizeSettingModal"
                                          style={{ cursor: "pointer" }}
                                        >
                                          <span
                                            class="align-middle"
                                            data-key="t-logout"
                                          >
                                            Personalize Setting
                                          </span>
                                        </a>
                                      </li>
                                    )}

                                    {/* Super Admin only, and only at the
                                        true platform level - not while
                                        viewing as a specific organisation -
                                        since this setting applies to every
                                        organisation at once. */}
                                    {common.organisationKeyID == null && (
                                      <li class="nav-item">
                                        <a
                                          onClick={() => {
                                            closeDropdown("Setting");
                                            NotificationCountData();
                                          }}
                                          class="nav-link"
                                          data-bs-toggle="modal"
                                          data-bs-target="#ProposalThemeSettingModal"
                                          style={{ cursor: "pointer" }}
                                        >
                                          <span class="align-middle">
                                            Proposal Theme
                                          </span>
                                        </a>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </li>
                            )}
                            {(userAccessData.SuperAdmin_Config_Template_CanView ||
                              userAccessData.SuperAdmin_Setting_Email_Template_CanView) && (
                              <li
                                class="nav-item"
                                onMouseLeave={hideSAWorkflowList}
                                onMouseEnter={showSAWorkflowList}
                              >
                                <a
                                  class="nav-link menu-link collapsed"
                                  role="button"
                                  data-bs-toggle="collapse"
                                  aria-expanded={isSAWorkflowDropdownOpen}
                                  aria-controls="superAdminWorkflows"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleSAWorkflowList();
                                  }}
                                  onMouseOver={() =>
                                    setIsHoveredSAWorkflow(true)
                                  }
                                  onMouseOut={() =>
                                    setIsHoveredSAWorkflow(false)
                                  }
                                  ref={saWorkflowRef}
                                  style={{
                                    color: isHoveredSAWorkflow
                                      ? "#438eff"
                                      : TopTextColor.color,
                                  }}
                                >
                                  <img
                                    src={SettingSvg}
                                    alt="WorkflowSvg"
                                    style={{
                                      width: "16px",
                                      marginRight: "5px",
                                    }}
                                  />
                                  <span data-key="t-pages">
                                    Workflows
                                    <span className="menu-arrow" />
                                  </span>
                                </a>
                                <div
                                  id="superAdminWorkflows"
                                  style={{
                                    ...style,
                                    display: isSAWorkflowDropdownOpen
                                      ? "block"
                                      : "none",
                                  }}
                                  class="collapse menu-dropdown Responsive-Config-service-package"
                                >
                                  <ul class="nav nav-sm flex-column">
                                    {userAccessData.SuperAdmin_Config_Template_CanView && (
                                      <li
                                        class="nav-item"
                                        onMouseLeave={() =>
                                          hideSAWorkflowSubList(
                                            "PredefinedReminder",
                                          )
                                        }
                                        onMouseEnter={() =>
                                          showSAWorkflowSubList(
                                            "PredefinedReminder",
                                          )
                                        }
                                      >
                                        <a
                                          href="#PredefinedReminder"
                                          class="nav-link collapsed"
                                          aria-expanded={
                                            activeSAWorkflowSubList ===
                                            "PredefinedReminder"
                                          }
                                          data-key="t-profile"
                                          style={{ cursor: "pointer" }}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            toggleSAWorkflowSubList(
                                              "PredefinedReminder",
                                            );
                                          }}
                                        >
                                          Organisations Workflows
                                        </a>
                                        <div
                                          id="PredefinedReminder"
                                          class="subList"
                                          style={{
                                            display:
                                              activeSAWorkflowSubList ===
                                              "PredefinedReminder"
                                                ? "block"
                                                : "none",
                                            paddingLeft: "12px",
                                          }}
                                        >
                                          <ul class="nav nav-sm flex-column">
                                            <li class="nav-item">
                                              <NavLink to="/reminder-email-template">
                                                <a
                                                  onClick={() => {
                                                    closeDropdown(
                                                      "superAdminWorkflows",
                                                    );
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations Workflows Email
                                                  Templates
                                                </a>
                                              </NavLink>
                                            </li>
                                            <li class="nav-item">
                                              <NavLink to="/reminder">
                                                <a
                                                  onClick={() => {
                                                    closeDropdown(
                                                      "superAdminWorkflows",
                                                    );
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-simple-page"
                                                >
                                                  Organisations Reminder
                                                </a>
                                              </NavLink>
                                            </li>
                                          </ul>
                                        </div>
                                      </li>
                                    )}

                                    {userAccessData.SuperAdmin_Setting_Email_Template_CanView && (
                                      <li
                                        class="nav-item"
                                        onMouseLeave={() =>
                                          hideSAWorkflowSubList("SASetting")
                                        }
                                        onMouseEnter={() =>
                                          showSAWorkflowSubList("SASetting")
                                        }
                                      >
                                        <a
                                          href="#SASetting"
                                          class="nav-link collapsed"
                                          aria-expanded={
                                            activeSAWorkflowSubList ===
                                            "SASetting"
                                          }
                                          data-key="t-profile"
                                          style={{ cursor: "pointer" }}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            toggleSAWorkflowSubList(
                                              "SASetting",
                                            );
                                          }}
                                        >
                                          Super Admin Workflows
                                        </a>
                                        <div
                                          id="SASetting"
                                          class="subList"
                                          style={{
                                            display:
                                              activeSAWorkflowSubList ===
                                              "SASetting"
                                                ? "block"
                                                : "none",
                                            paddingLeft: "12px",
                                          }}
                                        >
                                          <ul class="nav nav-sm flex-column">
                                            <li class="nav-item">
                                              <Link
                                                to="/super-admin-reminder-template-list"
                                                onClick={togglenav}
                                              >
                                                <a
                                                  onClick={() => {
                                                    closeDropdown(
                                                      "superAdminWorkflows",
                                                    );
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-basic-3"
                                                >
                                                  Super Admin Workflow Email
                                                  Templates
                                                </a>
                                              </Link>
                                            </li>
                                            <li class="nav-item">
                                              <Link
                                                to="/paid-unpaid-list"
                                                onClick={togglenav}
                                              >
                                                <a
                                                  onClick={() => {
                                                    closeDropdown(
                                                      "superAdminWorkflows",
                                                    );
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-basic-6"
                                                >
                                                  Account Login/Deletion
                                                </a>
                                              </Link>
                                            </li>
                                            <li className="nav-item">
                                              <Link
                                                to="/subscription-reminder-list"
                                                onClick={togglenav}
                                              >
                                                <a
                                                  onClick={() => {
                                                    closeDropdown(
                                                      "superAdminWorkflows",
                                                    );
                                                    NotificationCountData();
                                                  }}
                                                  className="nav-link"
                                                  data-key="t-basic-3"
                                                >
                                                  Subscription Package Upgrade
                                                </a>
                                              </Link>
                                            </li>
                                            <li class="nav-item">
                                              <Link
                                                to="/marketing-reminder"
                                                onClick={togglenav}
                                              >
                                                <a
                                                  onClick={() => {
                                                    closeDropdown(
                                                      "superAdminWorkflows",
                                                    );
                                                    NotificationCountData();
                                                  }}
                                                  class="nav-link"
                                                  data-key="t-basic-6"
                                                >
                                                  Other Reminders
                                                </a>
                                              </Link>
                                            </li>
                                          </ul>
                                        </div>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              {/*  Notification Modal Start*/}
              <div class="d-flex">
                <div class="d-flex align-items-center search">
                  <Tooltip title={"Notifications"}>
                    <div
                    // class="dropdown topbar-head-dropdown ms-1 header-item"
                    // id="notificationDropdown"
                    >
                      <button
                        type="button"
                        class="btn btn-icon btn-topbar  d-flex justify-content-center align-items-center"
                        id="page-header-notifications-dropdown"
                        onClick={() => {
                          Notifications();
                          closeNav();
                        }}
                      >
                        <span>
                          <i
                            style={{
                              cursor: "pointer",
                              color: TopTextColor.color,
                            }}
                            class="fa fa-regular fa-bell" // Change to fa-bell for a notification icon
                          ></i>
                        </span>
                        <span
                          style={{
                            cursor: "pointer",
                            backgroundColor: TopTextColor.color,
                          }}
                          class="position-absolute topbar-badge translate-middle badge rounded-pill fs-10"
                        >
                          <span class="notification-badge">
                            {notificationCount}
                          </span>
                          <span class="visually-hidden">unread messages</span>
                        </span>
                      </button>
                    </div>
                  </Tooltip>
                  <div class="dropdown ms-sm-3 header-item d-block mt-2">
                    <Tooltip
                      title={
                        common.name.length > 15
                          ? `${common.name.slice(0, 15)}....`
                          : common.name
                      }
                    >
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          marginTop: "17px",
                        }}
                        type="button"
                        class="btn"
                        id="page-header-user-dropdown"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <span class="d-flex align-items-center">
                          <img
                            class="rounded-circle header-profile-user"
                            src={profile}
                          />
                        </span>
                      </button>
                    </Tooltip>
                    <div class="dropdown-menu dropdown-menu-end">
                      <a
                        class="dropdown-item"
                        onClick={() => setShowUserModal(true)}
                        data-bs-toggle="modal"
                        data-bs-target="#TopbarUserProfileEdit"
                        style={{ cursor: "pointer" }}
                        // onClick={ResetPasswordClicked}
                      >
                        <span class="align-middle" data-key="t-logout">
                          Hello{" "}
                          <strong class="FontW">
                            {common.name.length > 15
                              ? ` ${common.name.slice(0, 15)}....`
                              : ` ${common.name}`}
                          </strong>
                          <hr />
                        </span>
                        {/* <i class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "} */}
                        <i
                          style={{
                            marginRight: "5px",
                          }}
                          class="bi bi-person"
                        ></i>{" "}
                        <span class="align-middle" data-key="t-logout">
                          My Profile
                        </span>
                      </a>
                      <a
                        class="dropdown-item appearance-btn"
                        style={{ cursor: "pointer" }}
                      >
                        {/* <i class="mdi mdi-settings-outline text-muted fs-16 align-middle me-1"></i>{" "} */}
                        <i
                          style={{ marginRight: "9px" }}
                          class="bi bi-gear-fill text-muted fs-16 align-middle"
                        ></i>
                        {""}
                        <span class="align-middle" data-key="t-logout">
                          {["right"].map((anchor) => (
                            <React.Fragment key={anchor}>
                              <Button
                                style={{ textTransform: "capitalize" }}
                                onClick={ToggleDrawer(anchor, true)}
                              >
                                Appearance
                              </Button>
                              <Drawer anchor={anchor} open={state[anchor]}>
                                {List(anchor)}
                              </Drawer>
                            </React.Fragment>
                          ))}
                        </span>
                      </a>
                      <a
                        class="dropdown-item"
                        data-bs-toggle="modal"
                        data-bs-target="#ResetPasswordModal"
                        style={{ cursor: "pointer" }}
                        // onClick={ResetPasswordClicked}
                      >
                        {/* <i class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "} */}
                        <i class=" mdi mdi-key-star text-muted fs-16 align-middle me-1"></i>{" "}
                        <span class="align-middle" data-key="t-logout">
                          {common.isPasswordSet
                            ? "Reset Password"
                            : "Set Password"}
                        </span>
                      </a>
                      <a
                        class="dropdown-item"
                        // data-bs-toggle="modal"
                        // data-bs-target="#SetLogoutTimeModal"
                        onClick={handleOpenSessionModel}
                        style={{ cursor: "pointer" }}
                      >
                        <i class="mdi mdi-clock-outline text-muted fs-16 align-middle me-1"></i>{" "}
                        <span class="align-middle" data-key="t-logout">
                          Set Session Timeout
                        </span>
                      </a>
                      <Link to="/security" className="dropdown-item">
                        <i className="  fas fa-lock text-muted fs-14 align-middle me-1"></i>{" "}
                        <span className="align-middle" data-key="t-logout">
                          Security
                        </span>
                      </Link>
                      <a
                        class="dropdown-item"
                        data-bs-toggle="modal"
                        data-bs-target="#logoutModal"
                        style={{ cursor: "pointer" }}
                      >
                        <i class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
                        <span class="align-middle " data-key="t-logout">
                          Logout
                        </span>
                      </a>
                    </div>
                  </div>
                  {/* Profile DropDown modal End  */}
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* <!-- LOGOUT MODAL --> */}
      <LogoutModal Logout={Logout} />

      {/* --------Reset Modal----------- */}
      <ResetPasswordModal id="ResetPasswordModal" />

      {/* ----------Set Logout Time modal-------- */}
      <SetTimeoutComponent id="SetLogoutTimeModal" />
      {/* ----------Super Admin: Proposal Theme modal-------- */}
      <ProposalThemeSettingModal />
      {/* ...............personalize setting modal............. */}
      <div
        class="modal fade zoomIn"
        id="SetPersonalizeSettingModal"
        tabIndex="-1"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div class="modal-dialog modal-md modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-light p-3">
              <h5 class="modal-title">Variable Names</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="close-modal"
                onClick={setInitializeValidationError}
              ></button>
            </div>
            <div class="modal-body">
              <div class="tab-content">
                <div className="container">
                  <div className="row">
                    <div
                      style={{ display: "flex", alignItems: "center" }}
                      className="col-lg-12 col-sm-12"
                    >
                      <label class="fieldset-label required">{`Change ${prospectName} Name`}</label>
                    </div>
                    <div className="col-lg-12 col-sm-12 mb-1">
                      <input
                        type="text"
                        className="input-text"
                        id="customerName-field"
                        value={updatedProspectName}
                        onChange={handleInputChange}
                        placeholder={`Change ${prospectName} Name`}
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div
                      style={{ display: "flex", alignItems: "center" }}
                      className="col-lg-12 col-sm-12 mt-1"
                    >
                      <label class="fieldset-label required">{`Change ${proposalName} Name`}</label>
                    </div>
                    <div className="col-lg-12 col-sm-12 mb-1">
                      <input
                        type="text"
                        className="input-text"
                        id="customerName-field"
                        value={updatedProposalName}
                        onChange={handleInputChangeProposal}
                        placeholder={`Change ${proposalName} Name`}
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div
                      style={{ display: "flex", alignItems: "center" }}
                      className="col-lg-12 col-sm-12 mt-1"
                    >
                      <label class="fieldset-label required">{`Change ${EngagementName} Name`}</label>
                    </div>
                    <div className="col-lg-12 col-sm-12 mb-1">
                      <input
                        type="text"
                        className="input-text"
                        id="customerName-field"
                        value={updatedEngagementName}
                        onChange={handleInputChangeEngagement}
                        placeholder={`Change ${EngagementName} Name`}
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-sm-6 mt-1 d-flex align-items-center ">
                      <input
                        id="setDefault"
                        type="checkbox"
                        value={DefaultVariables}
                        checked={DefaultVariables}
                        onChange={handleSetDefaultVariables}
                      />
                      <label
                        htmlFor="setDefault"
                        className="ml-2 mb-0"
                        style={{ marginLeft: "6px" }}
                      >
                        {" "}
                        Set Default
                      </label>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  {" "}
                  {RequireErrorMessage &&
                  (updatedEngagementName === "" ||
                    updatedEngagementName === null ||
                    updatedEngagementName === undefined) &&
                  (updatedProposalName === "" ||
                    updatedProposalName === null ||
                    updatedProposalName === undefined) &&
                  (updatedProspectName === "" ||
                    updatedProspectName === null ||
                    updatedProspectName === undefined) ? (
                    <label className="validation">
                      Please make sure to fill out at least one field.
                    </label>
                  ) : (
                    ""
                  )}
                </div>
                <div className="text-center mt-1">
                  {RequireErrorMessage &&
                    ((updatedEngagementName !== "" &&
                      updatedEngagementName !== null &&
                      updatedEngagementName !== undefined) ||
                      (updatedProposalName !== "" &&
                        updatedProposalName !== null &&
                        updatedProposalName !== undefined) ||
                      (updatedProspectName !== "" &&
                        updatedProspectName !== null &&
                        updatedProspectName !== undefined)) &&
                    (updatedEngagementName === updatedProposalName ||
                    updatedProposalName === updatedProspectName ||
                    updatedEngagementName === updatedProspectName ? (
                      <label className="validation">
                        Variable name should be unique. Please set unique
                        variable name.
                      </label>
                    ) : null)}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="hstack gap-2 justify-content-end">
                {((userAccessData.Admin_Personalize_SettingCanView &&
                  userAccessData.Admin_Personalize_SettingCanEdit) ||
                  (userAccessData.SuperAdmin_Personalize_SettingCanView &&
                    userAccessData.SuperAdmin_Personalize_SettingCanEdit)) && (
                  <button
                    type="button"
                    onClick={async () => {
                      await updateVariableFun();
                    }}
                    class="btn btn-md btn-success create-item-btn"
                  >
                    <span> Apply Changes</span>
                  </button>
                )}
              </div>
            </div>

            {/* </form> */}
          </div>
        </div>
      </div>
      <ViewPlan
        showModal={showModal}
        handleCloseModel={handleCloseModel}
        setShowModal={setShowModal}
        activeOrganizationKeyId={activeOrganizationKeyId}
      />
      <UserModelNew
        class="modal fade"
        tabIndex="-1"
        aria_labelledby="exampleModalLabel"
        aria_hidden="true"
        id="TopbarUserProfileEdit"
        open={showUserModal}
        setShowUserModal={setShowUserModal}
        UserKeyID={common.userKeyID}
        Edit={true}
        setIsAddUpdateActionDone={false}
      />

      <SuccessModal
        handleClose={handleClose}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={"Variables"}
      />
      <SetTimeoutComponent
        isOpenSessionTimeout={isOpenSessionTimeout}
        handleCloseSessionModel={handleCloseSessionModel}
      />
      {/* ---------Theme Setting modal---------- */}

      {/* <!-- ========== App Menu ========== --> */}
      <div class="app-menu ">
        <div id="scrollbar">
          <div class="container-fluid">
            <div id="two-column-menu"></div>
            <ul class="navbar-nav" id="navbar-nav"></ul>
          </div>
        </div>
        <div class="sidebar-background"></div>
      </div>
      {/* <!-- Left Sidebar End -->
        <!-- Vertical Overlay--> */}
      <div class="vertical-overlay"></div>

      {/* <!-- end main content--> */}
    </div>
  );
};

export default Topbar;
