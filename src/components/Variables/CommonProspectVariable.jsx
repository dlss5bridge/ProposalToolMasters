import React, { useContext } from "react";
import AccountantVariables from "./AccountantVariables";
import { CLIENT_TYPES } from "../../Middleware/enums";
import ProspectTypeVariables from "../../Database/VariableHelpers/ProspectTypeVariables";
import CopyToClipboard from "../CopyToClipboard/CopyToClipboard";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
function CommonProspectVariable({ businessTypeId, ClintType, ModuleName }) {
    const { prospectName } = useContext(AuthContextProvider);
    console.log(businessTypeId);
    const clientTypeList = Array.isArray(ClintType)
    ? ClintType.map(String)
    : [];

    const hasType = (type) => clientTypeList.includes(String(type));
    console.log(ClintType, 'ClintType')
    return (
        <div className="fieldset-group helper-variables-div">
            <label className="fieldset-group-label">Variables</label>
            <AccountantVariables
                ModuleName={ModuleName}
                ClintType={ClintType}
                businessTypeId={businessTypeId}
            />
            {/* {ClintType.includes(CLIENT_TYPES.Individual) && (
                <CopyToClipboard texts={ProspectTypeVariables.ClientIndividualVariables} heading={`Individual ${prospectName}:`} />
            )} */}
            {hasType(CLIENT_TYPES.Sole_Trader) && (
                <CopyToClipboard texts={ProspectTypeVariables.ClientSoleTraderVariables} heading={`Sole Trader ${prospectName}:`} />
            )}
            {hasType(CLIENT_TYPES.Partnership) && (
                <CopyToClipboard texts={ProspectTypeVariables.ClientPartnerShipVariables} heading={`Partnership ${prospectName}:`} />
            )}
            {(hasType(CLIENT_TYPES.LLP) || hasType(CLIENT_TYPES.Company)) && (
                <CopyToClipboard texts={ProspectTypeVariables.ClientLLpVariables} heading={`LLp & Ltd ${prospectName}:`} />
            )}

            {/* {ModuleName==='Template' && <span className="text-start variableHeading">{prospectName} Variables :</span>}
      <CopyToClipboard texts={ProspectTypeVariables.ClientLLpVariables} /> */}
        </div>
    );
}

export default CommonProspectVariable;
