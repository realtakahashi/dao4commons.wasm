import AddMemberForDao from "@/components/AddMemberForDao";
import MintNFT from "@/components/MintNFT";
import Link from "next/link";
import { useState } from "react";

const Join = () => {
    const [showMintNft, setShowMintNft] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [checkMintNft,setCheckMintNft] = useState(false);
    const [checkAddMember,setCheckAddMember] = useState(false);
    const [tokenAddress,setTokenAddress] = useState("");
    const [tokenId, setTokenId] = useState("");
  
    return (
      <>
        <div className="bg-black flex flex-col min-h-screen">
          <div className="m-5 text-25px text-left text-white underline leading-none tracking-tight">
            <Link href="/">Back to Top</Link>
          </div>
          <div className="text-50px text-center text-orange-200 leading-none tracking-tight">
            <p className="">You need the following steps to join the DAO. </p>
            <div className="p-3"></div>
            <p className="">Click each step.</p>
          </div>
          <div className="m-1"></div>
          <div className="flex flex-col justify-center m-5 leading-none tracking-tight">
            <table>
            <tr className="text-30px">
                <td className=" text-orange-200 text-center">
                &nbsp; &nbsp; ## &nbsp; Contact DAO for additional member approval.
                </td>
              </tr>
              <div className="p-2"></div>
              <tr className="text-30px">
                <td className=" text-orange-200 text-center">
                &nbsp; &nbsp; ## &nbsp; Get The Member NFT Address.
                </td>
              </tr>
              <div className="p-2"></div>
              <tr className="text-30px">
                <td className=" text-orange-200 text-center">
                &nbsp; &nbsp; ## &nbsp; Get The DAO Address.
                </td>
              </tr>
              <div className="p-8"></div>
              <tr className="text-30px">
                <td className="text-center">
                  <button
                    className="m-2 text-white hover:text-orange-200"
                    onClick={() => setShowMintNft(true)}
                  >
                    &nbsp; &nbsp; 1.&nbsp; Mint your own NFT.
                  </button>
                </td>
                {checkMintNft == true && (
                  <td>
                    <p className="px-5 text-blue-500">Finished</p>
                  </td>
                )}
                {checkMintNft == false && (
                  <td>
                    <p className="px-5 text-red-500">Yet</p>
                  </td>
                )}
              </tr>
              <div>
                {showMintNft == true && (
                  <>
                    <div className="m-3"></div>
                    <MintNFT
                    setCheckMintNft={setCheckMintNft}
                    nftAddress={""}
                    setTokenId={setTokenId}
                    setTokenAddress={setTokenAddress}
                  ></MintNFT>
                  </>
                )}
              </div>
              <div className="text-20px text-blue-300 text-center">
                    Your Token Id of Member NFT is [ {tokenId} ]
              </div>
              <div className="p-5"></div>
              <tr className="text-30px">
                <td className="text-center">
                  <button
                    className="m-2 text-white hover:text-orange-200"
                    onClick={() => setShowAddMember(true)}
                  >
                    &nbsp; &nbsp; 2.&nbsp; Add You 2 Member.
                  </button>
                </td>
                {checkAddMember == true && (
                  <td>
                    <p className="px-5 text-blue-500">Finished</p>
                  </td>
                )}
                {checkAddMember == false && (
                  <td>
                    <p className="px-5 text-red-500">Yet</p>
                  </td>
                )}
              </tr>
              <div>
                {(checkMintNft==true && showAddMember == true) && (
                  <>
                    <div className="p-5"></div>
                    <AddMemberForDao setCheckAddMember={setCheckAddMember} tokenAddress={tokenAddress}></AddMemberForDao>
                  </>
                )}
              </div>
            </table>
          </div>
        </div>
      </>
    );
  
};

export default Join;
