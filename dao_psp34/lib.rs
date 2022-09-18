#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

pub use self::dao_psp34::{DaoPsp34, DaoPsp34Ref};

#[openbrush::contract]
mod dao_psp34 {
    use ink_prelude::{
        vec::Vec,
        string::{
            String,
            ToString,
        },
    };
    use ink_storage::traits::SpreadAllocate;
    use openbrush::{
        contracts::psp34::extensions::{
            metadata::*,
//            mintable::*,
        },
        traits::Storage,
    };

    #[derive(SpreadAllocate, Storage)]
    #[ink(storage)]
    pub struct DaoPsp34 {
        #[storage_field]
        psp34: psp34::Data,
        #[storage_field]
        metadata: metadata::Data,
        initial_id:Id,
        sales_price:u128,
        dao_address:AccountId,
        proposal_manager_address:AccountId,
    }

    impl PSP34 for DaoPsp34 {}
    impl PSP34Metadata for DaoPsp34 {}
//    impl PSP34Mintable for DaoPsp34 {}

    impl DaoPsp34 {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(id: Id, name: String, symbol: String, base_uri: String, sales_price: u128, dao_address: AccountId, proposal_manager_address: AccountId) -> Self {
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
        pub fn mint_for_sale(&mut self, account:AccountId, id: Id) -> Result<(), PSP34Error> {
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
            
            String::from_utf8(base_uri.clone()).unwrap() + &self._get_id_string(id)
        }

        #[ink(message)]
        pub fn withdraw(&mut self) -> Result<(), PSP34Error> {
            let caller = self.env().caller();
            if caller != self.proposal_manager_address {
                return Err(PSP34Error::Custom("This function can be called by proposal manager.".to_string()));
            }
            match self.env().transfer(self.dao_address, self.env().balance()) {
                Ok(()) => Ok(()),
                Err(_e) => Err(PSP34Error::Custom("The Tranfering is failure.".to_string())),
            }
        }

        #[ink(message)]
        pub fn get_contract_balance( &self ) -> Balance {
            self.env().balance()
        }

        #[inline]
        fn _get_id_string(&self, id:Id) -> String {
            match id {
                Id::U8(u8) => {
                    let tmp:u8 = u8;
                    tmp.to_string()
                },
                Id::U16(u16) => {
                    let tmp:u16 = u16;
                    tmp.to_string()
                },
                Id::U32(u32) => {
                    let tmp:u32 = u32;
                    tmp.to_string()
                },
                Id::U64(u64) => {
                    let tmp:u64 = u64;
                    tmp.to_string()
                },
                Id::U128(u128) => {
                    let tmp:u128 = u128;
                    tmp.to_string()
                },
                Id::Bytes(value) => {
                    String::from_utf8(value.clone()).unwrap()
                },
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
            let dao_psp34 = DaoPsp34::default();
            assert_eq!(dao_psp34.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut dao_psp34 = DaoPsp34::new(false);
            assert_eq!(dao_psp34.get(), false);
            dao_psp34.flip();
            assert_eq!(dao_psp34.get(), true);
        }
    }
}
