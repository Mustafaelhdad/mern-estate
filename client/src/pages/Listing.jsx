import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import Contact from "../components/Contact";

function Listing() {
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  const [listingData, setListingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);

  const getListingData = async () => {
    try {
      const response = await fetch(`/api/listing/get/${params.listingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing data");
      }

      const listing = await response.json();

      setListingData(listing.data);
      setLoading(false);
      setError(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error fetching listing data");
      setError(true);
    }
  };

  useEffect(() => {
    getListingData();
  }, [params.listingId]);

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && (
        <p className="text-center my-7 text-2xl">Something went wrong!</p>
      )}

      {!loading && !error && listingData && (
        <>
          <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
            {listingData.imageUrls.map((imgUrl) => (
              <SwiperSlide key={imgUrl}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${imgUrl}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);

                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>

          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}

          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-semibold">
              {listingData.name} - ${" "}
              {listingData.offer
                ? listingData.discountPrice.toLocaleString("en-US")
                : listingData.regularPrice.toLocaleString("en-US")}
              {listingData.type === "rent" && " / month"}
            </p>
            <p className="flex items-center mt-6 gap-2 text-slate-600  text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listingData.address}
            </p>
            <div className="flex gap-4">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listingData.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              {listingData.offer && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  ${+listingData.regularPrice - +listingData.discountPrice}
                </p>
              )}
            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black">Description - </span>
              {listingData.description}
            </p>
            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBed className="text-lg" />
                {listingData.bedrooms > 1
                  ? `${listingData.bedrooms} beds `
                  : `${listingData.bedrooms} bed `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {listingData.bathrooms > 1
                  ? `${listingData.bathrooms} baths `
                  : `${listingData.bathrooms} bath `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaParking className="text-lg" />
                {listingData.parking ? "Parking spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaChair className="text-lg" />
                {listingData.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>

            {currentUser &&
              currentUser._id !== listingData.userRef &&
              !contact && (
                <button
                  onClick={() => setContact(true)}
                  className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3"
                >
                  contact landlord
                </button>
              )}

            {contact && <Contact listing={listingData} />}
          </div>
        </>
      )}
    </main>
  );
}

export default Listing;
