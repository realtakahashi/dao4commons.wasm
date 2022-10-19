import {
    buy,
    getMintedAmount,
    getPrice,
    getSalesAmount,
    getSalesStatus,
  } from "@/dao4.frontend.common.wasm/contracts/DaoErc20_api";
  import {
    TokenInfoWithName,
  } from "@/dao4.frontend.common.wasm/types/Token";
  import { useEffect, useState } from "react";
  import { ethers } from "ethers";
import { get_account_info, get_selected_address } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
  
  interface Erc20ForSaleParameter {
    selectToken: TokenInfoWithName;
  }
  
  const Erc20ForSale = (props: Erc20ForSaleParameter) => {
    const [saleStatus, setSaleStatus] = useState("");
    const [mintedAmount, setMintedAmount] = useState("");
    const [salesAmount, setSalesAmount] = useState("");
    const [buyAmount, setBuyAmount] = useState("");
    const [price, setPrice] = useState("");
    const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta>({address:"",meta:{genesisHash:"",name:"",source:""}});
    
    const getAccountInfo = async () => {
      setSelectedAccount(await get_account_info(get_selected_address()));
    }

    const _onSubmitBuy = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      console.log("## buy amount:",buyAmount)
      await buy(selectedAccount,props.selectToken.tokenAddress,Number(buyAmount));
    };
    
    const _getSalesStatus = async () => {
      const ret = await getSalesStatus(selectedAccount.address,props.selectToken.tokenAddress);
      if (ret == true) {
      setSaleStatus("On Sale");
      }
      else{
        setSaleStatus("Not On Sale");
      }
    };
  
    const _getSalesAmount = async () => {
      const ret = await getSalesAmount(selectedAccount.address,props.selectToken.tokenAddress);
      setSalesAmount(ethers.utils.formatEther(ret));
      
    };

    const _getMintedAmount = async () => {
        setMintedAmount(await getMintedAmount(selectedAccount.address,props.selectToken.tokenAddress));
      };
    
    const _getPrice = async () => {
      const ret = await getPrice(selectedAccount.address,props.selectToken.tokenAddress);
      setPrice(ret);
    };
  
    useEffect(() => {
      getAccountInfo();
      _getMintedAmount();
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
                <th className="flex justify-start">Minted Amount :</th>
                <td>{mintedAmount}</td>
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
                <table className="text-20px text-white">
                  <tr>
                    <th className=" flex justify-end px-4 py-2">Amount:</th>
                    <td className=" px-4 py-2 text-black">
                      <input
                        className="appearance-none rounded w-2/3 py-2 px-4
                      leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                        name="amount"
                        type="text"
                        onChange={(e) => setBuyAmount(e.target.value)}
                      ></input> <span className="text-white text-18px"></span>
                    </td>
                  </tr>
                </table>
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
        </div>
      </>
    );
  };
  
  export default Erc20ForSale;
  