import React, { useState } from "react";

const Accordian = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div
        onClick={() => setIsOpen((e) => !e)}
        className=" cursor-pointer 
        border-2 border-gray-400 w-full md:w-96 m-4 px-3 py-2 rounded-md"
      >
        <p className="flex text-left justify-between items-start">
          {data.question}
          {isOpen ? (
            <span>
              <i className="fa-solid fa-sort-up"></i>
            </span>
          ) : (
            <span>
              <i className="fa-solid fa-sort-down"></i>
            </span>
          )}
        </p>

        {isOpen && (
          <>
            <hr className="my-2" />
            <p className="text-left">{data.answer}</p>
          </>
        )}
      </div>
    </>
  );
};

export default Accordian;
