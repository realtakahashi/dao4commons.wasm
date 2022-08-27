#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

// use ink_lang as ink;
// #[ink::contract]

pub use self::manager_contract::{ManagerContract, ManagerContractRef};

#[openbrush::contract]
pub mod manager_contract {
    use ink_prelude::string::{String, ToString};
    use ink_prelude::vec::Vec;
    use ink_storage::traits::SpreadAllocate;
    use ink_storage::traits::StorageLayout;
    use ink_storage::traits::{PackedLayout, SpreadLayout};
    use openbrush::{contracts::ownable::*, modifiers, storage::Mapping, traits::Storage};

    #[derive(
        Default, Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq,
    )]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct MemberInfo {
        name: String,
        memberAddress: AccountId,
        memberId: u16,
        tokenId: u16,
        isElectoralCommissioner: bool,
    }

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
        /// running
        Running,
        /// denied
        Denied,
        /// finished
        Finished,
    }

    #[derive(Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct ProposalInfo {
        proposal_id: u128,
        proposer: AccountId,
        title: String,
        outline: String,
        detail: String,
        status: ProposalStatus,
    }

    #[ink(storage)]
    // #[derive(SpreadAllocate)]
    #[derive(SpreadAllocate, Storage, Default)]
    pub struct ManagerContract {
        #[storage_field]
        ownable: ownable::Data,

        /// member function values.
        next_member_id: u16,
        next_no: u16,
        owner: AccountId,
        // ( DAO address , EOA Address ) => MemberInfo
        member_infoes: Mapping<(AccountId, AccountId), MemberInfo>,
        // ( DAO address , member_id ) => MemberInfo
        member_infoes_from_id: Mapping<(AccountId, u16), MemberInfo>,
        // ( DAO address , commissioner_no ) = EOA Address
        electoral_commissioner: Mapping<(AccountId, u16), AccountId>,

        /// proposal function values.

        /// proposal_id
        next_proposal_id: u128,
        /// ( dao address, proposal_id) => proposal info
        proposal_infoes: Mapping<(AccountId, u128), ProposalInfo>,
    }

    impl Ownable for ManagerContract {}

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Target member does not exist.
        MemberDoesNotExist,
        /// Target member already exists.
        MemberAlreadyExists,
        /// Electoral Commissioner Data is mismatched.
        ElectoralCommissionerDataMismatch,
        /// Only Member does.
        OnlyMemberDoes,
        /// The proposal does not exist.
        ProposalDoesNotExist,
        /// The status you are trying to change is invalid.
        InvalidChanging,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl ManagerContract {
        /// Constructor
        #[ink(constructor)]
        pub fn new() -> Self {
            ink_lang::utils::initialize_contract(|instance: &mut Self| {
                let caller = instance.env().caller();
                instance._init_with_owner(caller);
            })
        }

        /// Functions of Member.

        /// add a member.
        #[ink(message)]
        pub fn add_member(
            &mut self,
            _dao_address: AccountId,
            _proposal_id: u128,
            _member_address: AccountId,
            _name: String,
            _token_id: u16,
        ) -> Result<()> {
            //todo:check proposal is valid
            if self.member_infoes.get(&(_dao_address, _member_address)) != None {
                return Err(Error::MemberAlreadyExists);
            }
            let member_info = MemberInfo {
                name: _name,
                memberAddress: _member_address,
                memberId: self.next_member_id,
                tokenId: _token_id,
                isElectoralCommissioner: false,
            };

            self.member_infoes
                .insert(&(_dao_address, _member_address), &member_info.clone());
            self.member_infoes_from_id
                .insert(&(_dao_address, self.next_member_id), &member_info.clone());
            self.next_member_id = self.next_member_id + 1;
            Ok(())
        }

        /// delete the member.
        #[ink(message)]
        pub fn delete_member(
            &mut self,
            _dao_address: AccountId,
            _proposal_id: u128,
            _member_address: AccountId,
        ) -> Result<()> {
            // todo:check invalid proposal
            let member_info = match self.member_infoes.get(&(_dao_address, _member_address)) {
                Some(value) => value,
                None => return Err(Error::MemberDoesNotExist),
            };
            for i in 0..self.next_no {
                let electoral_commissioner_address: AccountId =
                    match self.electoral_commissioner.get(&(_dao_address, i)) {
                        Some(value) => value,
                        None => return Err(Error::ElectoralCommissionerDataMismatch),
                    };
                if (electoral_commissioner_address == member_info.memberAddress) {
                    self.electoral_commissioner.remove(&(_dao_address, i));
                }
            }
            self.member_infoes_from_id
                .remove(&(_dao_address, member_info.memberId));
            self.member_infoes.remove(&(_dao_address, _member_address));
            Ok(())
        }

        /// get member list.
        #[ink(message)]
        pub fn get_member_list(&self, _dao_address: AccountId) -> Vec<MemberInfo> {
            let mut member_list: Vec<MemberInfo> = Vec::new();
            for i in 0..self.next_member_id {
                let member_info = match self.member_infoes_from_id.get(&(_dao_address, i)) {
                    Some(value) => value,
                    None => continue,
                };
                member_list.push(member_info.clone());
            }
            member_list
        }

        /// add electoral commissioner.
        #[ink(message)]
        pub fn add_electoral_commissioner(
            &mut self,
            _dao_address: AccountId,
            _member_address: AccountId,
            _proposal_id: u128,
        ) -> Result<()> {
            // todo: check only member
            // todo: check invalid proposal
            let mut member_info: MemberInfo =
                match self.member_infoes.get(&(_dao_address, _member_address)) {
                    Some(value) => value,
                    None => return Err(Error::MemberDoesNotExist),
                };
            self.electoral_commissioner
                .insert(&(_dao_address, self.next_no), &_member_address);
            self.next_no = self.next_no + 1;

            member_info.isElectoralCommissioner = true;
            self.member_infoes
                .insert(&(_dao_address, _member_address), &member_info.clone());
            self.member_infoes_from_id
                .insert(&(_dao_address, member_info.memberId), &member_info.clone());

            Ok(())
        }

        /// dismiss electoral commissioner.
        #[ink(message)]
        pub fn dismiss_electoral_commissioner(
            &mut self,
            _dao_address: AccountId,
            _proposal_id: u128,
        ) -> Result<()> {
            for i in 0..self.next_no {
                let member_address = match self.electoral_commissioner.get(&(_dao_address, i)) {
                    Some(value) => value,
                    None => return Err(Error::ElectoralCommissionerDataMismatch),
                };
                let mut member_info = match self.member_infoes.get(&(_dao_address, member_address))
                {
                    Some(value) => value,
                    None => return Err(Error::ElectoralCommissionerDataMismatch),
                };
                member_info.isElectoralCommissioner = false;
                self.member_infoes.insert(
                    &(_dao_address, member_info.memberAddress),
                    &member_info.clone(),
                );
                self.member_infoes_from_id
                    .insert(&(_dao_address, member_info.memberId), &member_info.clone());

                self.electoral_commissioner.remove(&(_dao_address, i));
            }
            Ok(())
        }

        #[inline]
        fn modifier_only_member(&self, _dao_address: AccountId) -> bool {
            let caller = self.env().caller();
            match self.member_infoes.get(&(_dao_address, caller)) {
                Some(value) => true,
                None => false,
            }
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
            if self.modifier_only_member(_dao_address) == false {
                return Err(Error::OnlyMemberDoes);
            }
            let caller = self.env().caller();
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
            _status: ProposalStatus
        ) -> Result<()> {
            if self.modifier_only_member(_dao_address) == false {
                return Err(Error::OnlyMemberDoes);
            }
            let proposal_info = match self.proposal_infoes.get(&(_dao_address, _proposal_id)) {
                Some(value) => value,
                None => return Err(Error::ProposalDoesNotExist),
            };
            match self.check_anti_pattern(proposal_info,_status) {
                true => self.inline_change_proposal_status(_dao_address, proposal_info),
                false => return Err(Error::InvalidChanging),
            }

            Ok(())
        }

        /// change status for local function.
        #[inline]
        fn inline_change_proposal_status(&mut self, _dao_address:AccountId, _proposal_info:ProposalInfo){
            self.proposal_infoes.insert(&(_dao_address, _proposal_info.proposal_id), &_proposal_info);
        }

        /// impossible changing => false, possible changing => true,
        #[inline]
        fn check_anti_pattern(_proposal_info:ProposalInfo, _status:ProposalStatus) -> bool {
            match _proposal_info.status {
                ProposalStatus::Proposed => {
                    match _status {
                        ProposalStatus::Voting => return true,
                        _ => return false,
                    }
                },
                ProposalStatus::Voting => {
                    match _status {
                        ProposalStatus::Running|ProposalStatus::Denied => return true,
                        _=> return false,
                    }
                },
                ProposalStatus::Running => {
                    match _status {
                        ProposalStatus::Finished => return true,
                        _=> return false,
                    }
                },
                _=> return false,
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
        fn add_member_works() {
            let mut manager_contract = ManagerContract::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();

            // normal adding a member
            manager_contract.add_member(accounts.frank, 0, accounts.alice, "alice".to_string(), 0);
            let member_info_list = manager_contract.get_member_list(accounts.frank);
            assert_eq!(member_info_list[0].name, "alice");
            assert_eq!(member_info_list[0].memberAddress, accounts.alice);
            assert_eq!(member_info_list[0].isElectoralCommissioner, false);

            // normal adding two members
            manager_contract.add_member(accounts.frank, 1, accounts.bob, "bob".to_string(), 1);
            let member_info_list = manager_contract.get_member_list(accounts.frank);
            assert_eq!(member_info_list[1].name, "bob");
            assert_eq!(member_info_list[1].memberAddress, accounts.bob);
            assert_eq!(member_info_list[1].isElectoralCommissioner, false);

            // duplicated adding
            match manager_contract.add_member(
                accounts.frank,
                0,
                accounts.alice,
                "alice".to_string(),
                0,
            ) {
                Ok(()) => panic!("This is not expected path."),
                Err(error) => assert_eq!(error, Error::MemberAlreadyExists),
            }
        }

        #[ink::test]
        fn delete_member_works() {
            let mut manager_contract = ManagerContract::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            // deleting non-existed member
            match manager_contract.delete_member(accounts.frank, 0, accounts.alice) {
                Ok(()) => panic!("This is not expected path."),
                Err(error) => assert_eq!(error, Error::MemberDoesNotExist),
            };
            // deleting existed member
            manager_contract.add_member(accounts.frank, 0, accounts.alice, "alice".to_string(), 0);
            manager_contract.add_member(accounts.frank, 1, accounts.bob, "bob".to_string(), 1);
            match manager_contract.delete_member(accounts.frank, 1, accounts.bob) {
                Ok(()) => {
                    let member_list = manager_contract.get_member_list(accounts.frank);
                    assert_eq!(1, member_list.len());
                    assert_eq!(accounts.alice, member_list[0].memberAddress);
                }
                Err(error) => panic!("This is not expected path."),
            }
        }

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
            manager_contract.add_member(accounts.frank, 0, accounts.alice, "alice".to_string(), 0);
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
                    assert_eq!(accounts.alice, proposal_list[0].proposer);
                }
                Err(error) => panic!("This is not expected path."),
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
                    assert_eq!(accounts.alice, proposal_list[1].proposer);
                }
                Err(error) => panic!("This is not expected path."),
            }
        }

        #[ink::test]
        fn change_proposal_status_works(){
            let mut manager_contract = ManagerContract::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            manager_contract.add_member(accounts.frank, 0, accounts.alice, "alice".to_string(), 0);
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
                Err(error) => panic!("This is not expected path."),
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
                Err(error) => panic!("This is not expected path."),
            }
            // change invalid status
            
            // change  

        }

    }
}
