import {
    getMintedAmount,
  } from "@/dao4.frontend.common/contracts/GovernanceToken_api";
  import {
    TokenInfoWithName,
  } from "@/dao4.frontend.common/types/Token";
  import { useEffect, useState } from "react";
  import { ethers } from "ethers";
  
  interface Erc20ForSaleParameter {
    selectToken: TokenInfoWithName;
  }
  
  const GovernanceTokenShowOnly = (props: Erc20ForSaleParameter) => {
    const [mintedAmount, setMintedAmount] = useState("");
        
    const _getMintedAmount = async () => {
        setMintedAmount(await getMintedAmount(props.selectToken.tokenAddress));
      };
    
  
    useEffect(() => {
        _getMintedAmount();
    }, []);
  
    return (
      <>
        <div className="bg-black  min-h-screen">
          <div className="p-2"></div>
          <div className="flex justify-center">
            <table className="text-white text-20px">
              <tr>
                <th className="flex justify-start">Name/Symbol :</th>
                <td>
                  {props.selectToken.tokenName} / {props.selectToken.tokenSymbol}
                </td>
              </tr>
              <tr>
                <th className="flex justify-start">Minted Amount :</th>
                <td>{mintedAmount}</td>
              </tr>
            </table>
          </div>
        </div>
      </>
    );
  };
  
  export default GovernanceTokenShowOnly;
  