#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
mod dao_governance_token {
    use ink_prelude::string::{String, ToString};
    use ink_storage::traits::SpreadAllocate;
    use openbrush::{contracts::psp22::extensions::metadata::*, traits::Storage};

    #[ink(storage)]
    #[derive(Default, SpreadAllocate, Storage)]
    pub struct DaoGovernanceToken {
        #[storage_field]
        psp22: psp22::Data,
        #[storage_field]
        metadata: metadata::Data,
        dao_account_id: AccountId,
    }

    impl PSP22 for DaoGovernanceToken {}
    impl PSP22Metadata for DaoGovernanceToken {}

    impl DaoGovernanceToken {
        #[ink(constructor)]
        pub fn new(
            total_supply: Balance,
            name: Option<String>,
            symbol: Option<String>,
            decimal: u8,
            dao_account_id: AccountId,
        ) -> Self {
            ink_lang::codegen::initialize_contract(|instance: &mut Self| {
                instance.metadata.name = name;
                instance.metadata.symbol = symbol;
                instance.metadata.decimals = decimal;
                instance
                    ._mint(instance.env().account_id(), total_supply)
                    .expect("Should mint total_supply");
                instance.dao_account_id = dao_account_id;
            })
        }

        #[ink(message)]
        pub fn distribute_token( &mut self, to:AccountId, amount:u128 ) -> Result<(), PSP22Error>{
            let caller = self.env().caller();
            if caller != self.dao_account_id {
                return Err(PSP22Error::Custom(
                    "This function can be called by thd dao.".to_string(),
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
            let dao_governance_token = DaoGovernanceToken::default();
            assert_eq!(dao_governance_token.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut dao_governance_token = DaoGovernanceToken::new(false);
            assert_eq!(dao_governance_token.get(), false);
            dao_governance_token.flip();
            assert_eq!(dao_governance_token.get(), true);
        }
    }
}
