import Link from "next/link";
import { useEffect, useState } from "react";
import DaoBalance from "dao4.frontend.common.wasm/components/DaoBalance";
import { useRouter } from "next/router";
import { getDaoName } from "dao4.frontend.common.wasm/contracts/subdao_api";
import Member from "@/dao4.frontend.common.wasm/components/Member";
import Proposal from "@/dao4.frontend.common.wasm/components/Proposal";
import Donate from "@/dao4.frontend.common.wasm/components/Donate";
import { TargetDaoKind } from "@/dao4.frontend.common.wasm/types/SubDaoType";
import Divide from "@/dao4.frontend.common.wasm/components/Divide";
import { get_account_info, get_selected_address } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";

const DaoTop = () => {
  const router = useRouter();
  const subDAOaddress = String(router.query.address)
  const [daoName,setDaoName] = useState("");
  const [showMember,setShowMember] = useState(false);
  const [showProposal,setShowProposal] = useState(false);
  const [showDonate,setShowDonate] = useState(false);
  const [showDivide,setShowDivide] = useState(false);

  useEffect(()=>{
    _getDaoName();
  },[])

  const _getDaoName = async () => {
    const selectedAccount = await get_account_info(get_selected_address());
    setDaoName(await getDaoName(selectedAccount.address,subDAOaddress));
  }

  const _setShow = (showMember:boolean,showProposal:boolean,showDonate:boolean,showDivide:boolean) =>{
    setShowMember(showMember);
    setShowProposal(showProposal);
    setShowDonate(showDonate);
    setShowDivide(showDivide);
  }

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="m-5 text-25px text-left text-white underline leading-none tracking-tight">
          <Link href="/">Back to Top</Link>
        </div>
        <div className="text-center text-100px font-extrabold leading-none tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-100">
            {daoName}
          </span>
        </div>
        <div className="p-4 text-center">
          <DaoBalance daoAddress={subDAOaddress} isMasterDao={false}></DaoBalance>
        </div>
        <div className="p-1 text-center text-25px">
          <button 
            className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500"
            onClick={()=>_setShow(!showMember,false,false,false)}
          >
            Members
          </button>
          <button 
            className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500"
            onClick={()=>_setShow(false,!showProposal,false,false)}
          >
            Proposals
          </button>
          <button 
            className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500"
            onClick={()=>_setShow(false,false,!showDonate,false)}
          >
            Donate
          </button>
          <button 
            className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500"
            onClick={()=>_setShow(false,false,false,!showDivide)}
          >
            Divide
          </button>
          <Link href={`/dao/${subDAOaddress}/tokens`}>
          <button
            className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500"
          >
            Tokens
          </button>
          </Link>
        </div>
        {showMember == true &&(
          <Member daoAddress={subDAOaddress}></Member>
        )}
        {showProposal == true &&(
          <Proposal daoAddress={subDAOaddress}></Proposal>
        )}
        {showDonate == true && (
          <Donate daoAddress={subDAOaddress} daoName={daoName} targetDaoKind={TargetDaoKind.TARGET_DAO_FROM_INDIVIDIALS}></Donate>
        )}
        {showDivide == true && (
          <Divide  daoAddress={subDAOaddress} daoName={daoName} targetDaoKind={TargetDaoKind.NONE}></Divide>
        )}
      </div>
    </>
  );
};

export default DaoTop;

