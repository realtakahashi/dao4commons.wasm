# dao4commons.wasm
## project philosophy
- Please check [the article](https://realtakahashi-work.medium.com/aiming-for-a-simple-dao-tool-that-anyone-can-use-cheaply-c23c24b99900) of this dApp.
## dApp design
        Proposal Manager
        ↓               ↓
    Member Manager      Dao Manager
                        ↓
                        Dao Contract
                        ↓                       ↓           ↓
                        dao governance token    dao_psp22   dao_psp34

## the function of contracts
- Proposapl Manager
  - Proposal Manager manages proposals related to DAO.
  - The Proposal Manager has the ability to make proposals, vote on proposals, and execute proposals.
  - All activities within the DAO must be voted on and approved using the Proposal Manager.
  - Two conditions must be met for a vote to pass: 80% or more of the members must participate, and 50% or more must agree.

- Member Manager
  - Member Manager manages DAO members. Appoint some of the members as election officials.
  - The election commissioner checks whether each proposal has been exhausted and initiates and terminates voting.
  - The Election Commission has a term of office and may not be dismissed during the term of office. Conversely, if the term of office expires, he will be forcibly dismissed and selected from among the members by proposal within the DAO.

- Dao Manager
  - Dao Manager aims to list Dao.
  - Operations on Dao are performed through Dao Manager.

- Dao Contract 
  - This is the body of Dao.
  - Dao has the following features:
    - Issue and distribute governance tokens.
    - Issue and sell PSP22 and PSP34 tokens.
    - Use DAO's Treasury according to its purpose.
    - Of course, member management such as member addition/deletion, proposal addition, voting, execution, etc. are also functions of DAO, but these are contractually implemented in Proposal Manager and Member Manager.

- Dao Governance Token
  - A governance token for DAO members.

- Dao PSP22 Token
  - PSP22 token for fundraising. It is implemented so that token sale can be executed.

- Dao PSP34 Token
  - PSP22 token for fundraising. It is implemented so that token sale can be executed.
