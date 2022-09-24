import { useState } from "react";
import { mintMemberNFT } from "../dao4.frontend.common/contracts/member_nft_api";

interface FinishMintSetting {
  setCheckMintNft: (flg: boolean) => void;
  setTokenId: (id: string) => void;
  setTokenAddress:(tokenAddress:string) => void;
  nftAddress: string;
}

const MintNFT = (props: FinishMintSetting) => {
  //console.log("#### MintNFT")
  const [nftAddress,setNftAddress] = useState("");
  const _mintNft = async () => {
    let tmpAddress = props.nftAddress;
    if (tmpAddress == ""){
      tmpAddress = nftAddress;
    }
    await mintMemberNFT(tmpAddress, props.setTokenId, props.setCheckMintNft);
    props.setCheckMintNft(true);
    props.setTokenAddress(tmpAddress);
  };

  return (
    <>
      <div className="p-3"></div>
      {props.nftAddress == "" && (
          <div className=" p-2 flex flex-col">
            <table className="text-20px text-orange-400">
              <tr>
                <th className=" flex justify-end px-4 py-2">NFT Address:</th>
                <td className=" px-4 py-2">
                  <input
                    className="appearance-none rounded w-2/3 py-2 px-4
                      leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                    name="name"
                    type="text"
                    onChange={(e) => setNftAddress(e.target.value)}
                  ></input>
                </td>
              </tr>
            </table>
          </div>
      )}
      <div className="p-1 text-center text-20px">
        <button
          className="px-7 py-3 border-double border-white border-2 bg-black rounded text-orange-400  hover:bg-orange-200"
          onClick={() => _mintNft()}
        >
          <a href="#deploy_nft">Mint The NFT</a>
        </button>
        <div className="p-3"></div>
      </div>
    </>
  );
};

export default MintNFT;
