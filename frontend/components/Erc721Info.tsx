import {
  getPrice,
  getSalesAmount,
  getSalesStatus,
} from "@/dao4.frontend.common.wasm/contracts/DaoErc721_api";
import { TokenInfoWithName } from "@/dao4.frontend.common.wasm/types/Token";
import { useEffect, useState, useContext } from "react";
import { get_selected_address } from "@/dao4.frontend.common.wasm/contracts/get_account_info_api";
import { formatBalances } from "@/dao4.frontend.common.wasm/contracts/contract_common_util";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { AppContext } from "../pages/_app";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";

interface Erc721DetailParameter {
  selectToken: TokenInfoWithName;
  daoAddress: string;
}

const Erc721Detail = (props: Erc721DetailParameter) => {
  const [saleStatus, setSaleStatus] = useState("");
  const [price, setPrice] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const {api} = useContext(AppContext);

  const getSelectedAddress = async () => {
    setSelectedAddress(get_selected_address());
  };

  const _getSalesStatus = async () => {
    if (
      (await getSalesStatus(api, selectedAddress, props.selectToken.tokenAddress)) ==
      true
    ) {
      setSaleStatus("On Sale");
    } else {
      setSaleStatus("Not On Sale");
    }
  };

  const _getPrice = async () => {
    let ret = await getPrice(api, selectedAddress, props.selectToken.tokenAddress);
    const decimals = api.registry.chainDecimals;
    ret = formatBalances(ret,decimals[0]);
    setPrice(ret);
  };

  useEffect(() => {
    getSelectedAddress();
    _getSalesStatus();
    // _getSalesAmount();
    _getPrice();
  }, []);

  return (
    <>
      <div className=" justify-center leading-none tracking-tight">
        <div className="text-center text-blue-400 text-30px">Token Status</div>
        <div className="flex justify-center p-5">
          <table className="text-white text-20px">
            <tr>
              <th className="flex justify-start px-2 py-4 text-white">
                Name/Symbol :{" "}
              </th>
              <td>
                {props.selectToken.tokenName} / {props.selectToken.tokenSymbol}
              </td>
            </tr>
            <tr>
              <th className="flex justify-start text-start px-2 py-4 text-white">
                Sales Status :{" "}
              </th>
              <td>{saleStatus}</td>
            </tr>
            <tr>
              <th className="flex justify-start px-2 py-4 text-white">
                Price :{" "}
              </th>
              <td>{price}</td>
            </tr>
            {/* <tr>
              <th className="flex justify-start px-2 py-4 text-white">Sales Amount : </th>
              <td>{salesAmount}</td>
            </tr> */}
          </table>
        </div>
      </div>
    </>
  );
};

export default Erc721Detail;
