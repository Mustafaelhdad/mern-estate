import React, { useEffect, useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL, // This is the correct way to import getDownloadURL
} from "firebase/storage";
import { app } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const params = useParams();

  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingImgs, setUploadingImgs] = useState(false);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 0,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [loading, setLoading] = useState(false);
  const [listingData, setListingData] = useState({});

  const handleImageSubmit = (e) => {
    e.preventDefault();
    setUploadingImgs(true);

    if (files.length > 0 && files.length < 7) {
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i], i));
      }

      Promise.all(promises)
        .then((urls) => {
          setFormData({ ...formData, imageUrls: urls });
          toast.success("Images uploaded successfully!");
          setUploadingImgs(false);
        })
        .catch((error) => {
          toast.error("Error uploading images. Please try again.");
          setUploadingImgs(false);
        });
    } else {
      toast.error("You must select between 1 and 6 images.");
      setUploadingImgs(false);
    }
  };

  const storeImage = (file, index) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          // Update the progress for this file using the correct index
          setUploadProgress((prev) => ({
            ...prev,
            [index]: progress, // Associate progress with file index
          }));
        },
        (error) => {
          reject(error); // Trigger the catch block in the Promise.all
          toast.error(`Error uploading ${file.name}`);
        },
        () => {
          // Correct way to get the download URL
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL); // Return the file URL once uploaded
            })
            .catch((error) => {
              reject(error);
              toast.error("Error getting download URL");
            });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({ ...formData, type: e.target.id });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.imageUrls.length === 0) {
      setLoading(false);
      toast.error("Please upload at least one image.");
      return;
    }

    if (+formData.regularPrice < +formData.discountPrice) {
      setLoading(false);
      toast.error("Discount price must be lower than regular price.");
      return;
    }

    try {
      const response = await fetch(
        [`/api/listing/update/${params.listingId}`],
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, userRef: currentUser._id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Listing created successfully!");
        setLoading(false);

        setFormData({
          imageUrls: [],
          name: "",
          description: "",
          address: "",
          type: "rent",
          bedrooms: 1,
          bathrooms: 1,
          regularPrice: 0,
          discountPrice: 0,
          offer: false,
          parking: false,
          furnished: false,
        });
        setFiles([]);

        navigate(`/listing/${params.listingId}`);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const getListingData = async () => {
    try {
      const response = await fetch(`/api/listing/get/${params.listingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing data");
      }

      const listing = await response.json();

      setListingData(listing.data);
      setFormData({
        ...formData,
        imageUrls: listing.data.imageUrls || [],
        name: listing.data.name || "",
        description: listing.data.description || "",
        address: listing.data.address || "",
        type: listing.data.type || "rent",
        bedrooms: listing.data.bedrooms || 1,
        bathrooms: listing.data.bathrooms || 1,
        regularPrice: listing.data.regularPrice || 0,
        discountPrice: listing.data.discountPrice || 0,
        offer: listing.data.offer || false,
        parking: listing.data.parking || false,
        furnished: listing.data.furnished || false,
      });
    } catch (error) {
      toast.error("Error fetching listing data");
    }
  };

  useEffect(() => {
    getListingData();
  }, [params.listingId]);

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <ToastContainer /> {/* Add this line to enable toast notifications */}
      <h1 className="text-3xl font-semibold text-center my-7">
        Update Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />

          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />

          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min={1}
                max={10}
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min={1}
                max={10}
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min={1}
                max={10}
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>

            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="50"
                  max="1000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discount Price</p>
                  <span className="text-xs">($ / month)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:{" "}
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          <div className="flex gap-4">
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
            />
            <button
              onClick={handleImageSubmit}
              type="button"
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploadingImgs ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Display the progress for each file */}
          <div className="mt-4">
            {files.length > 0 && (
              <div>
                {Array.from(files).map((file, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-sm">
                      {file.name}: {Math.round(uploadProgress[index] || 0)}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress[index] || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, idx) => (
              <div
                key={idx}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="Listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-95"
                >
                  Delete
                </button>
              </div>
            ))}

          <button
            type="button"
            disabled={loading || uploadingImgs}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
            onClick={handleSubmit}
          >
            {loading ? "Updating..." : "Update Listing"}
          </button>
        </div>
      </form>
    </main>
  );
}

// test

export default UpdateListing;
