import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Select, makeStyles, Button } from "@material-ui/core";
import { BASEURL, errorToast, successToast } from "../../utils/Utils";
import Spinner from "../../components/Spinner";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
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
import { ShoppingCart } from "@material-ui/icons";

//OWNER ADDRESS

const toPubkey = "BVmdx6PdToCmGcSPUaFCXzrzbrSzRrecbAXS7xgREdDq";

const useStyles = makeStyles({
  select: {
    width: '100%',
    marginBottom: "16px",
    fontSize: '20px',
    "& option": {
      padding: '4px',
      color: 'black',
    },
    "& option[disabled]": {
      backgroundColor: 'rgba(229, 231, 235)'
    }
  },
  button: {
    width: "100%",
		backgroundColor: 'black',
    color: 'white',
		"&:hover":{
      border: '1px solid black',
			backgroundColor: 'white',
			color: 'black'
		},
		"&:disabled":{
      color: 'gray'
		}
	},
});

const Details = ({ cartNum, setCartNum }) => {
  const defaultSize = {
    size: '', merchPrice:[{currency: 'Sol', price: 0, token: 0}], amount: 0
  }
  const defaultColor = {
    color: '', sizes: [defaultSize], imageUrl: ''
  };
  const classes = useStyles();
  const { connection } = useConnection();
  const instance = useWallet();
  const { connected, publicKey, signTransaction } = instance;
  const [merchDetails, setMerchDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [merchCount, setMerchCount] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState({});
  const [colorIndex, setColorIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [tokenList, setTokenList] = useState([]);
  const [selectedToken, setSelectedToken] = useState(0);
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [showImageUrl, setShowImageUrl] = useState("");
  const [userId, setUserId] = useState();
  const { id } = useParams();

  const fetchMerchDetail = (id) => {
    setIsLoading(true);
    console.log("fun ran");

    axios
      .get(`${BASEURL}/merch/${id}`)
      .then((response) => {
        setMerchDetails(response.data.data);
        setIsLoading(false);
        // console.log(response);
        // setSelectedCurrency(response.data.data);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
        // errorToast(e.response.data.message);
      });
  };

  const getUserInfo = (key) => {
    const url = BASEURL + `/user/get/${key}`;
    axios.get(url).then((res) => {
      if (res.data.message === "Success") {
        const newUserId = res.data.data._id;
        setUserId(newUserId);
      }
    });
  }
  
  const getTokenList = () => {
    const url = BASEURL + "/currency/all";
    axios.get(url)
      .then(res => {

        if (res.data.message === "Success") {
          setTokenList(res.data.data);
        }
      }).catch(error => {
        errorToast("Server is not connected");
      });
  }

  useEffect(() => {
    if (id) {
      fetchMerchDetail(id);
      publicKey && getUserInfo(publicKey);
      getTokenList();
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
          console.log("trade")
          axios
            .post(BASEURL + "/trade", {
              address: address,
              value: merchCount,
              id,
              transactionId: txId,
              colorId: selectedColor._id,
              sizeId: selectedSize._id,
              type: "sol",
              amount: count * LAMPORTS_PER_SOL,
              toPubkey: toPubkey,
              token: null,
              fromPubkey: address,
              userId,
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
          .post(BASEURL + "/trade", {
            address: address,
            value: merchCount,
            id,
            transactionId: txId,
            type: "spl-token",
            amount: count * LAMPORTS_PER_SOL,
            toPubkey: toPubkey,
            token: tokenAddress,
            userId,
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
    [isSelected, publicKey, signTransaction, connection, merchCount, id, userId]
  );

  const buyNowHandler = () => {
    if (!isSelected) {
      toast.error("Please select Currency");
      return;
    }
    if (!connected) {
      toast.error("Please Connect Your Wallet");
      return;
    }

    //
    // sendSol(merchCount * 0.1);
    // onSendSPLTransaction(1, "5HkxgJ2JPtTTGJZ4r2HAETpNtkotWirte7CXQ32qyELS");
    // if (selectedCurrency.token !== "null") {
    //   onSendSPLTransaction(
    //     merchCount * selectedCurrency.price,
    //     selectedCurrency.token
    //   );
    // } else {
      console.log(selectedCurrency.price)
      sendSol(merchCount * selectedCurrency.price);
      // sendSol(merchCount * 0.01);
    // }
  };

  const handleColor = (i) => {
    setColorIndex(i)
  }

  const handleCart = async () => {
    if (!connected) {
      toast.error("Please Connect Your Wallet");
      return;
    }
    try {
      const url = BASEURL + "/cart/add";
      const data = {
        userId,
        merchId: merchDetails._id,
        colorId: selectedColor._id,
        sizeId: selectedSize._id,
        amount: merchCount,
        tokenIndex: selectedToken
      }

      const res = await axios.post(url, data);
      if (res.data.message === "Success") {
        successToast("Added to Cart");
      } else {
        errorToast("Failed to add to cart");
      }
    } catch (error) {
      console.log(error)
      errorToast("Network is not connected");
    }
  }
  
  useEffect(() => {
    if (merchDetails) {
      setSelectedColor(merchDetails.colors[colorIndex]);
      const currencyArr = merchDetails.colors[colorIndex].sizes[sizeIndex].merchPrice;
      setShowImageUrl(merchDetails.colors[colorIndex].imageUrl[0]);
      let checkToken = false;
      currencyArr.forEach((token, index) => {
        if (!checkToken && token.price) {
          setSelectedToken(index);
          checkToken = true;
        }
      });
    }
  }, [colorIndex, merchDetails]);

  useEffect(() => {
    if (selectedColor) {
      setSelectedSize(selectedColor.sizes[sizeIndex]);
      setSelectedCurrency(selectedColor.sizes[sizeIndex].merchPrice[0]);
    }
  }, [sizeIndex, selectedColor])

  // const imgae =getImage =

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        merchDetails && (
          <div className="my-10 bg-gray-200 p-4 flex">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row">
              <div className="flex flex-col w-20 mr-2 overflow-auto">
                {
                  merchDetails.colors[colorIndex].imageUrl.map((url, index) =>
                    <img 
                      key={index} 
                      className="mb-2 cursor-pointer hover:border-black border-2 border-solid border-white" 
                      src={url} 
                      onClick={() => setShowImageUrl(url)}
                      alt="img" />
                  )
                }
              </div>
              <div className="flex justify-between flex-col md:flex-row ">
                <div>
                  <img
                    className="md:max-w-sm m-auto"
                    // src={BASEURL + "/images/" + merchDetails.imageUrl}
                    src={showImageUrl}
                    alt={merchDetails.title}
                  />
                </div>
                <div className="w-[100%] px-4">
                  <div className="w-[80%] m-auto">
                    <div className="mt-6 mb-4 m-auto">
                      <h3 className="">
                        {merchDetails.brand}
                      </h3>
                      <h1 className="mb-4">
                        {merchDetails.title}
                      </h1>
                      <div style={{display: "inline-flex", }}>
                        <h4 className="mb-4">
                          {selectedColor.sizes[0].merchPrice[0].price} {selectedColor.sizes[0].merchPrice[0].currency}
                        </h4>
                        <p className="mt-3 text-xs">&nbsp;&nbsp;VAT included.</p>
                      </div>
                      <p dangerouslySetInnerHTML={{__html: merchDetails.description.replaceAll("\n", "<br />")}}></p>
                    </div>
                    <div className="flex mb-4">
                      {
                        merchDetails.colors.map((item, index) => 
                          <div 
                            key={index} 
                            className={`w-20 mr-2 flex items-center justify-center cursor-pointer border-2  p-1 ${colorIndex === index ? 'border-black' : 'border-white'}`}
                            onClick={() => handleColor(index)}
                            >
                            <img className="w-full" src={item.imageUrl[0]} alt={item.color} />
                          </div>
                        )
                      }
                    </div>
                    <div className="flex flex-wrap mb-4">
                      {
                        selectedColor.sizes[sizeIndex].merchPrice[0].price !== 0 &&
                          <div 
                            className={`px-2 py-1 rounded-lg border-2 border-black mr-2 cursor-pointer ${ selectedToken === 0 ? "bg-white" : "" }`}
                            onClick={() => setSelectedToken(0)}
                            >
                            Solana
                          </div>
                      }
                      {
                        tokenList.map((item, index) => {
                          const price = selectedColor.sizes[sizeIndex].merchPrice[index + 1].price;
                          if (price !== 0) {
                            return (
                              <div 
                                key={index} 
                                className={`px-2 py-1 rounded-lg border-2 border-black mr-2 cursor-pointer ${ selectedToken === index + 1 ? "bg-white" : "" }`}
                                onClick={() => setSelectedToken(index + 1)}
                              >
                                {item.name}
                              </div>
                            );
                          }
                        })
                      }
                    </div>
                    <div className="mb-8">
                      <Select
                      style={{borderRadius: "0", }}
                        className="w-full mb-4 border-2 border-black text-lg font-bold"
                        native
                        variant="outlined"
                        value={sizeIndex}
                        onChange={(e) => setSizeIndex(e.target.value)}
                        placeholder="Select Size"
                      >
                        {
                          selectedColor.sizes.map((item, index) =>
                            <option key={index} className="color-black" value={index} disabled={item.amount === 0}>
                              {item.size}&nbsp;{item.merchPrice[selectedToken].price}&nbsp;{item.merchPrice[selectedToken].currency}
                            </option>
                          )
                        }
                      </Select>
                      <Button className={classes.button} variant="outlined" onClick={handleCart}>
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                  {/*<div className="flex justify-around">
                    <button
                      className="w-full bg-gray-100 p-3 px-6 shadow-lg"
                      onClick={buyNowHandler}
                      disabled={selectedSize && !selectedSize.amount}
                    >
                      Buy now
                    </button>
                  </div>*/}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Details;
