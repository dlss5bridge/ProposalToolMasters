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
import logoImg from "../../src/assets/images/company-logos/logo-outbooks-proposal.webp";
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
import UserModelNew from "./UserModelNew";
import ViewPlan from "./ViewPlan";
import AuthButton from "./Sidebar/AuthenticationButton";
import {
  quickBooksConnectionStatus,
  xeroConnectionStatus,
} from "../redux/reducer/authSlice";

const TopbarClone = () => {
  //localstorage values
  const bookkeeping = JSON.parse(localStorage.getItem("subscriptionPlan"));
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const settingsRef = useRef(null);
  const configRef = useRef(null);
  const subscriptionRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const workflowRef = useRef(null);
  const saWorkflowRef = useRef(null);
  const [isHoveredWorkflow, setIsHoveredWorkflow] = useState(false);
  const [isHoveredSAWorkflow, setIsHoveredSAWorkflow] = useState(false);
  const [isHoveredDashboard, setIsHoveredDashboard] = useState(false);
  const [isHoveredProspect, setIsHoveredProspect] = useState(false);
  const [isHoveredProposal, setIsHoveredProposal] = useState(false);
  const [isHoveredEngagement, setIsHoveredEngagement] = useState(false);
  const [isHoveredPdfToCsv, setIsHoveredPdfToCsv] = useState(false);
  const [isHoveredConfigure, setIsHoveredConfigure] = useState(false);
  const [isHoveredSetting, setIsHoveredSetting] = useState(false);
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Check localStorage only once when component loads
    const storedValue = localStorage.getItem("isSidebarOpen");
    return storedValue ? JSON.parse(storedValue) : true; // default: open
  });

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
    lightenColor,
  } = useContext(AuthContextProvider);
  const listColor = lightenColor(TopbarStyle.backgroundColor, 0.35);
  const subListColor = lightenColor(TopbarStyle.backgroundColor, 0.55);
  console.log(subListColor);
  const common = useSelector((state) => state.Storage);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpens, setIsOpens] = useState(false);
  const [activeOrganizationKeyId, setActiveOrganizationKeyId] = useState(null);
  const [isUserRoleDropdownOpen, setIsUserRoleDropdownOpen] = useState(false);
  const [isSettingDropdownOpen, setIsSettingDropdownOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    // Update localStorage whenever sidebar state changes
    localStorage.setItem("isSidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    if (common.organisationKeyID) {
      dispatch(xeroConnectionStatus(common.organisationKeyID));
      dispatch(quickBooksConnectionStatus(common.organisationKeyID));
    }

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
  // const closeNav = (event) => {
  //   if (isMobile || window.innerWidth <= 1024) {
  //     // Only proceed if the dropdown is currently open
  //     if (document.body.classList.contains("menu")) {
  //       setIsDropdownOpen(false);
  //       const hamburger = document.querySelector(".hamburger-icon");
  //       hamburger?.classList.remove("open");
  //       document.body.classList.remove("menu");
  //       // Remove event listeners
  //       document.body.removeEventListener("click", handleClickOutside);
  //       const dropdownButton = document.getElementById(
  //         "page-header-user-dropdown"
  //       );
  //       dropdownButton.removeEventListener("click", handleCloseDropdown);
  //     }
  //   }
  // };
  const closeNav = (event) => {
    if (isMobile || window.innerWidth <= 1040) {
      // Changed from 1024 to 1040
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
  // const togglenav = (event) => {
  //   // Adjust the breakpoint according to your design
  //   if (isMobile || window.innerWidth <= 1024) {
  //     setIsDropdownOpen(false);

  //     const hamburger = document.querySelector(".hamburger-icon");
  //     hamburger?.classList.toggle("open");
  //     document.body.classList.contains("menu")
  //       ? document.body.classList.remove("menu")
  //       : document.body.classList.add("menu");
  //     // Add event listener to close dropdown when clicking outside of it
  //     document.body.addEventListener("click", handleClickOutside);
  //     // Add event listener to close dropdown when clicking on the button inside the dropdown
  //     const dropdownButton = document.getElementById(
  //       "page-header-user-dropdown"
  //     );
  //     dropdownButton.addEventListener("click", handleCloseDropdown);

  //     // const notificationDropdownButton = document.getElementById(
  //     //   "page-header-notifications-dropdown"
  //     // );
  //     // notificationDropdownButton.addEventListener("click", handleCloseDropdown);
  //   }
  // };
  const togglenav = () => {
    setMenuOpen((prev) => !prev);
    const hamburger = document.querySelector(".hamburger-icon");

    if (isMobile || window.innerWidth <= 1040) {
      hamburger?.classList.toggle("open"); // animate hamburger
      document.body.classList.toggle("menu"); // toggle menu visibility
      if (document.body.classList.contains("menu")) {
        document.body.addEventListener("click", handleClickOutside);
      } else {
        document.body.removeEventListener("click", handleClickOutside);
      }
    }
  };

  const handleClickOutside = (event) => {
    const menu = document.querySelector(".app-menu");
    const hamburger = document.querySelector(".hamburger-icon");

    if (!menu?.contains(event.target) && !hamburger?.contains(event.target)) {
      document.body.classList.remove("menu");
      hamburger?.classList.remove("open");
      document.body.removeEventListener("click", handleClickOutside);
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

  // const toggleSettingDropdown = () => {
  //   const list = document.getElementById("Subscription");
  //   setIsSettingDropdownOpen(!isSettingDropdownOpen);
  //   if (!isSettingDropdownOpen) {
  //     list.style.display = "block";
  //     list.scrollIntoView({ behavior: "smooth", block: "start" });
  //   } else {
  //     list.style.display = "none";
  //   }
  // };

  const toggleSettingDropdown = () => {
    setIsSettingDropdownOpen((prev) => !prev);
  };

  const toggleUserRoleDropdown = (e) => {
    const list = document.getElementById("UserRole");
    if (!list) return;

    list.classList.toggle("show");

    const isOpen = list.classList.contains("show");

    if (settingsMenuRef.current) {
      settingsMenuRef.current.setAttribute("aria-expanded", String(isOpen));
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
    document.getElementById("config")?.classList.add("show");
    if (configRef.current) {
      configRef.current.setAttribute("aria-expanded", "true");
    }
  };

  const showSubscriptionList = () => {
    const sub = document.getElementById("Subscription");
    if (!sub) return;

    sub.classList.add("show");

    if (subscriptionRef.current) {
      subscriptionRef.current.setAttribute("aria-expanded", "true");
    }
  };

  const hideSettingList = () => {
    const setting = document.getElementById("Setting");
    if (!setting) return;

    setting.classList.remove("show");
    if (settingsRef.current) {
      settingsRef.current.setAttribute("aria-expanded", "false");
    }

    document.querySelectorAll("#Setting .subList").forEach((el) => {
      el.classList.remove("show");
      const link = el.parentElement.querySelector(".nav-link");
      if (link) link.setAttribute("aria-expanded", "false");
    });
  };

  const hideSettingSubList = (id) => {
    const configs = document.getElementById(id);
    configs.style.display = "none";
  };

  const toggleWorkflowList = () => {
    const workflow = document.getElementById("workflow");
    if (!workflow) return;

    workflow.classList.toggle("show");

    const isNowOpen = workflow.classList.contains("show");
    if (workflowRef.current) {
      workflowRef.current.setAttribute("aria-expanded", String(isNowOpen));
    }
  };

  const showWorkflowList = () => {
    document.getElementById("workflow")?.classList.add("show");
    if (workflowRef.current) {
      workflowRef.current.setAttribute("aria-expanded", "true");
    }
  };

  const hideWorkflowList = () => {
    const workflow = document.getElementById("workflow");
    if (!workflow) return;

    workflow.classList.remove("show");
    if (workflowRef.current) {
      workflowRef.current.setAttribute("aria-expanded", "false");
    }
  };

  const hideSubscriptionList = () => {
    const sub = document.getElementById("Subscription");
    if (!sub) return;

    sub.classList.remove("show");

    if (subscriptionRef.current) {
      subscriptionRef.current.setAttribute("aria-expanded", "false");
    }
  };
  //   const hideConfigList = () => {
  //   const configs = document.getElementById("config");
  //   // Add a small delay to allow clicking on items outside hover area
  //   setTimeout(() => {
  //     configs.style.display = "none";
  //   }, 200); // 200ms delay
  // };
  const hideConfigList = () => {
    const config = document.getElementById("config");
    if (!config) return;

    config.classList.remove("show");
    if (configRef.current) {
      configRef.current.setAttribute("aria-expanded", "false");
    }

    document.querySelectorAll("#config .subList").forEach((el) => {
      el.classList.remove("show");
      const link = el.parentElement.querySelector(".nav-link");
      if (link) link.setAttribute("aria-expanded", "false");
    });
  };
  // const hideConfigSubList = (id) => {
  //   const list = document.getElementById(id);
  //   if (list) list.style.display = "none";
  // };

  // const toggleConfigSubList = (id) => {
  //   const list = document.getElementById(id);
  //   const allLists = document.querySelectorAll(".subList");

  //   allLists.forEach((element) => {
  //     if (element.classList.contains("d-block") && element.id !== id) {
  //       element.classList.remove("d-block");
  //       element.classList.add("d-none");
  //     }
  //   });

  //   if (list.classList.contains("d-block")) {
  //     list.classList.remove("d-block");
  //     list.classList.add("d-none");
  //   } else {
  //     list.classList.add("d-block");
  //     list.classList.remove("d-none");
  //     list.scrollIntoView({ behavior: "smooth", block: "start" });
  //   }
  // };
  // const toggleConfigSubList = (id) => {
  //   const list = document.getElementById(id);
  //   const allLists = document.querySelectorAll(".subList");

  //   // Close all other sublists
  //   allLists.forEach((element) => {
  //     if (element.id !== id) element.style.display = "none";
  //   });

  //   // Toggle clicked sublist
  //   if (list.style.display === "block") {
  //     list.style.display = "none";
  //   } else {
  //     list.style.display = "block";
  //     list.scrollIntoView({ behavior: "smooth", block: "start" });
  //   }
  // };

  const toggleConfigSubList = (id) => {
    const list = document.getElementById(id);
    if (!list) return;

    const isOpen = list.classList.contains("show");

    document.querySelectorAll("#config .subList").forEach((el) => {
      el.classList.remove("show");
      const link = el.parentElement.querySelector(".nav-link");
      if (link) link.setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      list.classList.add("show");
      const link = list.parentElement.querySelector(".nav-link");
      if (link) link.setAttribute("aria-expanded", "true");
    }
  };

  const showUserSettingList = () => {
    const list = document.getElementById("UserRole");
    if (!list) return;

    list.classList.add("show");

    if (settingsMenuRef.current) {
      settingsMenuRef.current.setAttribute("aria-expanded", "true");
    }
  };
  //show function for setting
  const showSettingList = () => {
    document.getElementById("Setting")?.classList.add("show");
    if (settingsRef.current) {
      settingsRef.current.setAttribute("aria-expanded", "true");
    }
  };

  const toggleSettingList = () => {
    const setting = document.getElementById("Setting");
    if (!setting) return;

    setting.classList.toggle("show");

    // arrow follows config state
    const isNowOpen = setting.classList.contains("show");
    if (settingsRef.current) {
      settingsRef.current.setAttribute("aria-expanded", String(isNowOpen));
    }
  };

  const toggleSubscriptionList = () => {
    const sub = document.getElementById("Subscription");
    if (!sub) return;

    sub.classList.toggle("show");

    const isOpen = sub.classList.contains("show");

    if (subscriptionRef.current) {
      subscriptionRef.current.setAttribute("aria-expanded", String(isOpen));
    }

    // if (list.style.display !== "block") {
    //   list.style.display = "block";
    //   setTimeout(() => {
    //     list.scrollIntoView({
    //       behavior: "smooth",
    //       block: "end",
    //     });
    //   }, 100);
    // } else {
    //   list.style.display = "none";
    // }
  };

  const toggleSettingSubList = (id) => {
    const list = document.getElementById(id);
    if (!list) return;

    const isOpen = list.classList.contains("show");

    // Close only sibling submenus
    const parent = list.parentElement.parentElement;

    parent.querySelectorAll(":scope > .nav-item > .subList").forEach((el) => {
      if (el !== list) {
        el.classList.remove("show");
        const link = el.parentElement.querySelector(".nav-link");
        if (link) link.setAttribute("aria-expanded", "false");
      }
    });

    if (isOpen) {
      list.classList.remove("show");
    } else {
      list.classList.add("show");
    }

    const link = list.parentElement.querySelector(".nav-link");
    if (link) {
      link.setAttribute(
        "aria-expanded",
        String(list.classList.contains("show")),
      );
    }
  };

  const toggleUserRoleSettingSubList = (id) => {
    const list = document.getElementById(id);
    if (!list) return;

    const isOpen = list.classList.contains("show");

    document.querySelectorAll("#UserRole .subList").forEach((el) => {
      el.classList.remove("show");
      const link = el.parentElement.querySelector(".nav-link");
      if (link) link.setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      list.classList.add("show");
      const link = list.parentElement.querySelector(".nav-link");
      if (link) link.setAttribute("aria-expanded", "true");
    }
  };

  const toggleSAWorkflowList = () => {
    const el = document.getElementById("superAdminWorkflows");
    if (!el) return;
    el.classList.toggle("show");
    const isNowOpen = el.classList.contains("show");
    if (saWorkflowRef.current) {
      saWorkflowRef.current.setAttribute("aria-expanded", String(isNowOpen));
    }
  };

  const showSAWorkflowList = () => {
    document.getElementById("superAdminWorkflows")?.classList.add("show");
    if (saWorkflowRef.current) {
      saWorkflowRef.current.setAttribute("aria-expanded", "true");
    }
  };

  const hideSAWorkflowList = () => {
    const el = document.getElementById("superAdminWorkflows");
    if (!el) return;
    el.classList.remove("show");
    if (saWorkflowRef.current) {
      saWorkflowRef.current.setAttribute("aria-expanded", "false");
    }
    document
      .querySelectorAll("#superAdminWorkflows .subList")
      .forEach((sub) => {
        sub.classList.remove("show");
        const link = sub.parentElement.querySelector(".nav-link");
        if (link) link.setAttribute("aria-expanded", "false");
      });
  };

  // Same accordion pattern as toggleConfigSubList, scoped to this dropdown
  const toggleSAWorkflowSubList = (id) => {
    const list = document.getElementById(id);
    if (!list) return;

    const isOpen = list.classList.contains("show");

    document.querySelectorAll("#superAdminWorkflows .subList").forEach((el) => {
      el.classList.remove("show");
      const link = el.parentElement.querySelector(".nav-link");
      if (link) link.setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      list.classList.add("show");
      const link = list.parentElement.querySelector(".nav-link");
      if (link) link.setAttribute("aria-expanded", "true");
    }
  };

  const handleClose = () => {
    $("#" + "SetPersonalizeSettingModal").modal("hide");
    setOpenSuccessModal(false);
    setOpenPurchaseModal(false);
  };

  // const toggleConfigList = () => {
  //   const list = document.getElementById("config");
  //   setIsDropdownOpen(!isDropdownOpen);
  //   if (!isDropdownOpen) {
  //     list.style.display = "block";
  //     list.scrollIntoView({ behavior: "smooth", block: "start" });
  //   } else {
  //     list.style.display = "none";
  //   }
  // };
  const toggleConfigList = () => {
    const configs = document.getElementById("config");
    if (!configs) return;

    configs.classList.toggle("show");

    // arrow follows config state
    const isNowOpen = configs.classList.contains("show");
    if (configRef.current) {
      configRef.current.setAttribute("aria-expanded", String(isNowOpen));
    }
  };

  const hideUserRoleList = () => {
    const list = document.getElementById("UserRole");
    if (!list) return;

    // Hide main dropdown
    list.classList.remove("show");

    if (settingsMenuRef.current) {
      settingsMenuRef.current.setAttribute("aria-expanded", "false");
    }

    document.querySelectorAll("#UserRole .subList").forEach((el) => {
      el.classList.remove("show");

      const link = el.parentElement.querySelector(".nav-link");
      if (link) link.setAttribute("aria-expanded", "false");
    });
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
    <>
      <div className={`topbar-clone ${isSidebarOpen ? "" : "collapsed"}`}>
        {/* Hamburger Icon - Position changes based on sidebar state */}

        {/* Original mobile hamburger button */}
        <button
          type="button"
          onClick={togglenav}
          className="btn btn-sm px-2 fs-16 header-item vertical-menu-btn topnav-hamburger d-md-none"
          id="topnav-hamburger-icon"
        >
          <span className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <div
          className={`app-menu d-flex flex-column ${isMobile || window.innerWidth <= 1040 ? (menuOpen ? "d-block" : "d-none") : "d-block"}`}
          style={{
            // height: "100%",
            // width: isMobile || window.innerWidth <= 1040 ? "100%" : "300px",
            // maxWidth: "300px",
            background: currentTopbarColor,
            // overflowY: "auto",
            position:
              isMobile || window.innerWidth <= 1040 ? "absolute" : "relative",
            top: isMobile || window.innerWidth <= 1040 ? "56px" : "0",
            left: 0,
            zIndex: 2000,
          }}
        >
          <div id="scrollbar" className="mb-2" style={TopbarStyle}>
            <div style={{ width: "100%" }}>
              <div id="two-column-menu">
                <div>
                  <div
                    className="pt-4 me-2"
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      position: "relative",
                    }}
                  >
                    <div style={{ width: "60%" }}>
                      <a
                        className="lna"
                        href="https://outbooks.com/proposal/"
                        target="_blank"
                      >
                        <img
                          src={logoImg}
                          alt="Outbooks"
                          style={{
                            width: "100%", // scales down if needed
                            height: "auto", // keep aspect ratio
                            display: "block", // remove inline spacing
                            objectFit: "contain",
                            margin: "0 auto",
                            paddingLeft: "10px",
                          }}
                        />
                      </a>
                    </div>
                    <Tooltip
                      title={isSidebarOpen ? "Close menu" : "Open menu"}
                      disableInteractive
                    >
                      <div
                        style={{
                          width: "40%",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <button
                          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                          style={{
                            position: isSidebarOpen ? "relative" : "fixed",
                            left: isSidebarOpen ? "calc(17% - 15px)" : "16px", // centers within sidebar accounting for button width
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(0, 0, 0, 0.05)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            padding: "6.5px",
                            zIndex: 2001,
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0, 0, 0, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 8px rgba(0, 0, 0, 0.1)";
                          }}
                          aria-label="Toggle sidebar"
                        >
                          {isSidebarOpen ? (
                            <i class="fa-solid fa-arrow-left"></i>
                          ) : (
                            <>
                              <span
                                style={{
                                  width: isSidebarOpen ? "16px" : "22px",
                                  height: "2.5px",
                                  backgroundColor: "#1a1a1a",
                                  display: "block",
                                  transition:
                                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                  borderRadius: "2px",
                                  transform: isSidebarOpen
                                    ? "translateY(6.5px) rotate(-45deg)"
                                    : "none",
                                }}
                              ></span>
                              <span
                                style={{
                                  width: isSidebarOpen ? "16px" : "22px",
                                  height: "2.5px",
                                  backgroundColor: "#1a1a1a",
                                  display: "block",
                                  transition:
                                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                  borderRadius: "2px",
                                  opacity: isSidebarOpen ? "0" : "1",
                                }}
                              ></span>
                              <span
                                style={{
                                  width: isSidebarOpen ? "16px" : "22px",
                                  height: "2.5px",
                                  backgroundColor: "#1a1a1a",
                                  display: "block",
                                  transition:
                                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                  borderRadius: "2px",
                                  transform: isSidebarOpen
                                    ? "translateY(-6.5px) rotate(45deg)"
                                    : "none",
                                }}
                              ></span>
                            </>
                          )}
                        </button>
                      </div>
                    </Tooltip>
                    <div className="row"></div>
                  </div>
                </div>
                <div className="sidebar-menu-scroll ">
                  <ul
                    class="navbar-nav d-none d-md-block pt-4"
                    style={{ paddingLeft: "0.5rem" }}
                    id="navbar-nav"
                  >
                    <li class="edit-dropdown-cls">
                      {accessCount !== 0 && (
                        <>
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                              marginLeft: "1rem",
                              marginTop: "1rem",
                            }}
                          >
                            {/* Organisation List */}
                            <select
                              className="nav-select form-select"
                              onChange={(e) => {
                                OnOrganisationsChange(e);
                                // xeroConnectionStatus(e.target.value)
                                try {
                                  const orgId = e.target.value.split(",")[0];
                                  dispatch(xeroConnectionStatus(orgId));
                                  dispatch(quickBooksConnectionStatus(orgId));
                                } catch (error) {
                                  console.log("error==>>", error);
                                }
                              }}
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
                          <div
                            className="d-flex"
                            style={{
                              alignItems: "center", // ensures vertical alignment
                              marginLeft: "0.2rem",
                              marginRight: "0.4rem",
                              marginTop: "1rem", // same top margin for both
                            }}
                          >
                            <div
                              onClick={() => {
                                navigate("/create-new-practice");
                                togglenav();
                              }}
                              title="Create New Practice"
                              className="edit-topbar"
                            >
                              {/* <i className="fa fa-regular fa fa-circle-plus" */}
                              <i
                                className="fa-solid fa-circle-plus"
                                style={{
                                  cursor: "pointer",
                                  color: TopTextColor.color,
                                }}
                              ></i>
                            </div>

                            {common.organisationKeyID !== null && (
                              <div
                                onClick={() => {
                                  navigate("/update-practice-details");
                                  closeNav();
                                }}
                                className="update-practice-details"
                                title="Update Practice"
                              >
                                <i
                                  className="fa fa-pencil"
                                  style={{
                                    cursor: "pointer",
                                    color: TopTextColor.color,
                                  }}
                                ></i>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </li>
                  </ul>
                  {/* <button
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
              </button> */}
                  {/* <ul class="navbar-nav" id="navbar-nav"></ul> */}
                  <ul class="d-md-none d-block navbar-nav" id="navbar-nav">
                    <li class="edit-dropdown-cls">
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
                              onChange={(e) => {
                                OnOrganisationsChange(e);
                                // xeroConnectionStatus(e.target.value)
                                try {
                                  dispatch(
                                    xeroConnectionStatus(e.target.value),
                                  );
                                  dispatch(
                                    quickBooksConnectionStatus(e.target.value),
                                  );
                                } catch (error) {
                                  console.log("error==>>", error);
                                }
                              }}
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
                                  className="ri-pencil-fill"
                                  style={{
                                    cursor: "pointer",
                                    color: TopTextColor.color,
                                    fill: TopTextColor.color,
                                  }}
                                ></i>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  </ul>
                  {common.organisationKeyID !== null && (
                    <ul
                      className={`changed-nav navbar-nav ${
                        isDropdownOpen ? " open" : ""
                      } mt-1`}
                      // style={{paddingRight: "1rem"}}
                      id="navbar-UL-nav"
                    >
                      <li class="menu-title">
                        <span data-key="t-menu">Menu</span>
                      </li>
                      {/* Dashboard Start */}
                      {userAccessData.Dashboard_CanView &&
                        common.organisationKeyID !== null && (
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
                                fontWeight: "bold",
                              }}
                            >
                              <img
                                src={DashboardSvg}
                                alt="Dashboard"
                                style={{ width: "16px", marginRight: "5px" }}
                              />
                              {/* <i class="bi bi-graph-up mr-2"></i> */}
                              <span
                                className="menu-link"
                                data-key="t-dashboard"
                                style={{
                                  color: isHoveredDashboard
                                    ? "#438eff"
                                    : "#fff",
                                }}
                              >
                                Dashboard
                              </span>
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
                              fontWeight: "bold",
                            }}
                          >
                            <img
                              src={ProspectSvg}
                              alt="ProspectSvg"
                              style={{ width: "16px", marginRight: "5px" }}
                            />
                            <span
                              data-key="t-dashboard"
                              style={{
                                color: isHoveredProspect ? "#438eff" : "#fff",
                              }}
                            >
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
                              fontWeight: "bold",
                            }}
                          >
                            {" "}
                            <img
                              src={ProposalSvg}
                              alt="ProposalSvg"
                              style={{ width: "16px", marginRight: "5px" }}
                            />
                            {/* <i class="bi bi-card-list mr-2"  ></i>{" "} */}
                            <span
                              data-key="t-dashboard"
                              style={{
                                color: isHoveredProposal ? "#438eff" : "#fff",
                              }}
                            >
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
                              onMouseOver={() => setIsHoveredEngagement(true)}
                              onMouseOut={() => setIsHoveredEngagement(false)}
                              style={{
                                color: isHoveredEngagement
                                  ? "#438eff"
                                  : TopTextColor.color,
                                fontWeight: "bold",
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
                              <span
                                data-key="t-dashboard"
                                style={{
                                  color: isHoveredEngagement
                                    ? "#438eff"
                                    : "#fff",
                                }}
                              >
                                {EngagementName}
                              </span>{" "}
                            </NavLink>
                          </li>
                        )}

                      {/* Engagement latter End */}
                      {/* Admin Config Modal Start */}
                      {userAccessData.Admin_Config_CanView && (
                        <li
                          className="nav-item"
                          onMouseLeave={hideConfigList}
                          onMouseEnter={showConfigList}
                        >
                          <a
                            className="nav-link menu-link"
                            // data-bs-toggle="collapse"
                            role="button"
                            aria-expanded="false"
                            aria-controls="sidebarPages"
                            onClick={() => toggleConfigList()}
                            onMouseOver={() => setIsHoveredConfigure(true)}
                            onMouseOut={() => setIsHoveredConfigure(false)}
                            ref={configRef}
                            style={{
                              // color: isHoveredConfigure
                              //   ? "#438eff"
                              //   : TopTextColor.color,
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            <img
                              src={ConfigSvg}
                              alt="ConfigSvg"
                              style={{ width: "16px", marginRight: "5px" }}
                            />
                            <span
                              data-key="t-pages"
                              // style={{
                              //   color: isHoveredConfigure ? "#438eff" : "#fff",
                              // }}
                            >
                              Configure
                              <span className="menu-arrow" />
                            </span>
                          </a>
                          {/* Main dropdown: normal flow */}
                          <div
                            id="config"
                            // data-bs-parent="#sidebar"
                            style={{
                              "--listColor": listColor,
                            }}
                            className="menu-dropdown menu_dropdown Responsive-Config-service-package"
                          >
                            <ul className="nav nav-sm flex-column">
                              {userAccessData.Admin_Config_ServiceCat_CanView && (
                                <li className="nav-item">
                                  <a
                                    // href="#sidebarProfile"
                                    className="nav-link"
                                    // data-bs-toggle="collapse"
                                    aria-expanded="false"
                                    // aria-controls="sidebarProfile"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleConfigSubList("servicesAndPackage");
                                    }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    Services/Packages
                                    <span className="sub-arrow"></span>
                                  </a>
                                  {/* Sublist in normal flow */}
                                  <div
                                    id="servicesAndPackage"
                                    className="subList Service-package-bgColor"
                                    style={{
                                      "--subListColor": subListColor,
                                    }}
                                    // data-bs-parent="#config"
                                    // style={{
                                    //   color: style.backgroundColor,
                                    //   // display: "none", // controlled via toggleConfigSubList
                                    //   width: "100%",
                                    //   paddingLeft: "16px", // optional: visual indentation
                                    // }}
                                  >
                                    <ul className="nav nav-sm flex-column">
                                      <li className="nav-item">
                                        <NavLink to="/service-category">
                                          <a
                                            onClick={() => {
                                              // closeDropdown("config");
                                              toggleConfigList("config");
                                              NotificationCountData();
                                            }}
                                            className="nav-link"
                                          >
                                            Service Categories
                                          </a>
                                        </NavLink>
                                      </li>
                                      <li className="nav-item">
                                        <NavLink to="/services">
                                          <a
                                            onClick={() => {
                                              closeDropdown("config");
                                              NotificationCountData();
                                            }}
                                            className="nav-link"
                                          >
                                            Services
                                          </a>
                                        </NavLink>
                                      </li>
                                      <li className="nav-item">
                                        <NavLink to="/packages">
                                          <a
                                            onClick={() => {
                                              closeDropdown("config");
                                              NotificationCountData();
                                            }}
                                            className="nav-link"
                                          >
                                            Packages
                                          </a>
                                        </NavLink>
                                      </li>
                                    </ul>
                                  </div>
                                </li>
                              )}
                              {userAccessData.Admin_Config_Global_Constant_CanView && (
                                <li
                                  className="nav-item"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleConfigSubList("variable");
                                  }}
                                >
                                  <a
                                    href="#variable"
                                    className="nav-link collapsed"
                                    // data-bs-toggle="collapse"
                                    aria-expanded="false"
                                    // aria-controls="sidebarProfile"
                                    style={{ cursor: "pointer" }}
                                    data-key="t-profile"
                                  >
                                    Variables
                                    <span className="sub-arrow"></span>
                                  </a>

                                  {/* Sublist: normal flow so it pushes siblings down */}
                                  <div
                                    id="variable"
                                    style={{
                                      "--subListColor": subListColor,
                                    }}
                                    className=" subList Service-package-bgColor"
                                  >
                                    <ul className="nav nav-sm flex-column">
                                      <li className="nav-item">
                                        <NavLink to="/global-constant">
                                          <a
                                            onClick={() => {
                                              closeDropdown("config");
                                              NotificationCountData();
                                            }}
                                            // style={{ whiteSpace: "nowrap" }}
                                            className="nav-link"
                                            data-key="t-simple-page"
                                          >
                                            Global Constants
                                          </a>
                                        </NavLink>
                                      </li>
                                      <li className="nav-item">
                                        <NavLink to="/global-pricing-driver">
                                          <a
                                            onClick={() => {
                                              closeDropdown("config");
                                              NotificationCountData();
                                            }}
                                            // style={{ whiteSpace: "nowrap" }}
                                            className="nav-link"
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
                                <li className="nav-item">
                                  <a
                                    href="#Template"
                                    className="nav-link collapsed"
                                    // data-bs-toggle="collapse"
                                    aria-expanded="false"
                                    // aria-controls="sidebarProfile"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleConfigSubList("Template");
                                    }}
                                    style={{ cursor: "pointer" }}
                                    data-key="t-profile"
                                  >
                                    Templates
                                    <span className="sub-arrow"></span>
                                  </a>

                                  {/* Sublist: normal flow */}
                                  <div
                                    style={{
                                      "--subListColor": subListColor,
                                    }}
                                    id="Template"
                                    className=" subList Service-package-bgColor"
                                  >
                                    <ul className="nav nav-sm flex-column">
                                      <li className="nav-item">
                                        <NavLink
                                          to="/templates"
                                          // style={{whiteSpace: "nowrap"}}
                                          onClick={() => {
                                            closeDropdown("config");
                                            NotificationCountData();
                                          }}
                                          className="nav-link"
                                          data-key="t-simple-page"
                                        >
                                          {proposalName}/{EngagementName}
                                        </NavLink>
                                      </li>
                                      <li className="nav-item">
                                        <NavLink to="/terms-and-conditions">
                                          <a
                                            // style={{ whiteSpace: "nowrap" }}
                                            onClick={() => {
                                              closeDropdown("config");
                                              NotificationCountData();
                                            }}
                                            className="nav-link"
                                            data-key="t-simple-page"
                                          >
                                            Terms & Conditions
                                          </a>
                                        </NavLink>
                                      </li>
                                      <li className="nav-item">
                                        <NavLink to="/email-template">
                                          <a
                                            // style={{ whiteSpace: "nowrap" }}
                                            onClick={() => {
                                              closeDropdown("config");
                                              NotificationCountData();
                                            }}
                                            className="nav-link"
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

                      {/* Setting Admin Modal */}
                      {userAccessData.Admin_Setting_CanView && (
                        <li
                          class="nav-item"
                          // style={{
                          //   paddingLeft:
                          //     windowWidth <= 767 ? "0px" : "10px",
                          // }}
                          onMouseLeave={() => hideSettingList()}
                          onMouseEnter={() => showSettingList()}
                        >
                          <a
                            // href="#sidebarSignUp1"
                            // data-bs-toggle="collapse"
                            class="nav-link menu-link"
                            role="button"
                            aria-expanded="false"
                            aria-controls="sidebarSignUp1"
                            // data-key="t-signup"
                            onClick={toggleSettingList}
                            onMouseOver={() => setIsHoveredSetting(true)}
                            onMouseOut={() => setIsHoveredSetting(false)}
                            ref={settingsRef}
                            // style={{
                            //   color: isHoveredSetting
                            //     ? "#438eff"
                            //     : TopTextColor.color,
                            //   fontWeight: "bold",
                            // }}
                          >
                            <img
                              src={SettingSvg}
                              alt="SettingSvg"
                              style={{ width: "16px", marginRight: "5px" }}
                            />
                            <span
                              data-key="t-dashboard"
                              // style={{
                              //   color: isHoveredSetting ? "#438eff" : "#fff",
                              // }}
                            >
                              Settings
                              <span className="menu-arrow"></span>
                            </span>
                          </a>
                          <div
                            className="menu-dropdown menu_dropdown Responsive-Config-service-package"
                            id="Setting"
                            style={{
                              "--listColor": listColor,
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
                                    onClick={() =>
                                      toggleSettingSubList("WebIntegration")
                                    }
                                  >
                                    <a
                                      //   href="#sidebarProfile"
                                      class="nav-link"
                                      // data-bs-toggle="collapse"
                                      role="button"
                                      aria-expanded="false"
                                      // aria-controls="sidebarProfile"
                                      data-key="t-profile"
                                    >
                                      API Integration
                                      <span className="sub-arrow"></span>
                                    </a>
                                    <div
                                      class="subList Service-package-bgColor"
                                      id="WebIntegration"
                                      style={{
                                        "--subListColor": subListColor,
                                      }}
                                      // style={style}
                                    >
                                      <ul class="nav nav-sm flex-column">
                                        <li class="nav-item">
                                          <Link
                                            to="/WebSetting"
                                            onClick={togglenav}
                                          >
                                            <a
                                              onClick={() => {
                                                toggleSettingList("Setting");
                                                NotificationCountData();
                                              }}
                                              // style={{
                                              //   whiteSpace: "nowrap"
                                              // }}
                                              class="nav-link"
                                              // data-key="t-basic-3 fw-bold"
                                            >
                                              Setting
                                            </a>
                                          </Link>
                                        </li>
                                        <li className="nav-item">
                                          <NavLink
                                            to="/AccessKey"
                                            className="nav-link"
                                            // data-key="t-simple page"
                                            onClick={() => {
                                              toggleSettingList("Setting");
                                              NotificationCountData();
                                            }}
                                          >
                                            Access Key
                                          </NavLink>
                                        </li>
                                        <li class="nav-item">
                                          <Link
                                            to="/coupon"
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
                                  onClick={() =>
                                    toggleSettingSubList("PracticeConfig")
                                  }
                                >
                                  <a
                                    // href="#sidebarProfile"
                                    class="nav-link"
                                    // data-bs-toggle="collapse"
                                    role="button"
                                    aria-expanded="false"
                                    // aria-controls="sidebarProfile"
                                    // data-key="t-profile"
                                  >
                                    Practice Config
                                    <span className="sub-arrow"></span>
                                  </a>
                                  <div
                                    class="subList Responsive-Config-Variables"
                                    id="PracticeConfig"
                                    style={{
                                      "--subListColor": subListColor,
                                    }}
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
                                            // style={{ whiteSpace: "nowrap" }}
                                            class="nav-link"
                                            data-key="t-basic-3"
                                          >
                                            Payment Gateways
                                          </a>
                                        </Link>
                                      </li>

                                      <li
                                        className="nav-item"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSettingSubList(
                                            "BookKeepingConfig",
                                          );
                                        }}
                                      >
                                        <a
                                          href="#BookKeepingConfig"
                                          className="nav-link collapsed d-flex justify-content-between align-items-center"
                                          aria-expanded="false"
                                          onClick={(e) => {
                                            e.preventDefault();
                                          }}
                                          style={{ textDecoration: "none" }}
                                        >
                                          Bookkeeping Gateway
                                          <span className="sub-arrow"></span>
                                        </a>

                                        <div
                                          className="subList Service-package-bgColor"
                                          id="BookKeepingConfig"
                                        >
                                          <ul className="nav nav-sm flex-column ms-3">
                                            {bookkeeping?.enableXERO && (
                                              <li className="nav-item">
                                                <Link
                                                  to="/xero"
                                                  onClick={togglenav}
                                                  className="nav-link"
                                                >
                                                  Xero
                                                </Link>
                                              </li>
                                            )}
                                            {bookkeeping?.enableQBO && (
                                              <li className="nav-item">
                                                <Link
                                                  to="/quickbooks"
                                                  onClick={togglenav}
                                                  className="nav-link"
                                                >
                                                  QuickBooks
                                                </Link>
                                              </li>
                                            )}
                                            <li className="nav-item">
                                              <Link
                                                to="/deviation"
                                                onClick={togglenav}
                                                className="nav-link"
                                              >
                                                Deviation
                                              </Link>
                                            </li>
                                          </ul>
                                        </div>
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
                                  <Link to="/activity-logs" onClick={togglenav}>
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
                                <Link to="/mySubscription" onClick={togglenav}>
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

                      {userAccessData.Admin_Config_Email_Template_CanView && (
                        <li
                          className="nav-item"
                          onMouseLeave={hideWorkflowList}
                          onMouseEnter={showWorkflowList}
                        >
                          <a
                            className="nav-link menu-link"
                            role="button"
                            aria-expanded="false"
                            aria-controls="sidebarPages"
                            onClick={() => toggleWorkflowList()}
                            onMouseOver={() => setIsHoveredWorkflow(true)}
                            onMouseOut={() => setIsHoveredWorkflow(false)}
                            ref={workflowRef}
                            style={{ fontWeight: "bold", cursor: "pointer" }}
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
                            style={{ "--listColor": listColor }}
                            className="menu-dropdown menu_dropdown Responsive-Config-service-package"
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <NavLink to="/reminder-email-template">
                                  <a
                                    onClick={() => {
                                      closeDropdown("workflow");
                                      NotificationCountData();
                                    }}
                                    className="nav-link"
                                    data-key="t-simple-page"
                                  >
                                    Email Templates
                                  </a>
                                </NavLink>
                              </li>
                              <li className="nav-item">
                                <NavLink to="/reminder">
                                  <a
                                    onClick={() => {
                                      closeDropdown("workflow");
                                      NotificationCountData();
                                    }}
                                    className="nav-link"
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

                      {/* PDF to CSV section starts */}
                      {userAccessData.Admin_Setting_Practice_Config_CanView &&
                        activeOrganizationSubscriptionPlan?.enablePdfToCsv && (
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
                              <span
                                data-key="t-dashboard"
                                // style={{
                                //   color: isHoveredPdfToCsv ? "#438eff" : "#fff",
                                // }}
                                className="fw-bold"
                              >
                                PDF To CSV
                              </span>{" "}
                            </NavLink>
                          </li>
                        )}
                      {/* PDF to CSV section ends */}
                    </ul>
                  )}
                  {common.roleTypeId == USER_ROLE_TYPE.SuperAdmin &&
                    common.organisationKeyID === null && (
                      <>
                        <ul
                          className={`changed-nav navbar-nav ${
                            isDropdownOpen ? " open" : ""
                          }`}
                          // style={{ paddingRight: "2rem" }}
                          id="navbar-UL-nav"
                        >
                          <li class="menu-title">
                            <span
                              data-key="t-menu fw-bold"
                              style={{ color: "#fff" }}
                            >
                              Menu
                            </span>
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
                                onMouseOver={() => setIsHoveredDashboards(true)}
                                onMouseOut={() => setIsHoveredDashboards(false)}
                                style={{
                                  // color: isHoveredDashboards
                                  //   ? "#438eff"
                                  //   : TopTextColor.color,
                                  fontWeight: "bold",
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
                                <span
                                  data-key="t-dashboard"
                                  // style={{
                                  //   color: isHoveredDashboards
                                  //     ? "#438eff"
                                  //     : "#fff",
                                  // }}
                                >
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
                                  fontWeight: "bold",
                                }}
                              >
                                {" "}
                                <i
                                  class="bi bi-buildings-fill"
                                  style={{ marginRight: "5px" }}
                                ></i>
                                <span
                                  data-key="t-dashboard"
                                  style={{
                                    color: isHoveredOrganization
                                      ? "#438eff"
                                      : "#fff",
                                  }}
                                >
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
                                // activeclassname="active"
                                className="nav-link menu-link"
                                onMouseOver={() => setIsHoveredUser(true)}
                                onMouseOut={() => setIsHoveredUser(false)}
                                style={{
                                  color: isHoveredUser
                                    ? "#438eff"
                                    : TopTextColor.color,
                                  fontWeight: "bold",
                                }}
                              >
                                {" "}
                                <i
                                  class="bi bi-people-fill"
                                  style={{
                                    width: "16px",
                                    marginRight: "5px",
                                  }}
                                ></i>
                                <span
                                  data-key="t-dashboard"
                                  style={{
                                    color: isHoveredUser ? "#438eff" : "#fff",
                                  }}
                                >
                                  Users
                                </span>{" "}
                              </NavLink>
                            </li>
                          )}

                          {/* User Super Admin Modal end */}

                          {/*  Super Admin Config Modal Start */}
                          {userAccessData.SuperAdmin_Config_CanView && (
                            <li
                              class="nav-item"
                              onMouseLeave={hideConfigList}
                              onMouseEnter={showConfigList}
                            >
                              <a
                                class="nav-link menu-link"
                                href="#sidebarPages"
                                // data-bs-toggle="collapse"
                                // role="button"
                                // aria-expanded="false"
                                // aria-controls="sidebarPages"
                                onClick={toggleConfigList}
                                onMouseOver={() => setIsHoveredConfigure(true)}
                                onMouseOut={() => setIsHoveredConfigure(false)}
                                // style={{
                                //   color: isHoveredConfigure
                                //     ? "#438eff"
                                //     : TopTextColor.color,
                                //   fontWeight: "bold",
                                // }}
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
                                <span
                                  data-key="t-pages"
                                  // style={{
                                  //   color: isHoveredConfigure
                                  //     ? "#438eff"
                                  //     : "#fff",
                                  // }}
                                >
                                  Configure
                                  <span className="menu-arrow"></span>
                                </span>
                              </a>
                              <div
                                id="config"
                                // style={{
                                //   ...style,
                                //   display: isDropdownOpen ? "block" : "none",
                                //   border: "none",
                                // }}
                                style={{
                                  "--listColor": listColor,
                                }}
                                class="menu-dropdown menu_dropdown Responsive-Config-service-package"
                              >
                                <ul class="nav nav-sm flex-column">
                                  {/*  Super Admin Config SubList Modal Start */}
                                  {userAccessData.SuperAdmin_Config_ServicePackage_CanView && (
                                    <li
                                      class="nav-item"
                                      // onMouseLeave={() =>
                                      //   hideConfigSubList(
                                      //     "PredefinedServicesAndPackage"
                                      //   )
                                      // }
                                      // onMouseEnter={() =>
                                      //   showConfigSubList(
                                      //     "PredefinedServicesAndPackage"
                                      //   )
                                      // }
                                    >
                                      <a
                                        // href="#sidebarProfile"
                                        class="nav-link"
                                        // data-bs-toggle="collapse"
                                        // role="button"
                                        aria-expanded="false"
                                        // aria-controls="sidebarProfile"
                                        // data-key="t-profile"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          toggleConfigSubList(
                                            "PredefinedServicesAndPackage",
                                          );
                                        }}
                                        style={{ cursor: "pointer" }}
                                      >
                                        Predefined Services/Packages
                                        <span className="sub-arrow"></span>
                                      </a>
                                      <div
                                        class="subList Service-package-bgColor"
                                        id="PredefinedServicesAndPackage"
                                        // style={style}
                                        style={{
                                          "--subListColor": subListColor,
                                        }}
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
                                                  toggleConfigList("config");
                                                  NotificationCountData();
                                                  togglenav();
                                                }}
                                                class="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Predefined Service Categories
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
                                                Predefined Services
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
                                                Predefined Packages
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
                                      // onMouseLeave={() =>
                                      //   hideConfigSubList(
                                      //     "PredefinedVariable"
                                      //   )
                                      // }
                                      // onMouseEnter={() =>
                                      //   showConfigSubList(
                                      //     "PredefinedVariable"
                                      //   )
                                      // }
                                    >
                                      <a
                                        href="#sidebarProfile"
                                        class="nav-link collapsed"
                                        // data-bs-toggle="collapse"
                                        // role="button"
                                        aria-expanded="false"
                                        // aria-controls="sidebarProfile"
                                        // data-key="t-profile"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          toggleConfigSubList(
                                            "PredefinedVariable",
                                          );
                                        }}
                                      >
                                        Predefined Variables
                                        <span className="sub-arrow"></span>
                                      </a>
                                      <div
                                        // style={style}
                                        style={{
                                          "--subListColor": subListColor,
                                        }}
                                        class="subList"
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
                                                Predefined Global Constants
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
                                                Predefined Global Pricing
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
                                      // onMouseLeave={() =>
                                      //   hideConfigSubList(
                                      //     "PredefinedTemplate"
                                      //   )
                                      // }
                                      // onMouseEnter={() =>
                                      //   showConfigSubList(
                                      //     "PredefinedTemplate"
                                      //   )
                                      // }
                                    >
                                      <a
                                        href="#sidebarProfile"
                                        class="nav-link collapsed"
                                        // data-bs-toggle="collapse"
                                        // role="button"
                                        aria-expanded="false"
                                        // aria-controls="sidebarProfile"
                                        data-key="t-profile"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          toggleConfigSubList(
                                            "PredefinedTemplate",
                                          );
                                        }}
                                      >
                                        Predefined Templates
                                        <span className="sub-arrow"></span>
                                      </a>
                                      <div
                                        // style={style}
                                        className="subList Service-package-bgColor"
                                        id="PredefinedTemplate"
                                        style={{
                                          "--subListColor": subListColor,
                                        }}
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
                                                Predefined {proposalName}/
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
                                                Predefined Terms & Conditions
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
                                                Predefined Email Templates
                                              </a>
                                            </NavLink>
                                          </li>
                                        </ul>
                                      </div>
                                    </li>
                                  )}

                                  {/*  Deleted Predefined Workflows */}
                                </ul>
                              </div>
                            </li>
                          )}

                          {/*  Super Admin Config End */}
                          {/*  Super Admin Subscription Start */}
                          {userAccessData.Subscription_CanView && (
                            <li
                              class="nav-item"
                              // style={{
                              //   paddingLeft:
                              //     windowWidth <= 767 ? "0px" : "10px",
                              // }}
                              onMouseLeave={() => hideSubscriptionList()}
                              onMouseEnter={() => showSubscriptionList()}
                            >
                              <a
                                // href="#sidebarSignUp2"
                                ref={subscriptionRef}
                                class="nav-link menu-link"
                                // role="button"
                                // data-bs-toggle="collapse"
                                aria-expanded="false"
                                // aria-controls="sidebarSignUp2"
                                // data-key="t-signup"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleSubscriptionList();
                                }}
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
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                                // any issue arise ,undo this code

                                // onMouseOver={() =>
                                //   setIsHoveredSubscription(true)
                                // }
                                // onMouseOut={() =>
                                //   setIsHoveredSubscription(false)
                                // }
                              >
                                <i
                                  class="bi bi-credit-card"
                                  style={{ marginRight: "5px" }}
                                ></i>
                                <span
                                  data-key="t-dashboard"
                                  // style={{
                                  //   color: isHoveredSubscription
                                  //     ? "#438eff"
                                  //     : "#fff",
                                  // }}
                                >
                                  Subscription
                                  <span className="menu-arrow"></span>
                                </span>{" "}
                              </a>
                              <div
                                // style={{
                                //   ...style,
                                //   display: isSettingDropdownOpen
                                //     ? "block"
                                //     : "none",
                                // }}
                                style={{
                                  "--listColor": listColor,
                                }}
                                className="menu-dropdown menu_dropdown Responsive-Config-service-package"
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
                                        className="nav-link"
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
                                        className="nav-link"
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
                                        className="nav-link"
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
                                        className="nav-link"
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
                                // href="#sidebarSignUp3"
                                ref={settingsMenuRef}
                                class="nav-link menu-link"
                                // role="button"
                                // data-bs-toggle="collapse"
                                // aria-expanded="false"
                                // aria-controls="sidebarSignUp3"
                                // data-key="t-signup"
                                onClick={toggleUserRoleDropdown}
                                onMouseOver={() => setIsHoveredUserRole(true)}
                                onMouseOut={() => setIsHoveredUserRole(false)}
                                // style={{
                                //   color: isHoveredUserRole
                                //     ? "#438EFF"
                                //     : TopTextColor.color,
                                //   fontWeight: "bold",
                                // }}
                                style={{ cursor: "pointer" }}
                              >
                                <img
                                  src={SettingSvg}
                                  alt="SettingSvg"
                                  style={{
                                    width: "16px",
                                    marginRight: "5px",
                                  }}
                                />
                                <span
                                  data-key="t-dashboard"
                                  // style={{
                                  //   color: isHoveredUserRole
                                  //     ? "#438eff"
                                  //     : "#fff",
                                  // }}
                                >
                                  Settings
                                  <span className="menu-arrow"></span>
                                </span>{" "}
                              </a>
                              <div
                                // style={{
                                //   ...style,
                                //   display: isUserRoleDropdownOpen
                                //     ? "block"
                                //     : "none",
                                //   width: "200px",
                                // }}
                                style={{
                                  "--listColor": listColor,
                                }}
                                className="menu-dropdown menu_dropdown Responsive-Config-service-package"
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
                                        className="nav-link"
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
                                        className="nav-link"
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
                                      className="nav-link"
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
                                    // onMouseLeave={() =>
                                    //   hideSettingSubList("WebIntegration")
                                    // }
                                    // onMouseEnter={() =>
                                    //   showSettingSubList("WebIntegration")
                                    // }
                                    onClick={() =>
                                      toggleUserRoleSettingSubList(
                                        "WebIntegration",
                                      )
                                    }
                                  >
                                    <a
                                      // href="#sidebarProfile"
                                      class="nav-link"
                                      // data-bs-toggle="collapse"
                                      // role="button"
                                      aria-expanded="false"
                                      // aria-controls="sidebarProfile"
                                      data-key="t-profile"
                                      style={{ cursor: "pointer" }}
                                    >
                                      API Integration
                                      <span className="sub-arrow"></span>
                                    </a>
                                    <div
                                      class="subList"
                                      id="WebIntegration"
                                      style={{
                                        "--subListColor": subListColor,
                                      }}
                                      // style={style}
                                    >
                                      <ul class="nav nav-sm flex-column">
                                        <li class="nav-item">
                                          <Link
                                            to="/AccessKey"
                                            onClick={togglenav}
                                          >
                                            <a
                                              onClick={(e) => {
                                                // e.preventDefault();
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
                                          closeDropdown("UserRole");
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
                                  {/* deleted superadmin workflows */}
                                </ul>
                              </div>
                            </li>
                          )}

                          {(userAccessData.SuperAdmin_Config_Template_CanView ||
                            userAccessData.SuperAdmin_Setting_Email_Template_CanView) && (
                            <li
                              className="nav-item"
                              onMouseLeave={hideSAWorkflowList}
                              onMouseEnter={showSAWorkflowList}
                            >
                              <a
                                className="nav-link menu-link"
                                role="button"
                                aria-expanded="false"
                                aria-controls="sidebarPages"
                                onClick={() => toggleSAWorkflowList()}
                                onMouseOver={() => setIsHoveredSAWorkflow(true)}
                                onMouseOut={() => setIsHoveredSAWorkflow(false)}
                                ref={saWorkflowRef}
                                style={{
                                  fontWeight: "bold",
                                  cursor: "pointer",
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
                                id="superAdminWorkflows"
                                style={{ "--listColor": listColor }}
                                className="menu-dropdown menu_dropdown Responsive-Config-service-package"
                              >
                                <ul className="nav nav-sm flex-column">
                                  {userAccessData.SuperAdmin_Config_Template_CanView && (
                                    <li className="nav-item">
                                      <a
                                        href="#PredefinedReminder"
                                        className="nav-link collapsed"
                                        aria-expanded="false"
                                        data-key="t-profile"
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          toggleSAWorkflowSubList(
                                            "PredefinedReminder",
                                          );
                                        }}
                                      >
                                        Predefined Workflows
                                        <span className="sub-arrow"></span>
                                      </a>

                                      <div
                                        id="PredefinedReminder"
                                        className="subList Service-package-bgColor"
                                        style={{
                                          "--subListColor": subListColor,
                                        }}
                                      >
                                        <ul className="nav nav-sm flex-column">
                                          <li className="nav-item">
                                            <NavLink to="/reminder-email-template">
                                              <a
                                                onClick={() => {
                                                  closeDropdown(
                                                    "superAdminWorkflows",
                                                  );
                                                  NotificationCountData();
                                                }}
                                                className="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Predefined Workflows Email
                                                Templates
                                              </a>
                                            </NavLink>
                                          </li>
                                          <li className="nav-item">
                                            <NavLink to="/reminder">
                                              <a
                                                onClick={() => {
                                                  closeDropdown(
                                                    "superAdminWorkflows",
                                                  );
                                                  NotificationCountData();
                                                }}
                                                className="nav-link"
                                                data-key="t-simple-page"
                                              >
                                                Predefined Reminder
                                              </a>
                                            </NavLink>
                                          </li>
                                        </ul>
                                      </div>
                                    </li>
                                  )}

                                  {userAccessData.SuperAdmin_Setting_Email_Template_CanView && (
                                    <li className="nav-item">
                                      <a
                                        href="#SASetting"
                                        className="nav-link collapsed"
                                        aria-expanded="false"
                                        data-key="t-profile"
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          toggleSAWorkflowSubList("SASetting");
                                        }}
                                      >
                                        Super Admin Workflows
                                        <span className="sub-arrow"></span>
                                      </a>

                                      <div
                                        id="SASetting"
                                        className="subList Service-package-bgColor"
                                        style={{
                                          "--subListColor": subListColor,
                                        }}
                                      >
                                        <ul className="nav nav-sm flex-column">
                                          <li className="nav-item">
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
                                                className="nav-link"
                                                data-key="t-basic-3"
                                              >
                                                Super Admin Workflow Email
                                                Templates
                                              </a>
                                            </Link>
                                          </li>
                                          <li className="nav-item">
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
                                                className="nav-link"
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
                                          <li className="nav-item">
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
                                                className="nav-link"
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
                      </>
                    )}

                  {/* <div class="d-flex"> */}
                  {/* <div class="d-flex search"> */}
                  {/* Profile DropDown modal End  */}
                  {/* </div> */}
                  {/* </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* <  AuthButton /> */}

          <div
            className="d-flex sidebar-bottom align-items-center justify-content-start"
            style={{
              // zIndex: 9999,
              padding: "15px 5px 5px 5px",
            }}
          >
            <Tooltip title={"Notifications"}>
              <div
                // class="dropdown topbar-head-dropdown ms-1 header-item"
                // id="notificationDropdown"
                class="dropdown ms-sm-3 header-item justify-content-center d-block me-1"
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
                    <span class="notification-badge">{notificationCount}</span>
                    <span class="visually-hidden">unread messages</span>
                  </span>
                </button>
              </div>
            </Tooltip>
            <div className="dropdown header-item justify-content-center d-block ps-2">
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
                  <span class="d-flex align-items-center justify-content-center">
                    <img
                      class="rounded-circle header-profile-user"
                      src={profile}
                      style={{
                        width: "2rem", // scales with root font size
                        height: "2rem",
                        objectFit: "cover",
                      }}
                    />
                    <span
                      className="d-flex justify-content-center ps-2 fw-bold"
                      style={{ fontSize: "16px", color: TopTextColor.color }}
                    >
                      Profile
                    </span>
                  </span>
                </button>
              </Tooltip>
              <div
                class="dropdown-menu"
                style={{ inset: "auto 10px 0px auto" }}
              >
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
                    {common.isPasswordSet ? "Reset Password" : "Set Password"}
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
          </div>
          {/* <div class="sidebar-background"></div> */}
        </div>
        {/* <!-- Left Sidebar End -->
        <!-- Vertical Overlay--> */}
        <div class="vertical-overlay"></div>

        {/* <!-- end main content--> */}
      </div>
      <LogoutModal Logout={Logout} />

      {/* --------Reset Modal----------- */}
      <ResetPasswordModal id="ResetPasswordModal" />

      {/* ----------Set Logout Time modal-------- */}
      <SetTimeoutComponent id="SetLogoutTimeModal" />
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
    </>
  );
};

export default TopbarClone;
