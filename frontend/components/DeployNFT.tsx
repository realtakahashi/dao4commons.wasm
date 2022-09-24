import { MemberNFTDeployFormData } from "../dao4.frontend.common/types/MemberNftType";
import { useState } from "react";
import { deployMemberNFT } from "../dao4.frontend.common/contracts/member_nft_api";

interface FinishMintSetting {
  setCheckDeployNft: (flg: boolean) => void;
  setNftAddress:(value: string) => void;
}

const DeployNFT = (props:FinishMintSetting) => {
  const [nftAddress, setNftAddress] = useState("");
  const [nftValue, setNftValue] = useState<MemberNFTDeployFormData>({
    name: "",
    symbol: "",
    tokenURI: "",
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNftValue({
      ...nftValue,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await deployMemberNFT(nftValue,props.setNftAddress,props.setCheckDeployNft);
    setNftAddress(result);
    console.log("#### nftAddress",nftAddress);
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
              <th className=" flex justify-end px-4 py-2">
                Symbol:
              </th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none rounded w-2/3 py-2 px-4 
                        leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                  name="symbol"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
            <tr>
              <th className=" flex justify-end px-4 py-2">
                Base Uri:
              </th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none rounded w-2/3 py-2 px-4 
                        leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                  name="tokenURI"
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
        <div className="m-5 text-center text-orange-400 text-20px">
          Your NFT Address is : {nftAddress}
        </div>
      </form>
      <div className="p-5"></div>
    </>
  );
};

export default DeployNFT;
