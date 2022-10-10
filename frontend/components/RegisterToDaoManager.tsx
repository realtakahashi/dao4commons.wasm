import { registerToDaoManager } from "@/dao4.frontend.common.wasm/contracts/subdao_api";
import { SubDAODeployFormData } from "../dao4.frontend.common.wasm/types/SubDaoType";
import { get_account_info, get_selected_address } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";

interface FinishRegisterSetting {
  setCheckRegisterDAO: (flg: boolean) => void;
  dataToBeRegisterd: SubDAODeployFormData;
  subDaoAddress: string;
}

const RegisterToDaoManager = (props: FinishRegisterSetting) => {

  const _registerToDaoManager = async () => {
    const selectedAccount = await get_account_info(get_selected_address());
    await registerToDaoManager(
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
          <a href="#deploy_nft">Regisger Your DAO 2 Master DAO</a>
        </button>
        <div className="p-3"></div>
      </div>
    </>
  );
};

export default RegisterToDaoManager;
