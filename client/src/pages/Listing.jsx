import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

function Listing() {
  const params = useParams();

  const [listingData, setListingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        </>
      )}
    </main>
  );
}

export default Listing;
