import { TokenInfoWithName, TokenKind } from "@/dao4.frontend.common/types/Token";
import Erc20Detail from "./Erc20Detail";
import Erc20ForSale from "./Erc20ForSale";
import Erc721Detail from "./Erc721Detail";
import Erc721ForSale from "./Erc721ForSale";
import GovernanceTokenShowOnly from "./GovenanceTokenShowOnly";
import GovernanceTokenDetail from "./GovernanceTokenDetail";

interface TokenDetailParameter {
  _selectToken: TokenInfoWithName;
  _forMember: boolean;
  _showSettingAndSelectToken:(_showList:boolean,_showDetail:boolean,_selectToken:TokenInfoWithName)=>void;
}

const TokenDetail = (props: TokenDetailParameter) => {
  const _backToTokenList = () => {
    props._showSettingAndSelectToken(true,false,props._selectToken)
  }

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="text-blue-300 text-center text-25px ">
        <button
        className="underline" 
        onClick={()=> _backToTokenList()}>Back To Token List</button>
        </div>
        <div className="p-8"></div>
        {(props._selectToken.tokenKind == TokenKind.ERC20 && props._forMember == true) &&(
          <Erc20Detail selectToken={props._selectToken}></Erc20Detail>
        )}
        {(props._selectToken.tokenKind == TokenKind.ERC20 && props._forMember == false) &&(
          <Erc20ForSale selectToken={props._selectToken}></Erc20ForSale>
        )}
        {(props._selectToken.tokenKind == TokenKind.ERC721 && props._forMember == true) &&(
          <Erc721Detail selectToken={props._selectToken}></Erc721Detail>
        )}
        {(props._selectToken.tokenKind == TokenKind.ERC721 && props._forMember == false) &&(
          <Erc721ForSale selectToken={props._selectToken}></Erc721ForSale>
        )}
        {(props._selectToken.tokenKind == TokenKind.GOVERNANCE && props._forMember == true) &&(
          <GovernanceTokenDetail selectToken={props._selectToken}></GovernanceTokenDetail>
        )}
        {(props._selectToken.tokenKind == TokenKind.GOVERNANCE && props._forMember == false) &&(
          <GovernanceTokenShowOnly selectToken={props._selectToken}></GovernanceTokenShowOnly>
        )}
      </div>
    </>
  );
};

export default TokenDetail;
