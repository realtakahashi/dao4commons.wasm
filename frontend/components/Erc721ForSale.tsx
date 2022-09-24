import {
    buy,
    getPrice,
    getSalesAmount,
    getSalesStatus,
  } from "@/dao4.frontend.common/contracts/DaoErc721_api";
  import {
    TokenInfoWithName,
  } from "@/dao4.frontend.common/types/Token";
  import { useEffect, useState } from "react";
  import { ethers } from "ethers";
  
  interface Erc721ForSaleParameter {
    selectToken: TokenInfoWithName;
  }
  
  const Erc721ForSale = (props: Erc721ForSaleParameter) => {
    const [saleStatus, setSaleStatus] = useState("");
    const [salesAmount, setSalesAmount] = useState("");
    const [price, setPrice] = useState("");
    const [tokenId, setTokenId] = useState("");
    
    const _onSubmitBuy = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await buy(props.selectToken.tokenAddress,setTokenId);
    };
    
    const _getSalesStatus = async () => {
      const ret = await getSalesStatus(props.selectToken.tokenAddress);
      if (ret == true) {
      setSaleStatus("On Sale");
      }
      else{
        setSaleStatus("Not On Sale");
      }
    };
  
    const _getSalesAmount = async () => {
      const ret = await getSalesAmount(props.selectToken.tokenAddress);
      setSalesAmount(ethers.utils.formatEther(ret));
    };

    const _getPrice = async () => {
      const ret = await getPrice(props.selectToken.tokenAddress);
      setPrice(ethers.utils.formatEther(ret));
    };
  
    useEffect(() => {
      _getSalesStatus();
      _getSalesAmount();
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
                <th className="flex justify-start">Sales Amount :</th>
                <td>{salesAmount}</td>
              </tr>
            </table>
          </div>
          <div className="p-5"></div>
          <div className="flex justify-center">
            <form className="" onSubmit={_onSubmitBuy}>
              <div className=" p-2">
                <div className="text-orange-300 text-center text-30px">You are going to buy tokens...</div>
                <div className="p-2"></div>
              </div>
              
              <div className="flex justify-center">
                <button
                  className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
                  onClick={() => _onSubmitBuy}
                >
                  Buy
                </button>
              </div>
            </form>
            </div>
            <div className="flex justify-center p-5 text-white text-25px">Your Token Id is [ {tokenId} ]</div>
          
        </div>
      </>
    );
  };
  
  export default Erc721ForSale;
  