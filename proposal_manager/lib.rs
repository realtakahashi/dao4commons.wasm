#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

// use ink_lang as ink;
// #[ink::contract]

pub use self::proposal_manager::{
    ProposalManager,
    ProposalManagerRef,
};

#[openbrush::contract]
pub mod proposal_manager {
    use ink_prelude::string::{String, ToString};
    use ink_prelude::vec::Vec;
    use ink_storage::traits::SpreadAllocate;
    use ink_storage::traits::StorageLayout;
    use ink_storage::traits::{PackedLayout, SpreadLayout};
    use openbrush::{storage::Mapping, traits::Storage};
    use member_manager::MemberManagerRef;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Target member does not exist.
        MemberDoesNotExist,
        /// Target member already exists.
        MemberAlreadyExists,
        /// Electoral Commissioner Data is mismatched.
        ElectoralCommissionerDataMismatch,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode, Clone, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub enum ProposalStatus {
        /// initial value
        None,
        /// proposed
        Proposed,
        /// voting
        Voting,
        /// Finish Voting
        FinishVoting,
        /// running
        Running,
        /// denied
        Denied,
        /// finished
        Finished,
    }

    // #[derive(
    //     Default, Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq,
    // )]
    #[derive(
        Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq,
    )]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct ProposalInfo {
        proposal_id: u128,
        proposer: AccountId,
        title: String,
        outline: String,
        detail: String,
        status: ProposalStatus,
    }

    #[derive(
        Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq,
    )]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct VotingResult {
        proposal_id: u128,
        for:u16,
        against:u16,
    }

    #[ink(storage)]
    #[derive(SpreadAllocate, Storage, Default)]
    pub struct ProposalManager {
        /// member_manager reference
        member_manager: MemberManagerRef,
        /// proposal_id
        next_id: u128,
        /// ( dao address, proposal_id) => proposal info
        proposal_infoes: Mapping<(AccountId, u128), ProposalInfo>,
        /// ( dao address, proposal_id) = voting result
        voting_results: Mapping<(AccountId, u128), VotingResult>,
    }

    impl ProposalManager {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(_member_manager:MemberManagerRef) -> Self {
            ink_lang::utils::initialize_contract(|self| {
                self.member_manager_ref = _member_manager;
            })
        }

        /// Functions of Proposal.

        /// add_proposal
        #[ink(message)]
        pub fn add_proposal(
            &mut self,
            _dao_address: AccountId,
            _title: String,
            _outline: String,
            _detail: String,
        ) -> Result<()> {
            let caller = self.env().caller();
            if member_manager.modifier_only_member(caller, _dao_address) == false {
                return Err(Error::OnlyMemberDoes);
            }
            
            let proposal_info = ProposalInfo {
                proposal_id: self.next_proposal_id,
                title: _title,
                outline: _outline,
                detail: _detail,
                status: self::ProposalStatus::Proposed,
                proposer: caller,
            };
            self.proposal_infoes
                .insert(&(_dao_address, self.next_proposal_id), &proposal_info);
            self.next_proposal_id = self.next_proposal_id + 1;
            Ok(())
        }

        /// get proposal list.
        #[ink(message)]
        pub fn get_proposal_list(&self, _dao_address: AccountId) -> Vec<ProposalInfo> {
            let mut proposal_list: Vec<ProposalInfo> = Vec::new();
            for i in 0..self.next_proposal_id {
                let proposal_info = match self.proposal_infoes.get(&(_dao_address, i)) {
                    Some(value) => value,
                    None => continue,
                };
                proposal_list.push(proposal_info.clone());
            }
            proposal_list
        }

        /// change the proposal status
        #[ink(message)]
        pub fn change_proposal_status(
            &mut self,
            _dao_address: AccountId,
            _proposal_id: u128,
            _status: ProposalStatus,
        ) -> Result<()> {
            let caller = self.env().caller();
            if member_manager.modifier_only_electoral_commissioner(caller, _dao_address) == false {
                return Err(Error::OnlyElectoralCommissioner);
            }
            let mut proposal_info: ProposalInfo =
                match self.proposal_infoes.get(&(_dao_address, _proposal_id)) {
                    Some(value) => value,
                    None => return Err(Error::ProposalDoesNotExist),
                };
            match self.check_anti_pattern(proposal_info.clone(), _status.clone()) {
                true => {
                    proposal_info.status = _status.clone();
                    self.inline_change_proposal_status(_dao_address, proposal_info.clone())
                }
                false => return Err(Error::InvalidChanging),
            }

            Ok(())
        }

        #[inline]
        fn check_and_execute_proposal(&mut self, _dao_address:AccountId, _proposal_id:u128) -> Result<()> {
            let mut proposal_info:ProposalInfo = match self.proposal_infoes.get(&(_dao_address, _proposal_id)){
                Some(value) => value,
                None => return Err(Error::ProposalDoesNotExist),
            }

            Ok(())
        }


        /// change status for local function.
        #[inline]
        fn inline_change_proposal_status(
            &mut self,
            _dao_address: AccountId,
            _proposal_info: ProposalInfo,
        ) {
            self.proposal_infoes
                .insert(&(_dao_address, _proposal_info.proposal_id), &_proposal_info);
        }

        /// impossible changing => false, possible changing => true,
        #[inline]
        fn check_anti_pattern(
            &self,
            _proposal_info: ProposalInfo,
            _status: ProposalStatus,
        ) -> bool {
            match _proposal_info.status {
                ProposalStatus::Proposed => match _status {
                    ProposalStatus::Voting => return true,
                    _ => return false,
                },
                ProposalStatus::Voting => match _status {
                    ProposalStatus::FinishedVoting => return true,
                    _ => return false,
                },
                _ => return false,
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

    #[ink::test]
    fn add_proposal_works() {
        let mut manager_contract = ManagerContract::new();
        let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
        // no member add a proposal.
        match manager_contract.add_proposal(
            accounts.frank,
            "test_title".to_string(),
            "test_ outline".to_string(),
            "test_detail".to_string(),
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(error, Error::OnlyMemberDoes),
        }

        ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
        let _res = manager_contract.add_member(
            accounts.frank,
            0,
            accounts.alice,
            "alice".to_string(),
            0,
        );
        // add one proposal
        match manager_contract.add_proposal(
            accounts.frank,
            "test_title".to_string(),
            "test_outline".to_string(),
            "test_detail".to_string(),
        ) {
            Ok(()) => {
                let proposal_list: Vec<ProposalInfo> =
                    manager_contract.get_proposal_list(accounts.frank);
                assert_eq!(0, proposal_list[0].proposal_id);
                assert_eq!("test_title".to_string(), proposal_list[0].title);
                assert_eq!("test_outline".to_string(), proposal_list[0].outline);
                assert_eq!("test_detail".to_string(), proposal_list[0].detail);
                assert_eq!(ProposalStatus::Proposed, proposal_list[0].status);
                assert_eq!(accounts.alice, proposal_list[0].proposer);
            }
            Err(_error) => panic!("This is not expected path."),
        }
        // add two proposal
        match manager_contract.add_proposal(
            accounts.frank,
            "test_title2".to_string(),
            "test_outline2".to_string(),
            "test_detail2".to_string(),
        ) {
            Ok(()) => {
                let proposal_list: Vec<ProposalInfo> =
                    manager_contract.get_proposal_list(accounts.frank);
                assert_eq!(1, proposal_list[1].proposal_id);
                assert_eq!("test_title2".to_string(), proposal_list[1].title);
                assert_eq!("test_outline2".to_string(), proposal_list[1].outline);
                assert_eq!("test_detail2".to_string(), proposal_list[1].detail);
                assert_eq!(ProposalStatus::Proposed, proposal_list[1].status);
                assert_eq!(accounts.alice, proposal_list[1].proposer);
            }
            Err(_error) => panic!("This is not expected path."),
        }
    }

    #[ink::test]
    fn change_proposal_status_works() {
        let mut manager_contract = ManagerContract::new();
        let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
        ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
        let _res = manager_contract.add_member(
            accounts.frank,
            0,
            accounts.alice,
            "alice".to_string(),
            0,
        );
        // add one proposal
        match manager_contract.add_proposal(
            accounts.frank,
            "test_title".to_string(),
            "test_outline".to_string(),
            "test_detail".to_string(),
        ) {
            Ok(()) => {
                let proposal_list: Vec<ProposalInfo> =
                    manager_contract.get_proposal_list(accounts.frank);
                assert_eq!(0, proposal_list[0].proposal_id);
            }
            Err(_error) => panic!("This is not expected path."),
        }
        // add two proposal
        match manager_contract.add_proposal(
            accounts.frank,
            "test_title2".to_string(),
            "test_outline2".to_string(),
            "test_detail2".to_string(),
        ) {
            Ok(()) => {
                let proposal_list: Vec<ProposalInfo> =
                    manager_contract.get_proposal_list(accounts.frank);
                assert_eq!(1, proposal_list[1].proposal_id);
            }
            Err(_error) => panic!("This is not expected path."),
        }

        // change status
        // Proposed -> Something
        // Proposed -> Denied
        match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Denied)
        {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Proposed -> None
        match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::None) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Proposed -> Proposed
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::Proposed,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Proposed -> Denied
        match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Denied)
        {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Proposed -> Running
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::Running,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Proposed -> Finished
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::Finished,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Proposed -> FinishVoting
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::FinishedVoting,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Proposed -> Voting
        let res =
            manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Voting);
        assert_eq!(Ok(()), res);
        // check value
        let proposal_list: Vec<ProposalInfo> =
            manager_contract.get_proposal_list(accounts.frank);
        assert_eq!(ProposalStatus::Voting, proposal_list[0].status);

        // Voting -> Something
        // Voting -> None
        match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::None) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Voting -> Proposed
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::Proposed,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Voting -> Denied
        match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Denied)
        {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Voting -> Running
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::Running,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Voting -> Finished
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::Finished,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // Voting -> FinishVoting
        let res = manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::FinishedVoting,
        );
        assert_eq!(Ok(()), res);
        // check value
        let proposal_list: Vec<ProposalInfo> =
            manager_contract.get_proposal_list(accounts.frank);
        assert_eq!(ProposalStatus::FinishedVoting, proposal_list[0].status);

        // FinishVoting -> Something
        // FinishVoting -> None
        match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::None) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // FinishVoting -> Proposed
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::Proposed,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // FinishVoting -> Denied
        match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Denied)
        {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // FinishVoting -> Running
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::Running,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
        // FinishVoting -> Finished
        match manager_contract.change_proposal_status(
            accounts.frank,
            0,
            ProposalStatus::Finished,
        ) {
            Ok(()) => panic!("This is not expected path."),
            Err(error) => assert_eq!(Error::InvalidChanging, error),
        }
    }

}
