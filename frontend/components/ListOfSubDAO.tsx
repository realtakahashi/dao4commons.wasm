import { useContext, useState } from "react";
import {
  SubDAOData,
  SubDAODataWithMemberFlg,
} from "../dao4.frontend.common.wasm/types/SubDaoType";
import {
  getDaoListOfAffiliation,
  listSubDAO,
  listDAOAddress,
} from "../dao4.frontend.common.wasm/contracts/subdao_api";
import { useEffect } from "react";
import Link from "next/link";
import Donate from "@/dao4.frontend.common.wasm/components/Donate";
import { TargetDaoKind } from "@/dao4.frontend.common.wasm/types/SubDaoType";
import TokenList from "./TokenList";

import { get_selected_address, get_account_info } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";
import { AppContext } from "../pages/_app";

const ListOfSubDAO = () => {
  const [subDaoList, setSubDaoList] =
    useState<Array<SubDAODataWithMemberFlg>>();
  const [showList, setShowList] = useState(true);
  const [showListButton, setShowListButton] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [selectDao, setSelectDao] = useState<SubDAODataWithMemberFlg>({
    daoName: "",
    daoAddress: "",
    githubURL: "",
    description: "",
    isMember: false,
  });
  const {api} = useContext(AppContext);

  const getSubDaoList = async () => {
    //console.log("## getSubDaoList call 1");
    const selectedAccount = await get_account_info(get_selected_address());
    const dao_address_list = await listDAOAddress(api,selectedAccount.address);
    const list = await listSubDAO(api,selectedAccount.address,dao_address_list);
    console.log("## address_list:",list);
    const result = await getDaoListOfAffiliation(api,selectedAccount.address, list);
    console.log("## daolist:",result);
    setSubDaoList(result);
  };

  useEffect(() => {
    getSubDaoList();
  }, []);

  const showSettingAndSelectDAO = (
    _showList: boolean,
    _showListButton: boolean,
    _showDonate: boolean,
    _showTokens: boolean,
    _selectDao: SubDAODataWithMemberFlg
  ) => {
    showSetting(_showList, _showListButton, _showDonate, _showTokens);
    setSelectDao(_selectDao);
  };

  const showSetting = (
    _showList: boolean,
    _showListButton: boolean,
    _showDonate: boolean,
    _showTokens: boolean
  ) => {
    setShowList(_showList);
    getSubDaoList();
    setShowListButton(_showListButton);
    setShowDonate(_showDonate);
    setShowTokens(_showTokens);
  };

  return (
    <>
      <div className="p-2 flex flex-wrap justify-center mx-1 lg:-mx-4">
        {showListButton == true && (
          <button
            className="px-4 py-2 text-20px text-white underline  hover:text-orange-400"
            onClick={() => showSetting(true, false, false, false)}
          >
            Back To DAO List
          </button>
        )}
      </div>
      {showList == true && (
        <div className="p-2 flex flex-wrap justify-center mx-1 lg:-mx-4">
          {typeof subDaoList !== "undefined"
            ? subDaoList.map((subDao) => {
                return (
                  <div key={subDao.daoName}>
                    <div className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white">
                      <div className="px-6 py-4">
                        <div className="font-bold mb-2 text-white">
                          {subDao.daoName}
                        </div>
                        <p className="text-gray-200 text-12px">
                          {subDao.daoAddress}
                        </p>
                        <p className="p-3 text-gray-400 text-base">
                          {subDao.description}
                        </p>
                      </div>
                      <div className="px-6 pb-2">
                        <button
                          className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                          onClick={() =>
                            showSettingAndSelectDAO(
                              false,
                              true,
                              true,
                              false,
                              subDao
                            )
                          }
                        >
                          Donate
                        </button>
                        <button
                          className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                          onClick={() =>
                            showSettingAndSelectDAO(
                              false,
                              true,
                              false,
                              true,
                              subDao
                            )
                          }
                        >
                          Tokens
                        </button>
                        <button className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                          <Link href={subDao.githubURL}>
                            <a target={"_blank"} rel="noopener noreferrer">
                              Website
                            </a>
                          </Link>
                        </button>
                        {subDao.isMember == true && (
                          <Link href={`/dao/${subDao.daoAddress}/top`}>
                            <button className="inline-block bg-orange-500 rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2">
                              DAO Entrance
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            : ""}
        </div>
      )}
      ;
      {showDonate == true && (
        <Donate
          daoAddress={selectDao.daoAddress}
          daoName={selectDao.daoName}
          targetDaoKind={TargetDaoKind.TARGET_DAO_FROM_INDIVIDIALS}
        ></Donate>
      )}
      {showTokens == true && (
        <TokenList
          daoAddress={selectDao.daoAddress}
          showList={showList}
          setShowList={setShowList}
          forMember={false}
        ></TokenList>
      )}
    </>
  );
};

export default ListOfSubDAO;
