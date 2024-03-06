import React, { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";

const HeroTimer = ({ endingTime, startingTime }) => {
  const current = new Date();
  const endTime = new Date(endingTime);
  var hasStarted = false;
  var hasEnded = false;

  const startTime = new Date(startingTime);
  var secondBetweenTwoDate;

  var startUTC = startTime.getTimezoneOffset();
  var endUTC = endTime.getTimezoneOffset();

  startTime.setMinutes(startTime.getMinutes() + startUTC);
  endTime.setMinutes(endTime.getMinutes() + endUTC);

  if (startTime.getTime() < current.getTime()) hasStarted = true;
  if (endTime.getTime() < current.getTime()) hasEnded = true;

  if (startTime.getTime() > current.getTime()) {
    console.log("");
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
    <div>
      <p className="text-gray-400">
        {" "}
        {hasStarted ? "Ending in" : "Starting in"}
      </p>
      <div className="flex my-2 md:w-[400px]  m-auto  justify-around ">
        {days ? (
          <div className="">
            <p className="font-bold text-3xl">{days}</p>
            <p>Days</p>
          </div>
        ) : null}
        <div className="">
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
    </div>
  );
};

export default HeroTimer;
