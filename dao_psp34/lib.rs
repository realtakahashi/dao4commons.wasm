#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

pub use self::dao_psp34::{DaoPsp34, DaoPsp34Ref};

#[openbrush::contract]
mod dao_psp34 {
    use ink_prelude::{
        string::{String, ToString},
        vec::Vec,
    };
    use ink_storage::traits::SpreadAllocate;
    use openbrush::{contracts::psp34::extensions::metadata::*, traits::Storage};

    #[derive(SpreadAllocate, Storage)]
    #[ink(storage)]
    pub struct DaoPsp34 {
        #[storage_field]
        psp34: psp34::Data,
        #[storage_field]
        metadata: metadata::Data,
        initial_id: Id,
        sales_price: u128,
        dao_address: AccountId,
        proposal_manager_address: AccountId,
    }

    impl PSP34 for DaoPsp34 {}
    impl PSP34Metadata for DaoPsp34 {}
    //    impl PSP34Mintable for DaoPsp34 {}

    impl DaoPsp34 {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(
            id: Id,
            name: String,
            symbol: String,
            base_uri: String,
            sales_price: u128,
            dao_address: AccountId,
            proposal_manager_address: AccountId,
        ) -> Self {
            ink_lang::codegen::initialize_contract(|instance: &mut Self| {
                let name_key: Vec<u8> = "name".as_bytes().to_vec();
                let symbol_key: Vec<u8> = "symbol".as_bytes().to_vec();
                let base_uri_key: Vec<u8> = "base_uri".as_bytes().to_vec();
                instance._set_attribute(id.clone(), name_key, name.as_bytes().to_vec());
                instance._set_attribute(id.clone(), symbol_key, symbol.as_bytes().to_vec());
                instance._set_attribute(id.clone(), base_uri_key, base_uri.as_bytes().to_vec());
                instance.initial_id = id;
                instance.sales_price = sales_price;
                instance.dao_address = dao_address;
                instance.proposal_manager_address = proposal_manager_address;
            })
        }

        #[ink(message)]
        #[ink(payable)]
        pub fn mint_for_sale(&mut self, account: AccountId, id: Id) -> Result<(), PSP34Error> {
            let transfered_value = self.env().transferred_value();
            ink_env::debug_println!("     ########## tranfered_value: {:?}", transfered_value);
            if transfered_value < self.sales_price {
                return Err(PSP34Error::Custom("You don't pay enough.".to_string()));
            }
            self._mint_to(account, id)
        }

        #[ink(message)]
        pub fn token_uri(&self, id: Id) -> String {
            let base_uri_key: Vec<u8> = "base_uri".as_bytes().to_vec();
            let base_uri = match self.get_attribute(self.initial_id.clone(), base_uri_key) {
                Some(value) => value,
                None => return "".to_string(),
            };

            String::from_utf8(base_uri.clone()).unwrap() + &self._get_id_string(id) + ".json"
        }

        #[ink(message)]
        pub fn withdraw(&mut self) -> Result<(), PSP34Error> {
            let caller = self.env().caller();
            if caller != self.proposal_manager_address {
                return Err(PSP34Error::Custom(
                    "This function can be called by proposal manager.".to_string(),
                ));
            }
            match self.env().transfer(self.dao_address, self.env().balance()) {
                Ok(()) => Ok(()),
                Err(_e) => Err(PSP34Error::Custom("The Tranfering is failure.".to_string())),
            }
        }

        #[ink(message)]
        pub fn get_contract_balance(&self) -> Balance {
            self.env().balance()
        }

        #[inline]
        fn _get_id_string(&self, id: Id) -> String {
            match id {
                Id::U8(u8) => {
                    let tmp: u8 = u8;
                    tmp.to_string()
                }
                Id::U16(u16) => {
                    let tmp: u16 = u16;
                    tmp.to_string()
                }
                Id::U32(u32) => {
                    let tmp: u32 = u32;
                    tmp.to_string()
                }
                Id::U64(u64) => {
                    let tmp: u64 = u64;
                    tmp.to_string()
                }
                Id::U128(u128) => {
                    let tmp: u128 = u128;
                    tmp.to_string()
                }
                Id::Bytes(value) => String::from_utf8(value.clone()).unwrap(),
            }
        }
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// Imports `ink_lang` so we can use `#[ink::test]`.
        use ink_lang as ink;

        /// We test a simple use case of our contract.
        #[ink::test]
        fn constructor_works() {
            let dao_psp34 = DaoPsp34::new(
                Id::U8(0),
                "takahashi".to_string(),
                "TKH".to_string(),
                "https://takahashi.com/".to_string(),
                2000000000000000000,
                _convert_string_to_accountid("ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR"),
                _convert_string_to_accountid("XjMCB8QBUPHqh8VhAUGBETFxo9EY4rzu8ppeR1jpCPMyJjR"),
            );
            let name = match dao_psp34.get_attribute(Id::U8(0), "name".as_bytes().to_vec()) {
                Some(value) => value,
                None => "".as_bytes().to_vec(),
            };
            assert_eq!(name, "takahashi".as_bytes().to_vec());

            let symbol = match dao_psp34.get_attribute(Id::U8(0), "symbol".as_bytes().to_vec()) {
                Some(value) => value,
                None => "".as_bytes().to_vec(),
            };
            assert_eq!(symbol, "TKH".as_bytes().to_vec());

            let base_uri = match dao_psp34.get_attribute(Id::U8(0), "base_uri".as_bytes().to_vec())
            {
                Some(value) => value,
                None => "".as_bytes().to_vec(),
            };
            assert_eq!(base_uri, "https://takahashi.com/".as_bytes().to_vec());

            assert_eq!(dao_psp34.initial_id, Id::U8(0));
            assert_eq!(dao_psp34.sales_price, 2000000000000000000);
            assert_eq!(
                dao_psp34.dao_address,
                _convert_string_to_accountid("ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR")
            );
            assert_eq!(
                dao_psp34.proposal_manager_address,
                _convert_string_to_accountid("XjMCB8QBUPHqh8VhAUGBETFxo9EY4rzu8ppeR1jpCPMyJjR")
            );
        }

        #[ink::test]
        fn sales_for_mint_works() {
            let mut dao_psp34 = DaoPsp34::new(
                Id::U8(0),
                "takahashi".to_string(),
                "TKH".to_string(),
                "https://takahashi.com/".to_string(),
                2000000000000000000,
                _convert_string_to_accountid("ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR"),
                _convert_string_to_accountid("XjMCB8QBUPHqh8VhAUGBETFxo9EY4rzu8ppeR1jpCPMyJjR"),
            );
            ink_env::test::set_value_transferred::<ink_env::DefaultEnvironment>(
                2000000000000000000,
            );
            match dao_psp34.mint_for_sale(
                _convert_string_to_accountid("ZD39yAE4W4RiXCyk1gv6CD2tSaVjQU5KoKfujyft4Xa2GAz"),
                Id::U8(0),
            ) {
                Ok(()) => (),
                Err(_e) => panic!("Test is failure."),
            };
            match dao_psp34.owner_of(Id::U8(0)) {
                Some(value) => assert_eq!(
                    value,
                    _convert_string_to_accountid("ZD39yAE4W4RiXCyk1gv6CD2tSaVjQU5KoKfujyft4Xa2GAz")
                ),
                None => panic!("Test is failure."),
            }
        }

        #[ink::test]
        fn sales_for_mint_works_for_error_check() {
            let mut dao_psp34 = DaoPsp34::new(
                Id::U8(0),
                "takahashi".to_string(),
                "TKH".to_string(),
                "https://takahashi.com/".to_string(),
                2000000000000000000,
                _convert_string_to_accountid("ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR"),
                _convert_string_to_accountid("XjMCB8QBUPHqh8VhAUGBETFxo9EY4rzu8ppeR1jpCPMyJjR"),
            );
            ink_env::test::set_value_transferred::<ink_env::DefaultEnvironment>(
                1900000000000000000,
            );
            match dao_psp34.mint_for_sale(
                _convert_string_to_accountid("ZD39yAE4W4RiXCyk1gv6CD2tSaVjQU5KoKfujyft4Xa2GAz"),
                Id::U8(0),
            ) {
                Ok(()) => panic!("Test is failure."),
                Err(e) => assert_eq!(e,PSP34Error::Custom("You don't pay enough.".to_string())),
            };
        }

        #[ink::test]
        fn withdraw_works(){
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            let proposal_manager:AccountId = _convert_string_to_accountid("XjMCB8QBUPHqh8VhAUGBETFxo9EY4rzu8ppeR1jpCPMyJjR");
            let dao_address = accounts.frank;

            let mut dao_psp34 = DaoPsp34::new(
                Id::U8(0),
                "takahashi".to_string(),
                "TKH".to_string(),
                "https://takahashi.com/".to_string(),
                1000000,
                dao_address,
                proposal_manager,
            );
            ink_env::test::set_value_transferred::<ink_env::DefaultEnvironment>(
                1000000,
            );
            match dao_psp34.mint_for_sale(
                _convert_string_to_accountid("ZD39yAE4W4RiXCyk1gv6CD2tSaVjQU5KoKfujyft4Xa2GAz"),
                Id::U8(0),
            ) {
                Ok(()) => (),
                Err(_e) => panic!("Test is failure."),
            };

            assert_eq!(dao_psp34.get_contract_balance(),1000000);

            let balance = match ink_env::test::get_account_balance::<ink_env::DefaultEnvironment>(dao_address){
                Ok(value) => value,
                Err(_e) => panic!("Test is failure."),
            };
            assert_eq!(balance,0);

            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(proposal_manager);
            match dao_psp34.withdraw() {
                Ok(()) => {
                    let balance = match ink_env::test::get_account_balance::<ink_env::DefaultEnvironment>(dao_address){
                        Ok(value) => value,
                        Err(_e) => panic!("Test is failure."),
                    };
                    assert_eq!(balance,1000000)
                },
                Err(_e) => panic!("Test is failure."),
            }

        }

        fn _convert_string_to_accountid(account_str: &str) -> AccountId {
            let mut output = vec![0xFF; 35];
            bs58::decode(account_str).into(&mut output).unwrap();
            let cut_address_vec: Vec<_> = output.drain(1..33).collect();
            let mut array = [0; 32];
            let bytes = &cut_address_vec[..array.len()];
            array.copy_from_slice(bytes);
            let account_id: AccountId = array.into();
            account_id
        }
    }
}
