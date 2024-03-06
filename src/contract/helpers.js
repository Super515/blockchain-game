
import { web3 } from '@project-serum/anchor';
import {
    Keypair,
    PublicKey,
    SYSVAR_CLOCK_PUBKEY,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
    TransactionSignature,
    Connection
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from '@project-serum/anchor';
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletContextState } from "@solana/wallet-adapter-react";

import { showToast } from "./utils";
import { toast } from 'react-toastify';

const IDL = require('./squidmoon');

const PROGRAM_ID = new PublicKey(
    "bQ5ric8XJbnmfzp3oc4fK55aBYMNrM8aUE67mvujb6G"
);

const VAULT_SEED = "VAULT_SEED";
const USER_STATE_SEED = "USER_STATE_SEED";

export const getVaultKey = async () => {
    const [vaultKey] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_SEED)],
        PROGRAM_ID
    );
    return vaultKey;
};

export const getUserStateKey = async () => {
    const [userStateKey] = await PublicKey.findProgramAddress(
      [Buffer.from(USER_STATE_SEED)],
      PROGRAM_ID
    );
    return userStateKey;
  };
  

export const getProgram = (wallet, connection) => {
    let provider = new anchor.Provider(
        connection,
        wallet,
        anchor.Provider.defaultOptions()
    );
    const program = new anchor.Program(IDL, PROGRAM_ID, provider);
    return program;
};

export const initialize = async (wallet, connection) => {
    if (wallet.publicKey === null) throw new WalletNotConnectedError();

    let program = getProgram(wallet, connection);

    const vaultKey = await getVaultKey();
    const tx = new Transaction().add(
        await program.methods
            .initialize()
            .accounts({
                authority: wallet.publicKey,
                userState: await getUserStateKey(),
                vault: vaultKey,
                systemProgram: SystemProgram.programId
            })
            .instruction()
    );

    // try {
    //     await wallet.sendTransaction(tx, connection);
    // } catch (error) {
    //     console.log('error', error);
    // }

    return await send(connection, wallet, tx);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

export const coinFlip = async (wallet, connection) => {
    let program = getProgram(wallet, connection);

    const rand = getRandomInt(100, 200);

    const vaultKey = await getVaultKey();
    let userStateKey = await getUserStateKey();
    let tx = new Transaction().add(
        await program.methods
            .coinflip(45, 45, new anchor.BN(web3.LAMPORTS_PER_SOL * 0.1), rand)
            .accounts({
                vault: vaultKey,
                userState: userStateKey,
                user: wallet.publicKey,
                systemProgram: SystemProgram.programId
            })
            .instruction()
    );

    // await wallet.sendTransaction(tx, connection);
    await send(connection, wallet, tx);

    let userData = await program.account.userState.fetch(userStateKey);

    console.log('vault address : ', vaultKey.toBase58());

    console.log('user data : ', userData);
    console.log('rewards : ', userData.lastRewards.toNumber());

    return userData.lastCoinflipRes;
}

async function send(
    connection,
    wallet,
    transaction
) {
    const txHash = await sendTransaction(connection, wallet, transaction);
    if (txHash != null) {
        let confirming_id = showToast("Confirming Transaction ...", -1, 2);
        let res = await connection.confirmTransaction(txHash);
        console.log(txHash);
        toast.dismiss(confirming_id);
        if (res.value.err) showToast("Transaction Failed", 2000, 1);
        else showToast("Transaction Confirmed", 2000);
    } else {
        showToast("Transaction Failed", 2000, 1);
    }
    return txHash;
}


export async function sendTransaction(
    connection,
    wallet,
    transaction
) {
    if (wallet.publicKey === null || wallet.signTransaction === undefined)
        return null;
    try {
        transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
        ).blockhash;
        transaction.feePayer = wallet.publicKey;
        const signedTransaction = await wallet.signTransaction(transaction);
        const rawTransaction = signedTransaction.serialize();

        showToast("Sending Transaction ...", 500);

        const txid = await connection.sendRawTransaction(
            rawTransaction,
            {
                skipPreflight: true,
                preflightCommitment: "processed",
            }
        );
        return txid;
    } catch (e) {
        console.log("tx e = ", e);
        return null;
    }
}
