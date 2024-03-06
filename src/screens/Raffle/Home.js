import { useEffect, useState } from "react";
import axios from "axios";
import { Delete } from "@material-ui/icons";
import RaffleCard from "../../components/RaffleCard";
import Hero from "../../components/Hero";
import { BASEURL, errorToast, successToast } from "../../utils/Utils";
import Spinner from "../../components/Spinner";

const Home = () => {
  const params = new URLSearchParams(window.location.search);
	const adminKey = params.get('key');
	const role = params.get('role');
  const [nftsArray, setNftsArray] = useState([]);
  const [featuredNFT, setFeaturedNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    loadNFTs();
    loadFeaturedNFT();
  }, []);

  const loadNFTs = () => {
    setIsLoading(true);
    axios
      .get(BASEURL + "/nft/all")
      .then((response) => {
        setNftsArray(response.data.data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
        errorToast(e.response.data.message);
      });
  };

  const loadFeaturedNFT = () => {
    setIsLoading(true);
    axios
      .get(BASEURL + "/nft/featured")
      .then((response) => {
        setFeaturedNFT(response.data.data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
        errorToast(e.response.data.message);
      });
  };

  const removeRaffle = async (id) => {
    try {
      const url = BASEURL + "/nft/" + id;
      const res = await axios.post(url, {key: adminKey});
      if (res.data.message === "Success") {
        successToast("Request is success");
        loadNFTs();
      } else {
        errorToast(res.data.message);
      }
    } catch (error) {
      errorToast("Server is not connected");
    }
  }

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {featuredNFT ? (
            <Hero featuredNFT={featuredNFT} />
          ) : (
            <div className="py-10" />
          )}
          <p className="text-3xl font-bold text-white mx-4">All Lucky Dips</p>
          <div className="flex justify-center mt-6 flex-wrap ">
            {nftsArray && nftsArray.length == 0 ? (
              <p className="my-10 text-xl font-semibold text-white text-center">
                No NFT(s) Found
              </p>
            ) : (
              nftsArray.map((d, index) => 
                <div key={index} className="relative">
                  {
                    role === "admin" &&
                      <button className="absolute text-white" onClick={() => removeRaffle(d._id)}><Delete  /></button>
                  }
                  <RaffleCard data={d} />
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
