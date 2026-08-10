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

const NewDashboard = () => {
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
    GetOnlyDate,
  } = useContext(AuthContextProvider);
  let getActivityLogListApiCallCount = 0;
  let getOrganisationLookupListApiCallCount = 0;
  const { TopbarStyle, cardStyle, cardBgColor } = useContext(ColorContext);
  // console.log(cardBgColor);
  const [isHoveredTrue, setIsHoveredTrue] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [currencyID, setCurrencyID] = useState(1);
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
  // const hoverStyle = {
  //   backgroundColor: isHoveredTrue ? "#5a2eca" : cardStyle.color,
  //   color: isHoveredTrue ? "#fff" : "inherit",
  // };
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
        common.userKeyID,
      );
      if (ProspectData?.data?.statusCode === 200) {
        if (ProspectData?.data?.responseData?.data) {
          BusinessTypeListData = ProspectData.data.responseData.data.map(
            (BusinessType) => ({
              value: BusinessType.businessTypeID,
              label: BusinessType.businessTypeName,
            }),
          );
        }
      }
      let NoBTypeListData = [];
      const NOBType = await GetNOBTypeLookupList(
        common.organisationKeyID,
        common.userKeyID,
      );
      if (NOBType?.data?.statusCode === 200) {
        // console.log(NOBType?.data?.responseData?.data);
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
              (org) => org.organisationKeyID === common.organisationKeyID,
            )?.organisationName || "Unknown";

          const headersArray = [
            ["Practice Name", orgName],
            ["Reporting Period", filterHeading],
          ];

          // Define columns dynamically
          const defaultColumns = {
            quotationDraft: `${proposalName} Draft`,
            quotationSent: `${proposalName} Sent`,
            // quotationSkipped: `${proposalName} Skipped`,
            // quotationAwaitingSignature: `${proposalName} Awaiting Response`,
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
              if (subKey in columnsToShow && val > 0) {
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
            "Drafted On Date",
            "Sent On Date",
            "Accepted On Date",
            "Declined On Date",
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
            // console.log(proposalData);
            // Define status mappings
            const statusMappings = [
              { id: 1, label: "Draft" },
              { id: 2, label: "Sent" },
              { id: 6, label: "Accepted" },
              { id: 7, label: "Declined" },
            ];

            // Filter and process data for each status
            statusMappings.forEach(({ id, label }) => {
              const filteredData = proposalData.filter(
                (item) => item.statusID === id,
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
                item.lastUpdatedOn ||
                  item.acceptDeclineDate ||
                  item.sentOn ||
                  item.createdOn ||
                  "-",
                item.createdOn || "-",
                item.statusID !== 1 && item.statusID !== 3 ? item.sentOn : "-",
                item.statusID === 6 ? item.acceptDeclineDate : "-",
                item.statusID === 7 ? item.acceptDeclineDate : "-",
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
              "Drafted On Date",
              "Sent On Date",
              "Viewed On Date",
              "Signed On Date",
              "Declined On Date",
              "Void On Date",
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
              // console.log(contractData);
              const statusMappings = [
                { id: 1, label: "Draft" },
                { id: 2, label: "Sent" },
                { id: 4, label: "Viewed" },
                { id: 5, label: "Signed" },
                { id: 7, label: "Declined" },
                { id: 8, label: "Void" },
              ];
              statusMappings.forEach(({ id, label }) => {
                const filteredData = contractData.filter(
                  (item) => item.statusID === id,
                );
                const dataRows = filteredData.map((item) => [
                  item.prefix,
                  item.clientName,
                  item.businessTypeName,
                  item.businessNatureName,
                  formatValue(item.recurringPrice, 1),
                  formatValue(item.oneOffPrice, 1),
                  label,
                  item.lastUpdatedOn
                    ? item.lastUpdatedOn
                    : item.statusID === 5
                      ? GetOnlyDate(item.signedOn)
                      : (item.declinedOn ??
                        item.viewedOn ??
                        item.sentOn ??
                        item.createdOn ??
                        "-"),
                  item.createdOn || "-",
                  item.sentOn || "-",
                  item.viewedOn || "-",
                  item.statusID === 5 ? GetOnlyDate(item.signedOn) : "-",
                  item.statusID === 7 ? item.declinedOn : "-",
                  item.statusID === 8 ? item.lastUpdatedOn : "-",
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
            worksheetProposalData,
          );
          const worksheetContract = XLSX.utils.aoa_to_sheet(
            worksheetContractData,
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
            [],
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
            [],
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
              "Proposal",
            );
            if (common.enableEL === 1) {
              XLSX.utils.book_append_sheet(
                workbook,
                worksheetContract,
                "Engagement Letter",
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
          if (response?.data?.responseData?.currencyID) {
            dispatch(
              updateState({
                currency: getCurrencySymbol(
                  response?.data?.responseData?.currencyID,
                ),
              }),
            );
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
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).toDate,
        );

        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).fromDate,
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Week).toDate,
          ),
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Last_Week:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).toDate,
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).fromDate,
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Week).toDate,
          ),
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.This_Month:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).toDate,
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).toDate,
          setFromDateForFilter(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).fromDate,
          ),
          setToDateForFilter(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Month).toDate,
          ),
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Last_Month:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).toDate,
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).toDate,
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).toDate,
          ),

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Month).fromDate,
          ),
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.This_Quarter:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).toDate,
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).fromDate,
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Quarter).toDate,
          ),
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Last_Quarter:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).toDate,
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).fromDate,
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Quarter).toDate,
          ),
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.This_6_Months:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).toDate,
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months)
              .fromDate,
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_6_Months).toDate,
          ),
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.Last_6_Months:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).toDate,
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months)
              .fromDate,
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_6_Months).toDate,
          ),
        );
        setShowDatePicker(false);
        break;
      case CalenderFilterEnum.This_Year:
        setFromDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).toDate,
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).fromDate,
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.This_Year).toDate,
          ),
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
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).fromDate,
        );
        setToDateForFilter(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).toDate,
        );
        DashboardCountData(
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).fromDate,
          GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).toDate,

          setFromDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).fromDate,
          ),
          setToDateForExport(
            GetCustomDate(dateFormat, CalenderFilterEnum.Last_Year).toDate,
          ),
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
        (item) => item.organisationKeyID == common.organisationKeyID,
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
              currency: getCurrencySymbol(organisationData.currencyID),
            }),
          );
        }
      }
    }
  };

  const getOrganizationNameByKeyID = (organisationsList, organisationKeyID) => {
    // Find the organization object in the organisationsList array that matches the organisationKeyID
    const organization = organisationsList.find(
      (org) => org.organisationKeyID === organisationKeyID,
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
    common.organisationKeyID,
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
            JSON.stringify(OrganisationsListData),
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
            JSON.stringify(organisationData.accessList),
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
      // Skipped: type === "Skipped" ? proposalValue : null
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
        currencyID === 3 ? "en-US" : "en-GB",
        {
          style: "currency",
          currency:
            currencyID === 1
              ? "GBP"
              : currencyID === 2
                ? "EUR"
                : currencyID === 3
                  ? "USD"
                  : "INR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        },
      ).format(total);
    }

    return formattedAmount;
  };

  return (
    // <div className= {(isMobile || window.innerWidth <= 1040) ? "page-content" : "main-content"}>
    <div class="container mt-3 pb-3">
      <div style={{ maxWidth: "1400px" }}>
        {accessCount === undefined || loader ? (
          <div className="center-screen">
            <div className="text-center">
              <h5 className="mt-4">Loading...</h5>
            </div>
          </div>
        ) : accessCount !== 0 ? (
          <div class="container">
            <div class="row">
              <div className="dashboard-header-wrap col-lg-8 col-md-8 col-sm-12">
                <div className="dashboard-header" style={TopbarStyle}>
                  <div className="row align-items-center gx-3">
                    {/* Left: Title */}
                    <div className="col-auto">
                      <div className="dashboard-title">
                        <h5 className="page-title-cls mb-0">Dashboard</h5>
                        <div className="dashboard-sub">
                          Here is the overview
                        </div>
                      </div>
                    </div>

                    {/* Right: Filters + Export */}
                    <div className="col-auto ms-auto">
                      <div className="d-flex align-items-center justify-content-end header-controls">
                        {/* Select (react-select) */}
                        <div
                          className="me-2 select-wrap"
                          style={{ minWidth: "300px" }}
                        >
                          <Select
                            className="user-role-select phone-input-country-code text-black"
                            options={Utils.CalenderFilter}
                            value={selectedOption}
                            onChange={(selectedOption) =>
                              handleCalenderFilterChange(selectedOption)
                            }
                            isSearchable={false}
                          />
                        </div>

                        {/* Date pickers (optional) */}
                        {/* {showDatePicker && (
                            <div className="date-wrap">
                              <div className="me-2">
                                <DatePicker
                                  label="From Date"
                                  value={fromDate.toDate()}
                                  maxDate={toDate.subtract(0, "day").toDate()}
                                  onChange={handleFromDateChange}
                                  renderInput={(params) => <input style={{color: "black"}} {...params.inputProps} />}
                                  popperPlacement="bottom-start"
                                />
                              </div>
                              <div>
                                <DatePicker
                                  label="To Date"
                                  value={toDate.toDate()}
                                  minDate={fromDate.toDate()}
                                  maxDate={dayjs().toDate()}
                                  onChange={handleToDateChange}
                                  renderInput={(params) => <input {...params.inputProps} />}
                                  popperPlacement="bottom-start"
                                />
                              </div>
                            </div>
                          )} */}

                        {/* Export button */}
                        <div className="ms-auto">
                          <button
                            onClick={handleExport}
                            className="btn export-btn"
                            type="button"
                          >
                            Export
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {showDatePicker && (
                <>
                  <div className="col-lg-6 col-md-6 col-sm-12 d-flex align-items-center gap-3 mt-2">
                    <DatePicker
                      label="From Date"
                      value={fromDate.toDate()}
                      maxDate={toDate.subtract(0, "day").toDate()}
                      onChange={handleFromDateChange}
                      renderInput={(params) => (
                        <input
                          style={{ color: "black" }}
                          {...params.inputProps}
                        />
                      )}
                      popperPlacement="bottom-start"
                    />
                    <DatePicker
                      label="To Date"
                      value={toDate.toDate()}
                      minDate={fromDate.toDate()}
                      maxDate={dayjs().toDate()}
                      onChange={handleToDateChange}
                      renderInput={(params) => <input {...params.inputProps} />}
                      popperPlacement="bottom-start"
                    />
                  </div>
                </>
              )}
            </div>
            <div class="row dashboard-top-class">
              {/* <div class="col"> */}
              <div class="h-100">
                <div className="dashboard-top" class="row">
                  <div class="col-xl-8 col-lg-8 col-sm-12">
                    <div class="row">
                      {/* proposal start */}

                      {(userAccessData.Admin_Proposal_CanView ||
                        common.organisationKeyID == null) && (
                        <>
                          <div
                            className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                            onClick={() =>
                              handleAddData("Draft", statusID.Draft)
                            }
                          >
                            <div
                              className="stat-card"
                              style={{ "--hover-bg-color": cardBgColor }}
                            >
                              <div className="stat-card-header">
                                <div className="stat-icon">
                                  <img src={DraftProposalPng} alt="icon" />
                                </div>
                                <div className="stat-amount">
                                  {calculateGBPAmount(
                                    dashboardCount.quotationDraft_AmountOneOff,
                                    dashboardCount.quotationDraft_AmountRecc,
                                  )}
                                </div>
                              </div>
                              <div className="stat-card-body">
                                <h6 className="stat-title">
                                  Draft {proposalName}
                                </h6>
                                <p className="stat-subtitle fw-bold">
                                  Total: {dashboardCount?.quotationDraft}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                            onClick={() => handleAddData("Sent", statusID.Sent)}
                          >
                            <div
                              className="stat-card"
                              style={{ "--hover-bg-color": cardBgColor }}
                            >
                              <div className="stat-card-header">
                                <div className="stat-icon">
                                  <img src={SentProposalPng} alt="icon" />
                                </div>
                                <div className="stat-amount">
                                  {calculateGBPAmount(
                                    dashboardCount.quotationSent_AmountOneOff,
                                    dashboardCount.quotationSent_AmountRecc,
                                  )}
                                </div>
                              </div>
                              <div className="stat-card-body">
                                <h6 className="stat-title">
                                  {proposalName} Sent
                                </h6>
                                <p className="stat-subtitle fw-bold">
                                  Total: {dashboardCount?.quotationSent}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Proposal Accepted */}
                          <div
                            className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                            onClick={() =>
                              handleAddData("Accepted", statusID.Accepted)
                            }
                          >
                            <div
                              className="stat-card"
                              style={{ "--hover-bg-color": cardBgColor }}
                            >
                              <div className="stat-card-header">
                                <div className="stat-icon">
                                  <img
                                    src={DraftEngagementLatterPng}
                                    alt="icon"
                                  />
                                </div>
                                <div className="stat-amount">
                                  {calculateGBPAmount(
                                    dashboardCount.quotationAccepted_AmountOneOff,
                                    dashboardCount.quotationAccepted_AmountRecc,
                                  )}
                                </div>
                              </div>
                              <div className="stat-card-body">
                                <h6 className="stat-title">
                                  {proposalName} Accepted
                                </h6>
                                <p className="stat-subtitle fw-bold">
                                  Total: {dashboardCount?.quotationAccepted}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* <div
                            className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                            onClick={() =>
                              handleAddData("Skipped", statusID.Skipped)
                            }
                          >
                            <div
                              className="stat-card"
                              style={{ "--hover-bg-color": cardBgColor }}
                            >
                              <div className="stat-card-header">
                                <div className="stat-icon">
                                  <img src={DraftProposalPng} alt="icon" />
                                </div>
                                <div className="stat-amount">
                                  {calculateGBPAmount(
                                    dashboardCount.quotationSkipped_AmountRecc,
                                    dashboardCount.quotationSkipped_AmountOneOff
                                  )}
                                </div>
                              </div>
                              <div className="stat-card-body">
                                <h6 className="stat-title">
                                  {proposalName} Skipped
                                </h6>
                                <p className="stat-subtitle fw-bold">
                                  Total: {dashboardCount?.quotationSkipped}
                                </p>
                              </div>
                            </div>
                          </div> */}

                          {/* proposal start */}
                          {(common.enableEL == 0 ||
                            common.enableEL == null) && (
                            <>
                              <div
                                className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                                onClick={() =>
                                  handleAddData(
                                    "Sent",
                                    statusID.Awaiting_Signature,
                                  )
                                }
                              >
                                <div
                                  className="stat-card"
                                  style={{ "--hover-bg-color": cardBgColor }}
                                >
                                  <div className="stat-card-header">
                                    <div className="stat-icon">
                                      <img
                                        src={DraftEngagementLatterPng}
                                        alt="icon"
                                      />
                                    </div>
                                    <div className="stat-amount">
                                      {calculateGBPAmount(
                                        dashboardCount.quotationAwaitingSignatureEnd_AmountRecc,
                                        dashboardCount.quotationAwaitingSignatureEnd_AmountOneOff,
                                      )}
                                    </div>
                                  </div>
                                  <div className="stat-card-body">
                                    <h6 className="stat-title">
                                      {proposalName} Awaiting Response
                                    </h6>
                                    <p className="stat-subtitle fw-bold">
                                      Total:{" "}
                                      {
                                        dashboardCount?.quotationAwaitingSignature
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          {(common.enableEL == 0 ||
                            common.enableEL == null) && (
                            <>
                              <div
                                className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                      ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                                onClick={() =>
                                  handleAddData("Decline", statusID.Declined)
                                }
                              >
                                <div
                                  className="stat-card"
                                  style={{ "--hover-bg-color": cardBgColor }}
                                >
                                  <div className="stat-card-header">
                                    <div className="stat-icon">
                                      <img
                                        src={EngagementLatterSendSvg}
                                        alt="icon"
                                      />
                                    </div>
                                    <div className="stat-amount">
                                      {calculateGBPAmount(
                                        dashboardCount.quotationDeclined_AmountOneOff,
                                        dashboardCount.quotationDeclined_AmountRecc,
                                      )}
                                    </div>
                                  </div>
                                  <div className="stat-card-body">
                                    <h6 className="stat-title">
                                      {proposalName} Declined
                                    </h6>
                                    <p className="stat-subtitle fw-bold">
                                      Total: {dashboardCount?.quotationDeclined}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                      {/* </div> */}
                      {/* proposal end  */}

                      {/* engagement start */}
                      {/* <div className="row"> */}
                      {(common.enableEL == 1 || common.enableEL == null) &&
                        (userAccessData.Admin_Engagement_Latter_CanView ||
                          common.organisationKeyID == null) && (
                          <>
                            <div
                              className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                              onClick={() =>
                                GetHandleChangeFilter("Draft", statusID.Draft)
                              }
                            >
                              <div
                                className="stat-card"
                                style={{ "--hover-bg-color": cardBgColor }}
                              >
                                <div className="stat-card-header">
                                  <div className="stat-icon">
                                    <img
                                      src={EngagementLatterSendSvg}
                                      alt="icon"
                                    />
                                  </div>
                                  <div className="stat-amount">
                                    {calculateGBPAmount(
                                      dashboardCount.contractDraft_AmountOneOff,
                                      dashboardCount.contractDraft_AmountRecc,
                                    )}
                                  </div>
                                </div>
                                <div className="stat-card-body">
                                  <h6 className="stat-title">
                                    Draft {EngagementName}
                                  </h6>
                                  <p className="stat-subtitle fw-bold">
                                    Total: {dashboardCount?.contractDraft}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Void EL hidden */}

                            {dashboardCount?.contractVoid > 0 && (
                              <div
                                className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                                onClick={() =>
                                  GetHandleChangeFilter("Void", statusID.Void)
                                }
                              >
                                <div
                                  className="stat-card"
                                  style={{ "--hover-bg-color": cardBgColor }}
                                >
                                  <div className="stat-card-header">
                                    <div className="stat-icon">
                                      <img
                                        src={EngagementLatterSendSvg}
                                        alt="icon"
                                      />
                                    </div>
                                    <div className="stat-amount">
                                      {calculateGBPAmount(
                                        dashboardCount.contractVoid_AmountOneOff,
                                        dashboardCount.contractVoid_AmountRecc,
                                      )}
                                    </div>
                                  </div>
                                  <div className="stat-card-body">
                                    <h6 className="stat-title">
                                      Voided {EngagementName}
                                    </h6>
                                    <p className="stat-subtitle fw-bold">
                                      Total: {dashboardCount?.contractVoid}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div
                              className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                              onClick={() =>
                                GetHandleChangeFilter("Sent", statusID.Sent)
                              }
                            >
                              <div
                                className="stat-card"
                                style={{ "--hover-bg-color": cardBgColor }}
                              >
                                <div className="stat-card-header">
                                  <div className="stat-icon">
                                    <img
                                      src={EngagementLatterSendSvg}
                                      alt="icon"
                                    />
                                  </div>
                                  <div className="stat-amount">
                                    {calculateGBPAmount(
                                      dashboardCount.contractSent_AmountOneOff,
                                      dashboardCount.contractSent_AmountRecc,
                                    )}
                                  </div>
                                </div>
                                <div className="stat-card-body">
                                  <h6 className="stat-title">
                                    {EngagementName} Sent
                                  </h6>
                                  <p className="stat-subtitle fw-bold">
                                    Total: {dashboardCount?.contractSent}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* EL viewed hidden */}

                            {/* <div
                                  className={`col-xl-3 col-lg-3 col-md-3 dashboard-box col-sm-12  ${common.organisationKeyID !== null
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
                                          {EngagementName} Viewed
                                        </p>

                                        <div class="text-end pt-1">
                                          <h5 class="mb-0 text-white ">
                                            {" "}
                                            {dashboardCount?.contractAwaitingSignature}
                                          </h5>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div> */}
                            <div
                              className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                              onClick={() =>
                                GetHandleChangeFilter(
                                  "Viewed",
                                  statusID.Awaiting_Signature,
                                )
                              }
                            >
                              <div
                                className="stat-card"
                                style={{ "--hover-bg-color": cardBgColor }}
                              >
                                <div className="stat-card-header">
                                  <div className="stat-icon">
                                    <img
                                      src={EngagementLatterAwaitingSignatureSvg}
                                      alt="icon"
                                    />
                                  </div>
                                  <div className="stat-amount">
                                    {calculateGBPAmount(
                                      dashboardCount.contractViewed_AmountRecc,
                                      dashboardCount.contractViewed_AmountOneOff,
                                    )}
                                  </div>
                                </div>
                                <div className="stat-card-body">
                                  <h6 className="stat-title">
                                    {EngagementName} Viewed
                                  </h6>
                                  <p className="stat-subtitle fw-bold">
                                    Total:{" "}
                                    {dashboardCount?.contractAwaitingSignature}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                              onClick={() =>
                                GetHandleChangeFilter("Signed", statusID.Signed)
                              }
                            >
                              <div
                                className="stat-card"
                                style={{ "--hover-bg-color": cardBgColor }}
                              >
                                <div className="stat-card-header">
                                  <div className="stat-icon">
                                    <img
                                      src={EngagementLatterSignedSvg}
                                      alt="icon"
                                    />
                                  </div>
                                  <div className="stat-amount">
                                    {calculateGBPAmount(
                                      dashboardCount.contractSigned_AmountOneOff,
                                      dashboardCount.contractSigned_AmountRecc,
                                    )}
                                  </div>
                                </div>
                                <div className="stat-card-body">
                                  <h6 className="stat-title">
                                    {EngagementName} Signed
                                  </h6>
                                  <p className="stat-subtitle fw-bold">
                                    Total: {dashboardCount?.contractSigned}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`col-xl-3 col-lg-3 col-md-3 col-sm-12 dashboard-box 
                                    ${common.organisationKeyID !== null ? "cursor-pointer" : ""}`}
                              onClick={() =>
                                GetHandleChangeFilter(
                                  "Decline",
                                  statusID.Declined,
                                )
                              }
                            >
                              <div
                                className="stat-card"
                                style={{ "--hover-bg-color": cardBgColor }}
                              >
                                <div className="stat-card-header">
                                  <div className="stat-icon">
                                    <img
                                      src={EngagementLaterDeclinedSvg}
                                      alt="icon"
                                    />
                                  </div>
                                  <div className="stat-amount">
                                    {calculateGBPAmount(
                                      dashboardCount.contractDeclined_AmountOneOff,
                                      dashboardCount.contractDeclined_AmountRecc,
                                    )}
                                  </div>
                                </div>
                                <div className="stat-card-body">
                                  <h6 className="stat-title">
                                    {EngagementName} Declined
                                  </h6>
                                  <p className="stat-subtitle fw-bold">
                                    Total: {dashboardCount?.contractDeclined}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      {/* </div> */}
                    </div>
                  </div>
                  {(userAccessData.Admin_Activity_Log_CanView ||
                    common.organisationKeyID == null) && (
                    <>
                      <div class="col-xl-4 col-sm-12 col-lg-4 pb-2">
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
                                  {activityLogsList?.map((ActivityLogList) => {
                                    return (
                                      <>
                                        <li class="feed-item">
                                          <div class="feed-item-list">
                                            <span style={{ color: "black" }}>
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
                                                  `/${ActivityLogList?.moduleURL}`,
                                                );
                                              }}
                                            >
                                              {ActivityLogList.logMessage
                                                ?.replace(
                                                  /quotation/g,
                                                  proposalName,
                                                )
                                                ?.replace(
                                                  /client/g,
                                                  prospectName,
                                                )
                                                ?.replace(
                                                  /contract/g,
                                                  EngagementName,
                                                )}
                                            </span>
                                          </div>
                                        </li>
                                      </>
                                    );
                                  })}
                                </>
                              )}
                            </ol>
                            <>
                              {" "}
                              <div className="col-lg-12 col-md-12 col-sm-12 text-center">
                                <div className="add-new-btn">
                                  <button
                                    className="btn add-new text-white"
                                    style={{ backgroundColor: "#5a2eca" }}
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
              {/* </div> */}
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
        <Footer />
      </div>
      {/* <!-- End Page-content --> */}
    </div>
    // </div>
  );
};

export default NewDashboard;
