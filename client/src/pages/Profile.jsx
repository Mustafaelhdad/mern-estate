import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [uploadFileError, setUploadFileError] = useState(false);
  const [formData, setFormData] = useState({});

  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleUploadFile(file);
    }
  }, [file]);

  const handleUploadFile = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        // Handle upload error
        setUploadFileError(true);
        console.error("File upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setFormData((prev) => ({ ...prev, avatar: downloadUrl }));

          toast.success("Image uploaded successfully!");
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    dispatch(updateUserStart());

    try {
      // Get the user ID from the currentUser object
      const userId = currentUser?._id; // Make sure this matches your user object structure

      // Make a POST request to the update endpoint
      const response = await fetch(`/api/user/update/${userId}`, {
        method: "POST",
        body: JSON.stringify(formData), // Send formData as the request body
        headers: {
          "Content-Type": "application/json", // JSON since the form data is already managed
          // You can add Authorization headers if needed:
          // Authorization: `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(updateUserSuccess(data));
        // alert("Profile updated successfully!");

        toast.success("Profile updated successfully!");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      dispatch(updateUserFailure(error.message)); // Dispatch failure action

      toast.error("Error updating profile!");
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDeleteUser = async () => {
    dispatch(deleteUserStart());

    try {
      // Get the user ID from the currentUser object
      const userId = currentUser?._id; // Make sure this matches your user object structure

      // Make a DELETE request to the delete endpoint
      const response = await fetch(`/api/user/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Account deleted successfully!");
        dispatch(deleteUserSuccess());
        // Optionally, you can redirect the user or handle any additional logic here
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message)); // Dispatch failure action

      toast.error("Error deleting account!");
      console.error("Error deleting account:", error);
    }
  };

  // New function to handle sign out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const response = await fetch("/api/auth/signout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        dispatch(signOutUserSuccess());
        toast.success("Signed out successfully!");
        // window.location.href = "/login";
      } else {
        throw new Error("Failed to sign out");
      }
    } catch (error) {
      toast.error("Error signing out!");
      console.error("Error signing out:", error);
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <ToastContainer />

      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          accept="image/*"
          hidden
        />
        <img
          src={formData.avatar || currentUser.avatar}
          onClick={() => fileRef.current.click()}
          alt="profile"
          className="rounded-full h-24 w-24 cursor-pointer object-cover self-center mt-2"
        />
        <p className="text-sm text-center">
          {uploadFileError ? (
            <span className="text-red-700">Error Iamge upload</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc == 100 ? (
            <span className="text-green-700">Image successfully uploaded!</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          className="border p-3 rounded-lg"
          onChange={(e) => handleChange(e)}
        />
        <input
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg"
          onChange={(e) => handleChange(e)}
        />
        <input
          type="password"
          id="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          onChange={(e) => handleChange(e)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </form>

      <div className="flex justify-between mt-5">
        <span
          className="text-red-700 cursor-pointer"
          onClick={handleDeleteUser}
        >
          Delete account
        </span>
        <span className="text-red-700 cursor-pointer" onClick={handleSignOut}>
          Sign out
        </span>
      </div>
    </div>
  );
}

export default Profile;
