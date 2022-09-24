import { SubDAODeployFormData } from "../dao4.frontend.common/types/SubDaoType";
import { registerSubDAO } from "../dao4.frontend.common/contracts/masterdao_api";

interface FinishRegisterSetting {
  setCheckRegisterDAO: (flg: boolean) => void;
  dataToBeRegisterd: SubDAODeployFormData;
  subDaoAddress: string;
}

const RegisterToMasterDao = (props: FinishRegisterSetting) => {
  const _registerToMasterDao = async () => {
    let masterDaoAddress = "";
    if (process.env.NEXT_PUBLIC_MASTERDAO_CONTRACT_ADDRESS !== "undefined") {
      masterDaoAddress = String(
        process.env.NEXT_PUBLIC_MASTERDAO_CONTRACT_ADDRESS
      );
    }

    await registerSubDAO(
      props.subDaoAddress,
      props.dataToBeRegisterd,
      masterDaoAddress,
      props.setCheckRegisterDAO
    );
  };

  return (
    <>
      <div className="p-3"></div>
      <div className="p-1 text-center text-20px">
        <button
          className="px-7 py-3 border-double border-white border-2 bg-black rounded text-orange-400  hover:bg-orange-200"
          onClick={() => _registerToMasterDao()}
        >
          <a href="#deploy_nft">Regisger Your DAO 2 Master DAO</a>
        </button>
        <div className="p-3"></div>
      </div>
    </>
  );
};

export default RegisterToMasterDao;
