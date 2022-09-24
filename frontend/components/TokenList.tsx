import { getSalesStatus } from "@/dao4.frontend.common/contracts/DaoErc20_api";
import {
  getTokenList,
  getTokenListWithName,
} from "@/dao4.frontend.common/contracts/subdao_api";
import {
  TokenInfo,
  TokenInfoWithName,
  TokenKind,
} from "@/dao4.frontend.common/types/Token";
import { useEffect, useState } from "react";
import TokenDetail from "./TokenDetail";

interface TokenListParameter {
  daoAddress: string;
  showList: boolean;
  setShowList: (flg: boolean) => void;
  forMember: boolean;
}

const TokenList = (props: TokenListParameter) => {
  const [tokenList, setTokenList] = useState<Array<TokenInfoWithName>>();
  const [showTokenList, setShowTokenList] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [selectToken, setSelectToken] = useState<TokenInfoWithName>({
    tokenName: "",
    tokenSymbol: "",
    tokenAddress: "",
    tokenKind: 0,
  });

  const showSettingAndSelectToken = (
    _showList: boolean,
    _showDetail: boolean,
    _selectToken: TokenInfoWithName
  ) => {
    console.log("#### showSettingAndSelectToken");
    setShowTokenList(_showList);
    setShowDetail(_showDetail);
    setSelectToken(_selectToken);
  };

  const _getTokenList = async () => {
    const list = await getTokenList(props.daoAddress);
    setTokenList(await getTokenListWithName(list));
  };

  const _getTokenKindString = (tokenKind: TokenKind): string => {
    if (tokenKind == TokenKind.ERC20) {
      return "ERC20";
    } else if (tokenKind == TokenKind.ERC721){
      return "ERC721";
    } else{
      return "Governance"
    }

  };

  useEffect(() => {
    _getTokenList();
  }, []);

  return (
    <>
      {showTokenList == true && (
        <div className="p-2 flex flex-wrap justify-center mx-1 lg:-mx-4">
          {typeof tokenList !== "undefined"
            ? tokenList.map((token) => {
                return (
                  <div key={token.tokenAddress}>
                    <div className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white">
                      <div className="px-6 py-4">
                        <div className="font-bold mb-2 text-white text-20px">
                          {token.tokenName} / {token.tokenSymbol}
                        </div>
                        <p className=" text-gray-400 text-base">
                          {_getTokenKindString(token.tokenKind)}
                        </p>
                        <div className="p-2"></div>
                        <p className="text-gray-200 text-12px">
                          {token.tokenAddress}
                        </p>
                      </div>
                      <div className="px-6 pb-2">
                        <button
                          className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                          onClick={() =>
                            showSettingAndSelectToken(false, true, token)
                          }
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            : ""}
        </div>
      )}
      ;
      {showDetail == true && (
        <TokenDetail
          _selectToken={selectToken}
          _forMember={props.forMember}
          _showSettingAndSelectToken={showSettingAndSelectToken}
        ></TokenDetail>
      )}
    </>
  );
};

export default TokenList;
