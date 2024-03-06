import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTimer } from "react-timer-hook";
import { BASEURL } from "../utils/Utils";

const Hero = ({ featuredNFT }) => {
  const navigate = useNavigate();
  const current = new Date();
  const endTime = new Date(featuredNFT?.endTime);
  const startTime = new Date(featuredNFT?.startTime);
  var startUTC = startTime.getTimezoneOffset();
  var endUTC = endTime.getTimezoneOffset();

  startTime.setMinutes(startTime.getMinutes() + startUTC);
  endTime.setMinutes(endTime.getMinutes() + endUTC);

  var secondBetweenTwoDate;
  var hasStarted = false;
  if (startTime.getTime() < current.getTime()) hasStarted = true;
  if (startTime.getTime() > current.getTime()) {
    secondBetweenTwoDate = Math.abs(
      (startTime.getTime() - current.getTime()) / 1000
    );
  } else {
    secondBetweenTwoDate = Math.abs(
      (endTime.getTime() - current.getTime()) / 1000
    );
  }
  current.setSeconds(current.getSeconds() + secondBetweenTwoDate);
  var { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp: current,
    onExpire: () => console.warn("onExpire called"),
  });

  return (
    <div className="my-10 mx-6">
      <div className="grid grid-cols-1 md:grid-cols-2 justify-between max-w-4xl mx-auto">
        <img
          className="md:max-w-sm m-auto rounded-lg"
          // src={BASEURL + "/images/" + featuredNFT?.imageUrl}
          src={featuredNFT?.imageUrl}
          alt={featuredNFT?.title}
        />

        <div className="text-center  text-white">
          <div
            className="bg-dark-500  mt-6 mb-10 border-2 
            w-full shadow-lg rounded-lg p-3 shadow-white"
          >
            <p>Pot Value</p>
            <p className="font-semibold">{featuredNFT?.portValue} Prize (s)</p>
          </div>
          <p> {hasStarted ? "Ending in" : "Starting in"}</p>
          <div className="flex my-2 md:w-96  m-auto  justify-around ">
            {days != 0 && (
              <div>
                <p className="font-bold text-3xl">{days}</p>
                <p>Days</p>
              </div>
            )}
            <div>
              <p className="font-bold text-3xl">{hours}</p>
              <p>Hours</p>
            </div>
            <div>
              <p className="font-bold text-3xl">{minutes}</p>
              <p>Minutes</p>
            </div>
            <div>
              <p className="font-bold text-3xl">{seconds}</p>
              <p>Seconds</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/raffle/${featuredNFT._id}`)}
            className="rounded-lg border-2 my-2 border-gray-200 w-[160px] p-2"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
