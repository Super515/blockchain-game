import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTimer } from "react-timer-hook";
import { BASEURL } from "../utils/Utils";

const Card = ({ data }) => {
  var hasStarted = false;
  var hasEnded = false;
  var secondBetweenTwoDate;
  var current = new Date();
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  var startUTC = startTime.getTimezoneOffset();
  var endUTC = endTime.getTimezoneOffset();

  startTime.setMinutes(startTime.getMinutes() + startUTC);
  endTime.setMinutes(endTime.getMinutes() + endUTC);

  if (startTime.getTime() < current.getTime()) hasStarted = true;
  if (endTime.getTime() < current.getTime()) hasEnded = true;

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
    <Link to={`/raffle/${data._id}`}>
      <div
        className="bg-dark-500 cursor-pointer duration-100 hover:shadow-xl max-w-xs m-2   
     text-white text-center rounded-lg shadow-md  p-0 pb-2 "
      >
        {data && (
          <div>
            <div className="h-60 w-full overflow-hidden">
              <img
                className="w-full  rounded-lg"
                // src={BASEURL + "/images/" + data.imageUrl}
                src={data.imageUrl}
                alt=""
                style={{ minHeight: 240 }}
              />
            </div>
            <div className="py-4">
              <div className="py-2">
                <p className="text-gray-300 font-semibold text-md">Pot Value</p>
                <p className="font-bold text-xl">{data.portValue}</p>
              </div>
              <div className="my-2">
                <p className="text-gray-300 font-semibold text-md">
                  Tickets Sold
                </p>
                <p className="font-bold text-xl">{data.ticketSolds}</p>
              </div>
              <div className="my-2">
                <p className="text-gray-300 font-semibold text-md">
                  {hasEnded
                    ? "Status"
                    : hasStarted
                    ? "Ending in"
                    : "Starting in"}
                </p>
                {hasEnded ? (
                  <p className="font-semibold text-center text-white">
                    Finised
                  </p>
                ) : (
                  <p className="font-bold text-xl">
                    {days > 0 ? days : null}
                    {days > 0 ? " : " : null}
                    {hours} : {minutes} : {seconds}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Card;
