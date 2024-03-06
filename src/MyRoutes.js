import { useEffect, useState } from "react";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import OrderList from "./components/OrderList";
import Setting from "./components/Setting";
import FAQ from "./components/FAQ";
import Details from "./screens/Merch/Details";
import Home from "./screens/Merch/Home";
import Cart from "./screens/Merch/Cart";
import Admin from "./screens/Merch/Admin";
import AddMerch from "./screens/Merch/AddMerch";
import RaffleHome from "./screens/Raffle/Home";
import RaffleDetail from "./screens/Raffle/Detail";
import AddRaffle from "./screens/Raffle/AddRaffle";
import Hello from "./screens/Hello";
import { BASEURL, errorToast } from "./utils/Utils";

const MyRoutes = () => {
  const instance = useWallet();
  const [cartNum, setCartNum] = useState(0);
  const [isRaffle, setIsRaffle] = useState(false);
  const [isHello, setIsHello] = useState(false);
  const { publicKey } = instance;

  useEffect(() => {
    const prevUrl = window.location.href;
    console.log(window.location.pathname)
    if (window.location.pathname === "/" || window.location.pathname === "") {
      setIsHello(true);
    } else {
      setIsHello(false);
    }
    const prevUrlArr = prevUrl.split('/');
    const prevPage = prevUrlArr[prevUrlArr.length - 1];
    const index = prevUrl.indexOf("raffle");
    if (index > -1) {
      setIsRaffle(true);
    } else {
      setIsRaffle(false);
      if (publicKey) {
        const url = BASEURL + `/user/get/${publicKey}`;
        axios.get(url).then((res) => {
          console.log(res)
          if (res.data.message !== "Success") {
            if (prevPage !== "setting") {
              errorToast("Please enter your Address before purchasing a Item");
              window.location.href = "/setting"
            }
          } else {
            localStorage.setItem('userId', res.data.data._id);
            const cartUrl = BASEURL + `/cart/getCartNum`;
            axios.post(cartUrl, {userId: res.data.data._id}).then(response => {
              if (response.data.message === "Success") {
                setCartNum(response.data.data);
              }
            })
          }
        });
      } else {
        setCartNum(0);
      }
    }
  }, [publicKey]);

  return (
    <div className={`min-h-screen`} style={isRaffle ? {backgroundColor: "#130d20"} : {backgroundColor: "white"}}>
      <Router>
        {
          !isHello && <Navbar cartNum={cartNum} isRaffle={isRaffle} />
        }
        <div className={!isHello ? "max-w-6xl m-auto" : ""}>
          {
            !isHello && <Header isRaffle={isRaffle} />
          }
          <Routes>
            <Route path="/" element={<Hello />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/add-new" element={<AddMerch />} />
            <Route path="/merch" element={<Home />} />
            <Route path="/:id" element={<Details cartNum={cartNum} setCartNum={setCartNum} />} />
            <Route path="/order-list" element={<OrderList />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/cart" element={<Cart setCartNum={setCartNum} />} />
            <Route path="/raffle" element={<RaffleHome />}/>
            <Route path="/raffle/:id" element={<RaffleDetail />}/>
            <Route path="/raffle/add-new" element={<AddRaffle />} />
          </Routes>
          {
            isRaffle && !isHello &&
              <div className="text-white mt-10">
                <hr className="my-10" />
                <FAQ />
              </div>
          }
        </div>
        {
          !isHello && <Footer isRaffle={isRaffle} />
        }
      </Router>
    </div>
  );
};

export default MyRoutes;
