import {
  deployDaoErc20,
  mint,
} from "@/dao4.frontend.common.wasm/contracts/DaoErc20_api";
import { addTokenToList } from "@/dao4.frontend.common.wasm/contracts/subdao_api";
import { Erc20DeployData, MintInfo, TokenKind } from "@/dao4.frontend.common.wasm/types/Token";
import { useState } from "react";

interface IssueErc20Parameter {
  daoAddress: string;
}

const IssueErc20 = (props: IssueErc20Parameter) => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [deployData, setDeployData] = useState<Erc20DeployData>({
    tokenName: "",
    tokenSymbol: "",
    daoAddress: "",
  });

  const [mintData, setMintData] = useState<MintInfo>({
    price: 0,
    amount: 0,
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeployData({
      ...deployData,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeInputMint = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMintData({
      ...mintData,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    deployData.daoAddress = props.daoAddress;
    setTokenAddress(await deployDaoErc20(deployData));
  };

  const _onSubmitMint = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mint(mintData.price, mintData.amount, tokenAddress);
  };

  const _registerToDao = async () => {
    console.log("registerToDao")
    await addTokenToList(TokenKind.ERC20,tokenAddress,props.daoAddress);
  }

  return (
    <>
      <div className="bg-black min-h-screen">
      <div className="flex justify-center text-orange-400 p-5 text-25px">Deploy Erc20 Token</div>
        <div className="flex justify-center text-white">
          <form className="" onSubmit={_onSubmit}>
            <table className="p-5">
              <tr>
                <th className="px-2 py-3">Name</th>
                <td className="px-2 py-3">
                  <input
                    className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="tokenName"
                    type="text"
                    onChange={onChangeInput}
                  ></input>
                </td>
              </tr>
              <tr>
                <th className="px-2 py-3">Symbol</th>
                <td className="px-2 py-3">
                  <input
                    className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="tokenSymbol"
                    type="text"
                    onChange={onChangeInput}
                  ></input>
                </td>
              </tr>
            </table>
            <div className="flex justify-center p-3">
            <button
              className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={() => _onSubmit}
            >
              Deploy
            </button>
            </div>
          </form>
        </div>
        <div className="p-5"></div>
        <div className="flex justify-center">
          <div className="text-orange-400 text-25px">Mint Erc20 Token</div>
        </div>
        <div className="text-white flex justify-center p-5">
          <form className="" onSubmit={_onSubmitMint}>
            <table>
              <tr>
                <th className="px-2 py-3">Price</th>
                <td className="px-2 py-3">
                  <input
                    className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="price"
                    type="text"
                    onChange={onChangeInputMint}
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
                    onChange={onChangeInputMint}
                  ></input>
                </td>
              </tr>
            </table>
            <div className="flex justify-center p-5">
            <button
              className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={() => _onSubmitMint}
            >
              Mint
            </button>
            </div>
          </form>
        </div>
        <div className="flex justify-center p-5">
        <button
              className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={_registerToDao}
            >
              Register To Dao
            </button>
        </div>
      </div>
    </>
  );
};

export default IssueErc20;
