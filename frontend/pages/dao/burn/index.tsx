import AddMemberForDao from "@/components/AddMemberForDao";
import MintNFT from "@/components/MintNFT";
import { burnMemberNft } from "@/dao4.frontend.common/contracts/member_nft_api";
import Link from "next/link";
import { useState } from "react";

const Burn = () => {
  const [memberNftAddress, setMemberNftAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const _burn_memberNft = async () => {
    await burnMemberNft(memberNftAddress, Number(tokenId));
  };
  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="m-5 text-25px text-left text-white underline leading-none tracking-tight">
          <Link href="/">Back to Top</Link>
        </div>
        <div className="text-30px text-center text-orange-200 leading-none tracking-tight">
          <p className="">You are going to burn your member NFT... </p>
        </div>
        <div className="m-1 p-5"></div>
        <div className="flex justify-center m-5 leading-none tracking-tight">
          <table className="text-white">
            <tr className="text-30px">
              <th className="flex justify-start py-2">Member NFT Address : </th>
              <td className="px-4 py-2 text-black">
                <input
                    className="px-2 py-1"
                  onChange={(e) => setMemberNftAddress(e.target.value)}
                ></input>
              </td>
            </tr>
            <div className="p-3"></div>
            <tr className="text-30px">
              <th className="flex justify-start py-2">Token Id : </th>
              <td className="px-4 py-2 text-black">
                <input className="px-2 py-1" onChange={(e) => setTokenId(e.target.value)}></input>
              </td>
            </tr>
          </table>
        </div>
        <div className="p-5"></div>
            <div className="text-25px flex justify-center">
                <button
                  className="px-4 py-1  border-black border-2 bg-white rounded text-black  hover:bg-green-200"
                  onClick={() => _burn_memberNft()}
                >
                  Burn
                </button>
            </div>

      </div>
    </>
  );
};

export default Burn;
