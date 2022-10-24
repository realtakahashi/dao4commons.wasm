import IssueErc20 from "@/components/IssueErc20";
import IssueErc721 from "@/components/IssueErc721";
import IssueGovernance from "@/components/IssueGovernanceToken";
import TokenList from "@/components/TokenList";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const Tokens = () => {
  const router = useRouter();
  const subDAOaddress = String(router.query.address);
  const [showTokenList, setShowTokenList] = useState(true);
  const [showIssueErc20, setShowIssueErc20] = useState(false);
  const [showIssueErc721, setShowIssueErc721] = useState(false);
  const [showIssueGovernance, setShowIssueGovernance] = useState(false);

  const _setShow = (
    _showTokeList: boolean,
    _showIssueErc20: boolean,
    _showIssueErc721: boolean,
    _showIssueGovernance: boolean,
  ) => {
      setShowTokenList(_showTokeList);
      setShowIssueErc20(_showIssueErc20);
      setShowIssueErc721(_showIssueErc721);
      setShowIssueGovernance(_showIssueGovernance);
  };

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="m-5 text-25px text-left text-white underline leading-none tracking-tight">
          <Link href={`/dao/${subDAOaddress}/top`}>
            <a>Back To Dao Top</a>
          </Link>
        </div>
        <div className="p-1 text-center text-25px">
            <button
            className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500"
            onClick={() => _setShow(!showTokenList,false,false,false)}
          >
            Token List
          </button>
          <button
            className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500"
            onClick={() => _setShow(false,!showIssueErc20,false,false)}
          >
            Issue PSP22
          </button>
          <button
            className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500"
            onClick={() => _setShow(false, false, !showIssueErc721,false)}
          >
            Issue PSP34
          </button>
          <button
            className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500"
            onClick={() => _setShow(false, false, false,!showIssueGovernance)}
          >
            Issue Governance Token
          </button>
        </div>
      {showTokenList == true && (
        <TokenList daoAddress={subDAOaddress} showList={true} setShowList={()=>setShowTokenList} forMember={true}></TokenList>
      )}
      {showIssueErc20 == true && (
        <IssueErc20 daoAddress={subDAOaddress}></IssueErc20>
      )}
      {showIssueErc721 == true && (
        <IssueErc721 daoAddress={subDAOaddress}></IssueErc721>
      )}
      {showIssueGovernance == true && (
        <IssueGovernance daoAddress={subDAOaddress}></IssueGovernance>
      )}
      </div>
    </>
  );
};

export default Tokens;
