const handleAsync = (fn) => {
  return (req, res) => {
    fn(req, res).catch((e) => {
      console.log(e);
      if (e.name === "CastError")
        return res
          .status(500)
          .json({ message: "Invalid NFT Requested", data: [] });

      return res
        .status(500)
        .json({ message: "Something went wrong", data: [] });
    });
  };
};

module.exports = { handleAsync };
