import {
  getMintedAmount,
  getPrice,
  getSalesAmount,
  getSalesStatus,
} from "@/dao4.frontend.common.wasm/contracts/DaoErc20_api";
import {
  ProposalData4ChangingTokenSaleStatus,
  TokenInfoWithName,
} from "@/dao4.frontend.common.wasm/types/Token";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  get_account_info,
  get_selected_address,
} from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";

interface Erc20InfoParameter {
  selectToken: TokenInfoWithName;
  daoAddress: string;
}

const Erc20Info = (props: Erc20InfoParameter) => {
  const [saleStatus, setSaleStatus] = useState("");
  const [mintedAmount, setMintedAmount] = useState("");
  const [salesAmount, setSalesAmount] = useState("");
  const [price, setPrice] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  const _getSalesStatus = async () => {
    const ret = await getSalesStatus(selectedAddress,props.selectToken.tokenAddress);
    if (ret == true) {
      setSaleStatus("On Sale");
    } else {
      setSaleStatus("Not On Sale");
    }
  };

  const _getSalesAmount = async () => {
    const ret = await getSalesAmount(selectedAddress, props.selectToken.tokenAddress);
    setSalesAmount(ethers.utils.formatEther(ret));
  };

  const _getMintedAmount = async () => {
    setMintedAmount(await getMintedAmount(selectedAddress, props.selectToken.tokenAddress));
  };

  const _getPrice = async () => {
    const ret = await getPrice(selectedAddress ,props.selectToken.tokenAddress);
    setPrice(ret);
  };

  const getSelectedAddress =async () => {
    setSelectedAddress(get_selected_address());
  }

  useEffect(() => {
    getSelectedAddress();
    _getSalesStatus();
    _getSalesAmount();
    _getMintedAmount();
    _getPrice();
  }, []);

  return (
    <>
      <div className="bg-black  min-h-screen">
        <div className="flex justify-center leading-none tracking-tight">
          <div className="text-orange-300 text-30px">Token Status</div>
        </div>
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
              <th className="flex justify-start">Sales Status :</th>
              <td>{saleStatus}</td>
            </tr>
            <tr>
              <th className="flex justify-start">Price :</th>
              <td>{price}</td>
            </tr>
            <tr>
              <th className="flex justify-start">Minted Amount :</th>
              <td>{mintedAmount}</td>
            </tr>
            <tr>
              <th className="flex justify-start">Sales Amount :</th>
              <td>{salesAmount}</td>
            </tr>
          </table>
        </div>
      </div>
    </>
  );
};

export default Erc20Info;
