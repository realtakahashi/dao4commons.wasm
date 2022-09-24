import {
  getMintedAmount,
  mint,
  transfer
} from "@/dao4.frontend.common/contracts/GovernanceToken_api";
import {
  MintInfo,
  TokenInfoWithName,
  TransferInfo
} from "@/dao4.frontend.common/types/Token";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

interface GovernanceTokenDetailParameter {
  selectToken: TokenInfoWithName;
}

const GovernanceTokenDetail = (props: GovernanceTokenDetailParameter) => {
  const [mintedAmount, setMintedAmount] = useState("");
  const [mintValue, setMintValue] = useState<MintInfo>({
    amount: 0,
    price: 0,
  });
  const [transferData, setTransferData] = useState<TransferInfo>({
    amount: 0,
    to: "",
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMintValue({
      ...mintValue,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmitMint = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mint(mintValue.amount, props.selectToken.tokenAddress);
  };

  const _getMintedAmount = async () => {
    setMintedAmount(await getMintedAmount(props.selectToken.tokenAddress));
  };

  const onChangeInputTransfer = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTransferData({
      ...transferData,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmitTransfer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await transfer(transferData.amount, transferData.to, props.selectToken.tokenAddress);
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
          <div className="text-orange-400 text-25px">
            Transfer Governance Token To ...
          </div>
        </div>
        <div className="text-white flex justify-center p-5">
          <form className="" onSubmit={_onSubmitTransfer}>
            <table>
              <tr>
                <th className="px-2 py-3">To Address</th>
                <td className="px-2 py-3">
                  <input
                    className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                          leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="to"
                    type="text"
                    onChange={onChangeInputTransfer}
                  ></input>
                </td>
              </tr>
              <tr>
                <th className="px-2 py-3">Amount</th>
                <td className="px-2 py-3">
                  <input
                    className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                          leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="amount"
                    type="text"
                    onChange={onChangeInputTransfer}
                  ></input>
                </td>
              </tr>
            </table>
            <div className="flex justify-center p-5">
              <button
                className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
                onClick={() => _onSubmitTransfer}
              >
                Excecute
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default GovernanceTokenDetail;
