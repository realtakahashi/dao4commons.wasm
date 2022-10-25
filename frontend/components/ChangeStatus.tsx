import { proposeChangingTokenSaleStatus } from "@/dao4.frontend.common.wasm/contracts/DaoErc20_api";
import {
  ProposalData4ChangingTokenSaleStatus,
  TokenInfoWithName,
} from "@/dao4.frontend.common.wasm/types/Token";
import { useState, useContext } from "react";
import {
  get_account_info,
  get_selected_address,
} from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";
import { AppContext } from "../pages/_app";

interface TokenChangeStatusParameter {
  selectToken: TokenInfoWithName;
  daoAddress: string;
}

const ChangeStatus = (props: TokenChangeStatusParameter) => {
  const [changeStatusValue, setChangeStatusValue] =
    useState<ProposalData4ChangingTokenSaleStatus>({
      tokenSaleStatus: false,
      proposalKind: 5,
      title: "",
      outline: "",
      detail: "",
      githubURL: "",
    });
    const {api} = useContext(AppContext);

  const onChangeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setChangeStatusValue({
      ...changeStatusValue,
      [event.target.name]: event.target.value == "1",
    });
    // setChangeStatus(Boolean(Number(event.target.value)));
  };
  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChangeStatusValue({
      ...changeStatusValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChangeStatusValue({
      ...changeStatusValue,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmitStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedAccount = await get_account_info(get_selected_address());
    console.log("### changeStatusValue:", changeStatusValue);
    await proposeChangingTokenSaleStatus(
      api,
      selectedAccount,
      changeStatusValue,
      props.selectToken.tokenAddress,
      props.daoAddress
    );
  };

  return (
    <>
      <div className="bg-black  min-h-screen">
        <form className="" onSubmit={_onSubmitStatus}>
          <div className=" p-2 "></div>
          <div className="flex justify-center">
            <div className="text-orange-300 text-center text-30px">
              Create A Proposal which Change Sales Status...
            </div>
          </div>
          <div className="p-3"></div>
          <div className="flex justify-center">
            <table className="text-20px text-white">
              <tr>
                <th className="px-4 py-2">Status:</th>
                <td className=" px-4 py-2 text-black">
                  <select
                    className="py-2 px-4"
                    name="tokenSaleStatus"
                    onChange={onChangeSelect}
                  >
                    <option value="3" selected></option>
                    <option value="1">On Sale</option>
                    <option value="0">Not On Sale</option>
                  </select>
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
          <div className="flex justify-center">
            <button
              className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={() => _onSubmitStatus}
            >
              Create A Proposal
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChangeStatus;
