import React, { useState } from "react";

const DetailsHero = () => {
  const [ticketCount, setTicketCount] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("puff");

  return (
    <div className="my-10 bg-[#1E192B] rounded-lg p-4">
      <div className="flex-col md:flex-row flex w-[100%] justify-between  m-auto">
        <img
          className="md:max-w-[500px] m-auto rounded-lg"
          src="https://cdn.vox-cdn.com/thumbor/2xj1ySLIz1EZ49NvSsPzq8Itjyg=/1400x1050/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/23084330/bored_ape_nft_accidental_.jpg"
          alt=""
        />
        <div className="text-center w-[100%]  text-white">
          <div className="w-[80%] m-auto">
            <div
              className="bg-[#0B0713] mt-6 mb-10 border-2 max-w-[380px] m-auto
          border-white shadow-lg rounded-lg p-3 shadow-white"
            >
              <p>Pot Value</p>
              <p className="font-semibold">1 Prize (s)</p>
            </div>
            <p className="text-gray-400">Ending in</p>
            <div className="flex my-2 md:w-[400px]  m-auto  justify-around ">
              <div className="">
                <p className="font-bold text-3xl">09</p>
                <p>Hours</p>
              </div>
              <div>
                <p className="font-bold text-3xl">24</p>
                <p>Minutes</p>
              </div>
              <div>
                <p className="font-bold text-3xl">49</p>
                <p>Seconds</p>
              </div>
            </div>
            <div className="flex my-4 justify-between items-center">
              <p className="text-gray-400">
                Ticket Price:{" "}
                <span className="font-semibold text-white"> 0.10SOL</span>{" "}
              </p>
              <p className="text-gray-400">
                Ticket sold:{" "}
                <span className="font-semibold text-white"> 458</span>
              </p>
            </div>
            <div
              className="flex-col w-[100%] 
            md:flex-row flex justify-between my-2 mt-3 items-center"
            >
              <div className="my-3">
                <p className="text-gray-400">Choose Currency</p>
                <div className="flex justify-center">
                  <button
                    onClick={() => setSelectedCurrency("puff")}
                    className={`border-2 ${
                      selectedCurrency === "puff"
                        ? "border-gray-100"
                        : "border-gray-400"
                    } uppercase rounded-lg m-1 p-1`}
                  >
                    $PUFF
                  </button>
                  <button
                    onClick={() => setSelectedCurrency("all")}
                    className={`border-2 ${
                      selectedCurrency === "all"
                        ? "border-gray-100"
                        : "border-gray-400"
                    } uppercase rounded-lg m-1 p-1`}
                  >
                    $ALL
                  </button>
                  <button
                    onClick={() => setSelectedCurrency("sol")}
                    className={`border-2 ${
                      selectedCurrency === "sol"
                        ? "border-gray-100"
                        : "border-gray-400"
                    } uppercase rounded-lg m-1 p-1`}
                  >
                    $SOL
                  </button>
                </div>
              </div>
              <div>
                <p className="text-gray-400">Choose Amount</p>
                <div className="flex justify-center">
                  <p
                    className="font-bold text-3xl mx-1 cursor-pointer"
                    onClick={() =>
                      setTicketCount((p) => {
                        if (p != 0) return p - 1;
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
        </div>
      </div>
    </div>
  );
};

export default DetailsHero;
