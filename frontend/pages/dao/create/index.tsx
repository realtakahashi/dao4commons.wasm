import { SubDAODeployFormData } from "../../../dao4.frontend.common.wasm/types/SubDaoType";
import AddFirstMmeber from "@/components/AddFirstMember";
import DeployDAO from "@/components/DeployDAO";
import DeployNFT from "@/components/DeployNFT";
import MintNFT from "@/components/MintNFT";
import RegisterToDaoManager from "@/components/RegisterToDaoManager";
import Link from "next/link";
import { useState, useEffect } from "react";

import { useRouter } from "next/router";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { AccountProvider } from "@/hooks/account_context";
import {
  get_account_info,
  get_selected_address,
} from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";

const CreateDAO = () => {
  const [showDeployDao, setShowDeployDao] = useState(false);
  const [showRegisterDao, setShowRegisterDao] = useState(false);
  const [showAddFirstMember, setShowAddFirstMember] = useState(false);
  const [checkMintNft, setCheckMintNft] = useState(false);
  const [checkDeployDao, setCheckDeployDao] = useState(false);
  const [checkRegisterDAO, setCheckRegisterDAO] = useState(false);
  const [checkAddFirstMember, setCheckAddFirstMember] = useState(false);
  const [daoAddress, setDaoAddress] = useState("");
  const [daoValue, setDaoValue] = useState<SubDAODeployFormData>({
    name: "",
    githubUrl: "",
    description: "",
  });

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="m-5 text-25px text-left text-white underline leading-none tracking-tight">
          <Link href="/">Back to Top</Link>
        </div>
        <div className="text-50px text-center text-orange-200 leading-none tracking-tight">
          <p className="">You need the following steps to create a DAO. </p>
          <div className="p-3"></div>
          <p className="">Click each step.</p>
        </div>
        <div className="m-3"></div>
        <div className="flex flex-col justify-center m-5 leading-none tracking-tight">
          <table>
            <tr className="text-30px">
              <td className="text-center">
                <button
                  className="m-2 text-white hover:text-orange-400"
                  onClick={() => setShowDeployDao(true)}
                >
                  &nbsp; &nbsp; 1.&nbsp; Deploy your DAO.
                </button>
              </td>
              {checkDeployDao == true && (
                <td>
                  <p className="px-5 text-blue-500">Finished</p>
                </td>
              )}
              {checkDeployDao == false && (
                <td>
                  <p className="px-5 text-red-500">Yet</p>
                </td>
              )}
            </tr>
            <div>
              {showDeployDao == true && (
                <DeployDAO
                  setCheckDeployDao={setCheckDeployDao}
                  setDaoAddress={setDaoAddress}
                  setDaoValue={setDaoValue}
                ></DeployDAO>
              )}
            </div>
            <tr className="text-30px">
              <td className="text-center">
                <button
                  className="m-2 text-white hover:text-orange-500"
                  onClick={() => setShowRegisterDao(true)}
                >
                  &nbsp; &nbsp; 2.&nbsp; Register your DAO.
                </button>
              </td>
              {checkRegisterDAO == true && (
                <td>
                  <p className="px-5 text-blue-500">Finished</p>
                </td>
              )}
              {checkRegisterDAO == false && (
                <td>
                  <p className="px-5 text-red-500">Yet</p>
                </td>
              )}
            </tr>
            <div>
              {checkDeployDao == true && showRegisterDao == true && (
                <RegisterToDaoManager
                  setCheckRegisterDAO={setCheckRegisterDAO}
                  dataToBeRegisterd={daoValue}
                  subDaoAddress={daoAddress}
                ></RegisterToDaoManager>
              )}
            </div>
            <tr className="text-30px">
              <td className="text-center">
                <button
                  className="m-2 text-white hover:text-orange-500"
                  onClick={() => setShowAddFirstMember(true)}
                >
                  &nbsp; &nbsp; 3.&nbsp; Register you to the DAO as the owner.
                </button>
              </td>
              {checkAddFirstMember == true && (
                <td>
                  <p className="px-5 text-blue-500">Finished</p>
                </td>
              )}
              {checkAddFirstMember == false && (
                <td>
                  <p className="px-5 text-red-500">Yet</p>
                </td>
              )}
            </tr>
            <div>
              {checkRegisterDAO == true && showAddFirstMember == true && (
                <AddFirstMmeber
                  setCheckAddFirstMember={setCheckAddFirstMember}
                  subDaoAddress={daoAddress}
                ></AddFirstMmeber>
              )}
            </div>
          </table>
        </div>
      </div>
    </>
  );
};

export default CreateDAO;
