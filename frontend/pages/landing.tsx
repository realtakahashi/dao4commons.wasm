import type { InferGetStaticPropsType, NextPage } from 'next'
import Link from 'next/link';

export const getStaticProps = async () => {
    return { props: {} }
}

const NewIndex = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
    return (
        <>
            <h1 className="Tiltle text-white  font-extrabold text-6xl"> Welcome to DAO4.Commons.Shiden </h1>

            <p className="p-10"></p>

            <p className="text-white  text-3xl leading-10">This dApp is for use a DAO for real life time. </p>
            <p className="text-white  text-3xl leading-10">You don't have to treat DAO as something special. </p>
            <p className="text-white  text-3xl leading-10">"I want to clean the area where I live", </p>
            <p className="text-white  text-3xl leading-10">"I want to create a place where children can play",</p>
            <p className="text-white  text-3xl leading-10">"I want to increase the related population in the area where I live", </p>
            <p className="text-white  text-3xl leading-10">"I want to take action against global warming", etc. </p>
            <p className="text-white  text-3xl leading-10">You no longer have to worry that you want to start something on your own,</p>
            <p className="text-white  text-3xl leading-10">but you don't have a team, you don't have the infrastructure to build and work with.</p>

            <p className="p-10"></p>
            <p className="text-white  text-4xl font-extrabold leading-10">Let's Start your Activities With DAO. </p>

            <p className="p-10"></p>
            <p className="text-white  text-4xl  leading-10">How to Create DAO </p>
            <p className="p-2"></p>
            <p className="text-white  text-2xl leading-10">1. Create a Sub DAO.</p>
            <p className="text-white  text-2xl leading-10">2. Deploy a NFT for as proof of DAO member.</p>
            <p className="text-white  text-1xl leading-10"># To become a member of DAO, you need to deposit a certain amount and Mint this NFT.</p>
            <p className="text-white  text-1xl leading-3"># When you create a DAO, it will be added to the Master DAO as a Sub DAO.</p>

            <p className="p-10"></p>
            <p className="text-white  text-4xl  leading-10">How to be DAO Member </p>
            <p className="p-2"></p>
            <p className="text-white  text-2xl leading-10">1. You will need to contact the DAO owner or DAO member for approval.</p>
            <p className="text-white  text-2xl leading-10">2. Ask the DAO owner or DAO member for the NFT address for the member and mint it.</p>
            <p className="text-white  text-2xl leading-10">3. Contact the DAO member with the TokenId and ask them to add the member.</p>

            <p className="p-10"></p>
            <p className="text-white  text-4xl  leading-10">How to submit a Proposal </p>
            <p className="p-2"></p>
            <p className="text-white  text-2xl leading-10">1. SubDAO has the ability for DAO members to submit proposals.</p>
            <p className="text-white  text-2xl leading-10">2. You can propose a proposal by logging in to the target SubDAO and clicking "Add a Proposal".</p>
            <p className="text-white  text-2xl leading-10">3. What is stored on the blockchain is "github url", "voting results", etc. </p>
            <p className="text-white  text-2xl leading-10">4. It is a premise that the progress of the discussion will be carried out on github.</p>

            <p className="p-10"></p>
            <p className="text-white  text-4xl  leading-10">How to vote a Proposal </p>
            <p className="p-2"></p>
            <p className="text-white  text-2xl leading-10">1. When the discussion is exhausted, the authorized person changes the Proposal status to "voting".</p>
            <p className="text-white  text-2xl leading-10">2. All DAO members have equal voting rights and can vote.</p>
            <p className="text-white  text-2xl leading-10">3. At the end of the election period, the authorized person
                will change the status of Proposal to "Finished Voting".</p>
            <p className="text-white  text-2xl leading-10">4. When the status moves to "Finished Voting", the dApp will aggregate the voting results.</p>
            <p className="text-white  text-2xl leading-10">5. If Proposal is passed, the status will be "running", and if rejected, the status will be "rejected".</p>

            <p className="p-10"></p>
            <p className="text-white  text-4xl  leading-10">How to get a basic income as a DAO </p>
            <p className="p-2"></p>
            <p className="text-white  text-2xl leading-10">1. Master DAO needs to recognize your DAO activities as valuable.</p>
            <p className="text-white  text-2xl leading-10">2. If the Master DAO is recognized as valuable to your DAO, your DAO will be able to receive Basic Income.</p>
            <p className="text-white  text-2xl leading-10">3. Initially, Basic Income will be sourced from Shiden, or Astar's dApp Staking rewards.</p>

            <p className="p-10"></p>
            <p className="text-white  text-4xl  leading-10">How to create a token sale </p>
            <p className="p-2"></p>
            <p className="text-white  text-2xl leading-10">......to be added......</p>

            <p className="p-10"></p>
            <p className="text-white  text-4xl  leading-10">How to relate other DAO </p>
            <p className="p-2"></p>
            <p className="text-white  text-2xl leading-10">......to be added......</p>

            <p className="p-10"></p>
            <p className="text-white  text-4xl  leading-10">How to Reconstruct Information on the Internet </p>
            <p className="p-2"></p>
            <p className="text-white  text-2xl leading-10">......</p>

            <p className="p-7"></p>
            <Link href="/" >
                <a className="text-white  text-5xl font-extrabold leading-10 underline">→→→→ Starting to Create Sub DAO →→→→ </a>
            </Link>


        </>
    )
}

export default NewIndex
