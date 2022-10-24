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
    use dao_contract::dao_contract::{DaoContractRef, TokenType};
    use openbrush::contracts::ownable::OwnableError;
    use openbrush::{contracts::ownable::*, modifiers, storage::Mapping, traits::Storage};

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        TheDaoDoesNotExist,
        AddingTokenIsFailure,
        ThisFunctionCanBeCalledFromProposalManager,
        ChangingSokenSalesStatusIsFailure,
        WithdrawingTokenProceedsIsFailure,
        DistributingGovernanceTokenIsFailure,
        DistributingDaoTreasuryIsFailure,
        InvalidCsvData,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    #[derive(SpreadAllocate, Storage, Default)]
    pub struct DaoManager {
        proposal_manager_account_id:AccountId,
        /// id => dao address
        dao_list_for_id: Mapping<u128,AccountId>,
        /// dao address => id
        dao_list_for_address: Mapping<AccountId, u128>,
        next_id:u128,
        #[storage_field]
        ownable: ownable::Data,
        owner: AccountId,
    }

    impl Ownable for DaoManager {}

    impl DaoManager {
        #[ink(constructor)]
        pub fn new() -> Self {
            ink_lang::utils::initialize_contract(|instance: &mut Self| {
                let caller = instance.env().caller();
                instance._init_with_owner(caller);
            })

            // Self { 
            //     proposal_manager_account_id: proposal_manager_account_id,
            //     dao_list_for_id: Mapping::default(),
            //     dao_list_for_address: Mapping::default(),
            //     next_id:0,
            //  }
        }

        #[ink(message)]
        pub fn set_proposal_manager_account_id(&mut self, proposal_manager_account_id:AccountId) -> Result<()> {
            self.proposal_manager_account_id = proposal_manager_account_id;
            Ok(())
        }

        #[ink(message)]
        pub fn add_dao(&mut self, dao_account_id:AccountId) -> Result<()> {
            self.dao_list_for_id.insert(&self.next_id, &dao_account_id);
            self.dao_list_for_address.insert(&dao_account_id, &self.next_id);
            self.next_id = self.next_id + 1;
            Ok(())
        }

        #[ink(message)]
        pub fn get_dao_list(&self) -> Vec<AccountId> {
            let mut list:Vec<AccountId> = Vec::new();
            for i in 0..self.next_id {
                match self.dao_list_for_id.get(&i) {
                    Some(value) => list.push(value.clone()),
                    None => (),
                }
            }
            list
        }

        /// add dao token
        /// * This function can be called by proposal manager.
        /// * csv data is "token_address,token_type"
        #[ink(message)]
        pub fn add_dao_token(&mut self, dao_account_id:AccountId, csv_data:String) -> Result<()> {
            if !self._is_calling_from_proposal_manager() {
                return Err(Error::ThisFunctionCanBeCalledFromProposalManager);
            }
            if !self._dao_exists(dao_account_id){
                return Err(Error::TheDaoDoesNotExist);
            };

            let data:Vec<&str> = csv_data.split(',').collect();
            if data.len() != 2 {
                return Err(Error::InvalidCsvData);
            }
            let token_account_id = self._convert_string_to_accountid(data[0]);
            let token_type = match self._convert_str_2_token_type(data[1]) {
                Some(value) => value,
                None => return Err(Error::InvalidCsvData),
            };

            let mut instance: DaoContractRef = ink_env::call::FromAccountId::from_account_id(dao_account_id);
            match instance.add_dao_token(token_type, token_account_id) {
                Ok(()) => Ok(()),
                Err(_e) => return Err(Error::AddingTokenIsFailure),
            }
        }

        /// change token sales status
        /// * This function can be called by proposal manager.
        /// * csv data: "token_address,is_start("0" or "1")"
        #[ink(message)]
        pub fn change_token_sales_status(&mut self, dao_account_id:AccountId, csv_data:String) -> Result<()> {
            if !self._is_calling_from_proposal_manager() {
                return Err(Error::ThisFunctionCanBeCalledFromProposalManager);
            }
            if !self._dao_exists(dao_account_id){
                return Err(Error::TheDaoDoesNotExist);
            };

            let data:Vec<&str> = csv_data.split(',').collect();
            if data.len() != 2 {
                return Err(Error::InvalidCsvData);
            }
            let token_account_id = self._convert_string_to_accountid(data[0]);
            let isStart:bool = self._conver_str_2_bool(data[1]);

            let mut instance: DaoContractRef = ink_env::call::FromAccountId::from_account_id(dao_account_id);
            match instance.change_token_sales_status(token_account_id, isStart) {
                Ok(()) => Ok(()),
                Err(_e) => return Err(Error::ChangingSokenSalesStatusIsFailure),
            }
        }

        /// withdraw token proceeds
        /// * This function can be called by proposal manager.
        /// * csv_data: "token_address"
        #[ink(message)]
        pub fn withdraw_token_proceeds(&mut self, dao_account_id:AccountId, csv_data:String) -> Result<()> {
            if !self._is_calling_from_proposal_manager() {
                return Err(Error::ThisFunctionCanBeCalledFromProposalManager);
            }
            if !self._dao_exists(dao_account_id){
                return Err(Error::TheDaoDoesNotExist);
            };

            let data:Vec<&str> = csv_data.split(',').collect();
            if data.len() != 1 {
                return Err(Error::InvalidCsvData);
            }
            let token_account_id = self._convert_string_to_accountid(data[0]);

            let mut instance: DaoContractRef = ink_env::call::FromAccountId::from_account_id(dao_account_id);
            match instance.withdraw_token_proceeds(token_account_id) {
                Ok(()) => Ok(()),
                Err(_e) => return Err(Error::WithdrawingTokenProceedsIsFailure),
            }
        }

        /// distribute governance token
        /// * This function can be called by proposal manager.
        /// * csv_data : "token_address,list_of_reciever("reciver_data1(reciver_eoa#amount)?reciver_data2?...")"
        #[ink(message)]
        pub fn distribute_governance_token(&mut self, dao_account_id:AccountId, csv_data:String) -> Result<()> {
            if !self._is_calling_from_proposal_manager() {
                return Err(Error::ThisFunctionCanBeCalledFromProposalManager);
            }
            if !self._dao_exists(dao_account_id){
                return Err(Error::TheDaoDoesNotExist);
            };

            let data:Vec<&str> = csv_data.split(',').collect();
            if data.len() != 2 {
                return Err(Error::InvalidCsvData);
            }
            let token_account_id = self._convert_string_to_accountid(data[0]);
            let list_of_reciver:String = data[1].to_string();

            let mut instance: DaoContractRef = ink_env::call::FromAccountId::from_account_id(dao_account_id);
            match instance.distribute_governance_token(token_account_id, list_of_reciver) {
                Ok(()) => Ok(()),
                Err(_e) => return Err(Error::DistributingGovernanceTokenIsFailure),
            }
        }

        /// distribute dao treasury
        /// * This function can be called by proposal manager.
        /// * csv_data: "reciver_address,amount"
        #[ink(message)]
        pub fn distribute_dao_treasury(&mut self, dao_account_id:AccountId, csv_data:String) -> Result<()> {
            if !self._is_calling_from_proposal_manager() {
                return Err(Error::ThisFunctionCanBeCalledFromProposalManager);
            }
            if !self._dao_exists(dao_account_id){
                return Err(Error::TheDaoDoesNotExist);
            };

            let data:Vec<&str> = csv_data.split(',').collect();
            if data.len() != 2 {
                return Err(Error::InvalidCsvData);
            }
            let to = self._convert_string_to_accountid(data[0]);
            let amount:u128 = data[1].parse().unwrap();

            let mut instance: DaoContractRef = ink_env::call::FromAccountId::from_account_id(dao_account_id);
            match instance.distribute_dao_treasury(to, amount) {
                Ok(()) => Ok(()),
                Err(_e) => return Err(Error::DistributingDaoTreasuryIsFailure),
            }
        }

        #[inline]
        fn _dao_exists(&self, dao_account_id:AccountId) -> bool {
            match self.dao_list_for_address.get(&dao_account_id) {
                Some(value) => true,
                None => false,
            }            
        }

        #[inline]
        fn _is_calling_from_proposal_manager(&self) -> bool {
            self.env().caller() == self.proposal_manager_account_id
        }

        #[inline]
        fn _convert_string_to_accountid(&self, account_str: &str) -> AccountId {
            let mut output = vec![0xFF; 35];
            bs58::decode(account_str).into(&mut output).unwrap();
            let cut_address_vec: Vec<_> = output.drain(1..33).collect();
            let mut array = [0; 32];
            let bytes = &cut_address_vec[..array.len()];
            array.copy_from_slice(bytes);
            let account_id: AccountId = array.into();
            account_id
        }

        #[inline]
        fn _convert_str_2_token_type(&self, type_str:&str) -> Option<TokenType> {
            let convert_type:u8= type_str.parse().unwrap();
            match convert_type {
                2 => Some(TokenType::GovernanceToken),
                0 => Some(TokenType::Psp22),
                1 => Some(TokenType::Psp34),
                _ => None,
            }
        }

        #[inline]
        fn _conver_str_2_bool(&self, bool_str:&str) -> bool {
            let convert_bool:u8= bool_str.parse().unwrap();
            match convert_bool {
                0 => true,
                _ => false,
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
