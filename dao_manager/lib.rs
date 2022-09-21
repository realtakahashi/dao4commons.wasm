#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

pub use self::dao_manager::{DaoManager,DaoManagerRef};

#[openbrush::contract]
pub mod dao_manager {
    use ink_prelude::string::{String, ToString};
    use ink_prelude::{vec,vec::Vec};
    use ink_storage::traits::SpreadAllocate;
    use ink_storage::traits::StorageLayout;
    use ink_storage::traits::{PackedLayout, SpreadLayout};
    use member_manager::MemberManagerRef;
    use openbrush::{storage::Mapping, traits::Storage};

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// The Token Does Not Exists.
        TheTokenDoesNotExist,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    pub struct DaoManager {
        proposal_manager_account_id:AccountId,
        /// id => dao address
        dao_list_for_id: Mapping<u128,AccountId>,
        next_id:u128,
    }

    impl DaoManager {
        #[ink(constructor)]
        pub fn new(proposal_manager_account_id:AccountId) -> Self {
            Self { 
                proposal_manager_account_id: proposal_manager_account_id,
                dao_list_for_id: Mapping::default(),
                next_id:0,
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
            let dao_manager = DaoManager::default();
            assert_eq!(dao_manager.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut dao_manager = DaoManager::new(false);
            assert_eq!(dao_manager.get(), false);
            dao_manager.flip();
            assert_eq!(dao_manager.get(), true);
        }
    }
}
