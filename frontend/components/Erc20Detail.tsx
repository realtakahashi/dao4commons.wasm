import { TokenInfoWithName } from "@/dao4.frontend.common.wasm/types/Token";
import { useState } from "react";
import Erc20Info from "./Erc20Info";
import ChangeStatus from "./ChangeStatus";
import TokenWithdraw from "./TokenWithdraw";

interface Erc20DetailParameter {
  selectToken: TokenInfoWithName;
  daoAddress: string;
}

const Erc20Detail = (props: Erc20DetailParameter) => {
  const [changeStatus, setChangeStatus] = useState(false);
  const [withdraw, setWithdraw] = useState(false);

  const showChangeStatus = () => {
    console.log("### showChangeStatus:",!changeStatus);
    setChangeStatus(!changeStatus);
      setWithdraw(false);
  };

  const showWithdraw = () => {
    setWithdraw(!withdraw);
      setChangeStatus(false);
  };

  return (
    <>
      <div className="bg-black  min-h-screen">
        <div className="flex justify-center leading-none tracking-tight">
          <div className="text-orange-300 text-30px">
            Menu for managing tokens...{" "}
          </div>
        </div>
        <div className="p-5"></div>
        <div className="flex justify-center">
          <button
            className="p-5 m-5 px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
            onClick={() => showChangeStatus()}
          >
            Change Status
          </button>
          <button
            className="p-5 m-5 px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
            onClick={() => showWithdraw()}
          >
            Withdraw
          </button>
        </div>
        <div className="p-5"></div>
        <Erc20Info
          selectToken={props.selectToken}
          daoAddress={props.daoAddress}
        ></Erc20Info>
        <div className="p-8"></div>
        {
          changeStatus == true && (
            <ChangeStatus
              selectToken={props.selectToken}
              daoAddress={props.daoAddress}
            ></ChangeStatus>
          )
        }
        {
          withdraw == true && (
            <TokenWithdraw
              selectToken={props.selectToken}
              daoAddress={props.daoAddress}
            ></TokenWithdraw>
          )
        }        
      </div>
    </>
  );
};

export default Erc20Detail;
