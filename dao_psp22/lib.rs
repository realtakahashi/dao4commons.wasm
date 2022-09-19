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
        sales_price:u128,
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
            sales_price:u128,
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
                instance.sales_price = sales_price;
            })
        }

        #[ink(message)]
        #[ink(payable)]
        pub fn buy_token(&mut self, to: AccountId, amount:u128 ) -> Result<(), PSP22Error> {
            if self.is_token_sales_started == false {
                ink_env::debug_println!("     ########## Token sales is not opened.");
                return Err(PSP22Error::Custom("Token sales is not opened.".to_string()));
            }
            let transfered_value = self.env().transferred_value();
            ink_env::debug_println!("     ########## tranfered_value: {:?}", transfered_value);
            if transfered_value < self.sales_price {
                ink_env::debug_println!("     ########## You don't pay enough.");
                return Err(PSP22Error::Custom("You don't pay enough.".to_string()));
            }
            if amount > self.balance_of(self.env().account_id()) {
                ink_env::debug_println!("     ########## The amount you requested exceeds the remaining amount.");
                return Err(PSP22Error::Custom("The amount you requested exceeds the remaining amount.".to_string()));
            }
            match self._transfer_from_to(self.env().account_id(), to, amount, "transfer_data".as_bytes().to_vec()) {
                Ok(()) => Ok(()),
                Err(e) => {
                    ink_env::debug_println!("     ########## transfer error : {:?}", e);
                    Err(PSP22Error::Custom("Transfering is failure.".to_string()))
                },
            } 
        }


        #[ink(message)]
        pub fn withdraw(&mut self) -> Result<(), PSP22Error> {
            let caller = self.env().caller();
            // if caller != self.proposal_manager_address {
            //     return Err(PSP22Error::Custom(
            //         "This function can be called by proposal manager.".to_string(),
            //     ));
            // }
            match self.env().transfer(self.dao_address, self.env().balance()) {
                Ok(()) => Ok(()),
                Err(_e) => Err(PSP22Error::Custom("The Tranfering is failure.".to_string())),
            }
        }

        #[ink(message)]
        pub fn change_token_sale_status(&mut self, is_start: bool) -> Result<(), PSP22Error> {
            let caller = self.env().caller();
            // if caller != self.proposal_manager_address {
            //     return Err(PSP22Error::Custom(
            //         "This function can be called by proposal manager.".to_string(),
            //     ));
            // }
            self.is_token_sales_started = is_start;
            ink_env::debug_println!("     ########## is_token_sales_started : {:?}", self.is_token_sales_started);
            Ok(())
        }

        #[ink(message)]
        pub fn get_contract_balance(&self) -> Balance {
            self.env().balance()
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

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let dao_psp22 = DaoPsp22::default();
            assert_eq!(dao_psp22.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut dao_psp22 = DaoPsp22::new(false);
            assert_eq!(dao_psp22.get(), false);
            dao_psp22.flip();
            assert_eq!(dao_psp22.get(), true);
        }
    }
}
