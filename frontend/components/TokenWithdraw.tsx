import { CreateProoposalOfWithdraw } from "@/dao4.frontend.common.wasm/contracts/DaoErc20_api";
import {
  ProposalData4ChangingTokenSaleStatus,
  TokenInfoWithName,
} from "@/dao4.frontend.common.wasm/types/Token";
import { useState } from "react";
import {
  get_account_info,
  get_selected_address,
} from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";

interface TokenWithDrawParameter {
  selectToken: TokenInfoWithName;
  daoAddress: string;
}

const TokenWithdraw = (props: TokenWithDrawParameter) => {
  const [proposalValue, setProposalValue] =
    useState<ProposalData4ChangingTokenSaleStatus>({
      tokenSaleStatus: false,
      proposalKind: 6,
      title: "",
      outline: "",
      detail: "",
      githubURL: "",
    });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProposalValue({
      ...proposalValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProposalValue({
      ...proposalValue,
      [event.target.name]: event.target.value,
    });
  };

  const _onWithdraw = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedAccount = await get_account_info(get_selected_address());
    await CreateProoposalOfWithdraw(
      selectedAccount,
      proposalValue,
      props.selectToken.tokenAddress,
      props.daoAddress
    );
  };

  return (
    <>
      <div className="bg-black  min-h-screen">
        <div className="p-5"></div>
        <form className="" onSubmit={_onWithdraw}>
          <div className="flex justify-center">
            <div className=" p-2 ">
              <div className="text-orange-300 text-center text-30px">
                Create A Proposal which withdraw Sales of Token Sales...
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
          <div className="flex justify-center">
            <button
              className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={() => _onWithdraw}
            >
              Create A Proposal
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TokenWithdraw;
