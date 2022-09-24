import {
    controlTokenSale,
  getPrice,
  getSalesAmount,
  getSalesStatus,
  withdraw,
} from "@/dao4.frontend.common/contracts/DaoErc721_api";
import { MintInfo, TokenInfoWithName } from "@/dao4.frontend.common/types/Token";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

interface Erc721DetailParameter{
    selectToken: TokenInfoWithName;
}

const Erc721Detail = (props:Erc721DetailParameter) => {
  const [saleStatus, setSaleStatus] = useState("");
  const [salesAmount, setSalesAmount] = useState("");
  const [changeStatus, setChangeStatus] = useState(true);
  const [price, setPrice] = useState("");

  const onChangeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setChangeStatus(Boolean(Number(event.target.value)));
  };

  const _onSubmitStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await controlTokenSale(changeStatus,props.selectToken.tokenAddress);
  };

  const _getSalesStatus = async () => {
    if (await getSalesStatus(props.selectToken.tokenAddress) == true){
      setSaleStatus("On Sale");
    }
    else {
      setSaleStatus("Not On Sale");
    }
  };
  
  const _getSalesAmount = async () => {
    const ret = await getSalesAmount(props.selectToken.tokenAddress);
    setSalesAmount(ethers.utils.formatEther(ret));
  };
  
  const _getPrice =async () => {
    const ret = await getPrice(props.selectToken.tokenAddress); 
    setPrice(ethers.utils.formatEther(ret));
  }

  const _onWithdraw =async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("## _onWithdraw");
    await withdraw(props.selectToken.tokenAddress);
  }

  useEffect(() => {
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
          <div className="p-8"></div>
          <form className="" onSubmit={_onSubmitStatus}>
              <div className="text-center text-orange-400 text-30px">Change Sales Status...</div>
              <div className=" p-5 flex justify-center">
              <table className="text-20px text-white">
                <tr>
                  <th className=" flex justify-end px-4 py-2">Status:</th>
                  <td className=" px-4 py-2">
                    <select
                      className="py-2 px-4 text-black"
                      name="proposalKind"
                      onChange={onChangeSelect}
                    >
                      <option value="1">On Sale</option>
                      <option value="0">Not On Sale</option>
                    </select>
                  </td>
                </tr>
              </table>
            </div>
            <div className="flex justify-center">
            <button
              className="px-7 py-3 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={() => _onSubmitStatus}
            >
              Change Status
            </button>
            </div>
          </form>
        </div>
        <div className="p-5"></div>
        <div className="flex justify-center">
          <form onSubmit={_onWithdraw}>
          <div className=" p-2 ">
            <div className="text-orange-400 text-center text-30px">
              Withdraw Sales Amount To DAO Address.
            </div>
            <div className="flex justify-center">
              <button
                className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
                onClick={()=>_onWithdraw}
              >
                Excecute
              </button>
            </div>
          </div>
          </form>
        </div>

      </div>
    </>
  );
};

export default Erc721Detail;
