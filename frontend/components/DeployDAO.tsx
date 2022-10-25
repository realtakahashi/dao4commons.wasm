import { deploySubDAO } from "../dao4.frontend.common.wasm/contracts/subdao_api";
import { SubDAODeployFormData } from "../dao4.frontend.common.wasm/types/SubDaoType";
import { useState } from "react";
import { get_account_info, get_selected_address } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";

interface DeployDaoParameter {
  setCheckDeployDao: (flg: boolean) => void;
  setDaoAddress: (address: string) => void;
  setDaoValue: (daoValue: SubDAODeployFormData) => void;
}

const DeployDAO = (props: DeployDaoParameter) => {
  const [daoAddress, setDaoAddress] = useState("");
  const [daoValue, setDaoValue] = useState<SubDAODeployFormData>({
    name: "",
    githubUrl: "",
    description: "",
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDaoValue({
      ...daoValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDaoValue({
      ...daoValue,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedAccount = await get_account_info(get_selected_address());
    console.log("_onSubmit-selectedAccount: ",selectedAccount);
    await deploySubDAO(
      selectedAccount,
      daoValue,
      props.setDaoAddress,
      setDaoAddress,
      props.setCheckDeployDao
    );
    props.setDaoValue(daoValue);
  };

  return (
    <>
      <div className="p-3"></div>
      <form className="" onSubmit={_onSubmit}>
        <div className=" p-2 flex flex-col">
          <table className="text-20px text-orange-400">
            <tr>
              <th className=" flex justify-end px-4 py-2">Name:</th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none rounded w-2/3 py-2 px-4
                        leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                  name="name"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
            <tr>
              <th className=" flex justify-end px-4 py-2">Github Url:</th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none rounded w-2/3 py-2 px-4 
                        leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                  name="githubUrl"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
            <tr>
              <th className=" flex justify-end px-4 py-2">Description:</th>
              <td className=" px-4 py-2">
                <textarea
                  className="appearance-none rounded w-2/3 py-2 px-4 
                        leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                  name="description"
                  rows={5}
                  onInput={onChangeText}
                ></textarea>
              </td>
            </tr>
          </table>
        </div>
        <div className="flex justify-center">
          <button
            className="px-7 py-3 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
            onClick={() => _onSubmit}
          >
            Submit
          </button>
        </div>
        <div className="m-5 text-center text-green-400 text-20px">
          Your DAO Address is : {daoAddress}
        </div>
      </form>
      <div className="p-5"></div>
    </>
  );
};

export default DeployDAO;
