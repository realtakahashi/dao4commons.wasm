#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

// use ink_lang as ink;
// #[ink::contract]

pub use self::proposal_manager::{ProposalManager, ProposalManagerRef};

#[openbrush::contract]
pub mod proposal_manager {
    use ink_prelude::string::{String, ToString};
    use ink_prelude::vec::Vec;
    use ink_storage::traits::SpreadAllocate;
    use ink_storage::traits::StorageLayout;
    use ink_storage::traits::{PackedLayout, SpreadLayout};
    use member_manager::MemberManagerRef;
    use dao_manager::DaoManagerRef;
    use openbrush::{storage::Mapping, traits::Storage};

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Target member does not exist.
        MemberDoesNotExist,
        /// Target member already exists.
        MemberAlreadyExists,
        /// Electoral Commissioner Data is mismatched.
        ElectoralCommissionerDataMismatch,
        /// The proposal does not exist.
        ProposalDoesNotExist,
        /// The status you are trying to change is invalid.
        InvalidChanging,
        /// Only Electoral Commissioner
        OnlyElectoralCommissioner,
        /// Only Member does.
        OnlyMemberDoes,
        /// Already Voted.
        AlreadyVoted,
        /// Incorrect Voting Status
        IncorrectVotingStatus,
        /// Voted Result does not exist.
        VotedResultDoesNotExist,
        /// Required voter turnout not achieved
        VoterTurnoutNotAchieved,
        /// Not Running
        NotRunning,
        /// Not Implemented
        NotImplemented,
        /// Expiration of term of election commissioner
        ExpirationOfTermOfElectionCommissioner,
        /// Not Expiration Of Term Of Election Commissioner
        NotExpirationOfTermOfElectionCommissioner,
        /// Invalid Member Manager Call
        InvalidMemberManagerCall,
        InvalidDaoManagerCall,
        /// Possible Bug
        PossibleBug,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[derive(
        Debug, PartialEq, Eq, scale::Encode, scale::Decode, Clone, SpreadLayout, PackedLayout,
    )]
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

    #[derive(
        Debug, PartialEq, Eq, scale::Encode, scale::Decode, Clone, SpreadLayout, PackedLayout,
    )]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub enum ProposalType {
        AddMember,
        DeleteMember,
        ChangeElectoralCommissioner,
        UseDaoTresury,
        IssueToken,
        ChangeStatusOfTokenSale,
        WithdrawTokenSales,
        DistributeGovernanceToken,
    }

    pub const MAJORITY_PERCENTAGE_DEFINITION: u16 = 50;
    pub const REQUIRED_VOTER_TURNOUT_PERCENTAGE_DEFINITION: u16 = 80;
    pub const TENURE_OF_LIMIT: u16 = 3;

    // #[derive(
    //     Default, Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq,
    // )]
    #[derive(Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct ProposalInfo {
        proposal_type: ProposalType,
        proposal_id: u128,
        proposer: AccountId,
        title: String,
        outline: String,
        details: String,
        githubUrl: String,
        status: ProposalStatus,
        csv_data: String,
    }

    #[derive(Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct VotingResult {
        proposal_id: u128,
        yes: u16,
        no: u16,
    }

    #[ink(storage)]
    //   #[derive(SpreadAllocate, Storage)]
    //    #[derive(SpreadAllocate, Storage, Default)]
    pub struct ProposalManager {
        /// member_manager reference
        member_manager: MemberManagerRef,
        /// dao_manager reference
        dao_manager: DaoManagerRef,
        /// dao_address => count of tenure
        count_of_tenure: Mapping<AccountId, u16>,
        /// ( dao address, proposal_id) => proposal info
        proposal_infoes: Mapping<(AccountId, u128), ProposalInfo>,
        /// ( dao address, proposal_id) => voting result
        voting_results: Mapping<(AccountId, u128), VotingResult>,
        /// ( dao address, proposal_id) => eoa address
        voted_people: Mapping<(AccountId, u128), Vec<AccountId>>,
        /// dao address => u128
        next_proposal_ids:Mapping<AccountId, u128>,
    }

    impl ProposalManager {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(_member_manager: MemberManagerRef, dao_manager:DaoManagerRef) -> Self {
            // ink_lang::utils::initialize_contract(|instance: &mut Self| {
            //     instance.member_manager = _member_manager;
            // })
            Self {
                member_manager: _member_manager,
                dao_manager : dao_manager,
                count_of_tenure: Mapping::default(),
                proposal_infoes: Mapping::default(),
                voting_results: Mapping::default(),
                voted_people: Mapping::default(),
                next_proposal_ids: Mapping::default(), 
            }
        }

        /// add_proposal
        #[ink(message)]
        pub fn add_proposal(
            &mut self,
            proposal_type: ProposalType,
            dao_address: AccountId,
            title: String,
            outline: String,
            details: String,
            githubUrl: String,
            csv_data: String,
        ) -> Result<()> {
            let caller = self.env().caller();
            if self
                .member_manager
                .modifier_only_member(caller, dao_address)
                == false
            {
                ink_env::debug_println!("################### not member error.");
                return Err(Error::OnlyMemberDoes);
            }

            let limit = self.is_limit_tenure_count_of_electoral_commissioner(dao_address);
            match proposal_type {
                ProposalType::ChangeElectoralCommissioner => match limit {
                    true => (),
                    false => return Err(Error::NotExpirationOfTermOfElectionCommissioner),
                },
                _ => match limit {
                    true => return Err(Error::ExpirationOfTermOfElectionCommissioner),
                    false => (),
                },
            };

            let mut next_proposal_id = match self.next_proposal_ids.get(&dao_address) {
                Some(value) => value,
                None => 0,
            };

            let proposal_info = ProposalInfo {
                proposal_type: proposal_type,
                proposal_id: next_proposal_id,
                title: title,
                outline: outline,
                details: details,
                status: self::ProposalStatus::Proposed,
                proposer: caller,
                githubUrl: githubUrl,
                csv_data: csv_data,
            };
            self.proposal_infoes
                .insert(&(dao_address, next_proposal_id), &proposal_info);
            next_proposal_id = next_proposal_id + 1;
            self.next_proposal_ids.insert(&dao_address, &next_proposal_id);
            Ok(())
        }

        /// get proposal list.
        #[ink(message)]
        pub fn get_proposal_list(&self, dao_address: AccountId) -> Vec<ProposalInfo> {
            let next_proposal_id = match self.next_proposal_ids.get(&dao_address) {
                Some(value) => value,
                None => 0,
            };

            let mut proposal_list: Vec<ProposalInfo> = Vec::new();
            for i in 0..next_proposal_id {
                let proposal_info = match self.proposal_infoes.get(&(dao_address, i)) {
                    Some(value) => value,
                    None => continue,
                };
                proposal_list.push(proposal_info.clone());
            }
            proposal_list
        }

        /// vote for the proposal.
        #[ink(message)]
        pub fn vote_for_the_proposal(
            &mut self,
            dao_address: AccountId,
            proposal_id: u128,
            vote_yes: bool,
        ) -> Result<()> {
            let caller = self.env().caller();
            if self
                .member_manager
                .modifier_only_member(caller, dao_address)
                == false
            {
                return Err(Error::OnlyMemberDoes);
            }

            let mut proposal_info: ProposalInfo =
                match self.proposal_infoes.get(&(dao_address, proposal_id)) {
                    Some(value) => value,
                    None => return Err(Error::ProposalDoesNotExist),
                };
            if proposal_info.status != ProposalStatus::Voting {
                return Err(Error::IncorrectVotingStatus);
            }

            let mut voted_list: Vec<AccountId> =
                match self.voted_people.get(&(dao_address, proposal_id)) {
                    Some(value) => match value.contains(&caller) {
                        true => return Err(Error::AlreadyVoted),
                        _ => value,
                    },
                    None => Vec::<AccountId>::new(),
                };
            voted_list.push(caller);
            self.voted_people
                .insert(&(dao_address, proposal_id), &voted_list);

            let mut yes_value = 0;
            let mut no_value = 0;
            match vote_yes {
                true => yes_value = yes_value + 1,
                false => no_value = no_value + 1,
            };

            let vote_result: VotingResult =
                match self.voting_results.get(&(dao_address, proposal_id)) {
                    Some(mut value) => {
                        value.yes = value.yes + yes_value;
                        value.no = value.no + no_value;
                        value
                    }
                    None => VotingResult {
                        proposal_id: proposal_id,
                        yes: yes_value,
                        no: no_value,
                    },
                };
            self.voting_results
                .insert(&(dao_address, proposal_id), &vote_result);
            Ok(())
        }

        /// get voting result
        #[ink(message)]
        pub fn get_voted_result(
            &self,
            _dao_address: AccountId,
            _proposal_id: u128,
        ) -> Option<VotingResult> {
            self.voting_results.get(&(_dao_address, _proposal_id))
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
            if self
                .member_manager
                .modifier_only_electoral_commissioner(caller, _dao_address)
                == false
            {
                return Err(Error::OnlyElectoralCommissioner);
            }

            let mut proposal_info: ProposalInfo =
                match self.proposal_infoes.get(&(_dao_address, _proposal_id)) {
                    Some(value) => value,
                    None => return Err(Error::ProposalDoesNotExist),
                };

            let limit = self.is_limit_tenure_count_of_electoral_commissioner(_dao_address);
            match proposal_info.proposal_type {
                ProposalType::ChangeElectoralCommissioner => match limit {
                    true => (),
                    false => return Err(Error::NotExpirationOfTermOfElectionCommissioner),
                },
                _ => match limit {
                    true => return Err(Error::ExpirationOfTermOfElectionCommissioner),
                    false => (),
                },
            };

            match self.check_anti_pattern(proposal_info.clone(), _status.clone()) {
                true => {
                    proposal_info.status = _status.clone();
                    self.inline_change_proposal_status(_dao_address, proposal_info.clone())
                }
                false => return Err(Error::InvalidChanging),
            }
            if _status == ProposalStatus::FinishVoting {
                match self.count_votes_of_proposal(_dao_address, _proposal_id) {
                    Ok(()) => (),
                    Err(e) => return Err(e),
                };
            }
            Ok(())
        }

        /// execute the proposal
        #[ink(message)]
        pub fn execute_proposal(
            &mut self,
            _dao_address: AccountId,
            _proposal_id: u128,
        ) -> Result<()> {
            let caller = self.env().caller();
            if self
                .member_manager
                .modifier_only_member(caller, _dao_address)
                == false
            {
                ink_env::debug_println!("########################### OnlyMemberDoes Error.");
                return Err(Error::OnlyMemberDoes);
            }

            let mut proposal_info: ProposalInfo =
                match self.proposal_infoes.get(&(_dao_address, _proposal_id)) {
                    Some(value) => {
                        if value.status != ProposalStatus::Running {
                            ink_env::debug_println!("########################### NotRunning Error.");
                            return Err(Error::NotRunning);
                        }
                        value
                    }
                    None => {
                        ink_env::debug_println!("########################### ProposalDoesNotExist Error.");
                        return Err(Error::ProposalDoesNotExist);
                    },
                };

            match proposal_info.proposal_type {
                ProposalType::AddMember => {
                    match self.member_manager.add_member(_dao_address, proposal_info.clone().csv_data) {
                        Ok(()) => (),
                        Err(e) => {
                            ink_env::debug_println!("########################### Execute Error.");
                            return Err(Error::InvalidMemberManagerCall)
                        },
                    }
                },
                ProposalType::DeleteMember => {
                    match self.member_manager.delete_member(_dao_address, proposal_info.clone().csv_data){
                        Ok(()) => (),
                        Err(e) => {
                            ink_env::debug_println!("########################### Execute Error.");
                            return Err(Error::InvalidMemberManagerCall)
                        },
                    }
                },
                ProposalType::ChangeElectoralCommissioner => {
                    match self.member_manager.change_electoral_commissioner(_dao_address,proposal_info.clone().csv_data,){
                        Ok(()) => (),
                        Err(e) => return Err(Error::InvalidMemberManagerCall),
                    };
                    self.clear_tenure_count(_dao_address);
                },
                ProposalType::IssueToken => {
                    match self.dao_manager.add_dao_token(_dao_address,proposal_info.clone().csv_data){
                        Ok(()) => (),
                        Err(e) => return Err(Error::InvalidDaoManagerCall),
                    }
                },
                ProposalType::ChangeStatusOfTokenSale => {
                    match self.dao_manager.change_token_sales_status(_dao_address,proposal_info.clone().csv_data){
                        Ok(()) => (),
                        Err(e) => return Err(Error::InvalidDaoManagerCall),
                    }
                },
                ProposalType::WithdrawTokenSales => {
                    match self.dao_manager.withdraw_token_proceeds(_dao_address,proposal_info.clone().csv_data){
                        Ok(()) => (),
                        Err(e) => return Err(Error::InvalidDaoManagerCall),
                    }
                },
                ProposalType::DistributeGovernanceToken => {
                    match self.dao_manager.distribute_governance_token(_dao_address,proposal_info.clone().csv_data){
                        Ok(()) => (),
                        Err(e) => return Err(Error::InvalidDaoManagerCall),
                    }
                },
                ProposalType::UseDaoTresury => {
                    match self.dao_manager.distribute_dao_treasury(_dao_address,proposal_info.clone().csv_data){
                        Ok(()) => (),
                        Err(e) => return Err(Error::InvalidDaoManagerCall),
                    }
                },
                _ => {
                    ink_env::debug_println!("########################### NotImplemented Error.");
                    return Err(Error::NotImplemented);
                },
            };
            proposal_info.status = ProposalStatus::Finished;
            self.inline_change_proposal_status(_dao_address, proposal_info.clone());
            Ok(())
        }

        /// add tenure count
        #[inline]
        fn add_tenure_count(&mut self, _dao_address: AccountId) {
            match self.count_of_tenure.get(&_dao_address) {
                Some(value) => {
                    let count = value + 1;
                    self.count_of_tenure.insert(&_dao_address, &count);
                }
                None => {
                    let count = 1;
                    self.count_of_tenure.insert(&_dao_address, &count);
                },
            }
        }

        /// clear tenure count
        fn clear_tenure_count(&mut self, _dao_address: AccountId){
            match self.count_of_tenure.get(&_dao_address) {
                Some(value) => {
                    let count = 0;
                    self.count_of_tenure.insert(&_dao_address, &count);
                }
                None => (),
            }
        }

        /// check tenure count
        #[inline]
        fn is_limit_tenure_count_of_electoral_commissioner(&self, _dao_address: AccountId) -> bool {
            match self.count_of_tenure.get(&_dao_address) {
                Some(value) => {
                    ink_env::debug_println!("########################### count_of_tenure : {:?}", value);
                    ink_env::debug_println!("########################### TENURE_OF_LIMIT : {:?}", TENURE_OF_LIMIT);
                    return value >= TENURE_OF_LIMIT;
                },
                None => return false,
            };
        }

        /// count voting result.
        #[inline]
        fn count_votes_of_proposal(
            &mut self,
            _dao_address: AccountId,
            _proposal_id: u128,
        ) -> Result<()> {
            let member_count: u16 = self
                .member_manager
                .get_member_list(_dao_address)
                .len()
                .try_into()
                .unwrap();
            let mut proposal_info: ProposalInfo =
                match self.proposal_infoes.get(&(_dao_address, _proposal_id)) {
                    Some(value) => value,
                    None => return Err(Error::ProposalDoesNotExist),
                };
            let voted_result: VotingResult =
                match self.voting_results.get(&(_dao_address, _proposal_id)) {
                    Some(value) => value,
                    None => VotingResult {
                        proposal_id: _proposal_id,
                        yes: 0,
                        no: 0,
                    },
                };

            self.add_tenure_count(_dao_address);

            let voter_count = voted_result.yes + voted_result.no;
            if (voter_count / member_count * 100) < REQUIRED_VOTER_TURNOUT_PERCENTAGE_DEFINITION {
                proposal_info.status = ProposalStatus::Denied;
                self.inline_change_proposal_status(_dao_address, proposal_info);
                return Ok(());
            }
            match (voted_result.yes / member_count * 100) >= MAJORITY_PERCENTAGE_DEFINITION {
                true => proposal_info.status = ProposalStatus::Running,
                false => proposal_info.status = ProposalStatus::Denied,
            }
            self.inline_change_proposal_status(_dao_address, proposal_info);

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
                    ProposalStatus::FinishVoting => return true,
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
    use core::borrow::Borrow;

    /// Imports all the definitions from the outer scope so we can use them here.
    use super::*;

    /// Imports `ink_lang` so we can use `#[ink::test]`.
    use ink_lang as ink;

    use member_manager::{MemberManager, MemberManagerRef};

    #[ink::test]
    fn instanciate_works() {
        let mut member_manager = MemberManager::new();
        //        let member_manager_ref:MemberManagerRef = &mut member_manager;
        let mut proposal_manager = ProposalManager::new(&member_manager);
        let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
        let res = member_manager.add_first_member(
            accounts.frank,
            accounts.alice,
            "takahashi".to_string(),
            0,
        );
        assert_eq!(Ok(()), res);
        // proposal_manager.add_proposal(accounts.frank, "test_title".to_string(), "test_ outline".to_string(), "test_detail".to_string(),);
        // assert_eq!(Ok(()), res);
    }

    // #[ink::test]
    // fn add_proposal_works() {
    //     let mut manager_contract = ManagerContract::new();
    //     let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
    //     // no member add a proposal.
    //     match manager_contract.add_proposal(
    //         accounts.frank,
    //         "test_title".to_string(),
    //         "test_ outline".to_string(),
    //         "test_detail".to_string(),
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(error, Error::OnlyMemberDoes),
    //     }

    //     ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
    //     let _res = manager_contract.add_member(
    //         accounts.frank,
    //         0,
    //         accounts.alice,
    //         "alice".to_string(),
    //         0,
    //     );
    //     // add one proposal
    //     match manager_contract.add_proposal(
    //         accounts.frank,
    //         "test_title".to_string(),
    //         "test_outline".to_string(),
    //         "test_detail".to_string(),
    //     ) {
    //         Ok(()) => {
    //             let proposal_list: Vec<ProposalInfo> =
    //                 manager_contract.get_proposal_list(accounts.frank);
    //             assert_eq!(0, proposal_list[0].proposal_id);
    //             assert_eq!("test_title".to_string(), proposal_list[0].title);
    //             assert_eq!("test_outline".to_string(), proposal_list[0].outline);
    //             assert_eq!("test_detail".to_string(), proposal_list[0].detail);
    //             assert_eq!(ProposalStatus::Proposed, proposal_list[0].status);
    //             assert_eq!(accounts.alice, proposal_list[0].proposer);
    //         }
    //         Err(_error) => panic!("This is not expected path."),
    //     }
    //     // add two proposal
    //     match manager_contract.add_proposal(
    //         accounts.frank,
    //         "test_title2".to_string(),
    //         "test_outline2".to_string(),
    //         "test_detail2".to_string(),
    //     ) {
    //         Ok(()) => {
    //             let proposal_list: Vec<ProposalInfo> =
    //                 manager_contract.get_proposal_list(accounts.frank);
    //             assert_eq!(1, proposal_list[1].proposal_id);
    //             assert_eq!("test_title2".to_string(), proposal_list[1].title);
    //             assert_eq!("test_outline2".to_string(), proposal_list[1].outline);
    //             assert_eq!("test_detail2".to_string(), proposal_list[1].detail);
    //             assert_eq!(ProposalStatus::Proposed, proposal_list[1].status);
    //             assert_eq!(accounts.alice, proposal_list[1].proposer);
    //         }
    //         Err(_error) => panic!("This is not expected path."),
    //     }
    // }

    // #[ink::test]
    // fn change_proposal_status_works() {
    //     let mut manager_contract = ManagerContract::new();
    //     let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
    //     ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
    //     let _res = manager_contract.add_member(
    //         accounts.frank,
    //         0,
    //         accounts.alice,
    //         "alice".to_string(),
    //         0,
    //     );
    //     // add one proposal
    //     match manager_contract.add_proposal(
    //         accounts.frank,
    //         "test_title".to_string(),
    //         "test_outline".to_string(),
    //         "test_detail".to_string(),
    //     ) {
    //         Ok(()) => {
    //             let proposal_list: Vec<ProposalInfo> =
    //                 manager_contract.get_proposal_list(accounts.frank);
    //             assert_eq!(0, proposal_list[0].proposal_id);
    //         }
    //         Err(_error) => panic!("This is not expected path."),
    //     }
    //     // add two proposal
    //     match manager_contract.add_proposal(
    //         accounts.frank,
    //         "test_title2".to_string(),
    //         "test_outline2".to_string(),
    //         "test_detail2".to_string(),
    //     ) {
    //         Ok(()) => {
    //             let proposal_list: Vec<ProposalInfo> =
    //                 manager_contract.get_proposal_list(accounts.frank);
    //             assert_eq!(1, proposal_list[1].proposal_id);
    //         }
    //         Err(_error) => panic!("This is not expected path."),
    //     }

    //     // change status
    //     // Proposed -> Something
    //     // Proposed -> Denied
    //     match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Denied)
    //     {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Proposed -> None
    //     match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::None) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Proposed -> Proposed
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::Proposed,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Proposed -> Denied
    //     match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Denied)
    //     {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Proposed -> Running
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::Running,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Proposed -> Finished
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::Finished,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Proposed -> FinishVoting
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::FinishedVoting,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Proposed -> Voting
    //     let res =
    //         manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Voting);
    //     assert_eq!(Ok(()), res);
    //     // check value
    //     let proposal_list: Vec<ProposalInfo> =
    //         manager_contract.get_proposal_list(accounts.frank);
    //     assert_eq!(ProposalStatus::Voting, proposal_list[0].status);

    //     // Voting -> Something
    //     // Voting -> None
    //     match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::None) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Voting -> Proposed
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::Proposed,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Voting -> Denied
    //     match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Denied)
    //     {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Voting -> Running
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::Running,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Voting -> Finished
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::Finished,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // Voting -> FinishVoting
    //     let res = manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::FinishedVoting,
    //     );
    //     assert_eq!(Ok(()), res);
    //     // check value
    //     let proposal_list: Vec<ProposalInfo> =
    //         manager_contract.get_proposal_list(accounts.frank);
    //     assert_eq!(ProposalStatus::FinishedVoting, proposal_list[0].status);

    //     // FinishVoting -> Something
    //     // FinishVoting -> None
    //     match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::None) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // FinishVoting -> Proposed
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::Proposed,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // FinishVoting -> Denied
    //     match manager_contract.change_proposal_status(accounts.frank, 0, ProposalStatus::Denied)
    //     {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // FinishVoting -> Running
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::Running,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    //     // FinishVoting -> Finished
    //     match manager_contract.change_proposal_status(
    //         accounts.frank,
    //         0,
    //         ProposalStatus::Finished,
    //     ) {
    //         Ok(()) => panic!("This is not expected path."),
    //         Err(error) => assert_eq!(Error::InvalidChanging, error),
    //     }
    // }
}
