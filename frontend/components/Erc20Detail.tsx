import {
  controlTokenSale,
  getMintedAmount,
  getPrice,
  getSalesAmount,
  getSalesStatus,
  mint,
  withdraw,
} from "@/dao4.frontend.common/contracts/DaoErc20_api";
import {
  MintInfo,
  TokenInfoWithName,
} from "@/dao4.frontend.common/types/Token";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

interface Erc20DetailParameter {
  selectToken: TokenInfoWithName;
}

const Erc20Detail = (props: Erc20DetailParameter) => {
  const [saleStatus, setSaleStatus] = useState("");
  const [mintedAmount, setMintedAmount] = useState("");
  const [salesAmount, setSalesAmount] = useState("");
  const [changeStatus, setChangeStatus] = useState(true);
  const [price, setPrice] = useState("");
  const [mintValue, setMintValue] = useState<MintInfo>({
    amount: 0,
    price: 0,
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMintValue({
      ...mintValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("event.target.value", event.target.value);
    setChangeStatus(Boolean(Number(event.target.value)));
  };

  const _onSubmitMint = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mint(
      mintValue.price,
      mintValue.amount,
      props.selectToken.tokenAddress
    );
  };

  const _onSubmitStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("status:", changeStatus);
    await controlTokenSale(changeStatus, props.selectToken.tokenAddress);
  };

  const _onWithdraw = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("## _onWithdraw");
    await withdraw(props.selectToken.tokenAddress);
  };

  const _getSalesStatus = async () => {
    const ret = await getSalesStatus(props.selectToken.tokenAddress);
    if (ret == true) {
      setSaleStatus("On Sale");
    } else {
      setSaleStatus("Not On Sale");
    }
  };

  const _getSalesAmount = async () => {
    const ret = await getSalesAmount(props.selectToken.tokenAddress);
    setSalesAmount(ethers.utils.formatEther(ret));
  };

  const _getMintedAmount = async () => {
    setMintedAmount(await getMintedAmount(props.selectToken.tokenAddress));
  };

  const _getPrice = async () => {
    const ret = await getPrice(props.selectToken.tokenAddress);
    setPrice(ret);
  };


  useEffect(() => {
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
        <div className="p-5"></div>
        <div className="flex justify-center">
          <form className="" onSubmit={_onSubmitMint}>
            <div className=" p-2">
              <div className="text-orange-300 text-center text-30px">
                If you mint more token...
              </div>
              <div className="p-2"></div>
              <table className="text-20px text-white">
                <tr>
                  <th className=" flex justify-end px-4 py-2">Price:</th>
                  <td className=" px-4 py-2 text-black">
                    <input
                      className="appearance-none rounded w-2/3 py-2 px-4
                    leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                      name="price"
                      type="text"
                      onChange={onChangeInput}
                    ></input>
                  </td>
                </tr>
                <tr>
                  <th className=" flex justify-end px-4 py-2">Amount:</th>
                  <td className=" px-4 py-2 text-black">
                    <input
                      className="appearance-none rounded w-2/3 py-2 px-4
                    leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                      name="amount"
                      type="text"
                      onChange={onChangeInput}
                    ></input>
                  </td>
                </tr>
              </table>
            </div>
            <div className="flex justify-center">
              <button
                className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
                onClick={() => _onSubmitMint}
              >
                Mint
              </button>
            </div>
          </form>
        </div>
        <div className="p-5"></div>
        <div className="flex justify-center">
          <form className="" onSubmit={_onSubmitStatus}>
            <div className=" p-2 ">
              <div className="text-orange-300 text-center text-30px">
                Change Sales Status...
              </div>
              <table className="text-20px text-white">
                <tr>
                  <th className=" flex justify-end px-4 py-2">Status:</th>
                  <td className=" px-4 py-2 text-black">
                    <select
                      className="py-2 px-4"
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
                className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
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
            <div className="text-orange-300 text-center text-30px">
              Withdraw Sales Amount To DAO Address.
            </div>
            <div className="flex justify-center">
              <button
                className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
                onClick={() => _onWithdraw}
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

export default Erc20Detail;
