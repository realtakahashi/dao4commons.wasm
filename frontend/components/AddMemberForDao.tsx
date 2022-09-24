import { addMemberForDao } from "@/dao4.frontend.common/contracts/membermanager_api";
import { MemberFormDataForDao } from "@/dao4.frontend.common/types/MemberManagerType";
import { useState } from "react";

interface AddMemberForDaoParam{
    setCheckAddMember:(flg:boolean) => void;
    tokenAddress:string;
}
const AddMemberForDao = (props:AddMemberForDaoParam) => {
  const [addMemberValue, setAddMemberValue] = useState<MemberFormDataForDao>({
    name: "",
    memberAddress: "",
    proposalId: 0,
    targetDaoAddress: "",
    tokenId: 0,
    tokenAddress:"",
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddMemberValue({
      ...addMemberValue,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const memberManagerAddress =
      process.env.NEXT_PUBLIC_MEMBER_MANAGER_CONTRACT_ADDRESS ?? "";
    event.preventDefault();
    addMemberValue.tokenAddress = props.tokenAddress;
    await addMemberForDao(
        memberManagerAddress,
      addMemberValue,
      props.setCheckAddMember
    );
  };

  return (
    <>
      <form className="" onSubmit={_onSubmit}>
        <div className="bg-black flex flex-col ">
          <div className="flex justify-center text-orange-400 text-30px">
            You are going to Join to the DAO...
          </div>
          <div className="p-5"></div>

          <div className="flex justify-center">
            <table className="text-white">
              <tr>
                <th className="flex justify-start m-5">DAO Address : </th>
                <td>
                  <input
                    className="m-5 appearance-none border-2 border-gray-200 rounded  py-2 px-4 text-gray-700 
                            leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="targetDaoAddress"
                    type="text"
                    onChange={onChangeInput}
                  ></input>
                </td>
              </tr>
              <tr>
                <th className="flex justify-start m-5">Your Name : </th>
                <td>
                  <input
                    className="m-5 appearance-none border-2 border-gray-200 rounded  py-2 px-4 text-gray-700 
                            leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="name"
                    type="text"
                    onChange={onChangeInput}
                  ></input>
                </td>
              </tr>
              <tr>
                <th className="flex justify-start m-5">
                  Proposal Id which you are approved :{" "}
                </th>
                <td>
                  <input
                    className="m-5 appearance-none border-2 border-gray-200 rounded  py-2 px-4 text-gray-700 
                            leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="proposalId"
                    type="text"
                    onChange={onChangeInput}
                  ></input>
                </td>
              </tr>
              <tr>
                <th className="flex justify-start m-5">
                  Token Id which you are minted :{" "}
                </th>
                <td>
                  <input
                    className="m-5 appearance-none border-2 border-gray-200 rounded  py-2 px-4 text-gray-700 
                            leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    name="tokenId"
                    type="text"
                    onChange={onChangeInput}
                  ></input>
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div className="flex justify-center p-3">
          <button
            className="px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
            onClick={() => _onSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default AddMemberForDao;
