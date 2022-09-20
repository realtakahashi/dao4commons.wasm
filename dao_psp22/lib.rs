#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
mod dao_psp22 {
    use ink_prelude::string::{String, ToString};
    use ink_storage::traits::SpreadAllocate;
    use openbrush::{contracts::psp22::extensions::metadata::*, traits::Storage};

    #[ink(storage)]
    #[derive(Default, SpreadAllocate, Storage)]
    pub struct DaoPsp22 {
        #[storage_field]
        psp22: psp22::Data,
        #[storage_field]
        metadata: metadata::Data,
        dao_address: AccountId,
        proposal_manager_address: AccountId,
        is_token_sales_started: bool,
        sales_price_for_one_token: u128,
    }

    impl PSP22 for DaoPsp22 {}
    impl PSP22Metadata for DaoPsp22 {}

    impl DaoPsp22 {
        #[ink(constructor)]
        pub fn new(
            total_supply: Balance,
            name: Option<String>,
            symbol: Option<String>,
            decimal: u8,
            dao_address: AccountId,
            proposal_manager_address: AccountId,
            sales_price_for_one_token: u128,
        ) -> Self {
            ink_lang::codegen::initialize_contract(|instance: &mut Self| {
                instance.metadata.name = name;
                instance.metadata.symbol = symbol;
                instance.metadata.decimals = decimal;
                instance
                    ._mint(instance.env().account_id(), total_supply)
                    .expect("Should mint total_supply");
                instance.dao_address = dao_address;
                instance.proposal_manager_address = proposal_manager_address;
                instance.is_token_sales_started = false;
                instance.sales_price_for_one_token = sales_price_for_one_token;
            })
        }

        #[ink(message)]
        #[ink(payable)]
        pub fn buy_token(&mut self, to: AccountId, amount: u128) -> Result<(), PSP22Error> {
            if self.is_token_sales_started == false {
                ink_env::debug_println!("     ########## Token sales is not opened.");
                return Err(PSP22Error::Custom("Token sales is not opened.".to_string()));
            }
            let transfered_value = self.env().transferred_value();

            if transfered_value < self.sales_price_for_one_token * amount {
                ink_env::debug_println!("     ########## You don't pay enough.");
                return Err(PSP22Error::Custom("You don't pay enough.".to_string()));
            }
            if amount > self.balance_of(self.env().account_id()) {
                ink_env::debug_println!(
                    "     ########## The amount you requested exceeds the remaining amount."
                );
                return Err(PSP22Error::Custom(
                    "The amount you requested exceeds the remaining amount.".to_string(),
                ));
            }
            match self._transfer_from_to(
                self.env().account_id(),
                to,
                amount,
                "transfer_data".as_bytes().to_vec(),
            ) {
                Ok(()) => Ok(()),
                Err(e) => {
                    ink_env::debug_println!("     ########## transfer error : {:?}", e);
                    Err(PSP22Error::Custom("Transfering is failure.".to_string()))
                }
            }
        }

        #[ink(message)]
        pub fn withdraw(&mut self) -> Result<(), PSP22Error> {
            let caller = self.env().caller();
            if caller != self.proposal_manager_address {
                return Err(PSP22Error::Custom(
                    "This function can be called by proposal manager.".to_string(),
                ));
            }
            match self.env().transfer(self.dao_address, self.env().balance()) {
                Ok(()) => Ok(()),
                Err(_e) => Err(PSP22Error::Custom("The Tranfering is failure.".to_string())),
            }
        }

        #[ink(message)]
        pub fn change_token_sale_status(&mut self, is_start: bool) -> Result<(), PSP22Error> {
            let caller = self.env().caller();
            if caller != self.proposal_manager_address {
                return Err(PSP22Error::Custom(
                    "This function can be called by proposal manager.".to_string(),
                ));
            }
            self.is_token_sales_started = is_start;
            Ok(())
        }

        #[ink(message)]
        pub fn get_contract_balance(&self) -> Balance {
            self.env().balance()
        }

        #[ink(message)]
        pub fn get_dao_address(&self) -> AccountId {
            self.dao_address
        }

        #[ink(message)]
        pub fn get_proposal_manager_address(&self) -> AccountId {
            self.proposal_manager_address
        }

        #[ink(message)]
        pub fn get_sales_price_for_one_token(&self) -> u128 {
            self.sales_price_for_one_token
        }

        #[ink(message)]
        pub fn get_token_sales_status(&self) -> bool {
            self.is_token_sales_started
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
            let dao_address =
                _convert_string_to_accountid("XjMCB8QBUPHqh8VhAUGBETFxo9EY4rzu8ppeR1jpCPMyJjR");
            let proposal_manager_address =
                _convert_string_to_accountid("ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR");
            let dao_psp22 = DaoPsp22::new(
                123456789,
                Some("takahashi".to_string()),
                Some("TKH".to_string()),
                18,
                dao_address,
                proposal_manager_address,
                20000,
            );
            match dao_psp22.metadata.name {
                Some(ref value) => assert_eq!("takahashi", value),
                None => panic!("Test is failure."),
            }
            match dao_psp22.metadata.symbol {
                Some(ref value) => assert_eq!("TKH", value),
                None => panic!("Test is failure."),
            }

            let contract = ink_env::account_id::<ink_env::DefaultEnvironment>();
            assert_eq!(dao_psp22.balance_of(contract), 123456789);
        }

        #[ink::test]
        fn buy_token_works() {
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            let dao_account_id =
                _convert_string_to_accountid("XjMCB8QBUPHqh8VhAUGBETFxo9EY4rzu8ppeR1jpCPMyJjR");
            let proposal_manager_account_id =
                _convert_string_to_accountid("ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR");

            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            let mut dao_psp22 = DaoPsp22::new(
                123456789,
                Some("takahashi".to_string()),
                Some("TKH".to_string()),
                18,
                dao_account_id,
                proposal_manager_account_id,
                100,
            );

            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(proposal_manager_account_id);
            let result = match dao_psp22.change_token_sale_status(true) {
                Ok(()) => "succeed".to_string(),
                Err(e) => {
                    ink_env::debug_println!("Test is failure. Error is : {:?}", e);
                    panic!("Test is failure.");
                }
            };

            assert_eq!(result, "succeed".to_string());

            // ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            // ink_env::test::set_value_transferred::<ink_env::DefaultEnvironment>(100);
            // let result = match dao_psp22.buy_token(accounts.alice, 111) {
            //     Ok(()) => "succeed".to_string(),
            //     Err(e) => {
            //         ink_env::debug_println!("Test is failure. Error is : {:?}", e);
            //         panic!("Test is failure.");
            //     },
            // };

            // assert_eq!(result, "succeed".to_string());
            // assert_eq!(dao_psp22.balance_of(accounts.alice), 111);
            // assert_eq!(dao_psp22.get_contract_balance(), 100);
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
