import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GetGlobalProspectVariables } from "../../redux/Services/Setting/GlobalVariablesApi";


 const ClientIndividualVariables = [
  "$Client.FirstName$",
  "$Client.LastName$",
  "$Client.Email$",
  "$Client.Phone$",
  "$Client.Address$",
  "$Client.AddressWithLineBreak$",
];

 const ClientSoleTraderVariables = [
  "$Client.SoleTrader.FirstName$",
  "$Client.SoleTrader.LastName$",
  "$Client.SoleTrader.Email$",
  "$Client.SoleTrader.Phone$",
  "$Client.SoleTrader.Address$",
  "$Client.SoleTrader.AddressWithLineBreak$",
  "$Client.TradingName$",
  // "$Client.TradingName$",
  // "$Client.TradingAddress$",
  // "$Client.TradingAddressWithLineBreak$",
];

 const ClientPartnerShipVariables = [
  "$Client.Partner.Name$",
  "$Client.Partner.FirstName$",
  "$Client.Partner.LastName$",
  "$Client.Partner.Email$",
  "$Client.Partner.Phone$",
  "$Client.Partner.Address$",
  "$Client.Partner.AddressWithLineBreak$",
  "$Client.TradingName$",
  // "$Client.TradingName$",
  // "$Client.TradingAddress$",
  // "$Client.TradingAddressWithLineBreak$",
];

 const ClientLLpVariables = [
  "$Client.Officer.Name$",
  "$Client.Officer.FirstName$",
  "$Client.Officer.LastName$",
  "$Client.Officer.Email$",
  "$Client.Officer.Phone$",
  "$Client.Officer.Address$",
  "$Client.Officer.AddressWithLineBreak$",
  // "$Client.TradingName$",
  // "$Client.TradingAddress$",
  // "$Client.TradingAddressWithLineBreak$",
  "$Client.Company.Name$",
  "$Client.Company.Number$",
  "$Client.Company.RegisteredAddress$",
  "$Client.Company.RegisteredAddressWithLineBreak$",
];

 const ClientCompanyVariables = [
  "$Client.Officer.Name$",
  "$Client.Officer.FirstName$",
  "$Client.Officer.LastName$",
  "$Client.Officer.Email$",
  "$Client.Officer.Phone$",
  "$Client.Officer.Address$",
  "$Client.Officer.AddressWithLineBreak$",
  // "$Client.TradingName$",
  // "$Client.TradingAddress$",
  // "$Client.TradingAddressWithLineBreak$",
  "$Client.Company.Name$",
  "$Client.Company.Number$",
  "$Client.Company.RegisteredAddress$",
  "$Client.Company.RegisteredAddressWithLineBreak$",
];

const CommonClientVariables = [
  "$Client.FirstName$",
  "$Client.LastName$",
  "$Client.FullName$",
  "$Client.Email$",
  "$Client.Phone$",
  "$Client.Address$",
  "$Client.AddressWithLineBreak$",
  "$Client.CompanyName$",
  "$Client.CompanyNumber$",
  "$Client.IncorporatedIn$",
  "$Client.IncorporationDate$",
  "$Client.TradingName$",
];

export default {
  ClientIndividualVariables,
  ClientSoleTraderVariables,
  ClientPartnerShipVariables,
  ClientLLpVariables,
  ClientCompanyVariables,
  CommonClientVariables,
};

export const useProspectTypeVariables = () => {
  const common = useSelector((state) => state.Storage);
  const [globalVarNames, setGlobalVarNames] = useState([]);

  useEffect(() => {
    if(!common.organisationKeyID) return;
    const fetchGlobalVariables = async () => {
      try {
        const data = await GetGlobalProspectVariables(common.organisationKeyID);
        const responseData = data?.data?.responseData?.data;
        console.log(responseData);
        setGlobalVarNames(
          responseData?.map(item => item.globalVariableName) || []
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchGlobalVariables();
  }, [common.organisationKeyID]);

  const GlobalClientVariables = globalVarNames;
  console.log("Common", GlobalClientVariables);
  return { GlobalClientVariables };
};
