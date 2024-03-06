import { useEffect, useState } from "react";
import Card from "../../components/Card";
import axios from "axios";
import { BASEURL, errorToast } from "../../utils/Utils";
import Spinner from "../../components/Spinner";

const Home = () => {
  const [merches, setMerches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    loadMerches();
  }, []);

  const loadMerches = () => {
    setIsLoading(true);
    axios
      .get(BASEURL + "/merch/all")
      .then((response) => {
        setMerches(response.data.data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setMerches(false);
        errorToast(e.response.data.message);
      });
  };

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="py-10" />
          <p className="text-3xl font-bold mx-4 marion-font">All Merches</p>
          <div className="flex justify-center mt-6 flex-wrap ">
            {merches && merches.length === 0 ? (
              <p className="my-10 text-xl font-semibold text-center">
                No Merch(s) Found
              </p>
            ) : (
              merches.map((d, index) => <Card key={index} data={d} />)
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
