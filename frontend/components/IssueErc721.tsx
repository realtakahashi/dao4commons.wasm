import { deployDaoErc721 } from "@/dao4.frontend.common.wasm/contracts/DaoErc721_api";
import { createProposal4AddingTokenToList } from "@/dao4.frontend.common.wasm/contracts/subdao_api";
import {
  Erc721DeployData,
  ProposalData4RegisterToken,
  TokenKind,
} from "@/dao4.frontend.common.wasm/types/Token";
import { useState, useEffect, useContext } from "react";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import {
  get_account_info,
  get_selected_address,
} from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";
import { AppContext } from "../pages/_app";

interface IssueErc721Parameter {
  daoAddress: string;
}

const IssueErc721 = (props: IssueErc721Parameter) => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>({
      address: "",
      meta: { genesisHash: "", name: "", source: "" },
    });
  const [deployData, setDeployData] = useState<Erc721DeployData>({
    tokenName: "",
    tokenSymbol: "",
    daoAddress: "",
    price: 0,
    baseUri: "",
  });
  const {api} = useContext(AppContext);

  const [proposalValue, setProposalValue] =
    useState<ProposalData4RegisterToken>({
      proposalKind: 4,
      title: "",
      outline: "",
      detail: "",
      githubURL: "",
    });

  const getSelectedAccount = async () => {
    setSelectedAccount(await get_account_info(get_selected_address()));
  };

  const onChangeInputProposal = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProposalValue({
      ...proposalValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeTextProposal = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProposalValue({
      ...proposalValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeployData({
      ...deployData,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    deployData.daoAddress = props.daoAddress;
    await deployDaoErc721(api, selectedAccount, deployData, setTokenAddress);
  };

  const registerToDao = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    await createProposal4AddingTokenToList(
      api,
      Number(TokenKind.ERC721),
      tokenAddress,
      selectedAccount,
      props.daoAddress,
      proposalValue
    );
  };

  useEffect(() => {
    getSelectedAccount();
  }, []);

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="flex flex-col justify-center m-5 leading-none tracking-tight">
          <div className="text-orange-400 text-30px text-center">
            Deploy PSP34 Token
          </div>
          <div className="p-2"></div>
          <div className="flex justify-center">
            <form className="" onSubmit={_onSubmit}>
              <table>
                <tr>
                  <th className="text-white text-20px flex justify-start px-2 py-3">
                    Name :
                  </th>
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
                  <th className="text-white text-20px flex justify-start px-2 py-3">
                    Symbol :
                  </th>
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
                  <th className="text-white text-20px flex justify-start px-2 py-3">
                    Price :
                  </th>
                  <td className="px-2 py-3">
                    <input
                      className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                          leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                      name="price"
                      type="text"
                      onChange={onChangeInput}
                    ></input>
                  </td>
                </tr>
                <tr>
                  <th className="text-white text-20px flex justify-start px-2 py-3">
                    Base Uri :{" "}
                  </th>
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
                  Issue Token
                </button>
              </div>
            </form>
          </div>
          <div className="flex justify-center text-green-400 p-5 m-5 text-25px">
            Token Address is : {tokenAddress}
          </div>
          <div className="flex justify-center p-5"></div>
          <div className="p-5"></div>
          <form className="" onSubmit={() => registerToDao}>
            <div className="flex justify-center">
              <div className=" p-2 ">
                <div className="text-orange-300 text-center text-30px">
                  Create A Proposal Which Register The Token
                </div>
              </div>
            </div>
            <div className="m-5 flex justify-center text-24px text-blue-200">
              <label>Proposal Information</label>
            </div>
            <div className="p-2 m-5 flex flex-col">
              <table>
                <tr>
                  <th className=" flex justify-end px-4 py-2 text-white">
                    Title:
                  </th>
                  <td className=" px-4 py-2">
                    <input
                      className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                      name="title"
                      type="text"
                      onChange={onChangeInputProposal}
                    ></input>
                  </td>
                </tr>
                <tr>
                  <th className="flex justify-end px-4 py-2 text-white">
                    Outline:
                  </th>
                  <td className=" px-4 py-2">
                    <textarea
                      className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                      name="outline"
                      rows={5}
                      onInput={onChangeTextProposal}
                    ></textarea>
                  </td>
                </tr>
                <tr>
                  <th className="flex justify-end px-4 py-2 text-white">
                    Detail:
                  </th>
                  <td className=" px-4 py-2">
                    <textarea
                      className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                      name="detail"
                      rows={10}
                      onInput={onChangeTextProposal}
                    ></textarea>
                  </td>
                </tr>
                <tr>
                  <th className="flex justify-end px-4 py-2 text-white">
                    Github URL:
                  </th>
                  <td className=" px-4 py-2">
                    <input
                      className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                      name="githubURL"
                      type="text"
                      onChange={onChangeInputProposal}
                    ></input>
                  </td>
                </tr>
              </table>
            </div>
            <div className="flex justify-center">
              <button
                className="px-5 py-3 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
                onClick={() => registerToDao}
              >
                Create A Proposal
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default IssueErc721;
