import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { makeStyles, Button, Select } from '@material-ui/core';
import { toast } from "react-hot-toast";
import {
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
  } from "@solana/web3.js";
import { BASEURL, errorToast, successToast } from '../../utils/Utils';
import { getOrCreateAssociatedTokenAccount } from "../../components/tokenTransferUtils/getOrCreateAssociatedTokenAccount.ts";
import { createTransferInstruction } from "../../components/tokenTransferUtils/createTransferInstructions.ts";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Spinner from '../../components/Spinner';

const useStyles = makeStyles((theme) => ({
    button: {
        "&.MuiButton-outlined": {
          border: '1px solid black',
          color: 'black'
        },
        "&:hover":{
          backgroundColor: 'black',
          color: 'white'
        },
        "&:disabled":{
            color: 'gray'
        }
    }
}));

const Cart = ({ cartNum, setCartNum}) => {
    const { publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const classes = useStyles();
    const [cartList, setCartList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [priceList, setPriceList] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const currency = "SOL";

    const userId = localStorage.getItem('userId');
    const toPubkey = "BVmdx6PdToCmGcSPUaFCXzrzbrSzRrecbAXS7xgREdDq";

    const initCartList = async() => {
        setIsLoading(true);
        try {
            const url = BASEURL + '/cart/' + userId;
            
            const res = await axios.get(url);
            if (res.data.message === "Success") {
                const newCartList = res.data.data;
                const data = newCartList.map((item, index) => {
                    let total = [];
                    for (let i = 0; i < item.totalAmount; i++) {
                        total.push("")
                    }
                    return {...item, total, price: item.price[item.tokenIndex]}
                })

                setCartNum(data.length);
                const newPriceList = [];
                data.forEach(item => {
                    const currencyArr = newPriceList.map(subItem => subItem.currency);
                    console.log(currencyArr)
                    if (currencyArr.indexOf(item.price.currency) > -1) {
                        const index = currencyArr.indexOf(item.price.currency);
                        newPriceList[index].price += item.price.price * item.amount;
                    } else {
                        newPriceList.push({currency: item.price.currency, price: item.price.price * item.amount, tokenAddress: item.price.token});
                    }
                })
                setPriceList(newPriceList);
                setCartList(data);
            } else {
                errorToast("Request is failed")
            }
        } catch (error) {
            console.log(error);
            errorToast("Network is unconnected")
        }
        setIsLoading(false);
    }

    const handleRemove = async (sizeId) => {
        try {
            const url = BASEURL + "/cart/remove?sizeId=" + sizeId + "&userId=" + userId;
            const res = await axios.delete(url);
            if (res.data.message === "Success") {
                successToast("Request is success");
                await initCartList();
            } else {
                errorToast("Request is failed.")
            } 
        } catch (error) {
            errorToast("Network is not connected.")
        }
    }

    const amountChange = async (e, _id) => {
        try {
            const url = BASEURL + "/cart/increase";
            const res = await axios.post(url, {_id, amount: e.target.value});
            if (res.data.message === "Success") {
                successToast("Request is success");
                await initCartList();
            } else {
                errorToast("Request is failed.")
            } 
        } catch (error) {
            errorToast("Network is not connected.")
        }
    }

    const handleBuyAll = () => {
        priceList.map(token => {
            if (token.currency === 'Sol') {
                onSendSolTransaction(token.price);
            } else {
                onSendSPLTransaction(token.price, token.tokenAddress);
            }
        })
    }

    const onSendSolTransaction = useCallback(
        async (solTotalPrice) => {
            if (!publicKey) throw new WalletNotConnectedError();
            const toastId = toast.loading("Processing transaction...");
            const address = publicKey.toBase58();
            console.log(address);
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(toPubkey),
                lamports: solTotalPrice * LAMPORTS_PER_SOL,
                })
            );
        
            const blockHash = await connection.getLatestBlockhash();
            transaction.feePayer = publicKey;
            transaction.recentBlockhash = blockHash.blockhash;
            const signed = await signTransaction(transaction);
            const txId = await connection.sendRawTransaction(signed.serialize());
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
                    console.log("trade")
                    axios.post(BASEURL + "/cart/buy", { 
                        type: 'Sol',
                        userId, 
                        address,
                        transactionId: txId,
                        tokenIndex: 0,
                    })
                    .then(async (res) => {
                        await initCartList();
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

    const onSendSPLTransaction = useCallback(
        async (tokenPrice, tokenAddress) => {
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
                tokenPrice * LAMPORTS_PER_SOL,
                [],
                TOKEN_PROGRAM_ID
              )
            );
    
            const blockHash = await connection.getRecentBlockhash();
            transaction.feePayer = publicKey;
            transaction.recentBlockhash = blockHash.blockhash;
            const signed = await signTransaction(transaction);
            const txId = await connection.sendRawTransaction(signed.serialize());
            toast.success("Transaction sent", {
              id: toastId,
            });
            console.log(txId);
            const tokenArray = priceList.map(token => token.tokenAddress);
            axios
              .post(BASEURL + "/cart/buy", {
                address: address,
                transactionId: txId,
                type: "spl-token",
                userId,
                tokenIndex: tokenArray.indexOf(tokenAddress) + 1
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
        [ publicKey, signTransaction, connection, userId]
    );

    useEffect(async() => {
        if (publicKey) {
            await initCartList()
        }
    }, [publicKey]);

    useEffect(() => {
        if (cartList.length > 0) {
            let newTotalPrice = 0;
            cartList.forEach(item => {
                newTotalPrice += item.price * item.amount;
            });
            setTotalPrice(newTotalPrice);
        }
    }, [cartList]);

    return (
        <div className='flex flex-col'>
            <p className="text-3xl font-bold marion-font">Cart List</p>
            {
                publicKey
                    ? isLoading 
                        ? <Spinner />
                        : <div className='flex flex-col md:flex-row'>
                            <div className='flex flex-1 flex-col'>
                                {
                                    !cartList.length
                                        ?
                                        <div> 
                                            <h1 className='text-lg font-bold text-center mb-10'>Your Cart is empty.</h1>
                                        </div>
                                        : cartList.map((item, index) => 
                                            <div key={index} className='w-full flex p-2 m-2'>
                                                <div className="w-32 mr-4">
                                                    <img
                                                        className="w-full"
                                                        src={item.imageUrl[0]}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className='flex-1 flex flex-col justify-between'>
                                                    <div style={{display: "block ruby", }} className='flex justify-between'>
                                                        <div style={{display: "block", }}>
                                                            <div className='text-xl font-bold'>{item.brand}</div>
                                                            <div className='text-lg font-bold mb-4'>{item.title}</div>
                                                            <div className='text-md'>Size: {item.size}</div>
                                                            <div className='text-md'>Price: {item.price.price} {item.price.currency}</div>
                                                        </div>
                                                        <div  className='text-md mb-4 float-right'>
                                                            <Select native value={item.amount} onChange={(e) => amountChange(e, item._id)}>
                                                                {
                                                                    item.total.map((_, index) => 
                                                                        <option key={index} value={index + 1}>{index + 1}</option>
                                                                    )
                                                                }
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className='w-3/12 ml-8 flex flex-col float-left '>
                                                        <Button onClick={() => handleRemove(item.sizeId)} className='text-xs' variant="outlined">
                                                            Remove
                                                        </Button>
                                                    </div>

                                                </div>
                                            </div>
                                        )
                                }
                            </div> 
                            {
                                cartList.length > 0 &&
                                    <div className='w-full md:w-3/12 md:ml-8 px-4 flex flex-col mb-8'>
                                        <h2 className='mb-4'>Total</h2>
                                        <div className='mb-8'>
                                            SubTotal: 
                                            <div className='float-right'>
                                                {
                                                    priceList.map((item, index) => 
                                                        <div key={index} className=''>{item.price} {item.currency}</div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className='mb-8'>
                                            Delivery: 
                                            <span className='float-right'>1 {currency}</span>
                                        </div>
                                        <div className='mb-8 font-bold'>
                                            Total (incl. VAT.)
                                            <span className='float-right'>
                                            {
                                                priceList.map((item, index) => 
                                                    <div key={index} className=''>{item.currency === "Sol" ? item.price + 1 : item.price} {item.currency}</div>
                                                )
                                            }
                                            </span>
                                        </div>
                                        <Button onClick={handleBuyAll} className={classes.button} variant="outlined">Buy All</Button>
                                    </div>
                            }
                        </div>
                    : <p className='text-center text-bold my-8 text-xl'>Please connect wallet</p>
            }
        </div>
    );
}

export default Cart;