import { useState } from "react";
import { useEffect } from "react";
import { getMemberNFTAddress } from "@/dao4.frontend.common/contracts/subdao_api";

interface MemberNFTAddressParam {
  daoAddress: string;
}

const MemberNFTAddress = (props: MemberNFTAddressParam) => {
  const [showNFTAddress, setShowNFTAddress] = useState("");

  const _getAddress = async () => {
    setShowNFTAddress(await getMemberNFTAddress(props.daoAddress));
  };

  useEffect(() => {
    _getAddress();
  });

  return (
    <label className="text-white text-20px">
      NFT Address as a Member Card : {showNFTAddress}
    </label>
  );
};

export default MemberNFTAddress;
