import { getMintedAmount } from "@/dao4.frontend.common.wasm/contracts/GovernanceToken_api";
import { TokenInfoWithName } from "@/dao4.frontend.common.wasm/types/Token";
import { useEffect, useState } from "react";
import { get_selected_address } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";

interface Erc20ForSaleParameter {
  selectToken: TokenInfoWithName;
}

const GovernanceTokenShowOnly = (props: Erc20ForSaleParameter) => {
  const [mintedAmount, setMintedAmount] = useState("");

  const _getMintedAmount = async () => {
    const selectedAddress = get_selected_address();
    setMintedAmount(
      await getMintedAmount(selectedAddress, props.selectToken.tokenAddress)
    );
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
