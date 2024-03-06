const isAdmin = async (req, res, next) => {
  try {
    if (req.body?.key !== process.env.key)
      return res
        .status(200)
        .json({ message: "You can't perform this operation", data: [] });
    else next();
  } catch (error) {
    console.log(error.name);
    console.log(error);
    res.status(401).json({ message: "Please try after login" });
  }
};

module.exports = isAdmin;
