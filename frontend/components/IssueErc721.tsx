import { deployDaoErc721 } from "@/dao4.frontend.common/contracts/DaoErc721_api";
import { addTokenToList } from "@/dao4.frontend.common/contracts/subdao_api";
import { Erc721DeployData, TokenKind } from "@/dao4.frontend.common/types/Token";
import { useState } from "react";

interface IssueErc721Parameter {
  daoAddress: string;
}

const IssueErc721 = (props: IssueErc721Parameter) => {
  const [tokenAddress,setTokenAddress] = useState("");
  const [deployData, setDeployData] = useState<Erc721DeployData>({
    tokenName: "",
    tokenSymbol: "",
    daoAddress: "",
    priceWei: 0,
    baseUri: "",
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeployData({
      ...deployData,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    deployData.daoAddress = props.daoAddress;
    setTokenAddress(await deployDaoErc721(deployData));
  };

  const _registerToDao = async () => {
    console.log("registerToDao")
    await addTokenToList(TokenKind.ERC721,tokenAddress,props.daoAddress);
  }

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="flex flex-col justify-center m-5 leading-none tracking-tight">
          <div className="text-orange-400 text-30px text-center">Deploy Erc721 Token</div>
          <div className="p-2"></div>
          <div className="flex justify-center">
          <form className="" onSubmit={_onSubmit}>
            <table>
              <tr>
                <th className="text-white text-20px flex justify-start px-2 py-3">Name :</th>
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
                <th className="text-white text-20px flex justify-start px-2 py-3">Symbol :</th>
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
              <tr>
                <th className="text-white text-20px flex justify-start px-2 py-3">Price :</th>
                <td className="px-2 py-3">
                  <input
                    className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                          leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="priceWei"
                    type="text"
                    onChange={onChangeInput}
                  ></input>
                </td>
              </tr>
              <tr>
                <th className="text-white text-20px flex justify-start px-2 py-3">Base Uri : </th>
                <td className=" px-2 py-3">
                  <input
                    className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                          leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="baseUri"
                    type="text"
                    onChange={onChangeInput}
                  ></input>
                </td>
              </tr>
            </table>
            <div className="flex justify-center p-4">
            <button
              className="px-5 py-3 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={() => _onSubmit}
            >
              Deploy
            </button>
            </div>
          </form>
          </div>
          <div className="flex justify-center p-5">
        <button
              className="px-5 py-3 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={_registerToDao}
            >
              Register To Dao
            </button>
        </div>

        </div>
      </div>
    </>
  );
};

export default IssueErc721;
