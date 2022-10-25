import { addFirstMember } from "../dao4.frontend.common.wasm/contracts/membermanager_api";
import { useState, useContext } from "react";
import { FirstMemberData } from "../dao4.frontend.common.wasm/types/MemberManagerType";
import { get_account_info, get_selected_address } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";
import { AppContext } from "../pages/_app";

interface FirstMemberParameter {
  setCheckAddFirstMember: (flg: boolean) => void;
  subDaoAddress: string;
}

const AddFirstMmeber = (props: FirstMemberParameter) => {
  const [memberValue, setMemberValue] = useState<FirstMemberData>({
    ownerName: "",
    tokenId: 0,
  });
  const {api} = useContext(AppContext);

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMemberValue({
      ...memberValue,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedAccount = await get_account_info(get_selected_address());
    const result = await addFirstMember(
      api,
      selectedAccount,
      memberValue,
      props.subDaoAddress,
      props.setCheckAddFirstMember);
  };

  return (
    <>
      <div className="p-3"></div>
      <form className="" onSubmit={_onSubmit}>
        <div className=" p-2 flex flex-col">
          <table className="text-20px text-orange-400">
            <tr>
              <th className=" flex justify-end px-4 py-2">Owner Name:</th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none rounded w-2/3 py-2 px-4
                              leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                  name="ownerName"
                  type="text"
                  onChange={onChangeInput}
                ></input>
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
      </form>
      <div className="p-5"></div>
    </>
  );
};

export default AddFirstMmeber;
