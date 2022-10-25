import { registerToDaoManager } from "@/dao4.frontend.common.wasm/contracts/subdao_api";
import { SubDAODeployFormData } from "../dao4.frontend.common.wasm/types/SubDaoType";
import { get_account_info, get_selected_address } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";
import { useContext } from "react";
import { AppContext } from "../pages/_app";
import { checkAndCreateApiObject } from "@/dao4.frontend.common.wasm/contracts/contract_common_util";

interface FinishRegisterSetting {
  setCheckRegisterDAO: (flg: boolean) => void;
  dataToBeRegisterd: SubDAODeployFormData;
  subDaoAddress: string;
}

const RegisterToDaoManager = (props: FinishRegisterSetting) => {
  const {api,setApi} = useContext(AppContext);

  const _registerToDaoManager = async () => {
    await checkAndCreateApiObject(api, setApi);
    const selectedAccount = await get_account_info(get_selected_address());
    await registerToDaoManager(
      api,
      selectedAccount,
      props.subDaoAddress,
      props.setCheckRegisterDAO);
  };

  return (
    <>
      <div className="p-3"></div>
      <div className="p-1 text-center text-20px">
        <button
          className="px-7 py-3 border-double border-white border-2 bg-black rounded text-orange-400  hover:bg-orange-200"
          onClick={() => _registerToDaoManager()}
        >
          <a href="#deploy_nft">Regisger Your DAO</a>
        </button>
        <div className="p-3"></div>
      </div>
    </>
  );
};

export default RegisterToDaoManager;
