import {
    controlTokenSale,
  getPrice,
  getSalesAmount,
  getSalesStatus,
  withdraw,
} from "@/dao4.frontend.common.wasm/contracts/DaoErc721_api";
import { TokenInfoWithName } from "@/dao4.frontend.common.wasm/types/Token";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { get_selected_address } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";

interface Erc721DetailParameter{
    selectToken: TokenInfoWithName;
    daoAddress: string;
}

const Erc721Detail = (props:Erc721DetailParameter) => {
  const [saleStatus, setSaleStatus] = useState("");
  const [salesAmount, setSalesAmount] = useState("");
  const [price, setPrice] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  const getSelectedAddress =async () => {
    setSelectedAddress(get_selected_address());
  }

  const _getSalesStatus = async () => {
    if (await getSalesStatus(selectedAddress, props.selectToken.tokenAddress) == true){
      setSaleStatus("On Sale");
    }
    else {
      setSaleStatus("Not On Sale");
    }
  };
  
  const _getSalesAmount = async () => {
    const ret = await getSalesAmount(selectedAddress,props.selectToken.tokenAddress);
    setSalesAmount(String(ret));
  };
  
  const _getPrice =async () => {
    const ret = await getPrice(selectedAddress,props.selectToken.tokenAddress); 
    setPrice(ethers.utils.formatEther(ret));
  }

  useEffect(() => {
    getSelectedAddress();
    _getSalesStatus();
    _getSalesAmount();
    _getPrice();
  }, []);

  return (
    <>
      <div className="bg-black  min-h-screen">
        <div className=" justify-center leading-none tracking-tight">
          <div className="text-center text-orange-400 text-30px">Token Status</div>
          <div className="flex justify-center p-5">
          <table className="text-white text-20px">
            <tr>
              <th className="flex justify-start px-2 py-4 text-white">Name/Symbol : </th>
              <td>
                {props.selectToken.tokenName} / {props.selectToken.tokenSymbol}
              </td>
            </tr>
            <tr>
              <th className="flex justify-start text-start px-2 py-4 text-white">Sales Status : </th>
              <td>{saleStatus}</td>
            </tr>
            <tr>
              <th className="flex justify-start px-2 py-4 text-white">Price : </th>
              <td>{price}</td>
            </tr>
            <tr>
              <th className="flex justify-start px-2 py-4 text-white">Sales Amount : </th>
              <td>{salesAmount}</td>
            </tr>
          </table>
          </div>
          </div>
      </div>
    </>
  );
};

export default Erc721Detail;
