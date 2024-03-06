import { useState, useEffect } from "react";
import {
  WalletMultiButton as MaterialUIWalletMultiButton,
} from "@solana/wallet-adapter-material-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
const Header = ({ isRaffle }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  // console.log(connection.get);
  useEffect(() => {
    const getBalance = async () => {
      if (!publicKey) return;

      const _balance = await connection.getBalance(publicKey);
      console.log(_balance);
      setBalance(_balance / LAMPORTS_PER_SOL);
    };
    getBalance();
  }, [connection, publicKey]);
  return (
    <div className="mt-10 mb-4 px-4">
      <div className="flex items-center flex-wrap justify-between">
        <div className="bg-gray-800  p-3 rounded-md">
          <p className="text-white">
            Balance:
            <span className="font-semibold"> {balance.toFixed(2)}</span>
            <span className="font-bold"> SOL</span>
          </p>
        </div>
        {
          isRaffle &&
            <div>
              <p className="text-5xl text-white font-semibold my-4 md:my-1 ">Lucky Div</p>
            </div>
        }
        <div>
          <div
            style={{ display: "flex", flexDirection: "row-reverse" }}
            // onClick={() => setConnected((prev) => !prev)}
          >
            <MaterialUIWalletMultiButton
              variant="text"
              style={{
                backgroundColor: "#1F2937",
                color: "#FFFFFF",
                padding: "8px 10px",
              }}
            />
          </div>
          {/* <button className="rounded-md bg-blue-800  p-3">Select Wallet</button> */}
        </div>
      </div>
    </div>
  );
};

export default Header;
