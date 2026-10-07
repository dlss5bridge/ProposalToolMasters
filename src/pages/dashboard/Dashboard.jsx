import React, { useContext, useEffect, useState } from "react";
import "./Dashboard.css";
import { ColorContext, useColorContext } from "../../AuthContext/ColorContext";
import dayjs from "dayjs";
import DatePicker from "react-date-picker";
import "react-calendar/dist/Calendar.css";
import "react-date-picker/dist/DatePicker.css";
import { useNavigate } from "react-router-dom";
import DraftProposalPng from "../../assets/images/Web Icons Redo/Draft Proposal Icon.svg";
import SentProposalPng from "../../assets/images/Web Icons Redo/Proposal Sent Icon.svg";
import DraftEngagementLatterPng from "../../assets/images/gallery/Draft Engagement Letters icon.svg";
import EngagementLatterSendSvg from "../../assets/images/gallery/Engagement letters sent icon.svg";
import EngagementLatterAwaitingSignatureSvg from "../../assets/images/gallery/Engagement letter Awaiting sign icon.svg";
import EngagementLatterSignedSvg from "../../assets/images/gallery/Engagement letters signed icon.svg";
import EngagementLaterDeclinedSvg from "../../assets/images/gallery/Engagement Letter Declined icon.png";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../../components/Footer";
import { GetOrganisationLookupList } from "../../redux/Services/Master/OrganisationLookupList";
import { updateState } from "../../redux/Persist";
import Select from "react-select";
import { GetActivityLogsList } from "../../redux/Services/Setting/ActivityLogs";
import Utils from "../../Middleware/Utils";
import { DashboardCountList } from "../../redux/Services/Setting/DashBoardCountApi";
import { CalenderFilterEnum, statusID } from "../../Middleware/enums";
import { GetProspectTypeVariationLookupList } from "../../redux/Services/Master/BusinessTypeLookupListApi";
import { GetProposalList } from "../../redux/Services/Proposal/ProposalApi";
import { GetEngagementList } from "../../redux/Services/EngagementLetter/EngagementLetterApi";
import { GetNOBTypeLookupList } from "../../redux/Services/Master/NOBTypeLookupListApi";
import * as XLSX from "xlsx";

const Dashboard = () => {
  const getFilterHeading = (selectedOption) => {
    switch (selectedOption.value) {
      case CalenderFilterEnum.All:
        return "All Records";
      case CalenderFilterEnum.This_Week:
        return "This Week ";
      case CalenderFilterEnum.Last_Week:
        return "Last Week ";
      case CalenderFilterEnum.Last_Week:
        return "Last Week ";
      case CalenderFilterEnum.This_Month:
        return "This Month ";
      case CalenderFilterEnum.Last_Month:
        return "Last Month ";
      case CalenderFilterEnum.This_Quarter:
        return "This Quarter ";
      case CalenderFilterEnum.Last_Quarter:
        return "Last Quarter ";
      case CalenderFilterEnum.This_6_Months:
        return "This 6 Months ";
      case CalenderFilterEnum.Last_6_Months:
        return "Last 6 Months ";
      case CalenderFilterEnum.This_Year:
        return "This Year ";
      case CalenderFilterEnum.Last_Year:
        return "Last Year ";
      case CalenderFilterEnum.Custom_Date_Range:
        return "Custom Date Range ";
      default:
        return "All Records";
    }
  };

  const {
    isMobile,
    setTopbar,
    setLoader,
    accessCount,
    proposalName,
    setListCount,
    prospectName,
    GetCustomDate,
    desktopRecords,
    userAccessData,
    EngagementName,
    setProposalName,
    isMobileRecords,
    setProspectName,
    setOrgLoaderList,
    setEngagementName,
    formatValue,
    maxCountToRecallApi,
    setActiveOrganization,
    getCurrencySymbol,
    setDashboardCountListLoader,
    setDashboardActivityLogLoader,
    loader,
  } = useContext(AuthContextProvider);
  let getActivityLogListApiCallCount = 0;
  let getOrganisationLookupListApiCallCount = 0;
  const { cardBackgroundColor, cardStyle } = useContext(ColorContext);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [currencyID,setCurrencyID] = useState(1);
  const [selectedOption, setSelectedOption] = useState(Utils.CalenderFilter[0]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs().add(0, "day"));
  const [fromDateForFilter, setFromDateForFilter] = useState(null);
  const [toDateForFilter, setToDateForFilter] = useState(null);
  const [fromDateForExport, setFromDateForExport] = useState(null);
  const [toDateForExport, setToDateForExport] = useState(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [organisationsList, setOrganisationsList] = useState([]);
  const [modelRequestData, setModelRequestData] = useState({
    Draft: null,
    Sent: null,
    Accepted: null,
    Decline: null,
    Signed: null,
    Awaited: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [activityLogsList, setActivityLogsList] = useState([]);
  const dispatch = useDispatch();
  const common = useSelector((state) => state.Storage);
  const [dashboardCount, setDashboardCount] = useState([]);

  useEffect(() => {
    GetActivityLog();
    DashboardCountData();
  }, [common.organisationKeyID, common.userKeyID]);

  const getWeekDateRange = () => {
    const startDate = dayjs().subtract(100, "day");
    const endDate = dayjs();
    return { startDate, endDate };
  };

  useEffect(() => {
    if (common.mobileNo === null) {
      setShowUserModal(true);
    }
  }, []);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = year + "-" + month + "-" + day;

  const GetActivityLog = async (i) => {
    if (
      common?.organisationKeyID === "" ||
      common?.organisationKeyID === undefined ||
      common?.userKeyID === "" ||
      common?.userKeyID === undefined
    ) {
      return;
    }
    const pageNoList = i - 1;
    try {
      const data = await GetActivityLogsList({
        pageSize: 4,
        pageNo: 0,
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        fromDate: formattedDate,
        toDate: formattedDate,
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setDashboardActivityLogLoader(true);
          getActivityLogListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const ActivityList = data?.data?.responseData?.data;

            if (pageNoList > 0 && ActivityList.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetActivityLog(newPaneNo);
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setActivityLogsList(ActivityList);
          }
        } else {
          if (getActivityLogListApiCallCount < maxCountToRecallApi) {
            getActivityLogListApiCallCount += 1;
            setTimeout(() => {
              GetActivityLog(i);
            }, 2000);
          } else {
            setDashboardActivityLogLoader(true);
          }
          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
      setDashboardActivityLogLoader(true);
    }
  };
  // const handleExport = async () => {
  //   // Fetch data for export
  //   const data = await DashboardCountData(fromDateForExport, toDateForExport);
  //   // Check if data is fetched successfully
  //   if (data && data.data.statusCode === 200) {
  //     // Check if data contains any records
  //     if (data?.data?.responseData) {
  //       // Extract ProposalListData from the fetched data
  //       const DashboardCountsListData = data?.data?.responseData;
  //       // Get the selected filter option
  //       const selectedFilterValue = selectedOption;
  //       // Get the filter heading
  //       const filterHeading = getFilterHeading(selectedFilterValue);
  //       // Define columns to show based on the condition of common.enableEL
  //       let columnsToShow = {
  //         quotationDraft: `${proposalName} Draft`,
  //         quotationSent: `${proposalName} Sent`,
  //         quotationAwaitingSignature: `${proposalName} Awaiting Response`,
  //         quotationAccepted: `${proposalName} Accepted`,
  //         quotationDeclined: `${proposalName} Decline`,
  //         contractDraft: `${EngagementName} Draft`,
  //         contractSent: `${EngagementName} Sent`,
  //         contractAwaitingSignature: `${EngagementName} Viewed`,
  //         contractSigned: `${EngagementName} Signed`,
  //         contractDeclined: `${EngagementName} Declined`,
  //       };
  //       // Update columns to show based on common.enableEL value
  //       if (common.enableEL === 0) {
  //         columnsToShow = {
  //           quotationDraft: `${proposalName} Draft`,
  //           quotationSent: `${proposalName} Sent`,
  //           quotationAwaitingSignature: `Awaiting Response`,
  //           quotationAccepted: `${proposalName} Accepted`,
  //           quotationDeclined: `${proposalName} Decline`,
  //         };
  //       } else if (common.enableEL === 1) {
  //         columnsToShow = {
  //           quotationDraft: `${proposalName} Draft`,
  //           quotationSent: `${proposalName} Sent`,
  //           contractDraft: `${EngagementName} Draft`,
  //           contractSent: `${EngagementName} Sent`,
  //           contractAwaitingSignature: `${EngagementName} Viewed`,
  //           contractSigned: `${EngagementName} Signed`,
  //           contractDeclined: `${EngagementName} Declined`,
  //         };
  //       }
  //       // Convert DashboardCountsListData to an array of key-value pairs
  //       const dataArray = Object.entries(DashboardCountsListData).flatMap(
  //         ([Key, value]) => {
  //           const rowData = [
  //             { "Column Name": "Practice Name :", Value: orgName },
  //             { "Column Name": "Reporting Period :", Value: filterHeading },
  //             { "Column Name": "", Value: "" },
  //             { "Column Name": "", Value: "" },
  //             ...Object.entries(value)
  //               .filter(([key]) => key in columnsToShow)
  //               .map(([key, val]) => ({
  //                 "Column Name": columnsToShow[key],
  //                 Value: val,
  //               })),
  //           ];
  //           return rowData;
  //         }
  //       );
  //       // Convert dataArray to Excel workbook
  //       const workbook = XLSX.utils.book_new();
  //       const worksheet = XLSX.utils.json_to_sheet(dataArray, {
  //         skipHeader: true,
  //       });

  //       // Calculate column widths
  //       const maxWidths = [0, 0]; // Initialize with two columns
  //       dataArray.forEach(row => {
  //         const columnNameLength = row["Column Name"] ? row["Column Name"].toString().length : 0;
  //         const valueLength = row["Value"] ? row["Value"].toString().length : 0;
  //         maxWidths[0] = Math.max(maxWidths[0], columnNameLength);
  //         maxWidths[1] = Math.max(maxWidths[1], valueLength);
  //       });

  //       // Set column widths
  //       worksheet['!cols'] = maxWidths.map(width => ({ wch: width + 2 })); // Add 2 for padding

  //       XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
  //       // Generate a file name for the Excel file
  //       const fileName = `Dashboard_data_${orgName}_${filterHeading}.xlsx`;
  //       // Save the Excel file
  //       XLSX.writeFile(workbook, fileName);
  //       // Fetch data again to reset page size for subsequent calls
  //       await DashboardCountData(fromDateForExport, toDateForExport);
  //     } else {
  //       // Handle error if data fetching fails
  //       console.error("Failed to fetch data for export");
  //     }
  //   } else {
  //     // Handle error if data fetching fails
  //     console.error("Failed to fetch data for export");
  //   }
  // };
  const handleExport = async () => {
    try {
      let BusinessTypeListData = [];
      const ProspectData = await GetProspectTypeVariationLookupList(
        common.organisationKeyID,
        common.userKeyID
      );
      if (ProspectData?.data?.statusCode === 200) {
        if (ProspectData?.data?.responseData?.data) {
          BusinessTypeListData = ProspectData.data.responseData.data.map(
            (BusinessType) => ({
              value: BusinessType.businessTypeID,
              label: BusinessType.businessTypeName,
            })
          );
        }
      }
      let NoBTypeListData = [];
      const NOBType = await GetNOBTypeLookupList(
        common.organisationKeyID,
        common.userKeyID
      );
      if (NOBType?.data?.statusCode === 200) {
        console.log(NOBType?.data?.responseData?.data);
        if (NOBType?.data?.responseData?.data) {
          NoBTypeListData = NOBType.data.responseData.data.map((NOB) => ({
            value: NOB.businessNatureID,
            label: NOB.businessNatureName,
          }));
        }
      }
      // Fetch data for export
      const data = await DashboardCountData(fromDateForExport, toDateForExport);
      if (data && data.data.statusCode === 200) {
        if (data?.data?.responseData) {
          const DashboardCountsListData = data?.data?.responseData;

          // Define headers dynamically
          const selectedFilterValue = selectedOption;

          const filterHeading = getFilterHeading(selectedFilterValue);
          let OrganisationList = localStorage.getItem("OrganisationLocalList");
          let OrganisationListData = [];
          if (OrganisationList) {
            OrganisationListData = JSON.parse(OrganisationList);
          }
          const orgName =
            OrganisationListData.find(
              (org) => org.organisationKeyID === common.organisationKeyID
            )?.organisationName || "Unknown";

          const headersArray = [
            ["Practice Name", orgName],
            ["Reporting Period", filterHeading],
          ];

          // Define columns dynamically
          const defaultColumns = {
            quotationDraft: `${proposalName} Draft`,
            quotationSent: `${proposalName} Sent`,
            quotationAwaitingSignature: `${proposalName} Awaiting Response`,
            quotationAccepted: `${proposalName} Accepted`,
            quotationDeclined: `${proposalName} Declined`,
          };
          const engagementColumns = {
            contractDraft: `${EngagementName} Draft`,
            contractSent: `${EngagementName} Sent`,
            contractAwaitingSignature: `${EngagementName} Viewed`,
            contractAccepted: `${EngagementName} Accepted`,
            contractSigned: `${EngagementName} Signed`,
            contractDeclined: `${EngagementName} Declined`,
            contractVoid: `${EngagementName} Void`,
          };

          const columnsToShow =
            common.enableEL == 1
              ? { ...defaultColumns, ...engagementColumns }
              : { ...defaultColumns };

          // Map data to rows dynamically
          const baseRows = [];
          for (const [key, value] of Object.entries(DashboardCountsListData)) {
            for (const [subKey, val] of Object.entries(value)) {
              if (subKey in columnsToShow) {
                baseRows.push([columnsToShow[subKey], val]);
              }
            }
          }

          // Convert headers and rows into a 2D array
          headersArray.push([]); // Add an empty row before data
          headersArray.push([]);

          const baseRowsProposal = [];
          const proposalHeader = [
            "Ref Id",
            "Prospect Name",
            "Prospect Type",
            "Nature Of Business",
            "Recurring Price",
            "One Off Price",
            "Status",
            "Last Updated On",
            "Sent On Date",
          ];
          baseRowsProposal.push(proposalHeader);
          baseRowsProposal.push([]);

          const proposalDataResponse = await GetProposalList({
            organisationKeyID: common.organisationKeyID,
            pageSize: 30,
            pageNo: 0,
            userKeyID: common.userKeyID || null,
            fromDate: fromDateForExport === "" ? null : fromDateForExport,
            toDate: toDateForExport === "" ? null : toDateForExport,
          });

          if (proposalDataResponse?.data?.statusCode === 200) {
            const proposalData =
              proposalDataResponse.data.responseData.data || [];
            console.log(proposalData);
            // Define status mappings
            const statusMappings = [
              { id: 1, label: "Draft" },
              { id: 2, label: "Sent" },
            ];

            // Filter and process data for each status
            statusMappings.forEach(({ id, label }) => {
              const filteredData = proposalData.filter(
                (item) => item.statusID === id
              );
              const dataRows = filteredData.map((item) => [
                item.prefix,
                item.clientName,
                item.businessTypeName,
                item.businessNatureName,
                // new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(item.recurringPrice || 0),
                formatValue(item.recurringPrice, 1),
                // new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(item.oneOffPrice || 0),
                formatValue(item.oneOffPrice, 1),
                label,
                item.lastUpdatedOn || "-",
                item.sentOn || "-",
              ]);
              baseRowsProposal.push(...dataRows);
            });
          }

          let baseRowsContract = [];
          let contractHeader = [];
          if (common.enableEL === 1) {
            baseRowsContract = [];
            contractHeader = [
              "Ref Id",
              "Prospect Name",
              "Prospect Type",
              "Nature Of Business",
              "Recurring Price",
              "One Off Price",
              "Status",
              "Last Updated On",
              "Sent On Date",
              "Viewed On Date",
              "Signed On Date",
              "Declined On Date",
            ];
            baseRowsContract.push(contractHeader);
            baseRowsContract.push([]);

            const contractDataResponse = await GetEngagementList({
              organisationKeyID: common.organisationKeyID,
              pageSize: 30,
              pageNo: 0,
              userKeyID: common.userKeyID || null,
              fromDate: fromDateForExport === "" ? null : fromDateForExport,
              toDate: toDateForExport === "" ? null : toDateForExport,
            });
            if (contractDataResponse?.data?.statusCode === 200) {
              const contractData =
                contractDataResponse.data.responseData.data || [];
              console.log(contractData);
              const statusMappings = [
                { id: 1, label: "Draft" },
                { id: 2, label: "Sent" },
                { id: 4, label: "Awaiting Response" },
                { id: 5, label: "Signed" },
                { id: 7, label: "Declined" },
                { id: 8, label: "Void" },
              ];
              statusMappings.forEach(({ id, label }) => {
                const filteredData = contractData.filter(
                  (item) => item.statusID === id
                );
                const dataRows = filteredData.map((item) => [
                  item.prefix,
                  item.clientName,
                  item.businessTypeName,
                  item.businessNatureName,
                  formatValue(item.recurringPrice, 1),
                  formatValue(item.oneOffPrice, 1),
                  label,
                  item.lastUpdatedOn || "-",
                  item.sentOn || "-",
                  item.viewedOn || "-",
                  item.signedOn || "-",
                  item.declinedOn || "-",
                ]);
                baseRowsContract.push(...dataRows);
              });
            }
          }
          // const rowsArray = rows.map((row) => [row["Column Name"], row.Value]);
          const worksheetData = [...headersArray, ...baseRows];
          const worksheetProposalData = [...headersArray, ...baseRowsProposal];
          const worksheetContractData = [...headersArray, ...baseRowsContract];

          // Create Excel worksheet and adjust column widths
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
          const worksheetProposal = XLSX.utils.aoa_to_sheet(
            worksheetProposalData
          );
          const worksheetContract = XLSX.utils.aoa_to_sheet(
            worksheetContractData
          );

          const maxWidths = worksheetData.reduce((widths, row) => {
            row.forEach((cell, i) => {
              const cellValue =
                cell !== null && cell !== undefined ? String(cell) : "";
              widths[i] = Math.max(widths[i] || 0, cellValue.length);
            });
            return widths;
          }, []);
          const maxWidthsProposal = worksheetProposalData.reduce(
            (widths, row) => {
              row.forEach((cell, i) => {
                const cellValue =
                  cell !== null && cell !== undefined ? String(cell) : "";
                widths[i] = Math.max(widths[i] || 0, cellValue.length);
              });
              return widths;
            },
            []
          );
          const maxWidthsContract = worksheetContractData.reduce(
            (widths, row) => {
              row.forEach((cell, i) => {
                const cellValue =
                  cell !== null && cell !== undefined ? String(cell) : "";
                widths[i] = Math.max(widths[i] || 0, cellValue.length);
              });
              return widths;
            },
            []
          );
          worksheet["!cols"] = maxWidths.map((w) => ({ wch: w + 2 }));
          worksheetProposal["!cols"] = maxWidthsProposal.map((w) => ({
            wch: w + 2,
          }));
          worksheetContract["!cols"] = maxWidthsContract.map((w) => ({
            wch: w + 2,
          }));

          XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
          if (common.organisationKeyID) {
            XLSX.utils.book_append_sheet(
              workbook,
              worksheetProposal,
              "Proposal"
            );
            if (common.enableEL === 1) {
              XLSX.utils.book_append_sheet(
                workbook,
                worksheetContract,
                "Engagement Letter"
              );
            }
          }

          // Generate file name
          const fileName = `Dashboard_Data_${orgName}_${filterHeading}.xlsx`;
          XLSX.writeFile(workbook, fileName);

          // Re-fetch data to reset the state
          await DashboardCountData(fromDateForExport, toDateForExport);
        } else {
          console.error("No data available for export");
        }
      } else {
        console.error("Failed to fetch data for export");
      }
    } catch (error) {
      console.error("Error during export:", error);
    }
  };
  const DashboardCountData = async (startDate, endDate, i) => {
    if (
      common?.organisationKeyID === "" ||
      common?.organisationKeyID === undefined ||
      common?.userKeyID === "" ||
      common?.userKeyID === undefined
    ) {
      return;
    }
    setDashboardCount([]);
    // if (startDate !== undefined && endDate !== undefined) {
    //   setLoader(true);
    // }
    setLoader(true);
    try {
      const { startDate: defaultStartDate, endDate: defaultEndDate } =
        getWeekDateRange();
      const StartDate = startDate
        ? startDate.format("YYYY-MM-DD")
        : // : defaultStartDate.format("YYYY-MM-DD");
          null;
      const EndDate = endDate
        ? endDate.format("YYYY-MM-DD")
        : // : defaultEndDate.format("YYYY-MM-DD");
          null;

      const response = await DashboardCountList({
        organisationKeyID: common?.organisationKeyID,
        pageNo: 0,
        pageSize: 30,
        fromDate: StartDate,
        toDate: EndDate,
        userKeyID: common?.userKeyID,
      });

      if (response) {
        if (response?.data?.statusCode === 200) {
          setDashboardCountListLoader(true);
          if (startDate !== undefined && endDate !== undefined) {
            setLoader(false);
          }
          if(response?.data?.responseData?.currencyID) {
            const currency = response?.data?.responseData?.currencyID;
            setCurrencyID(currency);
          } else {
            setCurrencyID(1);
          }
          if (response?.data?.responseData?.data) {
            const DashboardNumb = response?.data?.responseData?.data;
            setDashboardCount(DashboardNumb);
          }
        } else {
          setDashboardCountListLoader(true);
          if (startDate !== undefined && endDate !== undefined) {
            setLoader(false);
          }
          setErrorMessage(response?.data?.errorMessage);
        }
        setTimeout(() => {
          setLoader(false);
        }, 2000);
        return response;
      }
    } catch (error) {
      console.log(error);
      if (startDate !== undefined && endDate !== undefined) {
        setLoader(false);
      }
      setTimeout(() => {
        setLoader(false);
      }, 2000);
      setDashboardCountListLoader(true);
    }
  };

  useEffect(() => {
    let OrganisationLocalList = localStorage.getItem("OrganisationLocalList");
    if (OrganisationLocalList === undefined || OrganisationLocalList === null) {
      GetOrganisationsListData(common.userKeyID);
    } else {
      OrganisationLocalListData();
    }
  }, []);

  const handleCalenderFilterChange = (selectedOption) => {
    const dateFormat = "mm-dd-yyyy";
    setSelectedOption(selectedOption);
    switch (selectedOption.value) {
      case CalenderFilterEnum.All:
        DashboardCountData(null, null);
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.This_Week:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).toDate
        );

        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).fromDate
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).toDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Last_Week:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).toDate
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).fromDate
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).toDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.This_Month:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).toDate
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).toDate,
          setFromDateForFilter(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).fromDate
          ),
          setToDateForFilter(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).toDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Last_Month:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).toDate
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).toDate,
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).toDate
          ),

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).fromDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.This_Quarter:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).toDate
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).fromDate
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).toDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Last_Quarter:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).toDate
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).fromDate
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).toDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.This_6_Months:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).toDate
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).fromDate
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).toDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Last_6_Months:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).toDate
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).fromDate
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).toDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.This_Year:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).toDate
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).fromDate
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).toDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Last_Year:
        const dates = GetCustomDate(dateFormat, selectedOption.value);
        setFromDateForFilter(dates.fromDate);
        setToDateForFilter(dates.toDate);
        setFromDateForExport(dates.fromDate);
        setToDateForExport(dates.toDate);
        DashboardCountData(dates.fromDate, dates.toDate);
        setShowDatePicker(false);
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).fromDate
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).toDate
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).fromDate
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).toDate
          )
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Custom_Date_Range:
        setShowDatePicker(true);
        // Handle custom date range selection, if needed
        break;
      default:
        // Handle default case
        break;
    }
    // DashboardCountData(fromDate, toDate);
  };

  const OrganisationLocalListData = async () => {
    let OrganisationList = localStorage.getItem("OrganisationLocalList");

    if (OrganisationList) {
      // Parse the JSON string to a JavaScript object
      let OrganisationListData = JSON.parse(OrganisationList);
      setOrganisationsList(OrganisationListData);
      const MatchOrganisationKeyID = OrganisationListData.filter(
        (item) => item.organisationKeyID == common.organisationKeyID
      );
      // Check if userThemeSettings is not null or undefined

      // if (OrganisationListData.length === 0) {
      //   localStorage.removeItem("OrganisationLocalList");
      //   localStorage.removeItem("userThemeSettingLocalStorage");
      //   dispatch(resetState());
      //   navigate("/login");
      // }

      let organisationData = [];
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
        JSON.stringify(organisationData.accessList)
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
            })
          );
        }
      }
    }
  };

  const getOrganizationNameByKeyID = (organisationsList, organisationKeyID) => {
    // Find the organization object in the organisationsList array that matches the organisationKeyID
    const organization = organisationsList.find(
      (org) => org.organisationKeyID === organisationKeyID
    );

    // If the organization object is found, return its organisationName
    if (organization) {
      return organization.organisationName;
    }

    // If the organization object is not found, return an empty string or any default value you prefer
    return "";
  };

  // Usage
  const orgName = getOrganizationNameByKeyID(
    organisationsList,
    common.organisationKeyID
  );

  const GetOrganisationsListData = async (KeyID) => {
    try {
      setLoader(true);
      const response = await GetOrganisationLookupList(KeyID);

      if (response?.data?.statusCode === 200) {
        getOrganisationLookupListApiCallCount = 0;
        if (response?.data?.responseData?.data) {
          const totalCount = response.data.totalCount;
          const OrganisationsListData = response.data.responseData.data;
          localStorage.removeItem("OrganisationLocalList");
          localStorage.setItem(
            "OrganisationLocalList",
            JSON.stringify(OrganisationsListData)
          );
          setOrganisationsList(OrganisationsListData);

          let organisationData;
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
          localStorage.setItem(
            "userAccess",
            JSON.stringify(organisationData.accessList)
          );
          setActiveOrganization(organisationData.accessList);

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
              })
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

  const handleActivityLog = () => {
    navigate("/activity-logs");
  };

  useEffect(() => {
    setTopbar("block");
  }, []);

  const handleAddData = (type, proposalValue) => {
    setModelRequestData((prevData) => ({
      ...prevData,
      Draft: type === "Draft" ? proposalValue : null,
      Sent: type === "Sent" ? proposalValue : null,
      Sent: type === "Accepted" ? proposalValue : null,
      Sent: type === "Decline" ? proposalValue : null,
    }));
    const fromDateStr = fromDateForFilter
      ? fromDateForFilter.toISOString()
      : null;
    const toDateStr = toDateForFilter ? toDateForFilter.toISOString() : null;

    const addFilterData = {
      proposalType: proposalValue,
      selectedOption: selectedOption ? selectedOption.value : null,
      fromDate: fromDateStr,
      toDate: toDateStr,
    };
    if (common.organisationKeyID !== null) {
      navigate("/proposals", { state: addFilterData });
    }
  };

  const GetHandleChangeFilter = (type, proposalValue) => {
    setModelRequestData((prevData) => ({
      ...prevData,
      Draft: type === "Draft" ? proposalValue : null,
      Void: type === "Void" ? proposalValue : null,
      Sent: type === "Sent" ? proposalValue : null,
      Accepted: type === "Accepted" ? proposalValue : null,
      Decline: type === "Decline" ? proposalValue : null,
      Signed: type === "Signed" ? proposalValue : null,
      Awaited: type === "Awaiting" ? proposalValue : null,
    }));
    const fromDateStr = fromDateForFilter
      ? fromDateForFilter.toISOString()
      : null;
    const toDateStr = toDateForFilter ? toDateForFilter.toISOString() : null;

    // Create an object containing non-null values
    const addFilterData = {
      proposalType: proposalValue,
      selectedOption: selectedOption || null,
      fromDate: fromDateStr,
      toDate: toDateStr,
    };

    // Navigate to "/add-template" and pass addFilterData as state
    if (common.organisationKeyID !== null) {
      navigate("/engagement-letters", { state: addFilterData });
    }
  };
  const handleFromDateChange = (newValue) => {
    if (dayjs(newValue).isValid()) {
      const newFromDate = dayjs(newValue);
      setFromDate(newFromDate);
      setFromDateForFilter(newFromDate);
      setFromDateForExport(newFromDate);
      if (newFromDate.isAfter(toDate)) {
        const newToDate = newFromDate.add(1, "day");
        setToDate(newToDate);
        setToDateForFilter(newToDate);
        setToDateForExport(newToDate);
      }
      DashboardCountData(newFromDate, toDate);
    }
  };
  const handleToDateChange = (newValue) => {
    if (dayjs(newValue).isValid()) {
      const newToDate = dayjs(newValue);
      setToDate(newToDate);
      setToDateForFilter(newToDate);
      setToDateForExport(newToDate);
      if (newToDate.isBefore(fromDate)) {
        const newFromDate = newToDate.subtract(1, "day");
        setFromDate(newFromDate);
        setFromDateForFilter(newFromDate);
        setFromDateForExport(newFromDate);
      }
      DashboardCountData(fromDate, newToDate);
    }
  };

  const calculateGBPAmount = (onOffValue, recurringValue) => {
    const total = onOffValue + recurringValue;
    const currencySymbol = getCurrencySymbol(currencyID);
    const formatWithCommas = (value) => {
      return new Intl.NumberFormat("en-GB", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(value);
    };

    let formattedAmount;
    if (total >= 1_000_000_000_000) {
      const value = Math.ceil((total / 1_000_000_000_000) * 10) / 10;
      // formattedAmount = `£${formatWithCommas(value)}t`;
      formattedAmount = `${currencySymbol}${formatWithCommas(value)}t`;
    } else if (total >= 1_000_000_000) {
      const value = Math.ceil((total / 1_000_000_000) * 10) / 10;
      // formattedAmount = `£${formatWithCommas(value)}b`;
      formattedAmount = `${currencySymbol}${formatWithCommas(value)}b`;
    } else if (total >= 1_000_000) {
      const value = Math.ceil((total / 1_000_000) * 10) / 10;
      // formattedAmount = `£${formatWithCommas(value)}m`;
      formattedAmount = `${currencySymbol}${formatWithCommas(value)}m`;
    } else if (total >= 1_000) {
      const value = Math.ceil((total / 1_000) * 10) / 10;
      // formattedAmount = `£${formatWithCommas(value)}k`;
      formattedAmount = `${currencySymbol}${formatWithCommas(value)}k`;
    } else {
      formattedAmount = new Intl.NumberFormat(
        currencyID === 3 ? "en-US" : "en-GB", {
        currency: currencyID === 1 ? "GBP" : currencyID === 2 ? "EUR" : currencyID === 3 ? "USD" : "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(total);
    }

    return formattedAmount;
  };

  return (
    <div class="main-content">
      <div class="page-content" style={{ height: "90vh" }}>
        {accessCount === undefined || loader ? (
          <div className="center-screen">
            <div className="text-center">
              <h5 className="mt-4">Loading...</h5>
            </div>
          </div>
        ) : accessCount !== 0 ? (
          <div class="container">
            <div class="col-lg-1">
              <h5 className="page-title-cls mt-2">Dashboard</h5>
            </div>
            <div class="row align-items-center  left-margin">
              <div className="col-lg-6 col-md-8 col-sm-8 ">
                <div>
                  <Select
                    classNamePrefix="app-select"
                    className="user-role-select phone-input-country-code"
                    options={Utils.CalenderFilter}
                    value={selectedOption}
                    onChange={(selectedOption) =>
                      handleCalenderFilterChange(selectedOption)
                    }
                  />
                </div>
              </div>
              {showDatePicker && (
                <>
                  <div className="col-lg-2 col-md-5 col-sm-5 mt-1">
                    <DatePicker
                      label="From Date"
                      value={fromDate.toDate()} // Convert to JavaScript Date object
                      maxDate={toDate.subtract(0, "day").toDate()} // Convert to JavaScript Date object
                      onChange={handleFromDateChange}
                      renderInput={(params) => <input {...params.inputProps} />}
                      popperPlacement="bottom-start"
                    />
                  </div>
                  <div className="col-lg-2 col-md-5 col-sm-5 mt-1">
                    <DatePicker
                      label="To Date"
                      value={toDate.toDate()} // Convert to JavaScript Date object
                      minDate={fromDate.toDate()} // Convert to JavaScript Date object
                      maxDate={dayjs().toDate()} // Convert to JavaScript Date object
                      onChange={handleToDateChange}
                      renderInput={(params) => <input {...params.inputProps} />}
                      popperPlacement="bottom-start"
                    />
                  </div>
                </>
              )}

              <div className="col-lg-6 col-sm-4 mt-1 ">
                <div className="add-new-btn">
                  <button
                    onClick={handleExport}
                    className="btn btn-success create-item-btn add-new"
                  >
                    <span>Export</span>
                  </button>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-6">
                <div className="date-picker-div"></div>
              </div>
            </div>
            <div class="row dashboard-top-class">
              <div class="col">
                <div class="h-100">
                  <div className="dashboard-top" class="row">
                    <div class="col-xl-8 col-lg-8 col-sm-12 ">
                      <div class="row">
                        {/* proposal start */}

                        {(userAccessData.Admin_Proposal_CanView ||
                          common.organisationKeyID == null) && (
                          <>
                            <div
                              className={`col-xl-4 col-lg-4s col-md-4 dashboard-box col-sm-12  ${
                                common.organisationKeyID !== null
                                  ? "cursor-pointer"
                                  : ""
                              } `}
                            >
                              <div className="dashboard-new-design">
                                <div
                                  class="card"
                                  onClick={() =>
                                    handleAddData("Draft", statusID.Draft)
                                  }
                                >
                                  <div
                                    class="card-header p-3 pt-2"
                                    style={cardStyle}
                                  >
                                    <div className="row">
                                      <div className="col-lg-3">
                                        <img
                                          src={DraftProposalPng}
                                          className="CardImage"
                                          alt
                                        />
                                      </div>
                                      <div className="col-lg-9">
                                        <div class="text-end pt-1">
                                          <h5 class="text-white mb-0">
                                            {calculateGBPAmount(
                                              dashboardCount.quotationDraft_AmountOneOff,
                                              dashboardCount.quotationDraft_AmountRecc
                                            )}
                                          </h5>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="text-end pt-1"></div>
                                  </div>
                                  <hr class="dark horizontal my-0" />
                                  <div
                                    class="card-footer p-3 d-flex justify-content-between align-items-center"
                                    style={cardStyle}
                                  >
                                    <p class="mb-0 font-weight-bolder">
                                      <span class="text-success  text-white text-sm font-weight-bolder" />
                                      Draft {proposalName}
                                    </p>
                                    <div class="text-end pt-1">
                                      <h5 class="text-white mb-0">
                                        {dashboardCount?.quotationDraft}
                                      </h5>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                common.organisationKeyID !== null
                                  ? "cursor-pointer"
                                  : ""
                              } `}
                            >
                              <div className="dashboard-new-design">
                                <div
                                  class="card"
                                  onClick={() =>
                                    handleAddData("Sent", statusID.Sent)
                                  }
                                >
                                  <div
                                    class="card-header p-3 pt-2"
                                    style={cardStyle}
                                  >
                                    <div className="row">
                                      <div className="col-lg-3">
                                        <img
                                          src={SentProposalPng}
                                          className="CardImage"
                                          alt
                                        />
                                      </div>
                                      <div className="col-lg-9">
                                        <div class="text-end pt-1">
                                          <h5 class=" text-white  mb-0">
                                            {calculateGBPAmount(
                                              dashboardCount.quotationSent_AmountOneOff,
                                              dashboardCount.quotationSent_AmountRecc
                                            )}
                                          </h5>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="text-end pt-1">
                                      {/* <p class="text-sm mb-0 text-capitalize">Sent</p> */}
                                      {/* <h4 class=" text-white  mb-0">44</h4> */}
                                    </div>
                                  </div>
                                  <hr class="dark horizontal my-0" />
                                  <div
                                    class="card-footer p-3 d-flex justify-content-between align-items-center"
                                    style={cardStyle}
                                  >
                                    <p class="mb-0 font-weight-bolder">
                                      <span class="text-success text-sm font-weight-bolder" />
                                      {proposalName} Sent
                                    </p>
                                    <div class="text-end pt-1">
                                      <h5 class=" text-white  mb-0">
                                        {dashboardCount?.quotationSent}{" "}
                                      </h5>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Proposal Accepted */}

                            <div
                              className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                common.organisationKeyID !== null
                                  ? "cursor-pointer"
                                  : ""
                              } `}
                            >
                              <div className="dashboard-new-design">
                                <div
                                  class="card"
                                  onClick={() =>
                                    handleAddData("Accepted", statusID.Accepted)
                                  }
                                >
                                  <div
                                    class="card-header p-3 pt-2"
                                    style={cardStyle}
                                  >
                                    <div className="row">
                                      <div className="col-lg-3">
                                        <img
                                          src={DraftEngagementLatterPng}
                                          className="CardImage"
                                          alt
                                        />
                                      </div>
                                      <div className="col-lg-9">
                                        <div class="text-end pt-1">
                                          <h5 class="mb-0 text-white ">
                                            {calculateGBPAmount(
                                              dashboardCount.quotationAccepted_AmountOneOff,
                                              dashboardCount.quotationAccepted_AmountRecc
                                            )}
                                          </h5>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="text-end pt-1"></div>
                                  </div>
                                  <hr class="dark horizontal my-0" />
                                  <div
                                    class="card-footer p-3 d-flex justify-content-between align-items-center"
                                    style={cardStyle}
                                  >
                                    <p class="mb-0 font-weight-bolder">
                                      <span class="text-success text-sm font-weight-bolder" />
                                      {proposalName} Accepted
                                    </p>
                                    <div class="text-end pt-1">
                                      <h5 class="mb-0 text-white ">
                                        {dashboardCount?.quotationAccepted}{" "}
                                      </h5>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* proposal start */}
                            {(common.enableEL == 0 ||
                              common.enableEL == null) && (
                              <>
                                <div
                                  className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                    common.organisationKeyID !== null
                                      ? "cursor-pointer"
                                      : ""
                                  } `}
                                >
                                  <div className="dashboard-new-design">
                                    <div
                                      class="card"
                                      onClick={() =>
                                        handleAddData(
                                          "Sent",
                                          statusID.Awaiting_Signature
                                        )
                                      }
                                    >
                                      <div
                                        class="card-header p-3 pt-2"
                                        style={cardStyle}
                                      >
                                        <div className="row">
                                          <div className="col-lg-3">
                                            <img
                                              src={DraftEngagementLatterPng}
                                              className="CardImage"
                                              alt
                                            />
                                          </div>
                                          <div className="col-lg-9">
                                            <div class="text-end pt-1">
                                              <h5 class="mb-0 text-white ">
                                                {calculateGBPAmount(
                                                  dashboardCount.quotationAwaitingSignatureEnd_AmountOneOff,
                                                  dashboardCount.quotationAwaitingSignatureEnd_AmountRecc
                                                )}
                                              </h5>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="text-end pt-1"></div>
                                      </div>
                                      <hr class="dark horizontal my-0" />
                                      <div
                                        class="card-footer p-3 d-flex justify-content-between align-items-center"
                                        style={cardStyle}
                                      >
                                        <p class="mb-0 font-weight-bolder">
                                          <span class="text-success text-sm font-weight-bolder" />
                                          Awaiting Response
                                        </p>
                                        <div class="text-end pt-1">
                                          <h5 class="mb-0 text-white ">
                                            {dashboardCount?.quotationAccepted}{" "}
                                          </h5>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                            {(common.enableEL == 0 ||
                              common.enableEL == null) && (
                              <>
                                {/* <div
                                  className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                    common.organisationKeyID !== null
                                      ? "cursor-pointer"
                                      : ""
                                  } `}
                                >
                                  <div className="dashboard-new-design">
                                    <div
                                      class="card"
                                      onClick={() =>
                                        handleAddData(
                                          "Accepted",
                                          statusID.Accepted
                                        )
                                      }
                                    >
                                      <div
                                        class="card-header p-3 pt-2"
                                        style={cardStyle}
                                      >
                                        <div className="row">
                                          <div className="col-lg-6">
                                            <img
                                              src={DraftEngagementLatterPng}
                                              className="CardImage"
                                              alt
                                            />
                                          </div>
                                          <div className="col-lg-6">
                                            <div class="text-end pt-1">
                                              <h4 class="mb-0 text-white ">
                                                {
                                                  dashboardCount?.quotationAccepted
                                                }{" "}
                                              </h4>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="text-end pt-1"></div>
                                      </div>
                                      <hr class="dark horizontal my-0" />
                                      <div
                                        class="card-footer p-3"
                                        style={cardStyle}
                                      >
                                        <p class="mb-0 font-weight-bolder">
                                          <span class="text-success text-sm font-weight-bolder" />
                                          {proposalName} Accepted
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div> */}

                                <div
                                  className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                    common.organisationKeyID !== null
                                      ? "cursor-pointer"
                                      : ""
                                  } `}
                                >
                                  <div className="dashboard-new-design">
                                    <div
                                      class="card"
                                      onClick={() =>
                                        handleAddData(
                                          "Decline",
                                          statusID.Declined
                                        )
                                      }
                                    >
                                      <div
                                        class="card-header p-3 pt-2"
                                        style={cardStyle}
                                      >
                                        <div className="row">
                                          <div className="col-lg-3">
                                            <img
                                              src={EngagementLatterSendSvg}
                                              className="CardImage"
                                              alt
                                            />
                                          </div>
                                          <div className="col-lg-9">
                                            <div class="text-end pt-1">
                                              <h5 class="mb-0 text-white ">
                                                {calculateGBPAmount(
                                                  dashboardCount.quotationDeclined_AmountOneOff,
                                                  dashboardCount.quotationDeclined_AmountRecc
                                                )}
                                              </h5>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="text-end pt-1"></div>
                                      </div>
                                      <hr class="dark horizontal my-0" />
                                      <div
                                        class="card-footer p-3 d-flex justify-content-between align-items-center"
                                        style={cardStyle}
                                      >
                                        <p class="mb-0 font-weight-bolder">
                                          <span class="text-success text-sm font-weight-bolder" />
                                          {proposalName} Declined
                                        </p>
                                        <div class="text-end pt-1">
                                          <h5 class="mb-0 text-white ">
                                            {dashboardCount?.quotationDeclined}
                                          </h5>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                      {/* proposal end  */}

                      {/* engagement start */}
                      <div className="row">
                        {(common.enableEL == 1 || common.enableEL == null) &&
                          (userAccessData.Admin_Engagement_Latter_CanView ||
                            common.organisationKeyID == null) && (
                            <>
                              <div
                                className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                  common.organisationKeyID !== null
                                    ? "cursor-pointer"
                                    : ""
                                } `}
                              >
                                <div className="dashboard-new-design">
                                  <div
                                    class="card"
                                    onClick={() =>
                                      GetHandleChangeFilter(
                                        "Draft",
                                        statusID.Draft
                                      )
                                    }
                                  >
                                    <div
                                      class="card-header p-3 pt-2"
                                      style={cardStyle}
                                    >
                                      <div className="row">
                                        <div className="col-lg-3">
                                          <img
                                            src={EngagementLatterSendSvg}
                                            className="CardImage"
                                            alt
                                          />
                                        </div>
                                        <div className="col-lg-9">
                                          <div class="text-end pt-1">
                                            <h5 class="mb-0 text-white ">
                                              {calculateGBPAmount(
                                                dashboardCount.contractDraft_AmountOneOff,
                                                dashboardCount.contractDraft_AmountRecc
                                              )}
                                            </h5>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="text-end pt-1"></div>
                                    </div>
                                    <hr class="dark horizontal my-0" />
                                    <div
                                      className="card-footer p-3 d-flex justify-content-between align-items-center"
                                      style={cardStyle}
                                    >
                                      <p className="mb-0 font-weight-bolder">
                                        <span className="text-success text-sm font-weight-bolder"></span>
                                        Draft {EngagementName}
                                      </p>
                                      <div class="text-end pt-1">
                                        <h5 class="mb-0 text-white ">
                                          {dashboardCount?.contractDraft}
                                        </h5>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Void EL hidden */}
                              {dashboardCount?.contractVoid > 0 && (                
                              <div
                                className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                  common.organisationKeyID !== null
                                    ? "cursor-pointer"
                                    : ""
                                } `}
                              >
                                <div className="dashboard-new-design">
                                  <div
                                    class="card"
                                    onClick={() =>
                                      GetHandleChangeFilter(
                                        "Void",
                                        statusID.Void
                                      )
                                    }
                                  >
                                    <div
                                      class="card-header p-3 pt-2"
                                      style={cardStyle}
                                    >
                                      <div className="row">
                                        <div className="col-lg-6">
                                          <img
                                            src={EngagementLatterSignedSvg}
                                            className="CardImage"
                                            alt
                                          />
                                        </div>
                                        <div className="col-lg-6">
                                          <div class="text-end pt-1">
                                            <h4 class="mb-0 text-white ">
                                              {" "}
                                              {dashboardCount?.contractVoid}
                                            </h4>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="text-end pt-1"></div>
                                    </div>
                                    <hr class="dark horizontal my-0" />
                                    <div
                                      class="card-footer p-3"
                                      style={cardStyle}
                                    >
                                      <p class="mb-0 font-weight-bolder">
                                        <span class="text-success text-sm font-weight-bolder" />
                                        Void {EngagementName}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              )}

                              <div
                                className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                  common.organisationKeyID !== null
                                    ? "cursor-pointer"
                                    : ""
                                } `}
                              >
                                <div className="dashboard-new-design">
                                  <div
                                    class="card"
                                    onClick={() =>
                                      GetHandleChangeFilter(
                                        "sent",
                                        statusID.Sent
                                      )
                                    }
                                  >
                                    <div
                                      class="card-header p-3 pt-2"
                                      style={cardStyle}
                                    >
                                      <div className="row">
                                        <div className="col-lg-3">
                                          <img
                                            src={EngagementLatterSendSvg}
                                            className="CardImage"
                                            alt
                                          />
                                        </div>
                                        <div className="col-lg-9">
                                          <div class="text-end pt-1">
                                            <h5 class="mb-0 text-white ">
                                              {calculateGBPAmount(
                                                dashboardCount.contractSent_AmountOneOff,
                                                dashboardCount.contractSent_AmountRecc
                                              )}
                                            </h5>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="text-end pt-1"></div>
                                    </div>
                                    <hr class="dark horizontal my-0" />
                                    <div
                                      class="card-footer p-3 d-flex justify-content-between align-items-center"
                                      style={cardStyle}
                                    >
                                      <p class="mb-0 font-weight-bolder">
                                        <span class="text-success text-sm font-weight-bolder" />
                                        {EngagementName} Sent
                                      </p>
                                      <div class="text-end pt-1">
                                        <h5 class="mb-0 text-white ">
                                          {dashboardCount?.contractSent}
                                        </h5>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* EL viewed hidden */}

                              {/* <div
                                    className={`col-xl-3 col-lg-3 col-md-4 dashboard-box col-sm-12  ${common.organisationKeyID !== null
                                      ? "cursor-pointer"
                                      : ""
                                      } `}
                                  >
                                    <div className="dashboard-new-design">
                                      <div
                                        class="card"
                                        onClick={() =>
                                          GetHandleChangeFilter(
                                            "Awaiting",
                                            statusID.Awaiting_Signature
                                          )
                                        }
                                      >
                                        <div
                                          class="card-header p-3 pt-2"
                                          style={cardStyle}
                                        >
                                          <div className="row">
                                            <div className="col-lg-6">
                                              <img
                                                src={
                                                  EngagementLatterAwaitingSignatureSvg
                                                }
                                                className="CardImage"
                                                alt
                                              />
                                            </div>
                                            <div className="col-lg-6">
                                              <div class="text-end pt-1">
                                                <h4 class="mb-0 text-white ">
                                                  {
                                                    dashboardCount?.contractAwaitingSignature
                                                  }
                                                </h4>
                                              </div>
                                            </div>
                                          </div>

                                          <div class="text-end pt-1"></div>
                                        </div>
                                        <hr class="dark horizontal my-0" />
                                        <div
                                          class="card-footer p-3"
                                          style={cardStyle}
                                        >
                                          <p class="mb-0 font-weight-bolder">
                                            <span class="text-success text-sm font-weight-bolder" />
                                            {EngagementName} Viewed
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div> */}

                              <div
                                className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                  common.organisationKeyID !== null
                                    ? "cursor-pointer"
                                    : ""
                                } `}
                              >
                                <div className="dashboard-new-design">
                                  <div
                                    class="card"
                                    onClick={() =>
                                      GetHandleChangeFilter(
                                        "Signed",
                                        statusID.Signed
                                      )
                                    }
                                  >
                                    <div
                                      class="card-header p-3 pt-2"
                                      style={cardStyle}
                                    >
                                      <div className="row">
                                        <div className="col-lg-3">
                                          <img
                                            src={EngagementLatterSignedSvg}
                                            className="CardImage"
                                            alt
                                          />
                                        </div>
                                        <div className="col-lg-9">
                                          <div class="text-end pt-1">
                                            <h5 class="mb-0 text-white ">
                                              {calculateGBPAmount(
                                                dashboardCount.contractSigned_AmountOneOff,
                                                dashboardCount.contractSigned_AmountRecc
                                              )}
                                            </h5>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="text-end pt-1"></div>
                                    </div>
                                    <hr class="dark horizontal my-0" />
                                    <div
                                      class="card-footer p-3 d-flex justify-content-between align-items-center"
                                      style={cardStyle}
                                    >
                                      <p class="mb-0 font-weight-bolder">
                                        <span class="text-success text-sm font-weight-bolder" />
                                        {EngagementName} Signed
                                      </p>

                                      <div class="text-end pt-1">
                                        <h5 class="mb-0 text-white ">
                                          {" "}
                                          {dashboardCount?.contractSigned}
                                        </h5>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div
                                className={`col-xl-4 col-lg-4 col-md-4 dashboard-box col-sm-12  ${
                                  common.organisationKeyID !== null
                                    ? "cursor-pointer"
                                    : ""
                                } `}
                              >
                                <div className="dashboard-new-design">
                                  <div
                                    class="card"
                                    onClick={() =>
                                      GetHandleChangeFilter(
                                        "Decline",
                                        statusID.Declined
                                      )
                                    }
                                  >
                                    <div
                                      class="card-header p-3 pt-2"
                                      style={cardStyle}
                                    >
                                      <div className="row">
                                        <div className="col-lg-3">
                                          <img
                                            src={EngagementLaterDeclinedSvg}
                                            className="CardImage"
                                            alt
                                          />
                                        </div>
                                        <div className="col-lg-9">
                                          <div class="text-end pt-1">
                                            <h4 class="mb-0 text-white ">
                                              {calculateGBPAmount(
                                                dashboardCount.contractDeclined_AmountOneOff,
                                                dashboardCount.contractDeclined_AmountRecc
                                              )}
                                            </h4>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="text-end pt-1"></div>
                                    </div>
                                    <hr class="dark horizontal my-0" />
                                    <div
                                      class="card-footer p-3 d-flex justify-content-between align-items-center"
                                      style={cardStyle}
                                    >
                                      <p
                                        class="mb-0 font-weight-bolder"
                                        style={{ fontSize: "0.9rem" }}
                                      >
                                        <span class="text-success text-sm font-weight-bolder" />
                                        {EngagementName} Declined
                                      </p>
                                      <div class="text-end pt-1">
                                        <h5 class="mb-0 text-white ">
                                          {dashboardCount?.contractDeclined}
                                        </h5>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                      </div>
                    </div>
                    {(userAccessData.Admin_Activity_Log_CanView ||
                      common.organisationKeyID == null) && (
                      <>
                        <div class="col-xl-4 col-lg-4 pb-2">
                          <div class="card activity-section-cls">
                            <div class="card-body dashboard-body">
                              <h5 className="activity-cls">Activity</h5>
                              <ol class="activity-feed">
                                {activityLogsList.length == 0 ? (
                                  <>
                                    <h6 className="activity-cls">
                                      No Activity Logs Found Today..
                                    </h6>
                                  </>
                                ) : (
                                  <>
                                    {activityLogsList?.map(
                                      (ActivityLogList) => {
                                        return (
                                          <>
                                            <li class="feed-item">
                                              <div class="feed-item-list">
                                                <span
                                                  style={{ color: "black" }}
                                                >
                                                  {ActivityLogList.logDateTime}
                                                </span>
                                                <br />

                                                <span
                                                  class="activity-text"
                                                  style={{
                                                    color: "blue",
                                                    cursor: "pointer",
                                                  }}
                                                  onClick={() => {
                                                    navigate(
                                                      `/${ActivityLogList?.moduleURL}`
                                                    );
                                                  }}
                                                >
                                                  {ActivityLogList.logMessage
                                                    ?.replace(
                                                      /quotation/g,
                                                      proposalName
                                                    )
                                                    ?.replace(
                                                      /client/g,
                                                      prospectName
                                                    )
                                                    ?.replace(
                                                      /contract/g,
                                                      EngagementName
                                                    )}
                                                </span>
                                              </div>
                                            </li>
                                          </>
                                        );
                                      }
                                    )}
                                  </>
                                )}
                              </ol>
                              <>
                                {" "}
                                <div className="col-lg-12 col-md-12 col-sm-12 text-center">
                                  <div className="add-new-btn">
                                    <button
                                      className="btn btn-success create-item-btn add-new"
                                      onClick={handleActivityLog}
                                    >
                                      <span>View All</span>
                                    </button>
                                  </div>
                                </div>
                              </>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div class="row dashboard-top-class">
              <div class="col">
                <div class="h-100">
                  <div class="container">
                    <div class="row">
                      <div class="col-md-12 " style={{ textAlign: "center" }}>
                        <div class="error-template">
                          <h1>Oops!</h1>
                          <h2>No Permission </h2>
                          <div class="error-details">
                            Sorry, No Permission , Please Contact Admin!
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {/* <!-- container-fluid --> */}
      </div>
      {/* <!-- End Page-content --> */}

      <Footer />
    </div>
  );
};

export default Dashboard;
