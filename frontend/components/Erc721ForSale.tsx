import {
  buy,
  getPrice,
  getSalesStatus,
} from "@/dao4.frontend.common.wasm/contracts/DaoErc721_api";
import { TokenInfoWithName } from "@/dao4.frontend.common.wasm/types/Token";
import { useEffect, useState,useContext } from "react";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import {
  get_account_info,
  get_selected_address,
} from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { formatBalances } from "@/dao4.frontend.common.wasm/contracts/contract_common_util";
import { AppContext } from "../pages/_app";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";

interface Erc721ForSaleParameter {
  selectToken: TokenInfoWithName;
}

const Erc721ForSale = (props: Erc721ForSaleParameter) => {
  const [saleStatus, setSaleStatus] = useState("");
  const [price, setPrice] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>({
      address: "",
      meta: { genesisHash: "", name: "", source: "" },
    });
    const {api} = useContext(AppContext);

  const getAccountInfo = async () => {
    setSelectedAccount(await get_account_info(get_selected_address()));
  };

  const _onSubmitBuy = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("### psp34 submit buy.");
    event.preventDefault();
    const wsProvider = new WsProvider(blockchainUrl);
    const api = await ApiPromise.create({ provider: wsProvider });  
    await buy(api, selectedAccount, props.selectToken.tokenAddress, setTokenId);
  };

  const _getSalesStatus = async () => {
    const ret = await getSalesStatus(
      api,
      selectedAccount.address,
      props.selectToken.tokenAddress
    );
    if (ret == true) {
      setSaleStatus("On Sale");
    } else {
      setSaleStatus("Not On Sale");
    }
  };

  const _getPrice = async () => {
    let ret = await getPrice(
      api,
      selectedAccount.address,
      props.selectToken.tokenAddress
    );
    const decimals = api.registry.chainDecimals;
    ret = formatBalances(ret,decimals[0]);
    setPrice(ret);
  };

  useEffect(() => {
    getAccountInfo();
    _getSalesStatus();
    _getPrice();
  }, []);

  return (
    <>
      <div className="bg-black  min-h-screen">
        <div className="flex justify-center leading-none tracking-tight">
          <div className="text-orange-300 text-30px">Token Status</div>
        </div>
        <div className="p-2"></div>
        <div className="flex justify-center">
          <table className="text-white text-20px">
            <tr>
              <th className="flex justify-start">Name/Symbol :</th>
              <td>
                {props.selectToken.tokenName} / {props.selectToken.tokenSymbol}
              </td>
            </tr>
            <tr>
              <th className="flex justify-start">Sales Status :</th>
              <td>{saleStatus}</td>
            </tr>
            <tr>
              <th className="flex justify-start">Price :</th>
              <td>{price}</td>
            </tr>
          </table>
        </div>
        <div className="p-5"></div>
        <div className="flex justify-center">
          <form className="" onSubmit={_onSubmitBuy}>
            <div className=" p-2">
              <div className="text-orange-300 text-center text-30px">
                You are going to buy tokens...
              </div>
              <div className="p-2"></div>
            </div>

            <div className="flex justify-center">
              <button
                className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
                onClick={() => _onSubmitBuy}
              >
                Buy
              </button>
            </div>
          </form>
        </div>
        <div className="flex justify-center p-5 text-white text-25px">
          Your Token Id is [ {tokenId} ]
        </div>
      </div>
    </>
  );
};

export default Erc721ForSale;
