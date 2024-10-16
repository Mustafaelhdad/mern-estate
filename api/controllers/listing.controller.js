import Listing from "../models/listing.modal.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);

    res.status(201).json({ status: "success", data: listing });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
