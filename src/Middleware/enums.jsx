export const USER_ROLE_TYPE = {
  SuperAdmin: 1,
  Admin: 2,
};

export const CLIENT_TYPES = {
  Other: null,
  Individual: 1,
  Sole_Trader: 2,
  Partnership: 3,
  LLP: 4,
  Company: 5,
};

export const PDFToCSVToggle = {
  Convertor: 1,
  Upgrade: 2,
  MySubscription: 3,
};

export const ServiceHeader = {
  BasicInformation: 1,
  Description: 2,
  PricingDrivers: 3,
  FeeInflation: 4,
  PricingFormula: 5,
};
export const CREATE_PRACTICE_DETAILS = {
  BasicInformation: 1,
  OfficerDetails: 2,
  OtherInformation: 3,
  ChoosePlan: 4,
};
export const EMAIL_TEMPLATE = {
  All_Variables: null,
  Quote: 5,
  Contract: 6,
  Email_Invite: 7,
  Quote_PDF: 8,
  Contract_Viewed: 9,
  Contract_Accepted: 10,
  Contract_Declined: 11,
  Quote_Accepted: 17,
  Quote_Declined: 18,
  Email_Invite_For_Organisation: 19,
  Quote_AcceptedDeclined_Email_Send_To_Sender: 20,
  Contract_Accepted_Email_Send_To_Sender: 21,
  Contract_Declined_Email_Send_To_Receiver: 22,
  Web_Based_Proposal: 47,
};
export const SUPER_EMAIL_TEMPLATE = {
  SuperAllVariable: null,
  Confirmation_Email: 13,
  Welcome_Email: 14,
  Forget_Password_Email: 15,
  Invite_For_Sign_UP_Email: 12,
  Two_FA: 16,
  SubscriptionPurchase: 39,
  SubscriptionRenew: 40,
  EsignQuotaExceed: 43,
  AccesskeyCreated: 41,
};
export const Template_Type = {
  Quote: 1,
  Contract: 2,
};

export const VAT_Reg = {
  Yes: 1,
  No: 0,
};

export const PackageHeader = {
  BasicInformation: 1,
  SelectServices: 2,
  AdditionalInformation: 3,
  PricingInformation: 4,
};

export const EngagementLetterHeader = {
  BasicInformation: 1,
  SelectServices: 2,
  AdditionalInformation: 3,
  ReviewServices: 4,
  Preview: 5,
  ReviewPackages: 7,
};
export const Payment_Frequency = {
  Yearly: 1,
  HalfYearly: 2,
  Quarterly: 3,
  Monthly: 4,
};
export const ProposalHeader = {
  BasicInformation: 1,
  SelectServices: 2,
  AdditionalInformation: 3,
  Preview: 4,
  SelectPackages: 5,
  ReviewServices: 6,
  ReviewPackages: 7,
};

export const ElementType = {
  HEADING: 1,
  TEXT_BLOCK: 2,
  SERVICE_PRICING_TABLE: 3,
  SERVICE_DESCRIPTION: 4,
  FULL_PAGE_HEADING: 5,
  PAGE_BREAK: 6,
  SIGNATURE_BLOCK: 7,
  STATEMENT_OF_FACTS: 8,
  AWS_PDF_LINK: 9,
  First_Page: 10,
  TermsAndCondition: 11,
};

export const TwoFactor = {
  BasicInformation: 1,
  ShowQrCode: 2,
  AuthenticatorCode: 3,
  RegisterEmail: 4,
  EmailVerification: 5,
};

export const ServiceChargeTypeEnum = {
  Recurring: 1,
  OneOff: 2,
};
export const ChangeDefaultPaymentGatewaysTypes = {
  BankTransfer: 1,
  Stripe: 2,
  GoCardless: 3,
};

export const statusID = {
  Draft: 1,
  Sent: 2,
  Skipped: 3,
  Awaiting_Signature: 4,
  Signed: 5,
  Accepted: 6,
  Declined: 7,
  Void: 8,
  All: 9,
};
export const statusNames = {
  Draft: "draft",
  Sent: "sent",
  Skipped: "skipped",
  Awaiting_Signature: "Viewed_Signature",
  Signed: "completed",
  Accepted: "accepted",
  Declined: "declined",
  All: "all",
  Completed: "completed",
  Pending: "pending",
};

export const CalenderFilterEnum = {
  All: 0,
  This_Week: 1,
  Last_Week: 2,
  This_Month: 3,
  Last_Month: 4,
  This_Quarter: 5,
  Last_Quarter: 6,
  This_6_Months: 7,
  Last_6_Months: 8,
  This_Year: 9,
  Last_Year: 10,
  Custom_Date_Range: 11,
};

export const ActiveDateFilterEnum = {
  Active_In_Last_1_Day: 0,
  Active_In_Last_7_Days: 1,
  Active_In_Last_30_Days: 2,
  Active_In_Last_60_Days: 3,
  Active_In_Last_90_Days: 4,
  Active_In_Last_6_Months: 5,
  Active_In_Last_1_Year: 6,
};

// src/emailTemplates.js
export const EmailTemplates = {
  UnpaidUser_FirstMail: 31,
  UnpaidUser_SecondMail: 32,
  UnpaidUser_ThirdMail: 33,
  UnpaidUser_DeletionMail: 34,
  PaidUser_FirstMail: 35,
  PaidUser_SecondMail: 36,
  PaidUser_ThirdMail: 37,
  Reminder: 38,
  FreePackageOrg_FirstMail: 44,
  FreePackageOrg_SecondMail: 45,
  FreePackageOrg_ThirdMail: 46,
};
export const EmailProviderEnum = {
  BT_Internet: 1,
  Gmail: 2,
  Hotmail: 3,
  Microsoft: 4,
  Microsoft_Exchange_server: 5,
  Office_365: 6,
  Yahoo: 7,
  Other: 8,
};

export const REMINDER_EMAIL_TEMPLATE = {
  QuoteSentTriggerPoint: 23,
  QuoteViewedTriggerPoint: 24,
  QuoteAcceptedTriggerPoint: 25,
  QuoteDeclinedTriggerPoint: 26,
  ContractSentTriggerPoint: 27,
  ContractViewedTriggerPoint: 28,
  ContractSignedTriggerPoint: 29,
  ContractDeclinedTriggerPoint: 30,
};

export const MarketingEmailAddressIdType = {
  EmailAddressID: "EmailAddressID",
  SubscriptionPackageID: "SubscriptionPackageID",
};
export const AppSettingType = {
  UnpaidUser: "Unpaid_Users_Login_To_Outbooks_Warning_Mail",
  paidUser: "Paid_Users_Login_To_Outbooks_Warning_Mail",
};

export const fieldToIdMap = {
  serviceCategory: 1,
  serviceName: 2,
  vatRate: 3,
  vat: 4,
  fees: 5,
  serviceScope: 6,
  feesIncVat: 7,
};

export const servicePackageTypeID = {
  RecurringServiceTypeID: 1,
  OneOffServiceTypeID: 2,
  RecurringPackageTypeID: 3,
  OneOffPackageTypeID: 4,
};

export const VATUpdateTypeID = {
  UpdateAllVAT: 1,
  UpdateDefaultVATOnly: 2,
};
