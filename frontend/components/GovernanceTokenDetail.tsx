import {
  createProposalDistributeGovToken,
  getMintedAmount,
} from "@/dao4.frontend.common.wasm/contracts/GovernanceToken_api";
import {
  TokenInfoWithName,
  ProposalData4TransferGovernanceToken,
} from "@/dao4.frontend.common.wasm/types/Token";
import { useEffect, useState, useContext } from "react";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import {
  get_account_info,
  get_selected_address,
} from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";
import { AppContext } from "../pages/_app";

interface GovernanceTokenDetailParameter {
  selectToken: TokenInfoWithName;
  daoAddress: string;
}

const GovernanceTokenDetail = (props: GovernanceTokenDetailParameter) => {
  const [mintedAmount, setMintedAmount] = useState("");
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>({
      address: "",
      meta: { genesisHash: "", name: "", source: "" },
    });
  const [proposalData, setProposalData] =
    useState<ProposalData4TransferGovernanceToken>({
      toListCsv: "",
      amountListCsv: "",
      proposalKind: 7,
      title: "",
      outline: "",
      githubURL: "",
      detail: "",
    });
  const { api } = useContext(AppContext);

  const getAccountInfo = async () => {
    setSelectedAccount(await get_account_info(get_selected_address()));
  };

  const _getMintedAmount = async () => {
    setMintedAmount(
      await getMintedAmount(
        api,
        selectedAccount.address,
        props.selectToken.tokenAddress
      )
    );
  };

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProposalData({
      ...proposalData,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProposalData({
      ...proposalData,
      [event.target.name]: event.target.value,
    });
  };

  const createProposal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createProposalDistributeGovToken(
      api,
      selectedAccount,
      props.daoAddress,
      props.selectToken.tokenAddress,
      proposalData
    );
  };

  useEffect(() => {
    getAccountInfo();
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
          <div className="text-orange-400 text-25px">
            Create A Proposal Which Transfer Governance Token To ...
          </div>
        </div>
        <form className="" onSubmit={createProposal}>
          <div className="text-white flex flex-col p-5">
            <table>
              <tr>
                <th className="px-2 py-3 flex justify-end ">
                  To Address(csv format)
                </th>
                <td className="px-2 py-3">
                  <textarea
                    className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                          leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="toListCsv"
                    rows={5}
                    onInput={onChangeText}
                  ></textarea>
                </td>
              </tr>
              <tr>
                <th className="px-2 py-3 flex justify-end ">
                  Amount(csv format)
                </th>
                <td className="px-2 py-3">
                  <textarea
                    className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                          leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="amountListCsv"
                    rows={5}
                    onInput={onChangeText}
                  ></textarea>
                </td>
              </tr>
            </table>
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
                    onChange={onChangeInput}
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
                    onInput={onChangeText}
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
                    onInput={onChangeText}
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
                    onChange={onChangeInput}
                  ></input>
                </td>
              </tr>
            </table>
          </div>

          <div className="flex justify-center p-5">
            <button
              className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={() => createProposal}
            >
              Create A Proposal
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default GovernanceTokenDetail;
