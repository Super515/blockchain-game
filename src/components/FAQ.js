import React from "react";
import Accordian from "./Accordian";

const data = [
  {
    question: "How to buy tickets:",
    answer:
      "Tickets can be bought from the opening of the raffle until the countdown timer hits 0. Simply connect your wallet at the top right of the page and then choose how many tickets you want before clicking purchase.",
  },
  {
    question: "How will I know if I won:",
    answer:
      "After the countdown timer hits 0 the winner will be automatically airdropped the raffled NFT to the winning wallet address.",
  },
  {
    question: "How many tickets can I purchase:",
    answer:
      "There is no limit to the amount of tickets you can purchase for a raffle. However, the raffle (unless otherwise noted) will only have 1 winner selected that receives the NFT. The more tickets you buy the better the chance is of you winning!",
  },
  {
    question: "How do I claim my prize if I won?:",
    answer:
      "No need! The prize will be automatically airdropped to the winning wallet address once the raffle timer hits 0!",
  },
  // {
  //   question: "",
  //   answer:
  //     "",
  // },
  // {
  //   question: "",
  //   answer:
  //     "",
  // },
  // {
  //   question: "",
  //   answer:
  //     "",
  // },
  // {
  //   question: "",
  //   answer:
  //     "",
  // },
];

const FAQ = () => {
  return (
    <div className="text-center my-10">
      <p className="uppercase font-bold text-4xl">FREQUENTLY ASKED QUESTIONS</p>
      <div className="flex flex-wrap justify-center items-start my-6">
        {data && data.map((d, index) => <Accordian key={index} data={d} />)}
      </div>
    </div>
  );
};

export default FAQ;
