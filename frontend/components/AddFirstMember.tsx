import { addFirstMember } from "../dao4.frontend.common/contracts/membermanager_api";
import { useState } from "react";
import { FirstMemberData } from "../dao4.frontend.common/types/MemberManagerType";

interface FirstMemberParameter {
  setCheckAddFirstMember: (flg: boolean) => void;
  subDaoAddress: string;
  tokenId: string;
}

const AddFirstMmeber = (props: FirstMemberParameter) => {
  const [memberValue, setMemberValue] = useState<FirstMemberData>({
    ownerName: "",
    tokenId: 0,
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMemberValue({
      ...memberValue,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const memberManagerAddress =
      process.env.NEXT_PUBLIC_MEMBER_MANAGER_CONTRACT_ADDRESS ?? "";
    memberValue.tokenId = parseInt(props.tokenId);

    const result = await addFirstMember(memberValue,memberManagerAddress,props.subDaoAddress,props.setCheckAddFirstMember);
    props.setCheckAddFirstMember(true);
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
