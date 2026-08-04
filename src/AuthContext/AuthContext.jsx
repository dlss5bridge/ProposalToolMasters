/* global $ */
import React, { createContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetState, updateState } from "../redux/Persist";
import { CalenderFilterEnum, ActiveDateFilterEnum } from "../Middleware/enums";
import moment from "moment/moment";
import { GetSaveImage } from "../redux/Services/SaveImage/SaveImageApi";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { format, parse, isValid } from "date-fns";
const initialState = {
  loading: false,
};

export const AuthContextProvider = createContext(initialState);

const AuthContext = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                State Declare                               */
  /* -------------------------------------------------------------------------- */
  const dispatch = useDispatch();
  const [activeOrganization, setActiveOrganization] = useState([]);
  const [
    activeOrganizationSubscriptionPlan,
    setActiveOrganizationSubscriptionPlan,
  ] = useState(JSON.parse(localStorage.getItem("subscriptionPlan")));
  const [topbar, setTopbar] = useState("block");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [loginLoader, setLoginLoader] = useState(false);
  const [professionTypeListData, setProfessionTypeList] = useState([]);
  const [prospectName, setProspectName] = useState("");
  const [bookKeepingGateway, setBookKeepingGateway] = useState("");
  const [updatedProspectName, setUpdatedProspectName] = useState("");
  const [proposalName, setProposalName] = useState("");
  const [updatedProposalName, setUpdatedProposalName] = useState("");
  const [EngagementName, setEngagementName] = useState("");
  const [updatedEngagementName, setUpdatedEngagementName] = useState("");
  const [DefaultVariables, setDefaultVariables] = useState(false);
  const [maxCountToRecallApi, setMaxCountToRecallApi] = useState(5);
  const [isAddUpdatePurchaseDone, setIsAddUpdatePurchaseDone] = useState(false);
  const [logoutTimeUpModal, setLogoutTimeUpModal] = useState({
    isPopupOpen: false,
    popupOpenTime: null,
    popupCloseTime: null,
  });
  const problematicInputRef = useRef(null);
  const [RequireErrorMessage, setRequireErrorMessage] = useState(false);
  const [listCount, setListCount] = useState(0);
  const [isMobileRecords, setIsMobileRecords] = useState(1);
  const [desktopRecords, setDesktopRecords] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [orgLoaderList, setOrgLoaderList] = useState(false);
  const [DashboardCountListLoader, setDashboardCountListLoader] =
    useState(false);
  const [DashboardActivityLogLoader, setDashboardActivityLogLoader] =
    useState(false);

  let engagementSetting;
  let proposalSetting;
  let prospectSetting;

  const staticCurrencySymbols = {
    currency1: "$", // Example: US Dollar
    currency2: "€", // Example: Euro
    currency3: "₹", // Example: Rupee
  };
  // access permission count
  const [accessCount, SetAccessCount] = useState(-1);
  const totalPage = isMobile
    ? Math.ceil(listCount / isMobileRecords)
    : Math.ceil(listCount / desktopRecords);

  const common = useSelector((state) => state.Storage);
  // User Access Permission
  const [userAccessData, setUserAccessData] = useState({
    Dashboard_CanView: true,

    // Prospect:
    Admin_Prospect_CanAdd: false,
    Admin_Prospect_CanEdit: false,
    Admin_Prospect_CanDelete: false,
    Admin_Prospect_CanView: false,

    //Proposal :
    Admin_Proposal_CanAdd: false,
    Admin_Proposal_CanEdit: false,
    Admin_Proposal_CanDelete: false,
    Admin_Proposal_CanView: false,

    //Engagement Latter :
    Admin_Engagement_Latter_CanAdd: false,
    Admin_Engagement_Latter_CanEdit: false,
    Admin_Engagement_Latter_CanDelete: false,
    Admin_Engagement_Latter_CanView: false,

    //Organisation:
    Organisation_CanAdd: false,
    Organisation_CanEdit: false,
    Organisation_CanDelete: false,
    Organisation_CanView: false,

    //SuperAdmin User:
    User_CanAdd: false,
    User_CanEdit: false,
    User_CanDelete: false,
    User_CanView: false,

    // Subscription:
    Subscription_CanAdd: false,
    Subscription_CanEdit: false,
    Subscription_CanDelete: false,
    Subscription_CanView: false,

    //Config Admin:

    Admin_Config_CanView: false,
    Admin_Setting_CanView: false,

    //Config Admin Service Cat:
    Admin_Config_ServiceCat_CanAdd: false,
    Admin_Config_ServiceCat_CanEdit: false,
    Admin_Config_ServiceCat_CanDelete: false,
    Admin_Config_ServiceCat_CanView: false,

    //Config Admin Service:
    Admin_Config_Service_CanAdd: false,
    Admin_Config_Service_CanEdit: false,
    Admin_Config_Service_CanDelete: false,
    Admin_Config_Service_CanView: false,

    //Config Admin Package:
    Admin_Config_ServicePackage_CanAdd: false,
    Admin_Config_ServicePackage_CanEdit: false,
    Admin_Config_ServicePackage_CanDelete: false,
    Admin_Config_ServicePackage_CanView: false,

    //Config Admin Global constant:
    Admin_Config_Global_Constant_CanAdd: false,
    Admin_Config_Global_Constant_CanEdit: false,
    Admin_Config_Global_Constant_CanDelete: false,
    Admin_Config_Global_Constant_CanView: false,

    //Config Admin GlobalDriver:
    Admin_Config_Global_Driver_CanAdd: false,
    Admin_Config_Global_Driver_CanEdit: false,
    Admin_Config_Global_Driver_CanDelete: false,
    Admin_Config_Global_Driver_CanView: false,

    //Config Admin EL/PL Template:
    Admin_Config_Template_CanAdd: false,
    Admin_Config_Template_CanEdit: false,
    Admin_Config_Template_CanDelete: false,
    Admin_Config_Template_CanView: false,

    Admin_Setting_CanView: false,

    //Config Admin Term and Condition:
    Admin_Config_TnC_CanAdd: false,
    Admin_Config_TnC_CanEdit: false,
    Admin_Config_TnC_CanDelete: false,
    Admin_Config_TnC_CanView: false,

    //Config Admin Setting User:
    Admin_Setting_user_CanAdd: false,
    Admin_Setting_user_CanEdit: false,
    Admin_Setting_user_CanDelete: false,
    Admin_Setting_user_CanView: false,

    //Config Admin Setting User:
    Admin_Setting_AccessKeyCanAdd: false,
    Admin_Setting_AccessKeyCanEdit: false,
    Admin_Setting_AccessKeyCanDelete: false,
    Admin_Setting_AccessKeyCanView: false,
    //Config Admin Setting User:

    Admin_Setting_Practice_Config_CanAdd: false,
    Admin_Setting_Practice_Config_CanEdit: false,
    Admin_Setting_Practice_Config_CanDelete: false,
    Admin_Setting_Practice_Config_CanView: false,

    //Config Admin Setting User:
    Admin_Activity_Log_CanAdd: false,
    Admin_Activity_Log_CanEdit: false,
    Admin_Activity_Log_CanDelete: false,
    Admin_Activity_Log_CanView: false,

    //Config Admin Setting User:
    Admin_Personalize_SettingCanAdd: false,
    Admin_Personalize_SettingCanEdit: false,
    Admin_Personalize_SettingCanDelete: false,
    Admin_Personalize_SettingCanView: false,

    //Config Admin Email Template:
    Admin_Config_Email_Template_CanAdd: false,
    Admin_Config_Email_Template_CanEdit: false,
    Admin_Config_Email_Template_CanDelete: false,
    Admin_Config_Email_Template_CanView: false,

    SuperAdmin_Setting_CanView: true,
    //Config SuperAdmin:

    SuperAdmin_Config_CanView: false,

    //Config SuperAdmin Service Cat:
    SuperAdmin_Config_ServiceCat_CanAdd: false,
    SuperAdmin_Config_ServiceCat_CanEdit: false,
    SuperAdmin_Config_ServiceCat_CanDelete: false,
    SuperAdmin_Config_ServiceCat_CanView: false,

    //Config SuperAdmin Service:
    SuperAdmin_Config_Service_CanAdd: false,
    SuperAdmin_Config_Service_CanEdit: false,
    SuperAdmin_Config_Service_CanDelete: false,
    SuperAdmin_Config_Service_CanView: false,

    //Config SuperAdmin Package:
    SuperAdmin_Config_ServicePackage_CanAdd: false,
    SuperAdmin_Config_ServicePackage_CanEdit: false,
    SuperAdmin_Config_ServicePackage_CanDelete: false,
    SuperAdmin_Config_ServicePackage_CanView: false,

    //Config SuperAdmin Global constant:
    SuperAdmin_Config_Global_Constant_CanAdd: false,
    SuperAdmin_Config_Global_Constant_CanEdit: false,
    SuperAdmin_Config_Global_Constant_CanDelete: false,
    SuperAdmin_Config_Global_Constant_CanView: false,

    //Config SuperAdmin GlobalDriver:
    SuperAdmin_Config_Global_Driver_CanAdd: false,
    SuperAdmin_Config_Global_Driver_CanEdit: false,
    SuperAdmin_Config_Global_Driver_CanDelete: false,
    SuperAdmin_Config_Global_Driver_CanView: false,

    //Config SuperAdmin Subscription0-Package:
    SuperAdmin_Config_Subscription_Package_CanAdd: false,
    SuperAdmin_Config_Subscription_Package_CanEdit: false,
    SuperAdmin_Config_Subscription_Package_CanDelete: false,
    SuperAdmin_Config_Subscription_Package_CanView: false,

    //Config SuperAdmin Subscription0-User:
    SuperAdmin_Config_Subscription_User_CanAdd: false,
    SuperAdmin_Config_Subscription_User_CanEdit: false,
    SuperAdmin_Config_Subscription_User_CanDelete: false,
    SuperAdmin_Config_Subscription_User_CanView: false,

    //Config SuperAdmin Subscription0-Invoices:
    SuperAdmin_Config_Subscription_Invoices_CanAdd: false,
    SuperAdmin_Config_Subscription_Invoices_CanEdit: false,
    SuperAdmin_Config_Subscription_Invoices_CanDelete: false,
    SuperAdmin_Config_Subscription_Invoices_CanView: false,

    //Config SuperAdmin EL/PL Template:
    SuperAdmin_Config_Template_CanAdd: false,
    SuperAdmin_Config_Template_CanEdit: false,
    SuperAdmin_Config_Template_CanDelete: false,
    SuperAdmin_Config_Template_CanView: false,

    //Config SuperAdmin Term and Condition:
    SuperAdmin_Config_TnC_CanAdd: false,
    SuperAdmin_Config_TnC_CanEdit: false,
    SuperAdmin_Config_TnC_CanDelete: false,
    SuperAdmin_Config_TnC_CanView: false,

    //Config SuperAdmin Email Template:
    SuperAdmin_Config_Email_Template_CanAdd: false,
    SuperAdmin_Config_Email_Template_CanEdit: false,
    SuperAdmin_Config_Email_Template_CanDelete: false,
    SuperAdmin_Config_Email_Template_CanView: false,

    SuperAdmin_Setting_Email_Template_CanAdd: false,
    SuperAdmin_Setting_Email_Template_CanEdit: false,
    SuperAdmin_Setting_Email_Template_CanDelete: false,
    SuperAdmin_Setting_Email_Template_CanView: false,

    SuperAdmin_Setting_User_Role_CanAdd: false,
    SuperAdmin_Setting_User_Role_CanEdit: false,
    SuperAdmin_Setting_User_Role_CanDelete: false,
    SuperAdmin_Setting_User_Role_CanView: false,

    SuperAdmin_Personalize_SettingCanAdd: false,
    SuperAdmin_Personalize_SettingCanEdit: false,
    SuperAdmin_Personalize_SettingCanDelete: false,
    SuperAdmin_Personalize_SettingCanView: false,
  });
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width <= 768) {
        setIsMobile(true);
      } else if (width > 768) {
        setIsMobile(false);
      }
      // Set isMobile based on width
      if (height <= 360) {
        setDesktopRecords(1);
        setIsMobileRecords(1);
      } else if (height >= 361 && height <= 400) {
        setDesktopRecords(2);
        setIsMobileRecords(2);
      } else if (height >= 401 && height <= 440) {
        setDesktopRecords(3);
        setIsMobileRecords(3);
      } else if (height >= 440 && height <= 520) {
        // Adjusted this condition to properly capture heights >= 841
        setDesktopRecords(4);
        setIsMobileRecords(4);
      } else if (height >= 521 && height <= 600) {
        setDesktopRecords(5);
        setIsMobileRecords(5);
      } else if (height >= 601 && height <= 660) {
        setDesktopRecords(6);
        setIsMobileRecords(6);
      } else if (height >= 661 && height <= 700) {
        setDesktopRecords(7);
        setIsMobileRecords(7);
      } else if (height >= 701 && height <= 740) {
        setDesktopRecords(8);
        setIsMobileRecords(8);
      } else if (height >= 741 && height <= 780) {
        setDesktopRecords(9);
        setIsMobileRecords(9);
      } else if (height >= 781 && height <= 820) {
        setDesktopRecords(9);
        setIsMobileRecords(9);
      } else if (height >= 801 && height <= 840) {
        setDesktopRecords(10);
        setIsMobileRecords(10);
      } else if (height >= 840) {
        setDesktopRecords(11);
        setIsMobileRecords(11);
      } else {
        setDesktopRecords(6);
        setIsMobileRecords(10);
      }
    };
    handleResize(); // Set initial viewport size
    window.addEventListener("resize", handleResize); // Listen for viewport changes
    return () => window.removeEventListener("resize", handleResize); // Clean up on unmount
  }, []);

  useEffect(() => {
    if (
      orgLoaderList &&
      DashboardActivityLogLoader &&
      DashboardCountListLoader
    ) {
      setLoader(false);
    }
  }, [orgLoaderList, DashboardActivityLogLoader, DashboardCountListLoader]);

  useEffect(() => {
    let timeoutId;
    if (logoutTimeUpModal.isPopupOpen) {
      timeoutId = setTimeout(() => {
        CheckUsersIdleStateAfterSessionTimeoutPopUpOpen();
      }, 10000);
    }
    // Cleanup the timeout if isPopupOpen becomes false or on component unmount
    if (!logoutTimeUpModal.isPopupOpen && timeoutId) {
      clearTimeout(timeoutId);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [logoutTimeUpModal]);

  useEffect(() => {
    localStorage.setItem("accessCount", accessCount);
  }, [accessCount]);

  useEffect(() => {
    SetAccessData();
  }, [activeOrganization]);

  useEffect(() => {
    if (common.token) {
      dispatch(
        updateState({
          isUpdateRole: false,
        }),
      );
    }
  }, [common.isUpdateRole, common.userKeyID]);

  useEffect(() => {
    if (common.token) {
      let userThemeSettingLocalStorage = localStorage.getItem(
        "userThemeSettingLocalStorage",
      );
      if (
        userThemeSettingLocalStorage === undefined ||
        userThemeSettingLocalStorage === null
      ) {
      } else {
        GetUserPersonalizeSettingDataFromLocalStorage();
      }
    }
  }, [common.userKeyID, common.token]);
  const toggleMenuVisibility = () => {
    setMenuVisible(!isMenuVisible);
  };

  // const updateImageUrlsInHtml = async (htmlContent) => {
  //   // Regular expression to match base64 images
  //   const base64ImageRegex =
  //     /<img[^>]+src="data:image\/(png|jpeg|jpg);base64,([^"]*)"/g;
  //   const matches = [...htmlContent.matchAll(base64ImageRegex)];
  //   setLoader(true);

  //   const urlMap = new Map();

  //   for (const [index, match] of matches.entries()) {
  //     const base64Data = match[2];
  //     const contentType = `image/${match[1]}`;
  //     const filename = `image-${index}.${match[1]}`;

  //     const userKeyID = common.userKeyID; // Ensure this is defined or passed in
  //     const ApiObject_param = { base64Data, contentType, filename, userKeyID };

  //     try {
  //       const response = await GetSaveImage(ApiObject_param);
  //       if (response.data.statusCode === 200) {
  //         const imgUrl = response.data.imageUrl;

  //         urlMap.set(base64Data, imgUrl);
  //       } else {
  //         console.error("Server response not successful:", response.data);
  //       }
  //     } catch (error) {
  //       console.error("Error saving image:", error);
  //     }
  //   }

  //   let updatedHtml = htmlContent;

  //   // Iterate over URL map and replace base64 data with URLs
  //   urlMap.forEach((newUrl, base64Data) => {
  //     try {
  //       // Use a more generic approach to split and replace
  //       updatedHtml = updatedHtml
  //         .split(`data:image/png;base64,${base64Data}`)
  //         .join(newUrl);
  //       updatedHtml = updatedHtml
  //         .split(`data:image/jpeg;base64,${base64Data}`)
  //         .join(newUrl);
  //       updatedHtml = updatedHtml
  //         .split(`data:image/jpg;base64,${base64Data}`)
  //         .join(newUrl);
  //     } catch (error) {
  //       console.error("Error replacing base64 data:", error);
  //     }
  //   });

  //   setLoader(false);
  //   return updatedHtml;
  // };

  // const updateTemplateList = async (ListArray, ModuleName) => {
  //   if (
  //     ModuleName === "Email_Template" ||
  //     ModuleName === "Super_Admin_Email_Template"
  //   ) {
  //     try {
  //       const updatedTemplate = await Promise.all(
  //         ListArray.map(async (item) => {
  //           return {
  //             ...item,
  //             htmlContent: await updateImageUrlsInHtml(item.htmlContent),
  //           };
  //         })
  //       );
  //       return updatedTemplate;
  //     } catch (error) {
  //       console.error("Error updating template list:", error);
  //     }
  //   }
  //   if (ModuleName === "CustomizeTemplate") {
  //     try {
  //       const updatedTemplate = await updateImageUrlsInHtml(ListArray);
  //       return updatedTemplate;
  //     } catch (error) {
  //       console.error("Error updating template list:", error);
  //     }
  //   }
  // };

  const updateImageUrlsInHtml = async (htmlContent) => {
    // Regular expression to match base64 images
    const base64ImageRegex =
      /<img[^>]+src="data:image\/(png|jpeg|jpg);base64,([^"]*)"/g;
    const matches = [...htmlContent.matchAll(base64ImageRegex)];
    setLoader(true);

    const urlMap = new Map();

    for (const [index, match] of matches.entries()) {
      const base64Data = match[2];
      const contentType = `image/${match[1]}`;
      const filename = `image-${index}.${match[1]}`;

      const userKeyID = common.userKeyID; // Ensure this is defined or passed in
      const ApiObject_param = { base64Data, contentType, filename, userKeyID };

      try {
        const response = await GetSaveImage(ApiObject_param);
        if (response.data.statusCode === 200) {
          const imgUrl = response.data.imageUrl;

          urlMap.set(base64Data, imgUrl);
        } else {
          console.error("Server response not successful:", response.data);
        }
      } catch (error) {
        console.error("Error saving image:", error);
      }
    }

    let updatedHtml = htmlContent;

    // Iterate over URL map and replace base64 data with URLs
    urlMap.forEach((newUrl, base64Data) => {
      try {
        // Use a more generic approach to split and replace
        updatedHtml = updatedHtml
          .split(`data:image/png;base64,${base64Data}`)
          .join(newUrl);
        updatedHtml = updatedHtml
          .split(`data:image/jpeg;base64,${base64Data}`)
          .join(newUrl);
        updatedHtml = updatedHtml
          .split(`data:image/jpg;base64,${base64Data}`)
          .join(newUrl);
      } catch (error) {
        console.error("Error replacing base64 data:", error);
      }
    });

    setLoader(false);
    return updatedHtml;
  };

  const updateTemplateList = async (ListArray, ModuleName) => {
    if (
      ModuleName === "Email_Template" ||
      ModuleName === "Super_Admin_Email_Template"
    ) {
      try {
        const updatedTemplate = await Promise.all(
          ListArray.map(async (item) => {
            return {
              ...item,
              htmlContent: await updateImageUrlsInHtml(item.htmlContent),
            };
          }),
        );
        return updatedTemplate;
      } catch (error) {
        console.error("Error updating template list:", error);
      }
    }
    if (ModuleName === "CustomizeTemplate") {
      try {
        const updatedTemplate = await updateImageUrlsInHtml(ListArray);
        return updatedTemplate;
      } catch (error) {
        console.error("Error updating template list:", error);
      }
    }
  };

  const CheckUsersIdleStateAfterSessionTimeoutPopUpOpen = () => {
    if (logoutTimeUpModal.isPopupOpen) {
      Logout();
    }
  };

  const Logout = () => {
    localStorage.clear();
    dispatch(resetState());
    handleReloadClick();
    window.location.reload(true);
    // navigate("/login");
  };
  const handleReloadClick = () => {
    const broadcastChannel = new BroadcastChannel("reloadChannel");
    broadcastChannel.postMessage("reload");
  };

  const scrollUptoCurrentPosition = (e, scrollbarContainerDivRef) => {
    const activeElement = document.activeElement;
    const isReactSelectInput =
      activeElement &&
      activeElement.id.startsWith("react-select-") &&
      activeElement.tagName === "INPUT";

    if (isReactSelectInput && scrollbarContainerDivRef.current) {
      const containerRect =
        scrollbarContainerDivRef.current.getBoundingClientRect();
      const clickedPosition = e.clientY - containerRect.top;
      const containerHeight = containerRect.height;

      // Calculate the target scroll position
      let targetScroll =
        scrollbarContainerDivRef.current.scrollTop +
        clickedPosition -
        containerHeight / 2;

      // Ensure we don't scroll past the bottom
      const maxScroll =
        scrollbarContainerDivRef.current.scrollHeight - containerHeight;
      targetScroll = Math.min(targetScroll, maxScroll);

      // Ensure we don't scroll above the top
      targetScroll = Math.max(targetScroll, 0);

      const smoothScroll = (start, end, duration) => {
        const startTime = performance.now();

        const animateScroll = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          scrollbarContainerDivRef.current.scrollTop =
            start + (end - start) * progress;

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };

        requestAnimationFrame(animateScroll);
      };

      const startScroll = scrollbarContainerDivRef.current.scrollTop;
      const duration = 500; // Duration in milliseconds
      smoothScroll(startScroll, targetScroll, duration);
    }
  };
  // Example usage: add an event listener to call the function on a specific event
  // Assume `scrollbarContainerDivRef` is a React ref attached to the container div
  document.addEventListener("click", (e) => {
    const scrollbarContainerDivRef = {
      current: document.getElementById("scrollbarContainer"),
    };
    scrollUptoCurrentPosition(e, scrollbarContainerDivRef);
  });

  const handleErrorMessage = (errorMessage) => {
    const modifiedErrorMessage = errorMessage?.toLowerCase();

    if (modifiedErrorMessage?.includes("please inactive this record first")) {
      return "Please change the status to InActive first.";
    }

    // If the error message does not match the condition, return the original error message
    return errorMessage;
  };

  const scrollUpDownByElementID = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const GetUserPersonalizeSettingDataFromLocalStorage = () => {
    // Get the JSON-formatted string from localStorage
    let userThemeSettingLocalStorage = localStorage.getItem(
      "userThemeSettingLocalStorage",
    );

    if (userThemeSettingLocalStorage) {
      // Parse the JSON string to a JavaScript object
      let userThemeSettings = JSON.parse(userThemeSettingLocalStorage);

      // Check if userThemeSettings is not null or undefined
      if (userThemeSettings) {
        // Now, userThemeSettings is a JavaScript object containing the parsed JSON data
        //alert(JSON.stringify(userThemeSettings));

        engagementSetting = userThemeSettings.find(
          (item) => item.settingName === "VariableEngagementName",
        );
        proposalSetting = userThemeSettings.find(
          (item) => item.settingName === "VariableProposalName",
        );
        prospectSetting = userThemeSettings.find(
          (item) => item.settingName === "VariableProspectName",
        );
      }
    }
  };

  // Global Date Filter
  const GetCustomDate = (dateFormat, dateType) => {
    const today = moment(); // Current date
    let _fromDate = null;
    let _toDate = null;

    if (dateType === CalenderFilterEnum.All) {
      _fromDate = null;
      _toDate = null;
    } else if (dateType === CalenderFilterEnum.This_Week) {
      _fromDate = today.clone().startOf("week");
      _toDate = today.clone().endOf("week");
    } else if (dateType === CalenderFilterEnum.Last_Week) {
      _fromDate = today.clone().subtract(1, "week").startOf("week");
      _toDate = today.clone().subtract(1, "week").endOf("week");
    } else if (dateType === CalenderFilterEnum.This_Month) {
      _fromDate = today.clone().startOf("month");
      _toDate = today.clone().endOf("month");
    } else if (dateType === CalenderFilterEnum.Last_Month) {
      _fromDate = today.clone().subtract(1, "month").startOf("month");
      _toDate = today.clone().subtract(1, "month").endOf("month");
    } else if (dateType === CalenderFilterEnum.This_Quarter) {
      _fromDate = today.clone().startOf("quarter");
      _toDate = today.clone().endOf("quarter");
    } else if (dateType === CalenderFilterEnum.Last_Quarter) {
      _fromDate = today.clone().subtract(1, "quarter").startOf("quarter");
      _toDate = today.clone().subtract(1, "quarter").endOf("quarter");
    } else if (dateType === CalenderFilterEnum.This_6_Months) {
      _fromDate = today.clone().subtract(6, "months").startOf("month");
      _toDate = today.clone().endOf("month");
    } else if (dateType === CalenderFilterEnum.Last_6_Months) {
      _fromDate = today.clone().subtract(12, "months").startOf("month");
      _toDate = today.clone().subtract(6, "months").endOf("month");
    } else if (dateType === CalenderFilterEnum.This_Year) {
      _fromDate = today.clone().startOf("year");
      _toDate = today.clone().endOf("year");
    } else if (dateType === CalenderFilterEnum.Last_Year) {
      _fromDate = today.clone().subtract(1, "year").startOf("year");
      _toDate = today.clone().subtract(1, "year").endOf("year");
    }
    return { fromDate: _fromDate, toDate: _toDate };
  };
  const GetActiveDateRange = (dateFormat, dateType) => {
    const today = moment(); // Current date
    let _fromDate = null;

    if (dateType === ActiveDateFilterEnum.Active_In_Last_1_Day) {
      _fromDate = today.clone().subtract(1, "day");
    } else if (dateType === ActiveDateFilterEnum.Active_In_Last_7_Days) {
      _fromDate = today.clone().subtract(7, "days");
    } else if (dateType === ActiveDateFilterEnum.Active_In_Last_30_Days) {
      _fromDate = today.clone().subtract(30, "days");
    } else if (dateType === ActiveDateFilterEnum.Active_In_Last_60_Days) {
      _fromDate = today.clone().subtract(60, "days");
    } else if (dateType === ActiveDateFilterEnum.Active_In_Last_90_Days) {
      _fromDate = today.clone().subtract(90, "days");
    } else if (dateType === ActiveDateFilterEnum.Active_In_Last_6_Months) {
      _fromDate = today.clone().subtract(6, "months");
    } else if (dateType === ActiveDateFilterEnum.Active_In_Last_1_Year) {
      _fromDate = today.clone().subtract(1, "year");
    }
    return { fromDate: _fromDate, toDate: today };
  };

  const GetOnlyDate = (value) => {
    if (!value) return "";

    // Case 1: Format like "May 28 2025  6:03PM" or "May  9 2025  5:55PM"
    if (/[A-Za-z]{3}\s+\d{1,2}\s+\d{4}/.test(value)) {
      const [monthStr, day, year] = value.trim().split(/\s+/);
      const monthMap = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };
      const month = monthMap[monthStr];
      const formattedDay = day.padStart(2, "0");
      return `${formattedDay}/${month}/${year}`;
    }

    // Case 2: Format like "6/11/2025 10:21:35 AM"
    const [datePart] = value.split(" ");
    const [month, day, year] = datePart.split("/"); // US format mm/dd/yyyy
    const formattedDay = day.padStart(2, "0");
    const formattedMonth = month.padStart(2, "0");
    return `${formattedDay}/${formattedMonth}/${year}`;
  };

  const hasActionAccess = (moduleId, mActionId) => {
    let userAccess = localStorage.getItem("userAccess");
    userAccess = JSON.parse(userAccess);
    if (userAccess == undefined || userAccess.length === 0) {
      return;
    }
    const trueCount = userAccess.reduce((count, item) => {
      return count + (item.setDefaultAction === true ? 1 : 0);
    }, 0);

    // Set the access count based on the total count of true values
    let newAccessCount = trueCount > 0 ? trueCount : 0;

    SetAccessCount(newAccessCount);

    // Store accessCount in local storage
    localStorage.setItem("accessCount", newAccessCount);

    const action = userAccess?.find(
      (act) => act.mActionId === mActionId && act.moduleID === moduleId,
    );

    if (action && action.setDefaultAction === true) {
      return true;
    }
    return false;
  };

  // Set Access with key mActionIds
  const SetAccessData = () => {
    // setLoader(true)
    setUserAccessData({
      ...userAccessData,
      Dashboard_CanView: true,

      //ADMIN :
      // Prospect:
      Admin_Prospect_CanAdd: hasActionAccess(1, 1),
      Admin_Prospect_CanEdit: hasActionAccess(1, 2),
      Admin_Prospect_CanDelete: hasActionAccess(1, 3),
      Admin_Prospect_CanView: hasActionAccess(1, 4),

      //Proposal :
      Admin_Proposal_CanAdd: hasActionAccess(2, 5),
      Admin_Proposal_CanEdit: hasActionAccess(2, 6),
      Admin_Proposal_CanDelete: hasActionAccess(2, 7),
      Admin_Proposal_CanView: hasActionAccess(2, 8),

      //Engagement Latter :
      Admin_Engagement_Latter_CanAdd: hasActionAccess(3, 9),
      Admin_Engagement_Latter_CanEdit: hasActionAccess(3, 10),
      Admin_Engagement_Latter_CanDelete: hasActionAccess(3, 11),
      Admin_Engagement_Latter_CanView: hasActionAccess(3, 12),

      //Config Admin:
      Admin_Config_CanView: hasActionAccess(7, 28),

      //Config Admin Service Cat:
      Admin_Config_ServiceCat_CanAdd: hasActionAccess(19, 73),
      Admin_Config_ServiceCat_CanEdit: hasActionAccess(19, 74),
      Admin_Config_ServiceCat_CanDelete: hasActionAccess(19, 75),
      Admin_Config_ServiceCat_CanView: hasActionAccess(19, 76),

      //Config Admin Service:
      Admin_Config_Service_CanAdd: hasActionAccess(19, 73),
      Admin_Config_Service_CanEdit: hasActionAccess(19, 74),
      Admin_Config_Service_CanDelete: hasActionAccess(19, 75),
      Admin_Config_Service_CanView: hasActionAccess(19, 76),

      //Config Admin Package:
      Admin_Config_ServicePackage_CanAdd: hasActionAccess(19, 73),
      Admin_Config_ServicePackage_CanEdit: hasActionAccess(19, 74),
      Admin_Config_ServicePackage_CanDelete: hasActionAccess(19, 75),
      Admin_Config_ServicePackage_CanView: hasActionAccess(19, 76),

      //Config Admin Global constant:
      Admin_Config_Global_Constant_CanAdd: hasActionAccess(20, 77),
      Admin_Config_Global_Constant_CanEdit: hasActionAccess(20, 78),
      Admin_Config_Global_Constant_CanDelete: hasActionAccess(20, 79),
      Admin_Config_Global_Constant_CanView: hasActionAccess(20, 80),

      //Config Admin GlobalDriver:
      Admin_Config_Global_Driver_CanAdd: hasActionAccess(20, 77),
      Admin_Config_Global_Driver_CanEdit: hasActionAccess(20, 78),
      Admin_Config_Global_Driver_CanDelete: hasActionAccess(20, 79),
      Admin_Config_Global_Driver_CanView: hasActionAccess(20, 80),

      //Config Admin EL/PL Template:
      Admin_Config_Template_CanAdd: hasActionAccess(21, 81),
      Admin_Config_Template_CanEdit: hasActionAccess(21, 82),
      Admin_Config_Template_CanDelete: hasActionAccess(21, 83),
      Admin_Config_Template_CanView: hasActionAccess(21, 84),

      //Config Admin Term and Condition:
      Admin_Config_TnC_CanAdd: hasActionAccess(21, 81),
      Admin_Config_TnC_CanEdit: hasActionAccess(21, 82),
      Admin_Config_TnC_CanDelete: hasActionAccess(21, 83),
      Admin_Config_TnC_CanView: hasActionAccess(21, 84),

      //Config Admin Email Template:
      Admin_Config_Email_Template_CanAdd: hasActionAccess(21, 81),
      Admin_Config_Email_Template_CanEdit: hasActionAccess(21, 82),
      Admin_Config_Email_Template_CanDelete: hasActionAccess(21, 83),
      Admin_Config_Email_Template_CanView: hasActionAccess(21, 84),

      //Setting Admin
      Admin_Setting_CanView: hasActionAccess(9, 36),

      //Config Admin Setting User:
      Admin_Setting_user_CanAdd: hasActionAccess(22, 85),
      Admin_Setting_user_CanEdit: hasActionAccess(22, 86),
      Admin_Setting_user_CanDelete: hasActionAccess(22, 87),
      Admin_Setting_user_CanView: hasActionAccess(22, 88),

      //Config Admin Setting User:
      Admin_Setting_AccessKeyCanAdd: hasActionAccess(23, 89),
      Admin_Setting_AccessKeyCanEdit: hasActionAccess(23, 90),
      Admin_Setting_AccessKeyCanDelete: hasActionAccess(23, 91),
      Admin_Setting_AccessKeyCanView: hasActionAccess(23, 92),
      //Config Admin Setting User:

      Admin_Setting_Practice_Config_CanAdd: hasActionAccess(24, 93),
      Admin_Setting_Practice_Config_CanEdit: hasActionAccess(24, 94),
      Admin_Setting_Practice_Config_CanDelete: hasActionAccess(24, 95),
      Admin_Setting_Practice_Config_CanView: hasActionAccess(24, 96),

      //Config Admin Setting User:
      Admin_Activity_Log_CanAdd: hasActionAccess(25, 97),
      Admin_Activity_Log_CanEdit: hasActionAccess(25, 98),
      Admin_Activity_Log_CanDelete: hasActionAccess(25, 99),
      Admin_Activity_Log_CanView: hasActionAccess(25, 100),

      //Config Admin Setting User:
      Admin_Personalize_SettingCanEdit: hasActionAccess(26, 102),
      Admin_Personalize_SettingCanView: hasActionAccess(26, 104),

      //SUPER ADMIN
      //Organisation:
      Organisation_CanAdd: hasActionAccess(4, 13),
      Organisation_CanEdit: hasActionAccess(4, 14),
      Organisation_CanDelete: hasActionAccess(4, 15),
      Organisation_CanView: hasActionAccess(4, 16),

      //User:
      User_CanAdd: hasActionAccess(5, 17),
      User_CanEdit: hasActionAccess(5, 18),
      User_CanDelete: hasActionAccess(5, 19),
      User_CanView: hasActionAccess(5, 20),

      //Subscription:
      // Subscription_CanAdd: true,//hasActionAccess(6, 21),
      // Subscription_CanEdit: hasActionAccess(6, 22),
      // Subscription_CanDelete: hasActionAccess(6, 23),
      Subscription_CanView: hasActionAccess(6, 24),

      //Config SuperAdmin Subscription0-Package:
      SuperAdmin_Config_Subscription_Package_CanAdd: hasActionAccess(11, 41),
      SuperAdmin_Config_Subscription_Package_CanEdit: hasActionAccess(11, 42),
      SuperAdmin_Config_Subscription_Package_CanDelete: hasActionAccess(11, 43),
      SuperAdmin_Config_Subscription_Package_CanView: hasActionAccess(11, 44),

      //Config SuperAdmin Subscription-User:
      SuperAdmin_Config_Subscription_User_CanAdd: hasActionAccess(12, 45),
      SuperAdmin_Config_Subscription_User_CanEdit: hasActionAccess(12, 46),
      SuperAdmin_Config_Subscription_User_CanDelete: hasActionAccess(12, 47),
      SuperAdmin_Config_Subscription_User_CanView: hasActionAccess(12, 48),

      //Config SuperAdmin Subscription0-Invoices:
      SuperAdmin_Config_Subscription_Invoices_CanAdd: hasActionAccess(13, 49),
      SuperAdmin_Config_Subscription_Invoices_CanEdit: hasActionAccess(13, 50),
      SuperAdmin_Config_Subscription_Invoices_CanDelete: hasActionAccess(
        13,
        51,
      ),
      SuperAdmin_Config_Subscription_Invoices_CanView: hasActionAccess(13, 52),

      //Super Admin Config
      SuperAdmin_Config_CanView: hasActionAccess(8, 32),

      //Config SuperAdmin Service Cat:
      SuperAdmin_Config_ServiceCat_CanAdd: hasActionAccess(14, 53),
      SuperAdmin_Config_ServiceCat_CanEdit: hasActionAccess(14, 54),
      SuperAdmin_Config_ServiceCat_CanDelete: hasActionAccess(14, 55),
      SuperAdmin_Config_ServiceCat_CanView: hasActionAccess(14, 56),

      //Config SuperAdmin Service:
      SuperAdmin_Config_Service_CanAdd: hasActionAccess(14, 53),
      SuperAdmin_Config_Service_CanEdit: hasActionAccess(14, 54),
      SuperAdmin_Config_Service_CanDelete: hasActionAccess(14, 55),
      SuperAdmin_Config_Service_CanView: hasActionAccess(14, 56),

      //Config SuperAdmin Package:
      SuperAdmin_Config_ServicePackage_CanAdd: hasActionAccess(14, 53),
      SuperAdmin_Config_ServicePackage_CanEdit: hasActionAccess(14, 54),
      SuperAdmin_Config_ServicePackage_CanDelete: hasActionAccess(14, 55),
      SuperAdmin_Config_ServicePackage_CanView: hasActionAccess(14, 56),

      //Config SuperAdmin Global constant:
      SuperAdmin_Config_Global_Constant_CanAdd: hasActionAccess(15, 57),
      SuperAdmin_Config_Global_Constant_CanEdit: hasActionAccess(15, 58),
      SuperAdmin_Config_Global_Constant_CanDelete: hasActionAccess(15, 59),
      SuperAdmin_Config_Global_Constant_CanView: hasActionAccess(15, 60),

      //Config SuperAdmin GlobalDriver:
      SuperAdmin_Config_Global_Driver_CanAdd: hasActionAccess(15, 57),
      SuperAdmin_Config_Global_Driver_CanEdit: hasActionAccess(15, 58),
      SuperAdmin_Config_Global_Driver_CanDelete: hasActionAccess(15, 59),
      SuperAdmin_Config_Global_Driver_CanView: hasActionAccess(15, 60),

      //Config SuperAdmin EL/PL Template:
      SuperAdmin_Config_Template_CanAdd: hasActionAccess(16, 61),
      SuperAdmin_Config_Template_CanEdit: hasActionAccess(16, 62),
      SuperAdmin_Config_Template_CanDelete: hasActionAccess(16, 63),
      SuperAdmin_Config_Template_CanView: hasActionAccess(16, 64),

      //Config SuperAdmin Term and Condition:
      SuperAdmin_Config_TnC_CanAdd: hasActionAccess(16, 61),
      SuperAdmin_Config_TnC_CanEdit: hasActionAccess(16, 62),
      SuperAdmin_Config_TnC_CanDelete: hasActionAccess(16, 63),
      SuperAdmin_Config_TnC_CanView: hasActionAccess(16, 64),

      //Config SuperAdmin Email Template:
      SuperAdmin_Config_Email_Template_CanAdd: hasActionAccess(16, 61),
      SuperAdmin_Config_Email_Template_CanEdit: hasActionAccess(16, 62),
      SuperAdmin_Config_Email_Template_CanDelete: hasActionAccess(16, 63),
      SuperAdmin_Config_Email_Template_CanView: hasActionAccess(16, 64),

      SuperAdmin_Setting_CanView: true, //hasActionAccess(10, 40),

      // SuperAdmin_Setting_User_Role_CanAdd: true,//hasActionAccess(17, 65),
      // SuperAdmin_Setting_User_Role_CanEdit: true,//hasActionAccess(17, 66),
      // SuperAdmin_Setting_User_Role_CanDelete: true,// hasActionAccess(17, 67),
      // SuperAdmin_Setting_User_Role_CanView: true,// hasActionAccess(17, 68),

      // SuperAdmin_Personalize_SettingCanAdd: hasActionAccess(27, 105),
      SuperAdmin_Personalize_SettingCanEdit: hasActionAccess(27, 106),
      // SuperAdmin_Personalize_SettingCanDelete: hasActionAccess(27, 107),
      SuperAdmin_Personalize_SettingCanView: hasActionAccess(27, 108),
      //Config SuperAdmin Email Template:
      SuperAdmin_Setting_Email_Template_CanAdd: hasActionAccess(18, 69),
      SuperAdmin_Setting_Email_Template_CanEdit: hasActionAccess(18, 70),
      SuperAdmin_Setting_Email_Template_CanDelete: hasActionAccess(18, 71),
      SuperAdmin_Setting_Email_Template_CanView: hasActionAccess(18, 72),

      SuperAdmin_Setting_User_Role_CanAdd: hasActionAccess(17, 65),
      SuperAdmin_Setting_User_Role_CanEdit: hasActionAccess(17, 66),
      SuperAdmin_Setting_User_Role_CanDelete: hasActionAccess(17, 67),
      SuperAdmin_Setting_User_Role_CanView: true, // hasActionAccess(17, 68),
    });
  };

  // Used in Html Editor , validation
  const HtmlToPlainText = (newText, ModuleName) => {
    const cleanText = newText
      .replace(/<p>[\s\n\r]*<br\s*\/?>[\s\n\r]*<\/p>/gi, "")
      .replace(/ style="[^"]*"/g, "")
      .replace(/<(?!img)[^>]*>/g, "") // Remove HTML tags except <img>
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/\s+/g, " ") // Replace multiple whitespaces with a single space
      // Remove empty paragraphs with just <br> tags
      .replace(/<br\s*\/?>/gi, "") // Remove <br> tags
      .trim(); // Trim leading and trailing spaces

    return cleanText;
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    const inputValue = e.target.value;

    if (
      inputValue.length === 0 ||
      (inputValue.length === 1 && inputValue[0] === " ")
    ) {
      setUpdatedProspectName("");
    } else {
      const formattedValue =
        inputValue.trim().charAt(0).toUpperCase() + inputValue.slice(1);
      setUpdatedProspectName(formattedValue);
    }
  };

  const handleNameChange = () => {
    if (updatedProspectName.trim() !== "") {
      setProspectName(updatedProspectName);
    }
    setUpdatedProspectName("");
  };

  const handleInputChangeProposal = (e) => {
    e.preventDefault();
    const inputValue = e.target.value;
    if (
      inputValue.length === 0 ||
      (inputValue.length === 1 && inputValue[0] === " ")
    ) {
      setUpdatedProposalName("");
    } else {
      const formattedValue =
        inputValue.trim().charAt(0).toUpperCase() + inputValue.slice(1);
      setUpdatedProposalName(formattedValue);
      setDefaultVariables(false);
    }
  };

  const handleNameChangeProposal = () => {
    if (updatedProposalName.trim() !== "") {
      setProposalName(updatedProposalName);
    }
    setUpdatedProposalName("");
  };

  const handleInputChangeEngagement = (e) => {
    e.preventDefault();
    const inputValue = e.target.value;

    if (
      inputValue.length === 0 ||
      (inputValue.length === 1 && inputValue[0] === " ")
    ) {
      setUpdatedEngagementName("");
    } else {
      const formattedValue =
        inputValue.trim().charAt(0).toUpperCase() + inputValue.slice(1);

      // Update the state with the formatted value
      setUpdatedEngagementName(formattedValue);
      setDefaultVariables(false);
    }
  };

  const handleNameChangeEngagement = () => {
    if (updatedEngagementName.trim() !== "") {
      setEngagementName(updatedEngagementName);
    }
    setUpdatedEngagementName("");
  };

  const handleSetDefaultVariables = () => {
    setDefaultVariables(!DefaultVariables);

    if (!DefaultVariables) {
      // Set default values
      setUpdatedEngagementName("Engagement Letter");
      setUpdatedProposalName("Proposal");
      setUpdatedProspectName("Prospect");
    } else {
      // Set values from settings
      setUpdatedEngagementName("");
      setUpdatedProposalName("");
      setUpdatedProspectName("");
    }
  };
  const setInitializeValidationError = () => {
    setRequireErrorMessage("");
  };

  const getCrudButtonTextName = (actionName, moduleName) => {
    let crudButtonTextName = "";
    if (actionName === "Cancel") {
      crudButtonTextName = actionName;
    } else {
      crudButtonTextName = actionName + " " + moduleName;
    }
    return crudButtonTextName;
  };

  const getCrudPopUpTitleName = (actionName, moduleName) => {
    let crudPopUpTitleName = actionName + " " + moduleName;
    return crudPopUpTitleName;
  };

  const getCrudButtonToolTipName = (actionName, moduleName) => {
    let crudButtonToolTipName = "";
    if (moduleName === undefined) {
      crudButtonToolTipName = actionName;
    } else {
      crudButtonToolTipName = actionName + " " + moduleName;
    }
    return crudButtonToolTipName;
  };

  const getPlaceholderTextName = (actionName, moduleName) => {
    let placeholderText = actionName + " " + moduleName;
    return placeholderText;
  };

  const isValidEmail = (email) => {
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?!\.{2})\.[A-Za-z]{2,}$/;

    return emailRegex.test(email);
  };

  const formatName = (value = "") => {
    if (!value) return "";
    const cleaned = value.replace(/[.\s]/g, "");
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  function formatValue(value, id) {
    // Ensure value is not null
    value = value == null ? 0 : value;

    // Split the value into integer and decimal parts
    let valueArray = value.toString().split(".");
    let valueLength = "";

    // Ensure valueArray[1] is defined and is a string
    if (
      valueArray &&
      valueArray.length > 1 &&
      typeof valueArray[1] === "string"
    ) {
      valueLength = valueArray[1];
    }

    let valueWithExactTwoPrecision = value.toString();

    // Check if valueLength is defined and has a length of at least 2
    if (valueLength && valueLength.length > 2) {
      valueWithExactTwoPrecision = (Math.floor(value * 100) / 100).toFixed(2);
    }

    // Determine the currency symbol based on the id
    let currencySymbol = "";
    switch (id) {
      case 1:
        currencySymbol = "£"; // Pound
        break;
      case 2:
        currencySymbol = "€";
        break;
      case 3:
        currencySymbol = "$"; // Dollar
        break;
      case 4:
        currencySymbol = "₹"; // Euro
        break;
      // Add more cases for different currency symbols as needed
      default:
        currencySymbol = ""; // Default: No currency symbol
    }

    // Format the value with comma separators
    const formattedValue = `${currencySymbol}${Number(
      valueWithExactTwoPrecision,
    )
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    return `${formattedValue}`;
  }

  function getTaxName(id) {
    if (!id) return "";
    switch (id) {
      case 1:
        return "VAT";
      case 2:
        return "EU VAT";
      case 3:
        return "Salex Tax";
      case 4:
        return "GST";
      default:
        return "";
    }
  }

  function getCurrencySymbol(id) {
    if (!id) return "";
    switch (id) {
      case 1:
        return "£";
      case 2:
        return "€";
      case 3:
        return "$";
      case 4:
        return "₹";
      default:
        return "£";
    }
  }

  function formatValueWithoutCurrencySymbol(value, id) {
    // Ensure value is not null
    value = value == null ? 0 : value;

    // Split the value into integer and decimal parts
    let valueArray = value.toString().split(".");
    let valueLength = "";

    // Ensure valueArray[1] is defined and is a string
    if (
      valueArray &&
      valueArray.length > 1 &&
      typeof valueArray[1] === "string"
    ) {
      valueLength = valueArray[1];
    }

    let valueWithExactTwoPrecision = value.toString();

    // Check if valueLength is defined and has a length of at least 2
    if (valueLength && valueLength.length > 2) {
      valueWithExactTwoPrecision = (Math.floor(value * 100) / 100).toFixed(2);
    }

    // Format the value with comma separators
    const formattedValue = `${Number(valueWithExactTwoPrecision)
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    return `${formattedValue}`;
  }

  function formatValueWithoutCurrencySymbol_v1(value, decimalPlace) {
    // Ensure value is not null
    value = value == null ? 0 : value;

    // Split the value into integer and decimal parts
    let valueArray = value.toString().split(".");
    let valueLength = "";

    // Ensure valueArray[1] is defined and is a string
    if (
      valueArray &&
      valueArray.length > 1 &&
      typeof valueArray[1] === "string"
    ) {
      valueLength = valueArray[1];
    }

    let valueWithExactPrecision = value.toString();

    // Check if valueLength is defined and has a length of at least 2
    if (valueLength && valueLength.length > decimalPlace) {
      valueWithExactPrecision = (Math.floor(value * 100) / 100).toFixed(
        decimalPlace,
      );
    }

    // Format the value with comma separators
    const formattedValue = `${Number(valueWithExactPrecision)
      .toFixed(decimalPlace)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    return `${formattedValue}`;
  }

  const convertAndParseDate = (dateStr, sourceFormat, targetFormat) => {
    if (!dateStr || !sourceFormat) return null;

    try {
      // Parse using the source format
      const parsedDate = parse(dateStr, sourceFormat, new Date());

      // Return the Date object (no need to convert to string for DatePicker)
      return isValid(parsedDate) ? parsedDate : null;
    } catch (err) {
      console.error("Date conversion error:", err);
      return null;
    }
  };
  const GetTwoDecimalValueWithoutRoundOff = (value) => {
    value = value == null ? 0 : value;
    let valueArray = value.toString().split(".");
    let valueLength = "";

    // Ensure valueArray[1] is defined and is a string
    if (
      valueArray &&
      valueArray.length > 1 &&
      typeof valueArray[1] === "string"
    ) {
      valueLength = valueArray[1];
    }

    let valueWithExactTwoPrecision = value.toString();

    // Check if valueLength is defined and has a length of at least 2
    if (valueLength && valueLength.length > 2) {
      valueWithExactTwoPrecision = Number(
        Math.floor(value * 100) / 100,
      ).toFixed(2);
    }
    return Number(valueWithExactTwoPrecision);
  };
  function hasHyphenAfterNumber(text) {
    const pattern = /(\d)-/g;
    let sanitizedText = text.replace(pattern, "$1"); // Remove hyphen if it follows a digit
    sanitizedText = sanitizedText.replace(/-/g, (match, index) =>
      index === 0 ? match : "",
    ); // Keep hyphen only at the start
    return sanitizedText;
  }

  const getValidationMessage = (
    requireMessage,
    maxDiscountForQC,
    defaultDiscount,
  ) => {
    if (!requireMessage) return "";

    const parsedDefaultDiscount = Number(defaultDiscount);

    if (isNaN(parsedDefaultDiscount)) {
      return <span className="validation">Invalid discount</span>;
    }

    const minDiscount = -999.0;
    const maxDiscount = maxDiscountForQC || 100;

    if (
      defaultDiscount !== "" &&
      defaultDiscount !== null &&
      defaultDiscount !== undefined &&
      (parsedDefaultDiscount < minDiscount ||
        parsedDefaultDiscount > maxDiscount)
    ) {
      return (
        <>
          <span className="validation">
            The discount (%) should be between {minDiscount}% and {maxDiscount}
            %.
          </span>
          <button
            style={{
              fontSize: "12px",
              border: "none",
              background: "transparent",
              color: "#626ED4",
            }}
            className="float-sm-end"
            data-bs-toggle="modal"
            data-bs-target="#pricingModel"
          >
            + Pricing Setting
          </button>
        </>
      );
    }

    return null;
  };

  function getFontStylesFromHtml(htmlContent) {
    // Create a temporary DOM element to parse the HTML content
    const tempElement = document.createElement("div");
    tempElement.innerHTML = htmlContent;

    // Use querySelectorAll to find all elements with the 'style' attribute containing 'font-family' or 'font-size'
    const elementsWithFontStyles = tempElement.querySelectorAll(
      '[style*="font-family"], [style*="font-size"]',
    );

    // Extract the font-family and font-size values
    const fontStyles = Array.from(elementsWithFontStyles).map((element) => {
      const fontFamily = element.style.fontFamily || null;
      const fontSize = element.style.fontSize || null;

      // Convert fontSize to a numeric value for comparison
      let numericFontSize = fontSize ? parseFloat(fontSize) : null;
      if (fontSize && fontSize.includes("em")) {
        // Convert 'em' values to pixels assuming 1em = 16px as a general rule
        numericFontSize *= 16;
      }

      let fontSizeCategory = null;
      if (numericFontSize) {
        fontSizeCategory = numericFontSize > 16 ? "large" : "small";
      }

      return { fontFamily, fontSize, fontSizeCategory };
    });

    // Convert to a comma-separated string of unique font-family values, removing both single and double quotes
    const uniqueFontFamilies = [
      ...new Set(fontStyles.map((style) => style.fontFamily).filter(Boolean)),
    ]
      .join(", ")
      .replace(/['"]/g, ""); // Remove both single and double quotes

    // Categorize and collect font sizes based on 'large' or 'small' classification
    const largeFontSizes = fontStyles
      .filter((style) => style.fontSizeCategory === "large")
      .map((style) => style.fontSize);
    const smallFontSizes = fontStyles
      .filter((style) => style.fontSizeCategory === "small")
      .map((style) => style.fontSize);

    return {
      uniqueFontFamilies,
      largeFontSizes: largeFontSizes.join(", "),
      smallFontSizes: smallFontSizes.join(", "),
    };
  }

  function isValidNumber(value) {
    // Convert the value to a number
    const number = Number(value);
    if (isNaN(number)) {
      return false; // Not a valid number
    }
    // Convert to a string without scientific notation
    let numberString = number?.toLocaleString("fullwide", {
      useGrouping: false,
    });

    // Split the string to separate the part before and after the decimal point
    const [integerPart] = numberString?.split(".");

    // Regular expression to validate up to 16 digits before the decimal
    let validRange = true;
    if (integerPart?.length > 16) {
      validRange = false;
    }
    // Test only the integer part against the regex
    return validRange;
  }

  //Variable Replace Functions
  const SingleServiceWithCombinedTableView = (
    Type,
    RecurringValue,
    OneOffValue,
  ) => {
    return `
      <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
        Recurring Service
      </p>
      <table style="border-collapse: collapse; width: 100%; page-break-inside: avoid; break-inside: avoid;">
        <tr>
          <td style="border: 1px solid black; padding: 8px; width: 50%;">${Type}</td>
          <td style="border: 1px solid black; padding: 8px; width: 50%;text-align: right;">${
            RecurringValue === null
              ? formatValue(0)
              : formatValue(RecurringValue)
          }</td>
        </tr>
      </table>
      <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
        One-Off Service
      </p>
      <table style="border-collapse: collapse; width: 100%; page-break-inside: avoid; break-inside: avoid;">
        <tr>
          <td style="border: 1px solid black; padding: 8px; width: 50%;">${Type}</td>
          <td style="border: 1px solid black; padding: 8px; width: 50%;text-align: right;">${
            OneOffValue === null ? formatValue(0) : formatValue(OneOffValue)
          }</td>
        </tr>
      </table>
    `;
  };

  const GetReplacePackageTableView = (
    RecurringPricingInfo,
    Type,
    servicePackageList,
  ) => {
    let PackageOneValue = null;
    let PackageTwoValue = null;
    let PackageThreeValue = null;

    if (Type === "Net Total") {
      PackageOneValue = Number(
        RecurringPricingInfo.packageOneNetTotal >
          Number(RecurringPricingInfo.packageOneDisCountedTotal),
      )
        ? RecurringPricingInfo.packageOneNetTotal
        : RecurringPricingInfo.packageOneDisCountedTotal;
      PackageTwoValue = Number(
        RecurringPricingInfo.packageTwoNetTotal >
          Number(RecurringPricingInfo.packageTwoDisCountedTotal),
      )
        ? RecurringPricingInfo.packageTwoNetTotal
        : RecurringPricingInfo.packageTwoDisCountedTotal;
      PackageThreeValue = Number(
        RecurringPricingInfo.packageThreeNetTotal >
          Number(RecurringPricingInfo.packageThreeDisCountedTotal),
      )
        ? RecurringPricingInfo.packageThreeNetTotal
        : RecurringPricingInfo.packageThreeDisCountedTotal;
    } else if (Type === "Discount") {
      PackageOneValue = RecurringPricingInfo.packageOneDisCount;
      PackageTwoValue = RecurringPricingInfo.packageTwoDisCount;
      PackageThreeValue = RecurringPricingInfo.packageThreeDisCount;
    } else if (Type === "Discounted Total") {
      PackageOneValue = RecurringPricingInfo.packageOneDisCountedTotal;
      PackageTwoValue = RecurringPricingInfo.packageTwoDisCountedTotal;
      PackageThreeValue = RecurringPricingInfo.packageThreeDisCountedTotal;
    } else if (Type === "VAT") {
      PackageOneValue = RecurringPricingInfo.PackageOneVaTPrice;
      PackageTwoValue = RecurringPricingInfo.PackageTwoVaTPrice;
      PackageThreeValue = RecurringPricingInfo.PackageThreeVaTPrice;
    } else if (Type === "Grand Total") {
      PackageOneValue = RecurringPricingInfo.PackageOneGrandTotal;
      PackageTwoValue = RecurringPricingInfo.PackageTwoGrandTotal;
      PackageThreeValue = RecurringPricingInfo.PackageThreeGrandTotal;
    } else if (Type === "Original Price") {
      PackageOneValue = RecurringPricingInfo.packageOneNetTotal;
      PackageTwoValue = RecurringPricingInfo.packageTwoNetTotal;
      PackageThreeValue = RecurringPricingInfo.packageThreeNetTotal;
    } else if (Type === "Default Percentage") {
      PackageOneValue = RecurringPricingInfo.DiscountPercentagePackageOne;
      PackageTwoValue = RecurringPricingInfo.DiscountPercentagePackageTwo;
      PackageThreeValue = RecurringPricingInfo.DiscountPercentagePackageThree;
    } else if (Type === "Discounted Price") {
      PackageOneValue = RecurringPricingInfo.packageOneDisCountedTotal;
      PackageTwoValue = RecurringPricingInfo.packageTwoDisCountedTotal;
      PackageThreeValue = RecurringPricingInfo.packageThreeDisCountedTotal;
    }

    const headers = servicePackageList
      .map(
        (item) =>
          `<th style="border: 1px solid black; padding: 8px; width: 25%;">${item.servicePackageName}</th>`,
      )
      .join("");

    let rowValues = "";
    if (servicePackageList.length === 1) {
      rowValues = `<td style="border: 1px solid black; padding: 8px;text-align:center;width: 25%;">${formatValue(
        PackageOneValue,
      )}</td>`;
    } else if (servicePackageList.length === 2) {
      rowValues = `
        <td style="border: 1px solid black; padding: 8px;text-align:right;width: 25%;">${formatValue(
          PackageOneValue,
        )}</td>
        <td style="border: 1px solid black; padding: 8px;text-align:right;width: 25%;">${formatValue(
          PackageTwoValue,
        )}</td>
      `;
    } else if (servicePackageList.length === 3) {
      rowValues = `
        <td style="border: 1px solid black; padding: 8px;text-align: right;width: 25%;">${formatValue(
          PackageOneValue,
        )}</td>
        <td style="border: 1px solid black; padding: 8px;text-align: right;width: 25%;">${formatValue(
          PackageTwoValue,
        )}</td>
        <td style="border: 1px solid black; padding: 8px;text-align: right;width: 25%;">${formatValue(
          PackageThreeValue,
        )}</td>
      `;
    }
    return `
      <table style="border-collapse: collapse; width: 100%; page-break-inside: avoid; break-inside: avoid;">
        <tr>
          <th style="border: 1px solid black; padding: 8px;width: 25%;">Package Name</th>
          ${headers}
        </tr>
        <tr>
          <th style="border: 1px solid black; padding: 8px;width: 25%;">${Type}</th>
          ${rowValues}
        </tr>
      </table>`;
  };

  const GetReplacePackageCombinedTableView = (
    RecurringPricingInfo,
    OneOffPricingInfo,
    Type,
    servicePackageList,
  ) => {
    let PackageOneValue = null;
    let PackageTwoValue = null;
    let PackageThreeValue = null;

    let PackageOneOneOffValue = null;
    let PackageTwoOneOffValue = null;
    let PackageThreeOneOffValue = null;

    if (Type === "Net Total") {
      PackageOneValue =
        Number(RecurringPricingInfo.packageOneNetTotal) >
        Number(RecurringPricingInfo.packageOneDisCountedTotal)
          ? RecurringPricingInfo.packageOneNetTotal
          : RecurringPricingInfo.packageOneDisCountedTotal;

      PackageTwoValue =
        Number(RecurringPricingInfo.packageTwoNetTotal) >
        Number(RecurringPricingInfo.packageTwoDisCountedTotal)
          ? RecurringPricingInfo.packageTwoNetTotal
          : RecurringPricingInfo.packageTwoDisCountedTotal;

      PackageThreeValue =
        Number(RecurringPricingInfo.packageThreeNetTotal) >
        Number(RecurringPricingInfo.packageThreeDisCountedTotal)
          ? RecurringPricingInfo.packageThreeNetTotal
          : RecurringPricingInfo.packageThreeDisCountedTotal;

      PackageOneOneOffValue =
        Number(OneOffPricingInfo.packageOneNetTotal) >
        Number(OneOffPricingInfo.packageOneDisCountedTotal)
          ? OneOffPricingInfo.packageOneNetTotal
          : OneOffPricingInfo.packageOneDisCountedTotal;

      PackageTwoOneOffValue =
        Number(OneOffPricingInfo.packageTwoNetTotal) >
        Number(OneOffPricingInfo.packageTwoDisCountedTotal)
          ? OneOffPricingInfo.packageTwoNetTotal
          : OneOffPricingInfo.packageTwoDisCountedTotal;

      PackageThreeOneOffValue =
        Number(OneOffPricingInfo.packageThreeNetTotal) >
        Number(OneOffPricingInfo.packageThreeDisCountedTotal)
          ? OneOffPricingInfo.packageThreeNetTotal
          : RecurringPricingInfo.packageThreeDisCountedTotal;
    } else if (Type === "Discount") {
      PackageOneValue = RecurringPricingInfo.packageOneDisCount;
      PackageTwoValue = RecurringPricingInfo.packageTwoDisCount;
      PackageThreeValue = RecurringPricingInfo.packageThreeDisCount;

      PackageOneOneOffValue = OneOffPricingInfo.packageOneDisCount;
      PackageTwoOneOffValue = OneOffPricingInfo.packageTwoDisCount;
      PackageThreeOneOffValue = OneOffPricingInfo.packageThreeDisCount;
    } else if (Type === "Discounted Total") {
      PackageOneValue = RecurringPricingInfo.packageOneDisCountedTotal;
      PackageTwoValue = RecurringPricingInfo.packageTwoDisCountedTotal;
      PackageThreeValue = RecurringPricingInfo.packageThreeDisCountedTotal;

      PackageOneOneOffValue = OneOffPricingInfo.packageOneDisCountedTotal;
      PackageTwoOneOffValue = OneOffPricingInfo.packageTwoDisCountedTotal;
      PackageThreeOneOffValue = OneOffPricingInfo.packageThreeDisCountedTotal;
    } else if (Type === "VAT") {
      PackageOneValue = RecurringPricingInfo.PackageOneVaTPrice;
      PackageTwoValue = RecurringPricingInfo.PackageTwoVaTPrice;
      PackageThreeValue = RecurringPricingInfo.PackageThreeVaTPrice;

      PackageOneOneOffValue = OneOffPricingInfo.PackageOneVaTPrice;
      PackageTwoOneOffValue = OneOffPricingInfo.PackageTwoVaTPrice;
      PackageThreeOneOffValue = OneOffPricingInfo.PackageThreeVaTPrice;
    } else if (Type === "Grand Total") {
      PackageOneValue = RecurringPricingInfo.PackageOneGrandTotal;
      PackageTwoValue = RecurringPricingInfo.PackageTwoGrandTotal;
      PackageThreeValue = RecurringPricingInfo.PackageThreeGrandTotal;

      PackageOneOneOffValue = OneOffPricingInfo.PackageOneGrandTotal;
      PackageTwoOneOffValue = OneOffPricingInfo.PackageTwoGrandTotal;
      PackageThreeOneOffValue = OneOffPricingInfo.PackageThreeGrandTotal;
    } else if (Type === "Original Price") {
      PackageOneValue = RecurringPricingInfo.packageOneNetTotal;
      PackageTwoValue = RecurringPricingInfo.packageTwoNetTotal;
      PackageThreeValue = RecurringPricingInfo.packageThreeNetTotal;

      PackageOneOneOffValue = OneOffPricingInfo.packageOneNetTotal;
      PackageTwoOneOffValue = OneOffPricingInfo.packageTwoNetTotal;
      PackageThreeOneOffValue = OneOffPricingInfo.packageThreeNetTotal;
    } else if (Type === "Default Percentage") {
      PackageOneValue = RecurringPricingInfo.DiscountPercentagePackageOne;
      PackageTwoValue = RecurringPricingInfo.DiscountPercentagePackageTwo;
      PackageThreeValue = RecurringPricingInfo.DiscountPercentagePackageThree;

      PackageOneOneOffValue = OneOffPricingInfo.DiscountPercentagePackageOne;
      PackageTwoOneOffValue = OneOffPricingInfo.DiscountPercentagePackageTwo;
      PackageThreeOneOffValue =
        OneOffPricingInfo.DiscountPercentagePackageThree;
    } else if (Type === "Discounted Price") {
      PackageOneValue = RecurringPricingInfo.packageOneDisCountedTotal;
      PackageTwoValue = RecurringPricingInfo.packageTwoDisCountedTotal;
      PackageThreeValue = RecurringPricingInfo.packageThreeDisCountedTotal;

      PackageOneOneOffValue = OneOffPricingInfo.packageOneDisCountedTotal;
      PackageTwoOneOffValue = OneOffPricingInfo.packageTwoDisCountedTotal;
      PackageThreeOneOffValue = OneOffPricingInfo.packageThreeDisCountedTotal;
    }

    const headers = servicePackageList
      .map(
        (item) =>
          `<th style="border: 1px solid black; padding: 8px;">${item.servicePackageName}</th>`,
      )
      .join("");

    let rowValues = "";
    if (servicePackageList.length === 1) {
      rowValues = `<td style="border: 1px solid black; padding: 8px;width: 25%;text-align: right;"> <ul>
          <li>Recurring Services: ${formatValue(PackageOneValue)}</li>
          <li>One-Off Services: ${formatValue(PackageOneOneOffValue)}</li>
        </ul></td>`;
    } else if (servicePackageList.length === 2) {
      rowValues = `
        <td style="border: 1px solid black; padding: 8px;width: 25%;text-align: right;"><ul>
          <li>Recurring Services: ${formatValue(PackageOneValue)}</li>
          <li>One-Off Services: ${formatValue(PackageOneOneOffValue)}</li>
        </ul></td>
        <td style="border: 1px solid black; padding: 8px;width: 25%;text-align: right;"><ul>
          <li>Recurring Services: ${formatValue(PackageTwoValue)}</li>
          <li>One-Off Services: ${formatValue(PackageTwoOneOffValue)}</li>
        </ul></td>
      `;
    } else if (servicePackageList.length === 3) {
      rowValues = `
        <td style="border: 1px solid black; padding: 8px;width: 25%;text-align: right;"><ul>
          <li>Recurring Services: ${formatValue(PackageOneValue)}</li>
          <li>One-Off Services: ${formatValue(PackageOneOneOffValue)}</li>
        </ul></td>
        <td style="border: 1px solid black; padding: 8px;width: 25%;text-align: right;"><ul>
          <li>Recurring Services: ${formatValue(PackageTwoValue)}</li>
          <li>One-Off Services: ${formatValue(PackageTwoOneOffValue)}</li>
        </ul></td>
        <td style="border: 1px solid black; padding: 8px;width: 25%;text-align: right;"><ul>
          <li>Recurring Services: ${formatValue(PackageThreeValue)}</li>
          <li>One-Off Services: ${formatValue(PackageThreeOneOffValue)}</li>
        </ul></td>
      `;
    }

    return `
      <table style="border-collapse: collapse; width: 100%; page-break-inside: avoid; break-inside: avoid;">
        <tr>
          <th style="border: 1px solid black; padding: 8px;width: 25%;">Package Name</th>
          ${headers}
        </tr>
        <tr>
          <th style="border: 1px solid black; padding: 8px;width: 25%;">${Type}</th>
          ${rowValues}
        </tr>
      </table>`;
  };

  const GetReplaceValueByWithComma = (
    RecurringValue,
    OneOffValue,
    selectedProposalTypeValue,
    servicePackageList,
    Type,
  ) => {
    if (selectedProposalTypeValue === 3) {
      return `Recurring Services: ${formatValue(
        RecurringValue,
      )}, One-Off Services: ${formatValue(OneOffValue)}`;
    } else {
      let PackageOneValue = "";
      let PackageTwoValue = "";
      let PackageThreeValue = "";
      let PackageOneOneOffValue = "";
      let PackageTwoOneOffValue = "";
      let PackageThreeOneOffValue = "";
      if (Type === "Net Total") {
        PackageOneValue = Number(
          RecurringValue.packageOneNetTotal >
            Number(RecurringValue.packageOneDisCountedTotal),
        )
          ? RecurringValue.packageOneNetTotal
          : RecurringValue.packageOneDisCountedTotal;
        PackageTwoValue = Number(
          RecurringValue.packageTwoNetTotal >
            Number(RecurringValue.packageTwoDisCountedTotal),
        )
          ? RecurringValue.packageTwoNetTotal
          : RecurringValue.packageTwoDisCountedTotal;
        PackageThreeValue = Number(
          RecurringValue.packageThreeNetTotal >
            Number(RecurringValue.packageThreeDisCountedTotal),
        )
          ? RecurringValue.packageThreeNetTotal
          : RecurringValue.packageThreeDisCountedTotal;

        PackageOneOneOffValue = Number(
          OneOffValue.packageOneNetTotal >
            Number(OneOffValue.packageOneDisCountedTotal),
        )
          ? OneOffValue.packageOneNetTotal
          : OneOffValue.packageOneDisCountedTotal;
        PackageTwoOneOffValue = Number(
          OneOffValue.packageTwoNetTotal >
            Number(OneOffValue.packageTwoDisCountedTotal),
        )
          ? OneOffValue.packageTwoNetTotal
          : OneOffValue.packageTwoDisCountedTotal;
        PackageThreeOneOffValue = Number(
          OneOffValue.packageThreeNetTotal >
            Number(OneOffValue.packageThreeDisCountedTotal),
        )
          ? OneOffValue.packageThreeNetTotal
          : OneOffValue.packageThreeDisCountedTotal;
      } else if (Type === "Discount") {
        PackageOneValue = RecurringValue.packageOneDisCount;
        PackageTwoValue = RecurringValue.packageTwoDisCount;
        PackageThreeValue = RecurringValue.packageThreeDisCount;

        PackageOneOneOffValue = OneOffValue.packageOneDisCount;
        PackageTwoOneOffValue = OneOffValue.packageTwoDisCount;
        PackageThreeOneOffValue = OneOffValue.packageThreeDisCount;
      } else if (Type === "Discounted Total") {
        PackageOneValue = RecurringValue.packageOneDisCountedTotal;
        PackageTwoValue = RecurringValue.packageTwoDisCountedTotal;
        PackageThreeValue = RecurringValue.packageThreeDisCountedTotal;

        PackageOneOneOffValue = OneOffValue.packageOneDisCountedTotal;
        PackageTwoOneOffValue = OneOffValue.packageTwoDisCountedTotal;
        PackageThreeOneOffValue = OneOffValue.packageThreeDisCountedTotal;
      } else if (Type === "VAT") {
        PackageOneValue = RecurringValue.PackageOneVaTPrice;
        PackageTwoValue = RecurringValue.PackageTwoVaTPrice;
        PackageThreeValue = RecurringValue.PackageThreeVaTPrice;

        PackageOneOneOffValue = OneOffValue.PackageOneVaTPrice;
        PackageTwoOneOffValue = OneOffValue.PackageTwoVaTPrice;
        PackageThreeOneOffValue = OneOffValue.PackageThreeVaTPrice;
      } else if (Type === "Grand Total") {
        PackageOneValue = RecurringValue.PackageOneGrandTotal;
        PackageTwoValue = RecurringValue.PackageTwoGrandTotal;
        PackageThreeValue = RecurringValue.PackageThreeGrandTotal;

        PackageOneOneOffValue = OneOffValue.PackageOneGrandTotal;
        PackageTwoOneOffValue = OneOffValue.PackageTwoGrandTotal;
        PackageThreeOneOffValue = OneOffValue.PackageThreeGrandTotal;
      } else if (Type === "Original Price") {
        PackageOneValue = RecurringValue.packageOneNetTotal;
        PackageTwoValue = RecurringValue.packageTwoNetTotal;
        PackageThreeValue = RecurringValue.packageThreeNetTotal;

        PackageOneOneOffValue = OneOffValue.packageOneNetTotal;
        PackageTwoOneOffValue = OneOffValue.packageTwoNetTotal;
        PackageThreeOneOffValue = OneOffValue.packageThreeNetTotal;
      } else if (Type === "Default Percentage") {
        PackageOneValue = RecurringValue.DiscountPercentagePackageOne;
        PackageTwoValue = RecurringValue.DiscountPercentagePackageTwo;
        PackageThreeValue = RecurringValue.DiscountPercentagePackageThree;

        PackageOneOneOffValue = OneOffValue.DiscountPercentagePackageOne;
        PackageTwoOneOffValue = OneOffValue.DiscountPercentagePackageTwo;
        PackageThreeOneOffValue = OneOffValue.DiscountPercentagePackageThree;
      } else if (Type === "Discounted Price") {
        PackageOneValue = RecurringValue.packageOneDisCountedTotal;
        PackageTwoValue = RecurringValue.packageTwoDisCountedTotal;
        PackageThreeValue = RecurringValue.packageThreeDisCountedTotal;

        PackageOneOneOffValue = OneOffValue.packageOneDisCountedTotal;
        PackageTwoOneOffValue = OneOffValue.packageTwoDisCountedTotal;
        PackageThreeOneOffValue = OneOffValue.packageThreeDisCountedTotal;
      }

      return servicePackageList
        .map(
          (item, index) =>
            `<b>${
              item.servicePackageName
            }</b>: Recurring Services: ${formatValue(
              [PackageOneValue, PackageTwoValue, PackageThreeValue][index],
            )}, One-Off Services: ${formatValue(
              [
                PackageOneOneOffValue,
                PackageTwoOneOffValue,
                PackageThreeOneOffValue,
              ][index],
            )}`,
        )
        .join(", ");
    }
  };

  const GetReplaceValueByWithBulletList = (
    RecurringValue,
    OneOffValue,
    selectedProposalTypeValue,
    servicePackageList,
    Type,
  ) => {
    if (selectedProposalTypeValue === 3) {
      return `
        <ul>
          <li>Recurring Services: ${formatValue(RecurringValue)}</li>
          <li>One-Off Services: ${formatValue(OneOffValue)}</li>
        </ul>
      `;
    } else {
      let PackageOneValue = "";
      let PackageTwoValue = "";
      let PackageThreeValue = "";
      let PackageOneOneOffValue = "";
      let PackageTwoOneOffValue = "";
      let PackageThreeOneOffValue = "";
      if (Type === "Net Total") {
        PackageOneValue = Number(
          RecurringValue.packageOneNetTotal >
            Number(RecurringValue.packageOneDisCountedTotal),
        )
          ? RecurringValue.packageOneNetTotal
          : RecurringValue.packageOneDisCountedTotal;
        PackageTwoValue = Number(
          RecurringValue.packageTwoNetTotal >
            Number(RecurringValue.packageTwoDisCountedTotal),
        )
          ? RecurringValue.packageTwoNetTotal
          : RecurringValue.packageTwoDisCountedTotal;
        PackageThreeValue = Number(
          RecurringValue.packageThreeNetTotal >
            Number(RecurringValue.packageThreeDisCountedTotal),
        )
          ? RecurringValue.packageThreeNetTotal
          : RecurringValue.packageThreeDisCountedTotal;

        PackageOneOneOffValue = Number(
          OneOffValue.packageOneNetTotal >
            Number(OneOffValue.packageOneDisCountedTotal),
        )
          ? OneOffValue.packageOneNetTotal
          : OneOffValue.packageOneDisCountedTotal;
        PackageTwoOneOffValue = Number(
          OneOffValue.packageTwoNetTotal >
            Number(OneOffValue.packageTwoDisCountedTotal),
        )
          ? OneOffValue.packageTwoNetTotal
          : OneOffValue.packageTwoDisCountedTotal;
        PackageThreeOneOffValue = Number(
          OneOffValue.packageThreeNetTotal >
            Number(OneOffValue.packageThreeDisCountedTotal),
        )
          ? OneOffValue.packageThreeNetTotal
          : OneOffValue.packageThreeDisCountedTotal;
      } else if (Type === "Discount") {
        PackageOneValue = RecurringValue.packageOneDisCount;
        PackageTwoValue = RecurringValue.packageTwoDisCount;
        PackageThreeValue = RecurringValue.packageThreeDisCount;

        PackageOneOneOffValue = OneOffValue.packageOneDisCount;
        PackageTwoOneOffValue = OneOffValue.packageTwoDisCount;
        PackageThreeOneOffValue = OneOffValue.packageThreeDisCount;
      } else if (Type === "Discounted Total") {
        PackageOneValue = RecurringValue.packageOneDisCountedTotal;
        PackageTwoValue = RecurringValue.packageTwoDisCountedTotal;
        PackageThreeValue = RecurringValue.packageThreeDisCountedTotal;

        PackageOneOneOffValue = OneOffValue.packageOneDisCountedTotal;
        PackageTwoOneOffValue = OneOffValue.packageTwoDisCountedTotal;
        PackageThreeOneOffValue = OneOffValue.packageThreeDisCountedTotal;
      } else if (Type === "VAT") {
        PackageOneValue = RecurringValue.PackageOneVaTPrice;
        PackageTwoValue = RecurringValue.PackageTwoVaTPrice;
        PackageThreeValue = RecurringValue.PackageThreeVaTPrice;

        PackageOneOneOffValue = OneOffValue.PackageOneVaTPrice;
        PackageTwoOneOffValue = OneOffValue.PackageTwoVaTPrice;
        PackageThreeOneOffValue = OneOffValue.PackageThreeVaTPrice;
      } else if (Type === "Grand Total") {
        PackageOneValue = RecurringValue.PackageOneGrandTotal;
        PackageTwoValue = RecurringValue.PackageTwoGrandTotal;
        PackageThreeValue = RecurringValue.PackageThreeGrandTotal;

        PackageOneOneOffValue = OneOffValue.PackageOneGrandTotal;
        PackageTwoOneOffValue = OneOffValue.PackageTwoGrandTotal;
        PackageThreeOneOffValue = OneOffValue.PackageThreeGrandTotal;
      } else if (Type === "Original Price") {
        PackageOneValue = RecurringValue.packageOneNetTotal;
        PackageTwoValue = RecurringValue.packageTwoNetTotal;
        PackageThreeValue = RecurringValue.packageThreeNetTotal;

        PackageOneOneOffValue = OneOffValue.packageOneNetTotal;
        PackageTwoOneOffValue = OneOffValue.packageTwoNetTotal;
        PackageThreeOneOffValue = OneOffValue.packageThreeNetTotal;
      } else if (Type === "Default Percentage") {
        PackageOneValue = RecurringValue.DiscountPercentagePackageOne;
        PackageTwoValue = RecurringValue.DiscountPercentagePackageTwo;
        PackageThreeValue = RecurringValue.DiscountPercentagePackageThree;

        PackageOneOneOffValue = OneOffValue.DiscountPercentagePackageOne;
        PackageTwoOneOffValue = OneOffValue.DiscountPercentagePackageTwo;
        PackageThreeOneOffValue = OneOffValue.DiscountPercentagePackageThree;
      } else if (Type === "Discounted Price") {
        PackageOneValue = RecurringValue.packageOneDisCountedTotal;
        PackageTwoValue = RecurringValue.packageTwoDisCountedTotal;
        PackageThreeValue = RecurringValue.packageThreeDisCountedTotal;

        PackageOneOneOffValue = OneOffValue.packageOneDisCountedTotal;
        PackageTwoOneOffValue = OneOffValue.packageTwoDisCountedTotal;
        PackageThreeOneOffValue = OneOffValue.packageThreeDisCountedTotal;
      }
      return `
        <ul>
          ${servicePackageList
            .map(
              (item, index) => `
            <li>${item.servicePackageName}: Recurring Services: ${formatValue(
              [PackageOneValue, PackageTwoValue, PackageThreeValue][index],
            )}, One-Off Services: ${formatValue(
              [
                PackageOneOneOffValue,
                PackageTwoOneOffValue,
                PackageThreeOneOffValue,
              ][index],
            )}</li>
          `,
            )
            .join("")}
        </ul>
      `;
    }
  };

  const getPaymentFrequencyLabel = (FrequencyTypeID) => {
    const Payment_Frequency = {
      Yearly: 1,
      HalfYearly: 2,
      Quarterly: 3,
      Monthly: 4,
    };

    switch (FrequencyTypeID) {
      case Payment_Frequency.Yearly:
        return "Yearly";
      case Payment_Frequency.HalfYearly:
        return "Half-Yearly";
      case Payment_Frequency.Quarterly:
        return "Quarterly";
      case Payment_Frequency.Monthly:
        return "Monthly";
      default:
        return "Unknown";
    }
  };

  const ReplaceVariable_WithTableView = (
    SelectedServiceList,
    PricingInfo,
    selectedProposalTypeValue,
    SelectedPackageList,
    Type,
  ) => {
    if (!SelectedServiceList || SelectedServiceList.length === 0) {
      return "";
    }
    if (selectedProposalTypeValue === 3) {
      const conditionalRecurringNetTotal =
        Number(PricingInfo.OriginalPrice) < Number(PricingInfo.DiscountedPrice)
          ? PricingInfo.DiscountedPrice
          : PricingInfo.OriginalPrice;
      const rows = [
        { label: "Net Total", value: conditionalRecurringNetTotal },
        { label: "Discount", value: PricingInfo.Discount },
        { label: "Discounted Price", value: PricingInfo.DiscountedTotal },
        { label: "VAT", value: PricingInfo.VATPrice },
        { label: "Grand Total", value: PricingInfo.GrandTotal },
      ];

      return `
            <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid;">
              ${rows
                .map(
                  ({ label, value }) => `
                    <tr>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
                        ${label}
                      </td>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: right; width: 60%;">
                        ${formatValue(value)}
                      </td>
                    </tr>
                  `,
                )
                .join("")}
            </table>
          `;
    } else {
      const packageData = [
        {
          label: "Package One",
          netTotal: PricingInfo.packageOneNetTotal,
          discountedTotal: PricingInfo.packageOneDisCountedTotal,
          discount: PricingInfo.packageOneDisCount,
          vatPrice: PricingInfo.PackageOneVaTPrice,
          grandTotal: PricingInfo.PackageOneGrandTotal,
          discountPercentage: PricingInfo.DiscountPercentagePackageOne,
        },
        {
          label: "Package Two",
          netTotal: PricingInfo.packageTwoNetTotal,
          discountedTotal: PricingInfo.packageTwoDisCountedTotal,
          discount: PricingInfo.packageTwoDisCount,
          vatPrice: PricingInfo.PackageTwoVaTPrice,
          grandTotal: PricingInfo.PackageTwoGrandTotal,
          discountPercentage: PricingInfo.DiscountPercentagePackageTwo,
        },
        {
          label: "Package Three",
          netTotal: PricingInfo.packageThreeNetTotal,
          discountedTotal: PricingInfo.packageThreeDisCountedTotal,
          discount: PricingInfo.packageThreeDisCount,
          vatPrice: PricingInfo.PackageThreeVaTPrice,
          grandTotal: PricingInfo.PackageThreeGrandTotal,
          discountPercentage: PricingInfo.DiscountPercentagePackageThree,
        },
      ];

      // Add computed properties
      packageData.forEach((pkg) => {
        pkg.netTotal = Math.max(pkg.netTotal, pkg.discountedTotal);
      });

      return `
  <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid;">
    <!-- Package Names Row -->
    ${
      Type !== "WithOutName"
        ? `
        <tr>
          <th style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Package Name</th>
          ${SelectedPackageList.map(
            (pkg) => `
              <th style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${pkg.servicePackageName}
              </th>
            `,
          ).join("")}
        </tr>
      `
        : ""
    }

    <!-- Data Rows -->
   
          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Net Total</td>
            ${SelectedPackageList.map(
              (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.netTotal || 0)}
              </td>
            `,
            ).join("")}
          </tr>
          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Discount</td>
            ${SelectedPackageList.map(
              (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.discount || 0)}
              </td>
            `,
            ).join("")}
          </tr>
          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Discounted Price</td>
            ${SelectedPackageList.map(
              (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.discountedTotal || 0)}
              </td>
            `,
            ).join("")}
          </tr>
          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">VAT</td>
            ${SelectedPackageList.map(
              (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.vatPrice || 0)}
              </td>
            `,
            ).join("")}
          </tr>
          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Grand Total</td>
            ${SelectedPackageList.map(
              (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.grandTotal || 0)}
              </td>
            `,
            ).join("")}
          </tr>
        
        
  </table>
`;
    }
  };
  //single and package service list variable replace function.
  const GetReplaceServiceWithTableView = (
    selectedRecurringServiceList,
    selectedOneOffServiceList,
    servicePackageList,
  ) => {
    const generateTableRows = (serviceList) => {
      if (!servicePackageList) {
        // When there is no servicePackageList
        if (!serviceList || serviceList?.length === 0) return "";
        return `
           <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;page-break-inside: avoid; break-inside: avoid;">
           <tr>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
  Service Name
</td>     
                    </tr>
           ${serviceList
             .map((item) =>
               item.servicesList
                 .map(
                   (subService) => `
                 
                    <tr>
                      <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
                        ${subService.serviceName}
                      </td>
                      
                    </tr>
                    
                  `,
                 )
                 .join(""),
             )
             .join("")}
            </table>
        `;
      } else {
        // When servicePackageList is present
        if (!serviceList || serviceList?.length === 0) return "";
        return `
        ${servicePackageList
          .slice(0, 3) // Limit to maximum of 3 packages
          .map((servicePackage, packageIndex) => {
            // Filter services for the current package
            const validServices = serviceList.flatMap((serviceCat) =>
              serviceCat.servicesList.filter((subService) => {
                return (
                  (packageIndex === 0 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageOneID,
                    ) &&
                    subService.packageOneValue !== null) ||
                  (packageIndex === 1 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageTwoID,
                    ) &&
                    subService.packageTwoValue !== null) ||
                  (packageIndex === 2 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageThreeID,
                    ) &&
                    subService.packageThreeValue !== null)
                );
              }),
            );

            // Skip rendering the package if no services are available
            if (validServices?.length === 0) return "";
            // Skip rendering the package if no services are available
            if (validServices.length === 0) return "";

            return `
              <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;page-break-inside: avoid; break-inside: avoid;">
    
              <tr>
                  <th colspan="2" style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 18px; text-align: center;">
                    ${servicePackage.servicePackageName}
                  </th>
                </tr>
                    <tr>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
  Service Name
</td>

                      
                    </tr>
                ${validServices
                  .map(
                    (subService) => `
                 
                      <tr>
                        <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left;">
                          ${subService.serviceName}
                        </td>
                      </tr>
                    `,
                  )
                  .join("")}
              </table>
            `;
          })
          .join("")}
      `;
      }
    };

    const recurringServices = generateTableRows(selectedRecurringServiceList);
    const oneOffServices = generateTableRows(selectedOneOffServiceList);

    return `
    <div>
  ${
    selectedRecurringServiceList?.length !== 0
      ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
        Recurring Services
      </p>`
      : ""
  }

   
      ${recurringServices}

       ${
         selectedOneOffServiceList?.length !== 0
           ? ` <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
    <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              Recurring Services
            </p>
      ${recurringServices}   
    <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              One-Off Services
            </p>`
           : ""
       }
      ${oneOffServices}
    </div>
  `;
  };

  const GetReplaceServiceWithTableViewWithPrice = (
    selectedRecurringServiceList,
    selectedOneOffServiceList,
    servicePackageList,
  ) => {
    const generateTableRows = (serviceList) => {
      if (!servicePackageList) {
        // When there is no servicePackageList
        if (!serviceList || serviceList?.length === 0) return "";
        return ` 
          <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;page-break-inside: avoid; break-inside: avoid;">
              <tr>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
  Service Name
</td>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: right; width: 60%;">
  Price
</td>

                      
                    </tr>
          ${serviceList
            .map((item) =>
              item.servicesList
                .map(
                  (subService) => `
             
                    <tr>
                      <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
                        ${subService.serviceName}
                      </td>
                      <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: right; width: 30%;">
                          ${
                            subService.price == undefined
                              ? formatValue(subService.quotationPrice)
                              : formatValue(subService.price)
                          }
                        </td>
                    </tr>
                  
                  `,
                )
                .join(""),
            )
            .join("")}
              </table>
        `;
      } else {
        // When servicePackageList is present
        if (!serviceList || serviceList?.length === 0) return "";
        return `
        ${servicePackageList
          .slice(0, 3) // Limit to maximum of 3 packages
          .map((servicePackage, packageIndex) => {
            // Filter services for the current package
            const validServices = serviceList.flatMap((serviceCat) =>
              serviceCat.servicesList.filter((subService) => {
                return (
                  (packageIndex === 0 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageOneID,
                    ) &&
                    subService.packageOneValue !== null) ||
                  (packageIndex === 1 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageTwoID,
                    ) &&
                    subService.packageTwoValue !== null) ||
                  (packageIndex === 2 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageThreeID,
                    ) &&
                    subService.packageThreeValue !== null)
                );
              }),
            );

            // Skip rendering the package if no services are available
            if (validServices?.length === 0) return "";

            return `
              <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;page-break-inside: avoid; break-inside: avoid;">
                <tr>
                  <th colspan="2" style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 18px; text-align: center;">
                    ${servicePackage.servicePackageName}
                  </th>
                </tr>
                                     <tr>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
  Service Name
</td>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: right; width: 60%;">
  Price
</td>

                      
                    </tr>
                ${validServices
                  .map((subService) => {
                    const packageValue =
                      packageIndex === 0
                        ? subService.packageOneValue
                        : packageIndex === 1
                          ? subService.packageTwoValue
                          : subService.packageThreeValue;

                    return `
     
                      <tr>
                        <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 70%;">
                          ${subService.serviceName}
                        </td>
                        <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: right; width: 30%;">
                          ${formatValue(packageValue)}
                        </td>
                      </tr>
                    `;
                  })
                  .join("")}
              </table>
            `;
          })
          .join("")}
      `;
      }
    };

    const recurringServices = generateTableRows(selectedRecurringServiceList);
    const oneOffServices = generateTableRows(selectedOneOffServiceList);

    return `
    <div>
     ${
       selectedRecurringServiceList?.length !== 0
         ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
        Recurring Services
      </p>`
         : ""
     }
      ${recurringServices}   

       ${
         selectedOneOffServiceList?.length !== 0
           ? `    <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              One-Off Services
            </p>`
           : ""
       }

      ${oneOffServices}
    </div>
  `;
  };

  const GetReplaceServiceWithCommaView = (
    selectedRecurringServiceList,
    selectedOneOffServiceList,
    servicePackageList,
  ) => {
    const generateTableRows = (serviceList) => {
      if (!servicePackageList) {
        // When there is no servicePackageList
        if (!serviceList || serviceList?.length === 0) return "";
        return `
        <p style="margin: 8px 0; line-height: 1.5;">
          ${serviceList
            .map((item) =>
              item.servicesList
                .map((subService) => subService.serviceName)
                .join(", "),
            )
            .join(", ")}
        </p>
      `;
      } else {
        // When servicePackageList is present
        if (!serviceList || serviceList?.length === 0) return "";
        return `
        ${servicePackageList
          .slice(0, 3) // Limit to a maximum of 3 packages
          .map((servicePackage, packageIndex) => {
            // Filter services for the current package
            const validServices = serviceList.flatMap((serviceCat) =>
              serviceCat.servicesList.filter((subService) => {
                return (
                  (packageIndex === 0 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageOneID,
                    ) &&
                    subService.packageOneValue !== null) ||
                  (packageIndex === 1 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageTwoID,
                    ) &&
                    subService.packageTwoValue !== null) ||
                  (packageIndex === 2 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageThreeID,
                    ) &&
                    subService.packageThreeValue !== null)
                );
              }),
            );

            // Skip rendering the package if no services are available
            if (validServices?.length === 0) return "";

            return `
              <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                 ${servicePackage.servicePackageName}
              </p>
              <p style="margin: 8px 0;line-height: 1.5;">
                ${validServices
                  .map((subService) => subService.serviceName)
                  .join(", ")}
              </p>
            `;
          })
          .join("")}
      `;
      }
    };

    const recurringServices = generateTableRows(selectedRecurringServiceList);
    const oneOffServices = generateTableRows(selectedOneOffServiceList);

    return `
    <div>
     ${
       selectedRecurringServiceList?.length !== 0
         ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              Recurring Services
            </p>`
         : ""
     }

      ${recurringServices}   
      ${
        selectedOneOffServiceList?.length !== 0
          ? ` <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              One-Off Services
            </p>`
          : ""
      }
   
      ${oneOffServices}
    </div>
  `;
  };

  const GetReplaceServiceWithCommaViewWithPrice = (
    selectedRecurringServiceList,
    selectedOneOffServiceList,
    servicePackageList,
  ) => {
    const generateTableRows = (serviceList) => {
      if (!servicePackageList) {
        // When there is no servicePackageList
        if (!serviceList || serviceList?.length === 0) return "";
        return `
        <p style="margin: 8px 0;line-height: 1.5;">
          ${serviceList
            .map((item) =>
              item.servicesList
                .map(
                  (subService) =>
                    `${subService.serviceName}: ${
                      subService.price == undefined
                        ? formatValue(subService.quotationPrice)
                        : formatValue(subService.price)
                    }`,
                )
                .join(", "),
            )
            .join(", ")}
        </p>
      `;
      } else {
        // When servicePackageList is present
        if (!serviceList || serviceList?.length === 0) return "";
        return `
        ${servicePackageList
          .slice(0, 3) // Limit to a maximum of 3 packages
          .map((servicePackage, packageIndex) => {
            // Filter services for the current package
            const validServices = serviceList.flatMap((serviceCat) =>
              serviceCat.servicesList.filter((subService) => {
                return (
                  (packageIndex === 0 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageOneID,
                    ) &&
                    subService.packageOneValue !== null) ||
                  (packageIndex === 1 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageTwoID,
                    ) &&
                    subService.packageTwoValue !== null) ||
                  (packageIndex === 2 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageThreeID,
                    ) &&
                    subService.packageThreeValue !== null)
                );
              }),
            );

            // Skip rendering the package if no services are available
            if (validServices?.length === 0) return "";

            return `
  <p style="margin: 8px 0; line-height: 1.5;">
   <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
    ${servicePackage.servicePackageName}:
  </p>  ${validServices
    .map((subService) => {
      const packageValue =
        packageIndex === 0
          ? subService.packageOneValue
          : packageIndex === 1
            ? subService.packageTwoValue
            : subService.packageThreeValue;

      return `${subService.serviceName}: ${formatValue(packageValue)}`;
    })
    .join(", ")}
  </p>
`;
          })
          .join("")}
      `;
      }
    };

    const recurringServices = generateTableRows(selectedRecurringServiceList);
    const oneOffServices = generateTableRows(selectedOneOffServiceList);

    return `
      <div>
      ${
        selectedRecurringServiceList?.length !== 0
          ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                Recurring Services
              </p>`
          : ""
      }
      
        ${recurringServices}

        ${
          selectedOneOffServiceList?.length !== 0
            ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                One-Off Services
              </p>`
            : ""
        }
      
        ${oneOffServices}
      </div>
    `;
  };

  const GetReplaceServiceWithBulletListView = (
    selectedRecurringServiceList,
    selectedOneOffServiceList,
    servicePackageList,
  ) => {
    const generateTableRows = (serviceList) => {
      if (!servicePackageList) {
        // When there is no servicePackageList
        if (!serviceList || serviceList?.length === 0) return "";
        return `
  <ul style="margin: 8px 0; font-size: 16px; line-height: 1.5;">
    ${serviceList
      .map((item) =>
        item.servicesList
          .map((subService) => `<li>${subService.serviceName}</li>`)
          .join(""),
      )
      .join("")}
  </ul>
`;
      } else {
        // When servicePackageList is present
        if (!serviceList || serviceList?.length === 0) return "";
        return `
        ${servicePackageList
          .slice(0, 3) // Limit to a maximum of 3 packages
          .map((servicePackage, packageIndex) => {
            // Filter services for the current package
            const validServices = serviceList.flatMap((serviceCat) =>
              serviceCat.servicesList.filter((subService) => {
                return (
                  (packageIndex === 0 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageOneID,
                    ) &&
                    subService.packageOneValue !== null) ||
                  (packageIndex === 1 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageTwoID,
                    ) &&
                    subService.packageTwoValue !== null) ||
                  (packageIndex === 2 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageThreeID,
                    ) &&
                    subService.packageThreeValue !== null)
                );
              }),
            );

            // Skip rendering the package if no services are available
            if (validServices?.length === 0) return "";

            return `
              <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                 ${servicePackage.servicePackageName}
              </p>
              <ul style="margin: 8px 0; font-size: 16px; line-height: 1.5;">
    ${serviceList
      .map((item) =>
        item.servicesList
          .map((subService) => `<li>${subService.serviceName}</li>`)
          .join(""),
      )
      .join("")}
  </ul>
            `;
          })
          .join("")}
      `;
      }
    };

    const recurringServices = generateTableRows(selectedRecurringServiceList);
    const oneOffServices = generateTableRows(selectedOneOffServiceList);

    return `
    <div>
    ${
      selectedRecurringServiceList?.length !== 0
        ? ` <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              Recurring Services
            </p>`
        : ""
    }
      ${recurringServices}   
      ${
        selectedOneOffServiceList?.length !== 0
          ? ` <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              One-Off Services
            </p>`
          : ""
      }
    
      ${oneOffServices}
    </div>
  `;
  };

  const GetReplaceServiceWithBulletListViewWithPrice = (
    selectedRecurringServiceList,
    selectedOneOffServiceList,
    servicePackageList,
  ) => {
    const generateTableRows = (serviceList) => {
      if (!servicePackageList) {
        // When there is no servicePackageList
        if (!serviceList || serviceList?.length === 0) return "";
        return `
        <ul style="margin: 8px 0; font-size: 16px; line-height: 1.5;">
          ${serviceList
            .map((item) =>
              item.servicesList
                .map(
                  (subService) =>
                    `<li>${subService.serviceName}: ${
                      subService.price == undefined
                        ? formatValue(subService.quotationPrice)
                        : formatValue(subService.price)
                    }</li>`,
                )
                .join(""),
            )
            .join("")}
        </ul>
      `;
      } else {
        // When servicePackageList is present
        if (!serviceList || serviceList?.length === 0) return "";
        return `
        ${servicePackageList
          .slice(0, 3) // Limit to a maximum of 3 packages
          .map((servicePackage, packageIndex) => {
            // Filter services for the current package
            const validServices = serviceList.flatMap((serviceCat) =>
              serviceCat.servicesList.filter((subService) => {
                return (
                  (packageIndex === 0 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageOneID,
                    ) &&
                    subService.packageOneValue !== null) ||
                  (packageIndex === 1 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageTwoID,
                    ) &&
                    subService.packageTwoValue !== null) ||
                  (packageIndex === 2 &&
                    subService?.servicePackageIDs.includes(
                      subService.packageThreeID,
                    ) &&
                    subService.packageThreeValue !== null)
                );
              }),
            );

            // Skip rendering the package if no services are available
            if (validServices?.length === 0) return "";

            return `
 
   <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
    ${servicePackage.servicePackageName}:
  </p>
   <ul style="margin: 8px 0; font-size: 16px; line-height: 1.5;">
  ${validServices
    .map((subService) => {
      const packageValue =
        packageIndex === 0
          ? subService.packageOneValue
          : packageIndex === 1
            ? subService.packageTwoValue
            : subService.packageThreeValue;

      return `<li>${subService.serviceName}: ${formatValue(packageValue)}</li>`;
    })
    .join(", ")}
                   </ul>
 
`;
          })
          .join("")}
      `;
      }
    };

    const recurringServices = generateTableRows(selectedRecurringServiceList);
    const oneOffServices = generateTableRows(selectedOneOffServiceList);

    return `
      <div>
        ${
          selectedRecurringServiceList?.length !== 0
            ? `  <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                Recurring Services
              </p>`
            : ""
        }
     
        ${recurringServices}   
         ${
           selectedOneOffServiceList?.length !== 0
             ? `  <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                One-Off Services
              </p>`
             : ""
         }
      
        ${oneOffServices}
      </div>
    `;
  };
  function replaceTemplatePricingVariables(
    array,
    RecurringPricingInfo,
    OneOffPricingInfo,
    paymentFrequency,
    selectedProposalTypeValue,
    servicePackageList,
    selectedRecurringServiceList,
    selectedOneOffServiceList,
  ) {
    let ResultTotalVariablesWithValues = {};
    const conditionalRecurringNetTotal =
      Number(RecurringPricingInfo.OriginalPrice) <
      Number(RecurringPricingInfo.DiscountedPrice)
        ? RecurringPricingInfo.DiscountedPrice
        : RecurringPricingInfo.OriginalPrice;
    const conditionalOneOffNetTotal =
      Number(OneOffPricingInfo.OriginalPrice) <
      Number(OneOffPricingInfo.DiscountedPrice)
        ? OneOffPricingInfo.DiscountedPrice
        : OneOffPricingInfo.OriginalPrice;
    //selectProposalTypeValue 3= single(Custumized)
    if (selectedProposalTypeValue === 3) {
      ResultTotalVariablesWithValues = {
        // All Total result variable with table view
        AllRecuringResultTotalVariable_WithPackageName:
          ReplaceVariable_WithTableView(
            selectedRecurringServiceList,
            RecurringPricingInfo,
            selectedProposalTypeValue,
            null,
            null,
          ),
        AllOneOffResultTotalVariable_WithPackageName:
          ReplaceVariable_WithTableView(
            selectedOneOffServiceList,
            OneOffPricingInfo,
            selectedProposalTypeValue,
            null,
            null,
          ),
        AllRecurringResultTotalVariable_WithoutPackageName:
          ReplaceVariable_WithTableView(
            selectedRecurringServiceList,
            RecurringPricingInfo,
            selectedProposalTypeValue,
            null,
            null,
          ),
        AllOneOffResultTotalVariable_WithoutPackageName:
          ReplaceVariable_WithTableView(
            selectedOneOffServiceList,
            OneOffPricingInfo,
            selectedProposalTypeValue,
            null,
            null,
          ),
        //service Variable
        AllServices_WithTableView: GetReplaceServiceWithTableView(
          selectedRecurringServiceList,
          selectedOneOffServiceList,
          null,
        ),
        AllServicesWithPrice_WithTableView:
          GetReplaceServiceWithTableViewWithPrice(
            selectedRecurringServiceList,
            selectedOneOffServiceList,
            null,
          ),

        AllServices_WithComma: GetReplaceServiceWithCommaView(
          selectedRecurringServiceList,
          selectedOneOffServiceList,
          null,
        ),
        AllServicesWithPrice_WithComma: GetReplaceServiceWithCommaViewWithPrice(
          selectedRecurringServiceList,
          selectedOneOffServiceList,
          null,
        ),

        AllServices_WithBulletList: GetReplaceServiceWithBulletListView(
          selectedRecurringServiceList,
          selectedOneOffServiceList,
          null,
        ),
        AllServicesWithPrice_WithBulletList:
          GetReplaceServiceWithBulletListViewWithPrice(
            selectedRecurringServiceList,
            selectedOneOffServiceList,
            null,
          ),

        //Other services
        Net_Total_Recurring: formatValue(conditionalRecurringNetTotal),
        Discount_Recurring: formatValue(RecurringPricingInfo.Discount),
        Discounted_Total_Recurring: formatValue(
          RecurringPricingInfo.DiscountedTotal,
        ),
        VAT_Recurring: formatValue(RecurringPricingInfo.VATPrice),
        Grand_Total_Recurring: formatValue(RecurringPricingInfo.GrandTotal),
        Original_Price_Recurring: formatValue(
          RecurringPricingInfo.OriginalPrice,
        ),
        Discount_Percentage_Recurring: formatValue(
          RecurringPricingInfo.DefaultDiscount,
        ),
        Discounted_Price_Recurring: formatValue(
          RecurringPricingInfo.DiscountedTotal,
        ),
        Payment_Frequency_Recurring: getPaymentFrequencyLabel(paymentFrequency),

        Net_Total_OneOff: formatValue(conditionalOneOffNetTotal),
        Discount_OneOff: formatValue(OneOffPricingInfo.Discount),
        Discounted_Total_OneOff: formatValue(OneOffPricingInfo.DiscountedTotal),
        VAT_OneOff: formatValue(OneOffPricingInfo.VATPrice),
        Grand_Total_OneOff: formatValue(OneOffPricingInfo.GrandTotal),
        Original_Price_OneOff: formatValue(OneOffPricingInfo.OriginalPrice),
        Discount_Percentage_OneOff: formatValue(
          OneOffPricingInfo.DefaultDiscount,
        ),
        Discounted_Price_OneOff: formatValue(OneOffPricingInfo.DiscountedTotal),
        //With Table View
        Net_Total_WithTableView: SingleServiceWithCombinedTableView(
          "Net Total",
          conditionalRecurringNetTotal,
          conditionalOneOffNetTotal,
        ),
        Discount_WithTableView: SingleServiceWithCombinedTableView(
          "Discount",
          RecurringPricingInfo.Discount,
          OneOffPricingInfo.Discount,
        ),
        Discounted_Total_WithTableView: SingleServiceWithCombinedTableView(
          "Discounted Total",
          RecurringPricingInfo.DiscountedTotal,
          OneOffPricingInfo.DiscountedTotal,
        ),
        VAT_WithTableView: SingleServiceWithCombinedTableView(
          "VAT",
          RecurringPricingInfo.VATPrice,
          OneOffPricingInfo.VATPrice,
        ),
        Grand_Total_WithTableView: SingleServiceWithCombinedTableView(
          "Grand Total",
          RecurringPricingInfo.GrandTotal,
          OneOffPricingInfo.GrandTotal,
        ),
        Original_Price_WithTableView: SingleServiceWithCombinedTableView(
          "Original Price",
          RecurringPricingInfo.OriginalPrice,
          OneOffPricingInfo.OriginalPrice,
        ),
        Discount_Percentage_WithTableView: SingleServiceWithCombinedTableView(
          "Default Percentage",
          RecurringPricingInfo.DefaultDiscount,
          OneOffPricingInfo.DefaultDiscount,
        ),
        Discounted_Price_WithTableView: SingleServiceWithCombinedTableView(
          "Discounted Price",
          RecurringPricingInfo.DiscountedPrice,
          OneOffPricingInfo.DiscountedPrice,
        ),
        //Comma Seprated
        Net_Total_WithComma: GetReplaceValueByWithComma(
          conditionalRecurringNetTotal,
          conditionalOneOffNetTotal,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Discount_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo.Discount,
          OneOffPricingInfo.Discount,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Discounted_Total_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo.DiscountedTotal,
          OneOffPricingInfo.DiscountedTotal,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        VAT_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo.VATPrice,
          OneOffPricingInfo.VATPrice,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Grand_Total_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo.GrandTotal,
          OneOffPricingInfo.GrandTotal,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Original_Price_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo.OriginalPrice,
          OneOffPricingInfo.OriginalPrice,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Discount_Percentage_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo.DefaultDiscount,
          OneOffPricingInfo.DefaultDiscount,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Discounted_Price_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo.DiscountedPrice,
          OneOffPricingInfo.DiscountedPrice,
          selectedProposalTypeValue,
          servicePackageList,
        ),

        Net_Total_WithBulletList: GetReplaceValueByWithBulletList(
          conditionalRecurringNetTotal,
          conditionalOneOffNetTotal,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Discount_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo.Discount,
          OneOffPricingInfo.Discount,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Discounted_Total_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo.DiscountedTotal,
          OneOffPricingInfo.DiscountedTotal,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        VAT_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo.VATPrice,
          OneOffPricingInfo.VATPrice,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Grand_Total_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo.GrandTotal,
          OneOffPricingInfo.GrandTotal,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Original_Price_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo.OriginalPrice,
          OneOffPricingInfo.OriginalPrice,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Discount_Percentage_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo.DefaultDiscount,
          OneOffPricingInfo.DefaultDiscount,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        Discounted_Price_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo.DiscountedPrice,
          OneOffPricingInfo.DiscountedPrice,
          selectedProposalTypeValue,
          servicePackageList,
        ),
      };
    } else {
      ResultTotalVariablesWithValues = {
        // All Total result variable with table view
        AllRecuringResultTotalVariable_WithPackageName:
          ReplaceVariable_WithTableView(
            selectedRecurringServiceList,
            RecurringPricingInfo,
            selectedProposalTypeValue,
            servicePackageList,
            null,
          ),
        AllOneOffResultTotalVariable_WithPackageName:
          ReplaceVariable_WithTableView(
            selectedOneOffServiceList,
            OneOffPricingInfo,
            selectedProposalTypeValue,
            servicePackageList,
            null,
          ),
        AllRecurringResultTotalVariable_WithoutPackageName:
          ReplaceVariable_WithTableView(
            selectedRecurringServiceList,
            RecurringPricingInfo,
            selectedProposalTypeValue,
            servicePackageList,
            "WithOutName",
          ),
        AllOneOffResultTotalVariable_WithoutPackageName:
          ReplaceVariable_WithTableView(
            selectedOneOffServiceList,
            OneOffPricingInfo,
            selectedProposalTypeValue,
            servicePackageList,
            "WithOutName",
          ),
        //service Price replace variables
        AllServices_WithTableView: GetReplaceServiceWithTableView(
          selectedRecurringServiceList,
          selectedOneOffServiceList,
          servicePackageList,
        ),
        AllServicesWithPrice_WithTableView:
          GetReplaceServiceWithTableViewWithPrice(
            selectedRecurringServiceList,
            selectedOneOffServiceList,
            servicePackageList,
          ),

        AllServices_WithComma: GetReplaceServiceWithCommaView(
          selectedRecurringServiceList,
          selectedOneOffServiceList,
          servicePackageList,
        ),
        AllServicesWithPrice_WithComma: GetReplaceServiceWithCommaViewWithPrice(
          selectedRecurringServiceList,
          selectedOneOffServiceList,
          servicePackageList,
        ),

        AllServices_WithBulletList: GetReplaceServiceWithBulletListView(
          selectedRecurringServiceList,
          selectedOneOffServiceList,
          servicePackageList,
        ),
        AllServicesWithPrice_WithBulletList:
          GetReplaceServiceWithBulletListViewWithPrice(
            selectedRecurringServiceList,
            selectedOneOffServiceList,
            servicePackageList,
          ),
        //Other Values
        Net_Total_Recurring: GetReplacePackageTableView(
          RecurringPricingInfo,
          "Net Total",
          servicePackageList,
        ),
        Discount_Recurring: GetReplacePackageTableView(
          RecurringPricingInfo,
          "Discount",
          servicePackageList,
        ),
        Discounted_Total_Recurring: GetReplacePackageTableView(
          RecurringPricingInfo,
          "Discounted Total",
          servicePackageList,
        ),
        VAT_Recurring: GetReplacePackageTableView(
          RecurringPricingInfo,
          "VAT",
          servicePackageList,
        ),
        Grand_Total_Recurring: GetReplacePackageTableView(
          RecurringPricingInfo,
          "Grand Total",
          servicePackageList,
        ),
        Original_Price_Recurring: GetReplacePackageTableView(
          RecurringPricingInfo,
          "Original Price",
          servicePackageList,
        ),
        Discount_Percentage_Recurring: GetReplacePackageTableView(
          RecurringPricingInfo,
          "Default Percentage",
          servicePackageList,
        ),
        Discounted_Price_Recurring: GetReplacePackageTableView(
          RecurringPricingInfo,
          "Discounted Price",
          servicePackageList,
        ),
        Payment_Frequency_Recurring: getPaymentFrequencyLabel(paymentFrequency),

        Net_Total_OneOff: GetReplacePackageTableView(
          OneOffPricingInfo,
          "Net Total",
          servicePackageList,
        ),
        Discount_OneOff: GetReplacePackageTableView(
          OneOffPricingInfo,
          "Discount",
          servicePackageList,
        ),
        Discounted_Total_OneOff: GetReplacePackageTableView(
          OneOffPricingInfo,
          "Discounted Total",
          servicePackageList,
        ),

        VAT_OneOff: GetReplacePackageTableView(
          OneOffPricingInfo,
          "VAT",
          servicePackageList,
        ),
        Grand_Total_OneOff: GetReplacePackageTableView(
          OneOffPricingInfo,
          "Grand Total",
          servicePackageList,
        ),
        Original_Price_OneOff: GetReplacePackageTableView(
          OneOffPricingInfo,
          "Original Price",
          servicePackageList,
        ),
        Discount_Percentage_OneOff: GetReplacePackageTableView(
          OneOffPricingInfo,
          "Default Percentage",
          servicePackageList,
        ),
        Discounted_Price_OneOff: GetReplacePackageTableView(
          OneOffPricingInfo,
          "Discounted Price",
          servicePackageList,
        ),

        //Table view
        Net_Total_WithTableView: GetReplacePackageCombinedTableView(
          RecurringPricingInfo,
          OneOffPricingInfo,
          "Net Total",
          servicePackageList,
        ),
        Discount_WithTableView: GetReplacePackageCombinedTableView(
          RecurringPricingInfo,
          OneOffPricingInfo,
          "Discount",
          servicePackageList,
        ),
        Discounted_Total_WithTableView: GetReplacePackageCombinedTableView(
          RecurringPricingInfo,
          OneOffPricingInfo,
          "Discounted Total",
          servicePackageList,
        ),
        Discounted_Price_WithTableView: GetReplacePackageCombinedTableView(
          RecurringPricingInfo,
          OneOffPricingInfo,
          "Discounted Price",
          servicePackageList,
        ),
        VAT_WithTableView: GetReplacePackageCombinedTableView(
          RecurringPricingInfo,
          OneOffPricingInfo,
          "VAT",
          servicePackageList,
        ),
        Grand_Total_WithTableView: GetReplacePackageCombinedTableView(
          RecurringPricingInfo,
          OneOffPricingInfo,
          "Grand Total",
          servicePackageList,
        ),
        Original_Price_WithTableView: GetReplacePackageCombinedTableView(
          RecurringPricingInfo,
          OneOffPricingInfo,
          "Original Price",
          servicePackageList,
        ),
        Discount_Percentage_WithTableView: GetReplacePackageCombinedTableView(
          RecurringPricingInfo,
          OneOffPricingInfo,
          "Default Percentage",
          servicePackageList,
        ),

        Net_Total_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Net Total",
        ),
        Discount_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Discount",
        ),
        Discounted_Total_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        VAT_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "VAT",
        ),
        Grand_Total_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Grand Total",
        ),
        Original_Price_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Original Price",
        ),
        Discount_Percentage_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Default Percentage",
        ),
        Discounted_Price_WithComma: GetReplaceValueByWithComma(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Default Price",
        ),

        Net_Total_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Net Total",
        ),
        Discount_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Discount",
        ),
        Discounted_Total_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
        ),
        VAT_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "VAT",
        ),
        Grand_Total_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Grand Total",
        ),
        Original_Price_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Original Price",
        ),
        Discount_Percentage_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Default Percentage",
        ),
        Discounted_Price_WithBulletList: GetReplaceValueByWithBulletList(
          RecurringPricingInfo,
          OneOffPricingInfo,
          selectedProposalTypeValue,
          servicePackageList,
          "Default Price",
        ),
      };
    }

    const replacedArray = array.map((item) => {
      if (item.htmlContent) {
        let replacedContent = item.htmlContent;

        // Iterate over each variable and replace it in the content
        for (const variable in ResultTotalVariablesWithValues) {
          let value =
            ResultTotalVariablesWithValues[variable] == null
              ? "0.00"
              : ResultTotalVariablesWithValues[variable];

          const regex = new RegExp(`\\$${variable}\\$`, "g");

          replacedContent = replacedContent.replace(regex, value);
        }
        // Update the htmlContent in the item
        return { ...item, htmlContent: replacedContent };
      } else {
        return item;
      }
    });

    return { replacedArray, pricingVariables: ResultTotalVariablesWithValues };
  }

  // const replaceUrlInHtml = (htmlContent) => {
  //   // Regex to match URLs outside of <img> tags
  //   const urlRegex = /(?<!<img[^>]*src=["'])\bhttps?:\/\/[^\s<>"']+[\w/]/g;

  //   // Replace URLs with styled spans
  //   return htmlContent.replace(urlRegex, (url) => {
  //     return `<span style="display: block; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; overflow-x: auto; white-space: pre-wrap;">${url}</span>`;
  //   });
  // };

  const replaceUrlInHtml = (htmlContent) => {
    const urlRegex = /\bhttps?:\/\/[^\s<>"']+[\w/]/g;

    return htmlContent.replace(urlRegex, (url, offset) => {
      const before = htmlContent.substring(Math.max(0, offset - 100), offset);

      // Don't replace if URL is inside src=, href=, or url()
      if (/(?:src|href|url)\s*=\s*["']?$/.test(before)) {
        return url;
      }

      // Don't replace if inside CSS url() function
      if (/url\s*\(\s*["']?$/.test(before)) {
        return url;
      }

      // Don't replace if inside any HTML attribute
      const lastQuote = Math.max(
        before.lastIndexOf('"'),
        before.lastIndexOf("'"),
      );
      const lastEquals = before.lastIndexOf("=");
      const lastCloseBracket = before.lastIndexOf(">");

      if (
        lastQuote > lastCloseBracket &&
        lastEquals > lastCloseBracket &&
        lastEquals < lastQuote
      ) {
        return url;
      }

      // Safe to replace
      return `<span style="display: block; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; overflow-x: auto; white-space: pre-wrap;">${url}</span>`;
    });
  };

  const isValueGreaterThan20000 = (
    RecurringPricingInfo,
    OneOffPricingInfo,
    vatPercentage,
    selectedPackagesList,
  ) => {
    // Check main grand totals and discounted values
    if (selectedPackagesList?.length == 0) {
      if (vatPercentage && RecurringPricingInfo.GrandTotal > 20000) {
        return true;
      }
      if (
        (RecurringPricingInfo.DefaultDiscount !== 0 ||
          !RecurringPricingInfo.DefaultDiscount) &&
        RecurringPricingInfo.DiscountedTotal > 20000
      ) {
        return true;
      }
      if (RecurringPricingInfo.DiscountedPrice > 20000) {
        return true;
      }
      if (vatPercentage && OneOffPricingInfo.GrandTotal > 20000) {
        return true;
      }
      if (
        (OneOffPricingInfo.DefaultDiscount !== 0 ||
          !OneOffPricingInfo.DefaultDiscount) &&
        OneOffPricingInfo.DiscountedTotal > 20000
      ) {
        return true;
      }
      if (OneOffPricingInfo.DiscountedPrice > 20000) {
        return true;
      }
    } else {
      // Check all three package values for RecurringPricingInfo and OneOffPricingInfo
      const packageLabels = ["One", "Two", "Three"];

      for (let i = 0; i < 3; i++) {
        const label = packageLabels[i];

        if (
          (vatPercentage &&
            RecurringPricingInfo[`Package${label}GrandTotal`] > 20000) ||
          (RecurringPricingInfo[`DiscountPercentagePackage${label}`] >= 0 &&
            RecurringPricingInfo[`package${label}DisCountedTotal`] > 20000) ||
          RecurringPricingInfo[`package${label}DisCountedTotal`] > 20000 ||
          (vatPercentage &&
            OneOffPricingInfo[`Package${label}GrandTotal`] > 20000) ||
          (OneOffPricingInfo[`DiscountPercentagePackage${label}`] >= 0 &&
            OneOffPricingInfo[`package${label}DisCountedTotal`] > 20000) ||
          OneOffPricingInfo[`package${label}DisCountedTotal`] > 20000
        ) {
          return true;
        }
      }
    }
    return false;
  };
  const formatUKPhoneNumberLocal = (number, countryCode) => {
    if (!number) return "";

    // If it's not +44, return the number as-is
    if (countryCode !== "+44") {
      return number;
    }

    // Remove all spaces just in case
    const cleaned = number.replace(/\s+/g, "");

    // If number is less than or equal to 4 digits, return as is
    if (cleaned.length <= 4) {
      return cleaned;
    }

    // Split first 4 digits and the rest
    const firstFour = cleaned.substring(0, 4);
    const rest = cleaned.substring(4);

    return `${firstFour} ${rest}`;
  };

  const lightenColor = (hex, percent) => {
    hex = hex.replace("#", "");

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    return `rgb(${r}, ${g}, ${b})`;
  };

  /* -------------- Set All Function Used Globally Throughout The Project ------------ */
  return (
    <AuthContextProvider.Provider
      value={{
        lightenColor,
        formatUKPhoneNumberLocal,
        formatName,
        isValueGreaterThan20000,
        replaceUrlInHtml,
        replaceTemplatePricingVariables,
        isValidNumber,
        getFontStylesFromHtml,
        GetActiveDateRange,
        GetOnlyDate,
        topbar,
        loader,
        listCount,
        setTopbar,
        isPopupOpen,
        prospectName,
        bookKeepingGateway,
        setIsPopupOpen,
        proposalName,
        EngagementName,
        setLoader,
        loginLoader,
        setLoginLoader,
        isMobile,
        totalPage,
        getCurrencySymbol,
        getTaxName,
        formatValue,
        formatValueWithoutCurrencySymbol,
        formatValueWithoutCurrencySymbol_v1,
        convertAndParseDate,
        isValidEmail,
        setListCount,
        accessCount,
        GetCustomDate,
        orgLoaderList,
        userAccessData,
        SetAccessCount,
        desktopRecords,
        isMobileRecords,
        setProposalName,
        hasActionAccess,
        handleNameChange,
        DefaultVariables,
        HtmlToPlainText,
        setProspectName,
        setBookKeepingGateway,
        setOrgLoaderList,
        handleInputChange,
        setEngagementName,
        activeOrganization,
        updatedProspectName,
        updatedProposalName,
        RequireErrorMessage,
        setDefaultVariables,
        problematicInputRef,
        staticCurrencySymbols,
        setProfessionTypeList,
        setActiveOrganization,
        getCrudButtonTextName,
        getCrudPopUpTitleName,
        updatedEngagementName,
        setUpdatedProposalName,
        setUpdatedProspectName,
        getPlaceholderTextName,
        professionTypeListData,
        setRequireErrorMessage,
        scrollUpDownByElementID,
        DashboardCountListLoader,
        handleNameChangeProposal,
        getCrudButtonToolTipName,
        handleInputChangeProposal,
        handleSetDefaultVariables,
        scrollUptoCurrentPosition,
        DashboardActivityLogLoader,
        handleNameChangeEngagement,
        handleInputChangeEngagement,
        setDashboardCountListLoader,
        setInitializeValidationError,
        setDashboardActivityLogLoader,
        activeOrganizationSubscriptionPlan,
        setActiveOrganizationSubscriptionPlan,
        isAddUpdatePurchaseDone,
        setIsAddUpdatePurchaseDone,
        handleErrorMessage,
        GetTwoDecimalValueWithoutRoundOff,
        hasHyphenAfterNumber,
        getValidationMessage,
        logoutTimeUpModal,
        setLogoutTimeUpModal,
        handleReloadClick,
        updateTemplateList,
        // updateImageUrlsInHtml,
        // updateTemplateList,
        isMenuVisible,
        setMenuVisible,
        toggleMenuVisibility,
        maxCountToRecallApi,
        setMaxCountToRecallApi,
      }}
    >
      {children}
    </AuthContextProvider.Provider>
  );
};

export default AuthContext;
