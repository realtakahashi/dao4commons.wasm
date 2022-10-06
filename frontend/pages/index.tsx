import { useEffect, useState } from "react";
import Link from "next/link";
import ListOfSubDAO from "../components/ListOfSubDAO";
import SelectAccount from "@/components/SelectAccount";

import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

const Home = () => {
  const [showSelectAccount, setShowSelectAccount] = useState(false);
  const [account, setAccount] = useState<InjectedAccountWithMeta>({address:"",meta:{genesisHash:"",name:"",source:""}});

  const checkSelectedAccount = () => {
    let address = sessionStorage.getItem("selected_account_address");
    console.log("## address: ",address);
    if (address == "" || address == null) {
      setShowSelectAccount(true);
    }
  };

  useEffect(() => {
    checkSelectedAccount();
  }, []);

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="text-center text-100px font-extrabold leading-none tracking-tight">
          <div className="p-3"></div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-red-500">
            Enpower Your Activities by DAO
          </span>
        </div>
        {showSelectAccount ? (
          <>
            <SelectAccount
              setShowAccount={setShowSelectAccount}
            ></SelectAccount>
          </>
        ) : (
          <>
            <div className="p-1 text-center text-25px">
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href="dao/create/">Create Your DAO</Link>
              </button>
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href="dao/join/">Join to the DAO</Link>
              </button>
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href="dao/burn/">Burn Member NFT</Link>
              </button>
            </div>
              <ListOfSubDAO></ListOfSubDAO>
          </>
        )}
      </div>
    </>
  );
};
export default Home;
