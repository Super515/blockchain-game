import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BASEURL, errorToast, successToast } from "../../utils/Utils";
import HeroTimer from "../../components/HeroTimer";
import Spinner from "../../components/Spinner";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SendTransactionError,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
// import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getOrCreateAssociatedTokenAccount } from "../../components/tokenTransferUtils/getOrCreateAssociatedTokenAccount.ts";
import { createTransferInstruction } from "../../components/tokenTransferUtils/createTransferInstructions.ts";

//OWNER ADDRESS
const toPubkey = "BVmdx6PdToCmGcSPUaFCXzrzbrSzRrecbAXS7xgREdDq";

const Details = () => {
  const { connection } = useConnection();
  const instance = useWallet();
  const { connected, publicKey, signTransaction, sendTransaction } = instance;
  const [nftDetails, setNFTDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState({});
  const [purchasedTickets, setPurchasedTickets] = useState("0");
  const { id } = useParams();
  // console.log(instance);
  // console.log(publicKey);

  const myTicketsHandler = (id) => {
    if (!publicKey) return;
    const address = publicKey.toBase58();
    const wallet = localStorage.getItem("wallet");

    if (!connected) {
      return;
    }

    setIsLoading(true);

    axios
      .post(`${BASEURL}/entry/my-tickets`, {
        walletAddress: address,
        nftId: id,
      })
      .then((response) => {
        console.log(response.data.data);
        setPurchasedTickets(response.data.data?.totalTickets || 0);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
        errorToast(e.response.data.message);
      });
  };
  const fetchNFTDetail = (id) => {
    setIsLoading(true);
    console.log("fun ran");

    axios
      .get(`${BASEURL}/nft/${id}`)
      .then((response) => {
        setNFTDetails(response.data.data);
        setIsLoading(false);
        // console.log(response);
        console.log(response.data.data);
        // setSelectedCurrency(response.data.data);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
        // errorToast(e.response.data.message);
      });
  };
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  useEffect(() => {
    if (id) {
      fetchNFTDetail(id);
      myTicketsHandler(id);

      var current = new Date();
      const startTime = new Date(nftDetails?.startTime);
      const endTime = new Date(nftDetails?.endTime);
      var startUTC = startTime.getTimezoneOffset();
      var endUTC = endTime.getTimezoneOffset();

      startTime.setMinutes(startTime.getMinutes() + startUTC);
      endTime.setMinutes(endTime.getMinutes() + endUTC);
      console.log(current);
      console.log(startTime);
      console.log(endTime);
      if (startTime.getTime() < current.getTime()) setHasStarted(true);
      if (endTime.getTime() < current.getTime()) setHasEnded(true);
    }
  }, [id, publicKey]);
  const isSelected = Object.keys(selectedCurrency).length > 0;

  //SEND SOL
  const sendSol = useCallback(
    async (count) => {
      if (!publicKey) throw new WalletNotConnectedError();
      const toastId = toast.loading("Processing transaction...");
      console.log(count);
      const address = publicKey.toBase58();
      console.log(address);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(toPubkey),
          lamports: count * LAMPORTS_PER_SOL,
        })
      );

      const blockHash = await connection.getLatestBlockhash();
      transaction.feePayer = await publicKey;
      transaction.recentBlockhash = await blockHash.blockhash;
      const signed = await signTransaction(transaction);
      const txId = await connection.sendRawTransaction(signed.serialize());
      // const status = (await connection.TransactionConfirmationConfig(txId))
      //   .value;
      // console.log(status);
      console.log(blockHash.blockhash, signed);
      toast(
        "Validating transaction...",
        {
          duration: 30000,
        }
      );
      const timeoutId = setInterval(async () => {
        const data = await connection.getTransaction(txId);
        console.log(data);
        if (data !== null) {
          toast.success("Transaction sent", {
            id: toastId,
          });
          axios
            .post(BASEURL + "/entry", {
              address: address,
              value: ticketCount,
              id,
              transactionId: txId,
              type: "sol",
              amount: count * LAMPORTS_PER_SOL,
              toPubkey: toPubkey,
              token: null,
              fromPubkey: address,
            })
            .then((res) => {
              successToast("Bought Successfully");
            })
            .catch((e) => {
              console.log(e);
              errorToast(e.response.data.message);
            });
          clearInterval(timeoutId);
        }
      }, 30000);
      console.log(txId);
    },
    [publicKey, connection, signTransaction]
  );
  //SEND SPL TOKEN
  const onSendSPLTransaction = useCallback(
    async (count, tokenAddress) => {
      if (!isSelected) {
        toast.error("Please select Currency");
        return;
      }
      if (!toPubkey) return;

      const toastId = toast.loading("Processing transaction...");

      try {
        if (!publicKey || !signTransaction) throw new WalletNotConnectedError();
        const address = publicKey.toBase58();
        const toPublicKey = new PublicKey(toPubkey);
        const mint = new PublicKey(tokenAddress);
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          publicKey,
          mint,
          publicKey,
          signTransaction
        );
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          publicKey,
          mint,
          toPublicKey,
          signTransaction
        );
        const transaction = new Transaction().add(
          createTransferInstruction(
            fromTokenAccount.address, // source
            toTokenAccount.address, // dest
            publicKey,
            count * LAMPORTS_PER_SOL,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const blockHash = await connection.getRecentBlockhash();
        transaction.feePayer = await publicKey;
        transaction.recentBlockhash = await blockHash.blockhash;
        const signed = await signTransaction(transaction);
        const txId = await connection.sendRawTransaction(signed.serialize());
        toast.success("Transaction sent", {
          id: toastId,
        });
        console.log(txId);
        axios
          .post(BASEURL + "/entry", {
            address: address,
            value: ticketCount,
            id,
            transactionId: txId,
            type: "spl-token",
            amount: count * LAMPORTS_PER_SOL,
            toPubkey: toPubkey,
            token: tokenAddress,
            fromPubkey: address,
          })
          .then((res) => {
            successToast("Bought Successfully");
          })
          .catch((e) => {
            console.log(e);
            errorToast(e.response.data.message);
          });
      } catch (error) {
        toast.error(`Transaction failed: ${error.message}`, {
          id: toastId,
        });
      }
    },
    [isSelected, publicKey, signTransaction, connection, ticketCount, id]
  );

  const buyNowHandler = () => {
    const wallet = localStorage.getItem("wallet");
    if (!isSelected) {
      toast.error("Please select Currency");
      return;
    }
    if (!connected) {
      toast.error("Please Connect Your Wallet");
      return;
    }

    //
    // sendSol(ticketCount * 0.1);
    // onSendSPLTransaction(1, "5HkxgJ2JPtTTGJZ4r2HAETpNtkotWirte7CXQ32qyELS");
    if (selectedCurrency.token !== "null") {
      onSendSPLTransaction(
        ticketCount * selectedCurrency.price,
        selectedCurrency.token
      );
    } else {
      sendSol(ticketCount * selectedCurrency.price);
      // sendSol(ticketCount * 0.01);
    }
  };

  // const imgae =getImage =

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        nftDetails && (
          <div className="my-10 bg-dark-700 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 justify-between max-w-4xl mx-auto">
              <div>
                <img
                  className="md:max-w-sm m-auto  rounded-lg"
                  // src={BASEURL + "/images/" + nftDetails.imageUrl}
                  src={nftDetails.imageUrl}
                  alt={nftDetails.title}
                />
                <p className="text-white font-semibold text-center mt-3 text-lg">
                  {nftDetails.title}
                </p>
              </div>
              <div className="text-center w-[100%]  text-white">
                <div className="w-[80%] m-auto">
                  <div
                    className="bg-dark-500 shadow-white mt-6 mb-10 border-2 max-w-[380px] m-auto
          border-white shadow-lg rounded-lg p-3 shadow-white"
                  >
                    <p>Pot Value</p>
                    <p className="font-semibold">
                      {nftDetails.portValue} Prize (s)
                    </p>
                  </div>
                  <HeroTimer
                    startingTime={nftDetails.startTime}
                    endingTime={nftDetails.endTime}
                  />
                  <div className="flex my-4 justify-between items-center">
                    {isSelected ? (
                      <div>
                        <div className="text-gray-400 flex justify-start">
                          <span>Selected Currency : </span>{" "}
                          <span className="font-semibold uppercase text-white block ml-1">
                            <span>{selectedCurrency?.currency}</span>
                          </span>
                        </div>
                        <div className="text-gray-400 flex justify-start">
                          <span>Price : </span>{" "}
                          <span className="font-semibold uppercase text-white block ml-1">
                            <span>{selectedCurrency?.price}</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span>Please select a currency</span>
                    )}
                    <p className="text-gray-400">
                      Ticket sold:{" "}
                      <span className="font-semibold text-white">
                        {" "}
                        {nftDetails.ticketSolds}
                      </span>
                    </p>
                  </div>
                  <p className="text-gray-400">
                    You own: &nbsp;
                    <span className="font-semibold text-white">
                      {purchasedTickets} Tickets
                    </span>
                  </p>
                  <div
                    className="flex-col w-[100%] 
            md:flex-row flex justify-between my-2 mt-3 items-center"
                  >
                    <div className="my-3">
                      <p className="text-gray-400"> Currency</p>
                      <div className="flex justify-center">
                        {nftDetails?.ticketPrice.map((val, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedCurrency(val)}
                            className={`border-2 ${
                              selectedCurrency.currency === val.currency
                                ? "border-gray-100"
                                : "border-gray-400"
                            } uppercase rounded-lg m-1 p-1`}
                          >
                            {val.currency}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400">Choose Amount</p>
                      <div className="flex justify-center">
                        <p
                          className="font-bold text-3xl mx-1 cursor-pointer"
                          onClick={() =>
                            setTicketCount((p) => {
                              if (p > 1) return p - 1;
                              return p;
                            })
                          }
                        >
                          -
                        </p>
                        <p className="w-[50px] font-bold text-4xl mx-1">
                          {ticketCount}
                        </p>
                        <p
                          className="font-bold text-3xl mx-1 cursor-pointer"
                          onClick={() => setTicketCount((p) => p + 1)}
                        >
                          +
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {hasStarted && !hasEnded && <div className="text-center"></div>}
                <button
                  className="bg-gray-800 p-3 px-6 rounded-md"
                  onClick={buyNowHandler}
                >
                  Buy now
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Details;
