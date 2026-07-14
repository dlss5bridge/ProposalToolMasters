import { ColorProvider } from "../AuthContext/ColorContext";
import { lazy, useContext, useEffect, Suspense } from "react";
import { OutBooksTitle } from "../components/GlobalMessage";
// -------------------------------CSS File--------------------------------------------------------
import "../App.css";

// -------------------------------Common Topbar----------------------------------------------------
// import TopbarClone from "../components/TopbarClone";
// import Topbar from "../components/Topbar";

// --------------------------------Routes----------------------------------------------------------
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

// -----------------------------------Loader-------------------------------------------------------
import Loadable from "../loader/Loadable";
import { useDispatch, useSelector } from "react-redux";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import Loader from "../loader/Loader";
import LoginPageLoader from "../loader/LoginPageLoader";
import { resetState } from "../redux/Persist";
import Login from "../Auth/login/Login";

// import AddUpdateReminderTemplate from "../pages/configure/Reminder/ReminderEmailTemplate/AddReminderTemplateModel";
// import SuperAdminReminderTemplateList from "../pages/Settings/SuperAdminReminder/SuperAdminReminderEmailTemplate/SuperAdminReminderTemplateList";
// import AddUpdateSuperAdminReminderTemplate from "../pages/Settings/SuperAdminReminder/SuperAdminReminderEmailTemplate/AddUpdateSuperAdminReminderTemplate";
// import UpdateUnPaidAccount from "../pages/Settings/SuperAdminReminder/LoginToOutbooks/UpdateLoginToOutbooksReminder";
// // import UserSubscriptionPackageTab from "../pages/subscription/User/UserSubscriptionPackageModel";
// import SuperAdminMarketingReminderList from "../pages/Settings/SuperAdminReminder/SuperAdminMarketingReminder/SuperAdminMarketingReminderList";
// import SuperAdminMarketingReminderAddUpdate from "../pages/Settings/SuperAdminReminder/SuperAdminMarketingReminder/SuperAdminMarketingReminderAddUpdate";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ChatWidget from "../components/Ai/ChatWidget";

// ------------------------------------Pages with loader--------------------------------------------
export const Topbar = Loadable(lazy(() => import("../components/Topbar")));
export const TopbarClone = Loadable(
  lazy(() => import("../components/TopbarClone")),
);
export const AddUpdateReminderTemplate = Loadable(
  lazy(
    () =>
      import("../pages/configure/Reminder/ReminderEmailTemplate/AddReminderTemplateModel"),
  ),
);

export const SuperAdminReminderTemplateList = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SuperAdminReminder/SuperAdminReminderEmailTemplate/SuperAdminReminderTemplateList"),
  ),
);

export const AddUpdateSuperAdminReminderTemplate = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SuperAdminReminder/SuperAdminReminderEmailTemplate/AddUpdateSuperAdminReminderTemplate"),
  ),
);

export const UpdateUnPaidAccount = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SuperAdminReminder/LoginToOutbooks/UpdateLoginToOutbooksReminder"),
  ),
);

export const UpdateSubscriptionPackageReminder = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SuperAdminReminder/SuperAdminReminderSubscriptionPackage/UpdateSuperAdminReminderSubscriptionPackage"),
  ),
);

// export const UserSubscriptionPackageTab = Loadable(
//   lazy(() => import("../pages/subscription/User/UserSubscriptionPackageModel"))
// );

export const SuperAdminMarketingReminderList = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SuperAdminReminder/SuperAdminMarketingReminder/SuperAdminMarketingReminderList"),
  ),
);

export const SuperAdminMarketingReminderAddUpdate = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SuperAdminReminder/SuperAdminMarketingReminder/SuperAdminMarketingReminderAddUpdate"),
  ),
);
const Logout = Loadable(lazy(() => import("../components/Logout")));
const SuccessPage = Loadable(lazy(() => import("../components/SuccessPage")));
const Setting = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SingleApiIntegrationSetting/setting/Setting"),
  ),
);
const Access_Key = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SingleApiIntegrationSetting/AccessKey/AccessKeyList"),
  ),
);
const CouponsList = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SingleApiIntegrationSetting/Coupon/CouponsList"),
  ),
);
const StripePaymentCanceledPage = Loadable(
  lazy(() => import("../components/PaymentCancelPage")),
);
const ChoosePlanForPurchase = Loadable(
  lazy(() => import("../components/ChoosePlanForpurchase")),
);
const MySubscription = Loadable(
  lazy(() => import("../components/MySubscription")),
);

const ReminderList = Loadable(
  lazy(() => import("../pages/configure/Reminder/Reminders/ReminderList")),
);
const AddUpdateReminder = Loadable(
  lazy(() => import("../pages/configure/Reminder/Reminders/AddUpdateReminder")),
);
const SubscriptionModal = Loadable(
  lazy(
    () =>
      import("../pages/subscription/subscription_package/SubscriptionPackageModel"),
  ),
);
const PdfToCsvSubscriptionPackageModel = Loadable(
  lazy(
    () =>
      import("../pages/subscription/pdf_csv_subscription_package/PdfToCsvSubscriptionPackageModel"),
  ),
);
const PdfToCsvConvertorModel = Loadable(
  lazy(
    () =>
      import("../pages/subscription/pdf_csv_subscription_package/PdfToCsvConvertor"),
  ),
);

const DeletionReminder = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SuperAdminReminder/LoginToOutbooks/LoginToOutbooksReminderList"),
  ),
);

const SubscriptionPackageReminder = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SuperAdminReminder/SuperAdminReminderSubscriptionPackage/SuperAdminReminderSubscriptionPackageList"),
  ),
);

const ReminderTemplateList = Loadable(
  lazy(
    () =>
      import("../pages/configure/Reminder/ReminderEmailTemplate/ReminderTemplatesList"),
  ),
);
const ViewPdf = Loadable(lazy(() => import("../components/ViewPdf")));
const UserSubscriptionTab = Loadable(
  lazy(() => import("../pages/subscription/User/UserSubscriptionTab")),
);

const Prospects = Loadable(
  lazy(() => import("../pages/prospects/ProspectsList")),
);
const Access_Keys = Loadable(
  lazy(() => import("../pages/Settings/access-keys/AccessKeyList")),
);
const Services = Loadable(
  lazy(() => import("../pages/configure/services/ServicesList")),
);
const Dashboard = Loadable(
  lazy(() => import("../pages/dashboard/NewDashboard")),
);
const DashboardClone = Loadable(
  lazy(() => import("../pages/dashboard/DashbordClone")),
);
const Update_Practice_Details = Loadable(
  lazy(() => import("../pages/Settings/Organisations/Update_Practice_Details")),
);
const Organisations = Loadable(
  lazy(() => import("../pages/organisation/OrganisationsList")),
);

const ViewOrganisationsDetails = Loadable(
  lazy(() => import("../pages/organisation/OrganisationViewDetails")),
);

const Service_categories = Loadable(
  lazy(
    () => import("../pages/configure/service_categories/ServiceCategoriesList"),
  ),
);
const Add_Category = Loadable(
  lazy(() => import("../pages/configure/services/AddUpdateServices")),
);
const Predefined_Package = Loadable(
  lazy(() => import("../pages/configure/packages/PackageList")),
);

const ViewProspects = Loadable(
  lazy(() => import("../pages/prospects/ProspectViewDetails")),
);

const Proposals = Loadable(
  lazy(() => import("../pages/proposals/ProposalsList")),
);
const Add_New_Predefined_Package = Loadable(
  lazy(() => import("../pages/configure/packages/AddUpdatePackage")),
);
const Predefined_Global_Constant = Loadable(
  lazy(
    () =>
      import("../pages/configure/global-constants/PredifinedGlobalConstantList"),
  ),
);
const Predefined_templates = Loadable(
  lazy(() => import("../pages/configure/template/PredefinedTemplatesList")),
);
const Add_New_Templates = Loadable(
  lazy(() => import("../pages/configure/template/AddNewTemplates")),
);
const Add_New_Templates_Pdf = Loadable(
  lazy(() => import("../pages/configure/template/AddNewTemplatePdf")),
);
const Add_New_Templates_HeaderFooter = Loadable(
  lazy(() => import("../pages/configure/template/AddNewTemplateHeaderFooter")),
);
const Predefined_Email_templates = Loadable(
  lazy(() => import("../pages/configure/email_template/EmailTemplatesList")),
);
const Add_New_Email_Templates = Loadable(
  lazy(() => import("../pages/configure/email_template/AddEmailTemplateModel")),
);
const Predefined_Term_And_Condition = Loadable(
  lazy(
    () => import("../pages/configure/term_and_condition/TermandConditionList"),
  ),
);
const Add_New_Term_And_Condition = Loadable(
  lazy(
    () =>
      import("../pages/configure/term_and_condition/AddTermAndConditionModal"),
  ),
);
const Add_New_Pricing_Drivers = Loadable(
  lazy(
    () =>
      import("../pages/configure/global-pricing-drivers/GlobalPricingDriversList"),
  ),
);
const Email_Config = Loadable(
  lazy(() => import("../pages/Settings/Email_config/EmailConfig")),
);

const SuperAdminEmail_Config = Loadable(
  lazy(
    () =>
      import("../pages/Settings/SuperAdminReminder/EmailConfig/EmailConfig"),
  ),
);
const Users = Loadable(lazy(() => import("../pages/Settings/users/UsersList")));
const Payment_Gateway = Loadable(
  lazy(() => import("../pages/Settings/payment-gateway/PaymentGateway")),
);

const Xero = Loadable(lazy(() => import("../pages/Settings/xero")));
const QuickBook = Loadable(lazy(() => import("../pages/Settings/quick-book")));
const Deviation = Loadable(lazy(() => import("../pages/Settings/deviation")));

const Activity_Logs = Loadable(
  lazy(() => import("../pages/Settings/Activity-logs/Activity_Logs")),
);
const Pricing_Settings = Loadable(
  lazy(() => import("../pages/Settings/Pricing-settings/PricingSetting")),
);
const Fee_Inflation_Page = Loadable(
  lazy(() => import("../pages/Settings/FeeInflation/FeeInflationView")),
);

const Add_New_Proposals = Loadable(
  lazy(() => import("../pages/proposals/AddUpdateProposal")),
);

const Notification = Loadable(
  lazy(() => import("../pages/notification/Notification")),
);

const Subscription_package = Loadable(
  lazy(
    () =>
      import("../pages/subscription/subscription_package/SubscriptionPackageList"),
  ),
);
const PdfToCsvSubscription_Package = Loadable(
  lazy(
    () =>
      import("../pages/subscription/pdf_csv_subscription_package/PdfToCsvSubscriptionPackageList"),
  ),
);
const Edit_Sub_package = Loadable(
  lazy(
    () =>
      import("../pages/subscription/subscription_package/SubscriptionPackageModel"),
  ),
);

const New_Engagement_Model = Loadable(
  lazy(() => import("../pages/engagement-letter/AddUpdateEngagementLetter")),
);
const User = Loadable(lazy(() => import("../pages/subscription/User/User")));
const Invoices = Loadable(
  lazy(() => import("../pages/subscription/Invoices/Invoices")),
);
const Engagement_Letter = Loadable(
  lazy(() => import("../pages/engagement-letter/Engagement_Letter_List")),
);
const SuperAdminUserList = Loadable(
  lazy(() => import("../pages/user/InviteUserList")),
);
const Create_new_practice = Loadable(
  lazy(() => import("../pages/Settings/Organisations/Create_practice_details")),
);
const ViewLetter = Loadable(
  lazy(() => import("../pages/engagement-letter/view_letter")),
);

const View_Proposals = Loadable(
  lazy(() => import("../pages/proposals/View_Proposals")),
);

const CreateNewPassWord = Loadable(
  lazy(() => import("../Auth/CreateNewPassword/ActivateUserAccount")),
);
const GettingStarted = Loadable(
  lazy(() => import("../pages/Home/GettingStarted")),
);

const AcceptInvitation = Loadable(
  lazy(() => import("../pages/user/AcceptInvitation")),
);
const AddClient = Loadable(
  lazy(() => import("../pages/prospects/AddUpdateProspects")),
);
const AcceptProposal = Loadable(
  lazy(() => import("../pages/proposals/AcceptDeclineProposal")),
);
const UserRoleList = Loadable(
  lazy(() => import("../pages/Settings/SuperAdmin/User-role/UserRoleList")),
);
const SecurityList = Loadable(
  lazy(() => import("../components/Security/SecurityList")),
);
const SuperAdminEmailTemplateList = Loadable(
  lazy(
    () =>
      import("../pages/Settings/super_admin_email_template/SuperAdminEmailTemplateList"),
  ),
);
const SecurityModel = Loadable(
  lazy(() => import("../components/Security/SecurityModel")),
);
const SecurityLandingPage = Loadable(
  lazy(() => import("../components/Security/SecurityLandingPage")),
);
const SuperAdminEmailTemplateModel = Loadable(
  lazy(
    () =>
      import("../pages/Settings/super_admin_email_template/SuperAdminEmailTemplateModel"),
  ),
);
const NewLoginPage = Loadable(lazy(() => import("../Auth/login/NewLoginPage")));
const NewRegistration = Loadable(
  lazy(() => import("../Auth/registration/NewRegistration")),
);
const NewForgotPage = Loadable(
  lazy(() => import("../Auth/forgot-password/NewForgotPage")),
);
const NewResetPassword = Loadable(
  lazy(() => import("../Auth/ResetPassword/NewResetPassword")),
);
const GenerateContract = Loadable(
  lazy(() => import("../pages/proposals/generate-contract")),
);

const GenerateContractPdfLoader = Loadable(
  lazy(() => import("../components/GeneratePdfloaderpage")),
);

//view ai proposal
const ViewAiProposal = Loadable(
  lazy(() => import("../pages/view-ai-proposal")),
);
//web-based-proposal
const WebBasedProposal = Loadable(
  lazy(() => import("../pages/web-based-proposal")),
);

function AppContent() {
  const {
    loginLoader,
    loader,
    setTopbar,
    prospectName,
    proposalName,
    EngagementName,
    userAccessData,
    hasActionAccess,
    handleReloadClick,
  } = useContext(AuthContextProvider);
  const common = useSelector((state) => state.Storage);
  const location = useLocation();
  // Define the title dynamically based on the current location
  let title = `${OutBooksTitle}`;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const { pathname } = location;
    const currentPathname = pathname; // Store current pathname
    // Check if common.enableEL is not equal to 1
    if (common.enableEL !== 1) {
      // If the current path is "/engagement-letters" or "/add-engagement-letter",
      // go back in history to prevent navigation
      if (
        currentPathname === "/engagement-letters" ||
        currentPathname === "/add-engagement-letter"
      ) {
        navigate(-1); // Go back in history by one step
        return; // Exit early to prevent further checks
      }
    }
    // // Check if userAccessData is available and not null
    // if (!userAccessData) {
    //   // Handle loading state or data fetching here
    //   return;
    // }
    const {
      Dashboard_CanView,
      // Prospect:
      Admin_Prospect_CanView,
      //Proposal :
      Admin_Proposal_CanView,
      //Engagement Latter :
      Admin_Engagement_Latter_CanView,
      //Organisation:
      Organisation_CanView,
      //Organisation:
      User_CanView,
      // Subscription:
      Subscription_CanView,
      //Config Admin:
      Admin_Config_CanView,
      //Config Admin Service Cat:
      Admin_Config_ServiceCat_CanView,
      //Config Admin Global constant:
      Admin_Config_Global_Constant_CanView,
      Admin_Setting_CanView,
      Admin_Config_Email_Template_CanView,
      SuperAdmin_Setting_CanView,
      //Config SuperAdmin:
      SuperAdmin_Config_CanView,
      SuperAdmin_Config_ServiceCat_CanView,
      SuperAdmin_Config_Global_Constant_CanView,
      SuperAdmin_Config_Email_Template_CanView,
    } = userAccessData;
    // Destructure userAccessData only if it's available
    let Admin_Prospect_CanView_New = hasActionAccess(1, 4);
    let Admin_Proposal_CanView_New = hasActionAccess(2, 8);
    let Admin_Engagement_Latter_CanView_New = hasActionAccess(3, 12);
    let Organisation_CanView_New = hasActionAccess(4, 16);
    let User_CanView_New = hasActionAccess(5, 20);
    let Subscription_CanView_New = hasActionAccess(6, 24);
    let Admin_Config_CanView_New = hasActionAccess(7, 28);
    let Admin_Config_ServiceCat_CanView_New = hasActionAccess(19, 76);
    let Admin_Config_Global_Constant_CanView_New = hasActionAccess(20, 80);
    let Admin_Setting_CanView_New = hasActionAccess(9, 36);
    let Admin_Config_Email_Template_CanView_New = hasActionAccess(21, 84);
    let Admin_Activity_Log_CanView_New = hasActionAccess(25, 100);
    let Admin_Setting_Practice_Config_CanView_New = hasActionAccess(24, 96);
    let Admin_Setting_AccessKeyCanView_New = hasActionAccess(23, 92);
    let Admin_Setting_user_CanView_New = hasActionAccess(22, 88);
    let SuperAdmin_Config_CanView_New = hasActionAccess(8, 32);
    let SuperAdmin_Config_ServiceCat_CanView_New = hasActionAccess(14, 56);
    let SuperAdmin_Config_Global_Constant_CanView_New = hasActionAccess(15, 60);
    let SuperAdmin_Config_Email_Template_CanView_New = hasActionAccess(16, 64);
    const Admin_Engagement_Latter_CanAdd = hasActionAccess(3, 9);
    const Admin_Proposal_CanAdd_New = hasActionAccess(2, 5);
    const Admin_Config_Template_CanAdd = hasActionAccess(21, 81);
    const SuperAdmin_Config_Template_CanAdd = hasActionAccess(16, 61);
    // Check user access permissions based on the current pathname
    if (
      (currentPathname === "/" && !Dashboard_CanView) ||
      (currentPathname === "/organisations" && !Organisation_CanView_New) ||
      (currentPathname === "/view-organisations-details" &&
        !Organisation_CanView_New) ||
      (currentPathname === "/invite-user" && !User_CanView_New) ||
      ((currentPathname === "/service-category" ||
        currentPathname === "/services" ||
        currentPathname === "/packages") &&
        !(Admin_Config_CanView_New || SuperAdmin_Config_CanView_New) &&
        (!Admin_Config_ServiceCat_CanView_New ||
          !SuperAdmin_Config_ServiceCat_CanView_New)) ||
      ((currentPathname === "/global-constant" ||
        currentPathname === "/global-pricing-driver") &&
        !(
          (Admin_Config_CanView_New || SuperAdmin_Config_CanView_New) &&
          (Admin_Config_Global_Constant_CanView_New ||
            SuperAdmin_Config_Global_Constant_CanView_New)
        )) ||
      ((currentPathname === "/templates" ||
        currentPathname === "/terms-and-conditions" ||
        currentPathname === "/email-template") &&
        !(
          (Admin_Config_CanView_New || SuperAdmin_Config_CanView_New) &&
          (Admin_Config_Email_Template_CanView_New ||
            SuperAdmin_Config_Email_Template_CanView_New)
        )) ||
      ((currentPathname === "/sub-package" ||
        currentPathname === "/user" ||
        currentPathname === "/invoices") &&
        !Subscription_CanView_New) ||
      (currentPathname === "/super-admin-email-template-list" &&
        !SuperAdmin_Setting_CanView) ||
      ((currentPathname === "/prospects" ||
        currentPathname === "/create-new-client" ||
        currentPathname === "/view-prospects") &&
        !Admin_Prospect_CanView_New) ||
      ((currentPathname === "/proposals" ||
        currentPathname === "/view-proposal") &&
        !Admin_Proposal_CanView_New) ||
      ((currentPathname === "/engagement-letters" ||
        currentPathname === "/view-letter") &&
        !Admin_Engagement_Latter_CanView_New) ||
      (currentPathname === "/activity-logs" &&
        !(Admin_Activity_Log_CanView_New && Admin_Setting_CanView_New)) ||
      ((currentPathname === "/email-config" ||
        currentPathname === "/payment-gateway" ||
        currentPathname === "/pricing-setting") &&
        !(
          Admin_Setting_Practice_Config_CanView_New && Admin_Setting_CanView_New
        )) ||
      (currentPathname === "/access-key" &&
        !(Admin_Setting_AccessKeyCanView_New && Admin_Setting_CanView_New)) ||
      (currentPathname === "/users" &&
        !(Admin_Setting_user_CanView_New && Admin_Setting_CanView_New))
      // ||
      // (currentPathname === "/add-engagement-letter" &&
      //   location?.state?.Action === undefined &&
      //   !Admin_Engagement_Latter_CanAdd) ||
      // (currentPathname === "/add-proposal" &&
      //   location?.state?.Action === undefined &&
      //   !Admin_Proposal_CanAdd_New) ||
      // ((currentPathname === "/add-template" ||
      //   currentPathname === "/add-terms-and-conditions" ||
      //   currentPathname === "/add-email-template") &&
      //   location?.state?.Action === undefined &&
      //   !(Admin_Config_Template_CanAdd && SuperAdmin_Config_Template_CanAdd))
    ) {
      navigate("/"); // Navigate back if the user doesn't have permission
    }
  }, [common.enableEL, userAccessData]);

  useEffect(() => {
    const { pathname } = location;
    const currentPathname = pathname; // Store current pathname
    if (currentPathname == "/view-pdf" && !common.token) {
      navigate("/login");
    }
    if (
      !common.token &&
      currentPathname !== "/dashboard" &&
      currentPathname !== "/generate-contract" &&
      currentPathname !== "/reset-password" &&
      currentPathname !== "/activate" &&
      currentPathname !== "/registration" &&
      currentPathname !== "/accept-invite" &&
      currentPathname !== "/accept-decline-proposal" &&
      currentPathname !== "/security-landing-page" &&
      currentPathname !== "/forget-password" &&
      currentPathname !== "/loader"
    ) {
      setTopbar("none");
      // window.location.href = "https://proposal.outbooks.com";
    }
  }, []);
  // Set the title based on the current location path
  switch (location.pathname) {
    case "/":
      title = "Dashboard | " + title;
      break;
    case "/service-category":
      title = "Categories | " + title;
      break;
    case "/global-constant":
      title = "Configure-global-constant | " + title;
      break;
    case "/global-pricing-driver":
      title = "Configure-global-pricing-driver | " + title;
      break;
    case "/templates":
      title = "Templates | " + title;
      break;
    case "/add-template":
      title = "Templates | " + title;
      break;
    case "/email-template":
      title = "Email-template | " + title;
      break;
    case "/add-email-template":
      title = "Email-template | " + title;
      break;
    case "/get-started":
      title = "Get Started | " + title;
      break;
    case "/create-new-practice":
      title = "Practice | " + title;
      break;
    case "/activate":
      title = "Activate User | " + title;
      break;
    case "/invite-user":
      title = "Invite User | " + title;
      break;
    case "/accept-invite":
      title = "Accept Invitation | " + title;
      break;
    case "/services":
      title = "Services | " + title;
      break;
    case "/packages":
      title = "Packages | " + title;
      break;
    case "/update-practice-details":
      title = "Update Practice | " + title;
      break;
    case "/terms-and-conditions":
      title = "Terms & Conditions | " + title;
      break;
    case "/prospects":
      title = `${prospectName} | ` + title;
      break;
    case "/proposals":
      title = `${proposalName} | ` + title;
      break;
    case "/engagement-letters":
      title = `${EngagementName} | ` + title;
      break;
    case "/add-update-package":
      title = `Package | ` + title;
      break;
    case "/email-config":
      title = `Email Config | ` + title;
      break;
    case "/users":
      title = `Users | ` + title;
      break;
    case "/access-key":
      title = `Access Key | ` + title;
      break;
    case "/organisations":
      title = `Organisations | ` + title;
      break;
    case "/sub-package":
      title = `Subscription | ` + title;
      break;
    case "/invoices":
      title = `Invoice | ` + title;
      break;
    case "/user-role":
      title = `User Role | ` + title;
      break;
    case "/super-admin-email-template-list":
      title = `Email Template | ` + title;
      break;
    case "/user":
      title = `SA - User | ` + title;
      break;
    case "/payment-gateway":
      title = `Payment Gateway | ` + title;
      break;
    case "/xero":
      title = `Xero | ` + title;
      break;
    case "/quick-book":
      title = `Quick Book | ` + title;
      break;
    case "/pricing-setting":
      title = `Pricing | ` + title;
      break;
    case "/fee-inflation":
      title = `Fee Inflation | ` + title;
      break;
    case "/activity-logs":
      title = `Activity Logs | ` + title;
      break;
    case "/mySubscription":
      title = `My Subscription | ` + title;
      break;
    case "/generate-contract":
      setTopbar("none");
      break;
    case "/security":
      title = `Security | ` + title;
      break;
    case "/notification":
      title = `Notification | ` + title;
      break;
    // Add other cases for different routes
    default:
      break;
  }
  document.title = title;
  switch (location.pathname) {
    case "/create-new-practice":
      setTopbar("none");
      break;
    case "/add-template":
      setTopbar("none");
      break;
    case "/add-update-package":
      setTopbar("none");
      break;
    case "/add-terms-and-conditions":
      setTopbar("none");
      break;
    case "/add-email-template":
      setTopbar("none");
      break;
    case "/create-new-client":
      setTopbar("none");
      break;
    case "/accept-invite":
      localStorage.removeItem("userAccess");
      localStorage.removeItem("OrganisationLocalList");
      localStorage.removeItem("userThemeSettingLocalStorage");
      localStorage.removeItem("logoutMilliseconds");
      localStorage.removeItem("subscriptionPlan");
      localStorage.removeItem("accessCount");
      localStorage.clear();
      // handleReloadClick();
      dispatch(resetState());
      setTopbar("none");
      break;
    case "/reset-password":
      localStorage.removeItem("userAccess");
      localStorage.removeItem("OrganisationLocalList");
      localStorage.removeItem("userThemeSettingLocalStorage");
      localStorage.removeItem("logoutMilliseconds");
      localStorage.removeItem("subscriptionPlan");
      localStorage.removeItem("accessCount");
      localStorage.clear();
      // handleReloadClick();
      dispatch(resetState());
      setTopbar("none");
      break;
    case "/activate":
      localStorage.removeItem("userAccess");
      localStorage.removeItem("OrganisationLocalList");
      localStorage.removeItem("userThemeSettingLocalStorage");
      localStorage.removeItem("logoutMilliseconds");
      localStorage.removeItem("subscriptionPlan");
      localStorage.removeItem("accessCount");
      localStorage.clear();
      // handleReloadClick();
      dispatch(resetState());
      setTopbar("none");
      break;
    case "/logout":
      localStorage.removeItem("userAccess");
      localStorage.removeItem("OrganisationLocalList");
      localStorage.removeItem("userThemeSettingLocalStorage");
      localStorage.removeItem("logoutMilliseconds");
      localStorage.removeItem("subscriptionPlan");
      localStorage.removeItem("accessCount");
      localStorage.clear();
      handleReloadClick();
      dispatch(resetState());
      // window.location.reload();
      // window.location.href = "https://proposal.outbooks.com";
      setTopbar("none");
      if (!common.token) {
        navigate("/");
      }
      break;
    case "/dashboard":
      setTopbar("block");
      // localStorage.removeItem("userAccess");
      // localStorage.removeItem("OrganisationLocalList");
      // localStorage.removeItem("userThemeSettingLocalStorage");
      // localStorage.removeItem("logoutMilliseconds");
      // localStorage.removeItem("subscriptionPlan");
      // localStorage.removeItem("accessCount");
      // dispatch(resetState());

      break;
    case "/add-proposal":
      setTopbar("none");
      break;
    case "*":
      if (!common.token) {
        localStorage.removeItem("userAccess");
        localStorage.removeItem("OrganisationLocalList");
        localStorage.removeItem("userThemeSettingLocalStorage");
        localStorage.removeItem("logoutMilliseconds");
        localStorage.removeItem("subscriptionPlan");
        localStorage.removeItem("accessCount");
        localStorage.clear();
        // handleReloadClick();
        dispatch(resetState());
        // window.location.href = "https://proposal.outbooks.com";
      } else {
        // window.location.href = "https://proposal.outbooks.com";
      }
      break;
    case "/":
      if (!common.token) {
        localStorage.removeItem("userAccess");
        localStorage.removeItem("OrganisationLocalList");
        localStorage.removeItem("userThemeSettingLocalStorage");
        localStorage.removeItem("logoutMilliseconds");
        localStorage.removeItem("subscriptionPlan");
        localStorage.removeItem("accessCount");
        localStorage.clear();
        // handleReloadClick();
        dispatch(resetState());
        // window.location.href = "https://proposal.outbooks.com";
      }
      break;
    case "/accept-decline-proposal":
      setTopbar("none");
      break;
    case "/login":
      if (common.token) {
        navigate("/");
      } else {
        setTopbar("none");
        // window.location.href = "https://proposal.outbooks.com";
      }
      break;
    case "/registration":
      if (common.token) {
        navigate("/");
      } else {
        setTopbar("none");
      }
      break;

    case "/forget-password":
      if (common.token) {
        navigate("/");
      } else {
        setTopbar("none");
      }
      break;
    case "/reset-password":
      if (common.token) {
        navigate("/");
      } else {
        setTopbar("none");
      }
      break;
    // Add other cases for different routes
    default:
      break;
  }

  // switch (location.pathname) {
  //   case "/":
  //     if (!userAccessData.Dashboard_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/organisations":
  //     if (!userAccessData.Organisation_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/view-organisations-details":
  //     if (!userAccessData.Organisation_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/invite-user":
  //     if (!userAccessData.User_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/service-category":
  //     if (
  //       !userAccessData.Config_Admin_CanView ||
  //       !userAccessData.Config_Super_Admin_CanView
  //     ) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/services":
  //     if (
  //       !userAccessData.Config_Admin_CanView ||
  //       !userAccessData.Config_Super_Admin_CanView
  //     ) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/packages":
  //     if (
  //       !userAccessData.Config_Admin_CanView ||
  //       !userAccessData.Config_Super_Admin_CanView
  //     ) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/global-constant":
  //     if (
  //       !userAccessData.Config_Admin_CanView ||
  //       !userAccessData.Config_Super_Admin_CanView
  //     ) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/global-pricing-driver":
  //     if (
  //       !userAccessData.Config_Admin_CanView ||
  //       !userAccessData.Config_Super_Admin_CanView
  //     ) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/templates":
  //     if (
  //       !userAccessData.Config_Admin_CanView ||
  //       !userAccessData.Config_Super_Admin_CanView
  //     ) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/terms-and-conditions":
  //     if (
  //       !userAccessData.Config_Admin_CanView ||
  //       !userAccessData.Config_Super_Admin_CanView
  //     ) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/email-template":
  //     if (
  //       !userAccessData.Config_Admin_CanView ||
  //       !userAccessData.Config_Super_Admin_CanView
  //     ) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/sub-package":
  //     if (!userAccessData.subScription_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/user":
  //     if (!userAccessData.subScription_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/invoices":
  //     if (!userAccessData.subScription_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/super-admin-email-template-list":
  //     if (!userAccessData.Config_Super_Admin_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/prospects":
  //     if (!userAccessData.Prospect_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/create-new-client":
  //     if (!userAccessData.Prospect_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/view-prospects":
  //     if (!userAccessData.Prospect_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/proposals":
  //     if (!userAccessData.Proposal_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/add-proposal":
  //     if (!userAccessData.Proposal_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/engagement-letters":
  //     if (!userAccessData.Engagement_Latter_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/view-letter":
  //     if (!userAccessData.Engagement_Latter_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   case "/add-engagement-letter":
  //     if (!userAccessData.Engagement_Latter_CanView) {
  //       navigate(-1);
  //     }
  //     break;
  //   // Add other cases for different routes
  //   default:
  //     navigate("/error"); // Navigate to an error page
  //     break;
  // }
}
// -----------------------------------Routes Component------------------------------------------------
function Index() {
  const common = useSelector((state) => state.Storage);
  const subscriptionPlan = JSON.parse(localStorage.getItem("subscriptionPlan"));
  const {
    loginLoader,
    loader,
    setTopbar,
    prospectName,
    proposalName,
    EngagementName,
  } = useContext(AuthContextProvider);

  return (
    <div id="layout-wrapper">
      <Suspense fallback={<Loader />}>
        <BrowserRouter>
          <>
            <GoogleOAuthProvider clientId="532596605778-uqj3qnojmgk9tlcgvmogb02jsb42psin.apps.googleusercontent.com">
              {loader && <Loader />}
              {loginLoader && <LoginPageLoader />}
              {common.token &&
                common.organisationCount === 0 &&
                common.roleTypeId !== 1 && (
                  <ColorProvider>
                    <Routes>
                      <Route path="*" element={<GettingStarted />} />
                      <Route path="/get-started" element={<GettingStarted />} />
                      <Route
                        path="/create-new-practice"
                        element={<Create_new_practice />}
                      />
                      <Route path="/activate" element={<CreateNewPassWord />} />
                      <Route
                        path="/invite-user"
                        element={<SuperAdminUserList />}
                      />
                      <Route
                        path="/security-landing-page"
                        element={<SecurityLandingPage />}
                      />
                      <Route
                        path="/accept-decline-proposal"
                        element={<AcceptProposal />}
                      />
                      <Route
                        path="/generate-contract"
                        element={<GenerateContract />}
                      />
                      <Route path="/view-pdf" element={<ViewPdf />} />
                      <Route
                        path="/mySubscription"
                        element={<MySubscription />}
                      />
                      {/* <Route path="/accept-invite" element={<AcceptInvitation />} /> */}
                      <Route
                        path="/ChoosePlan"
                        element={<ChoosePlanForPurchase />}
                      />
                    </Routes>
                  </ColorProvider>
                )}

              {common.token &&
                (common.organisationCount > 0 || common.roleTypeId === 1) && (
                  <ColorProvider>
                    <div
                      className={
                        window.innerWidth > 1040
                          ? "app-layout app-layout-clone"
                          : "app-layout"
                      }
                    >
                      {window.innerWidth > 1040 ? (
                        <TopbarClone
                          Email={common.email}
                          moduleName={"DashBoardClone"}
                        />
                      ) : (
                        <Topbar
                          Email={common.email}
                          moduleName={"DashBoardClone"}
                        />
                      )}
                      <div
                        className={
                          window.innerWidth <= 1040
                            ? "page-content"
                            : "main-content"
                        }
                      >
                        <Routes>
                          <Route
                            path="/marketing-reminder"
                            element={<SuperAdminMarketingReminderList />}
                          />
                          <Route path="/WebSetting" element={<Setting />} />
                          <Route path="/AccessKey" element={<Access_Key />} />
                          <Route path="/coupon" element={<CouponsList />} />
                          <Route
                            path="/add-update-marketing-reminder"
                            element={<SuperAdminMarketingReminderAddUpdate />}
                          />
                          <Route path="*" element={<Dashboard />} />
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/logout" element={<Logout />} />
                          <Route
                            path="/StripePaymentSuccess"
                            element={<SuccessPage />}
                          />
                          <Route
                            path="/StripePaymentCanceled"
                            element={<StripePaymentCanceledPage />}
                          />
                          <Route
                            path="/service-category"
                            element={<Service_categories />}
                          />
                          <Route path="/services" element={<Services />} />
                          <Route
                            path="/add-update-service"
                            element={<Add_Category />}
                          />
                          <Route
                            path="/packages"
                            element={<Predefined_Package />}
                          />
                          <Route
                            path="/add-update-package"
                            element={<Add_New_Predefined_Package />}
                          />
                          <Route
                            path="/global-constant"
                            element={<Predefined_Global_Constant />}
                          />
                          <Route
                            path="/global-pricing-driver"
                            element={<Add_New_Pricing_Drivers />}
                          />
                          <Route
                            path="/organisations"
                            element={<Organisations />}
                          />
                          <Route
                            path="/view-organisations-details"
                            element={<ViewOrganisationsDetails />}
                          />

                          <Route
                            path="/update-practice-details"
                            element={<Update_Practice_Details />}
                          />
                          <Route
                            path="/create-new-practice"
                            element={<Create_new_practice />}
                          />
                          <Route
                            path="/templates"
                            element={<Predefined_templates />}
                          />

                          <Route
                            path="/add-template-pdf"
                            element={<Add_New_Templates_Pdf />}
                          />
                          <Route
                            path="/add-template"
                            element={<Add_New_Templates />}
                          />
                          <Route
                            path="/add-template-header-footer"
                            element={<Add_New_Templates_HeaderFooter />}
                          />
                          <Route
                            path="/email-template"
                            element={<Predefined_Email_templates />}
                          />
                          <Route
                            path="/add-email-template"
                            element={<Add_New_Email_Templates />}
                          />

                          <Route
                            path="/terms-and-conditions"
                            element={<Predefined_Term_And_Condition />}
                          />
                          <Route
                            path="/add-terms-and-conditions"
                            element={<Add_New_Term_And_Condition />}
                          />
                          <Route path="/users" element={<Users />} />
                          <Route
                            path="/payment-gateway"
                            element={<Payment_Gateway />}
                          />
                          <Route path="/xero" element={<Xero />} />
                          <Route path="/quickbooks" element={<QuickBook />} />
                          <Route path="/deviation" element={<Deviation />} />
                          <Route
                            path="/activity-logs"
                            element={<Activity_Logs />}
                          />
                          <Route
                            path="/pricing-setting"
                            element={<Pricing_Settings />}
                          />
                          <Route
                            path="/fee-inflation"
                            element={<Fee_Inflation_Page />}
                          />
                          <Route path="/access-key" element={<Access_Keys />} />
                          <Route path="/prospects" element={<Prospects />} />
                          <Route
                            path="/create-new-client"
                            element={<AddClient />}
                          />
                          <Route
                            path="/view-prospects"
                            element={<ViewProspects />}
                          />
                          <Route
                            path="/email-config"
                            element={<Email_Config />}
                          />
                          <Route
                            path="/reminder-Email-Config"
                            element={<SuperAdminEmail_Config />}
                          />
                          <Route
                            path="/add-proposal"
                            element={<Add_New_Proposals />}
                          />
                          <Route path="/proposals" element={<Proposals />} />
                          <Route
                            path="/notification"
                            element={<Notification />}
                          />
                          <Route path="/user" element={<User />} />
                          <Route path="/reminder" element={<ReminderList />} />
                          <Route
                            path="/subscriptionModal"
                            element={<SubscriptionModal />}
                          />
                          <Route
                            path="/pdf-csv-subscriptionModal"
                            element={<PdfToCsvSubscriptionPackageModel />}
                          />
                          <Route
                            path="/pdf-to-csv"
                            element={<PdfToCsvConvertorModel />}
                          />
                          <Route
                            path="/UserSubscriptionTab"
                            element={<UserSubscriptionTab />}
                          />
                          <Route
                            path="/super-admin-reminder-template-list"
                            element={<SuperAdminReminderTemplateList />}
                          />
                          {/* <Route
                        path="/super-admin-reminder-template-list"
                        element={<UserSubscriptionPackageTab />}
                      /> */}

                          <Route
                            path="/add-reminder"
                            element={<AddUpdateReminder />}
                          />

                          <Route
                            path="/update-paid-unpaid-account"
                            element={<UpdateUnPaidAccount />}
                          />

                          <Route
                            path="/AddUpdateSuperAdminReminder"
                            element={<AddUpdateReminder />}
                          />
                          <Route
                            path="/UpdateSuperAdminSubscriptionPackageReminder"
                            element={<UpdateSubscriptionPackageReminder />}
                          />
                          <Route
                            path="/reminder-email-template"
                            element={<ReminderTemplateList />}
                          />
                          <Route
                            path="/add-reminder-template"
                            element={<AddUpdateReminderTemplate />}
                          />

                          <Route
                            path="/add-update-super-admin-reminder-template"
                            element={<AddUpdateSuperAdminReminderTemplate />}
                          />

                          <Route
                            path="/ChoosePlan"
                            element={<ChoosePlanForPurchase />}
                          />
                          <Route
                            path="/sub-package"
                            element={<Subscription_package />}
                          />
                          <Route
                            path="/pdf-csv-sub-package"
                            element={<PdfToCsvSubscription_Package />}
                          />
                          <Route
                            path="/edit_sub_package"
                            element={<Edit_Sub_package />}
                          />
                          <Route path="/invoices" element={<Invoices />} />
                          <Route
                            path="/engagement-letters"
                            element={<Engagement_Letter />}
                          />
                          <Route
                            path="/add-engagement-letter"
                            element={<New_Engagement_Model />}
                          />
                          <Route path="/view-letter" element={<ViewLetter />} />
                          <Route
                            path="/view-proposal"
                            element={<View_Proposals />}
                          />
                          <Route
                            path="/invite-user"
                            element={<SuperAdminUserList />}
                          />
                          <Route
                            path="/activate"
                            element={<CreateNewPassWord />}
                          />
                          {/* <Route path="/user-role" element={<UserRoleList />} /> */}
                          <Route path="/user-role" element={<UserRoleList />} />
                          <Route path="/security" element={<SecurityList />} />
                          <Route
                            path="/security-model"
                            element={<SecurityModel />}
                          />

                          <Route
                            path="/super-admin-email-template-model"
                            element={<SuperAdminEmailTemplateModel />}
                          />
                          <Route
                            path="/super-admin-email-template-list"
                            element={<SuperAdminEmailTemplateList />}
                          />
                          <Route
                            path="/security-landing-page"
                            element={<SecurityLandingPage />}
                          />

                          <Route
                            path="/accept-decline-proposal"
                            element={<AcceptProposal />}
                          />
                          <Route
                            path="/generate-contract"
                            element={<GenerateContract />}
                          />

                          <Route
                            path="/paid-unpaid-list"
                            element={<DeletionReminder />}
                          />

                          <Route
                            path="/subscription-reminder-list"
                            element={<SubscriptionPackageReminder />}
                          />
                          {/* <Route path="/view-pdf/:quoteKeyID" element={<ViewPdf />} /> */}
                          <Route path="/view-pdf" element={<ViewPdf />} />
                          <Route
                            path="/mySubscription"
                            element={<MySubscription />}
                          />
                        </Routes>
                      </div>
                      <AppContent />
                      {subscriptionPlan?.enableAIAgent && <ChatWidget />}
                    </div>
                  </ColorProvider>
                )}

              {!common.token && (
                <ColorProvider>
                  {/* <Topbar Email={common.email} /> */}
                  <Routes>
                    <Route path="/dashboard" element={<DashboardClone />} />
                    <Route
                      path="/loader"
                      element={<GenerateContractPdfLoader />}
                    />
                    <Route
                      path="/accept-invite"
                      element={<AcceptInvitation />}
                    />
                    <Route path="*" element={<NewLoginPage />} />
                    {/* <Route path="/login" element={<Login />} /> */}
                    <Route path="/login" element={<NewLoginPage />} />
                    <Route
                      path="/reset-password"
                      element={<NewResetPassword />}
                    />
                    <Route
                      path="/forget-password"
                      element={<NewForgotPage />}
                    />

                    <Route path="/registration" element={<NewRegistration />} />

                    <Route path="/activate" element={<CreateNewPassWord />} />
                    <Route
                      path="/security-landing-page"
                      element={<SecurityLandingPage />}
                    />
                    <Route
                      path="/accept-decline-proposal"
                      element={<AcceptProposal />}
                    />
                    <Route
                      path="/generate-contract"
                      element={<GenerateContract />}
                    />
                    <Route
                      path="/view-ai-proposal"
                      element={<ViewAiProposal />}
                    />
                    <Route
                      path="/web-based-proposal"
                      element={<WebBasedProposal />}
                    />
                  </Routes>
                </ColorProvider>
              )}

              <AppContent />
            </GoogleOAuthProvider>
          </>
        </BrowserRouter>
      </Suspense>
    </div>
  );
}

export default Index;
