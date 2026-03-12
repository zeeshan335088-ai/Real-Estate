import { useSelector, useDispatch } from "react-redux";
import { useRef, useState } from "react";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from "../redux/user/userSlice";
import { Link } from "react-router-dom";

export default function Profile() {

  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [fileUploadError, setFileUploadError] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  const dispatch = useDispatch();

  // CLOUDINARY IMAGE UPLOAD
  const handleFileUpload = async (file) => {

    try {

      setFileUploadError(false);
      setFilePerc(10);

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "unsigned_profile_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dmzx36hxd/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();

      if (!result.secure_url) {
        setFileUploadError(true);
        return;
      }

      setFilePerc(100);

      setFormData((prev) => ({
        ...prev,
        avatar: result.secure_url,
      }));

    } catch (error) {
      console.log(error);
      setFileUploadError(true);
    }
  };

  // FILE CHANGE
  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (file) {
      handleFileUpload(file);
    }

  };

  // INPUT CHANGE
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });

  };

  // UPDATE USER
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      dispatch(updateUserStart());

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);

    } catch (error) {

      dispatch(updateUserFailure(error.message));

    }
  };

  // DELETE USER
  const handleDeleteUser = async () => {

    try {

      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));

    } catch (error) {

      dispatch(deleteUserFailure(error.message));

    }
  };

  // SIGN OUT
  const handleSignOut = async () => {

    try {

      dispatch(signOutUserStart());

      const res = await fetch(`/api/auth/signout`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));

    } catch (error) {

      dispatch(deleteUserFailure(error.message));

    }
  };

  // SHOW LISTINGS
  const handleShowListings = async () => {

    try {

      setShowListingsError(false);

      const res = await fetch(`/api/user/listings/${currentUser._id}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);

    } catch {

      setShowListingsError(true);

    }
  };

  // DELETE LISTING
  const handleListingDelete = async (listingId) => {

    try {

      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );

    } catch (error) {

      console.log(error.message);

    }
  };

  return (

    <div className="p-3 max-w-lg mx-auto">

      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />

        <img
          onClick={() => fileRef.current.click()}
          src={
            formData.avatar ||
            currentUser.avatar ||
            "https://via.placeholder.com/150"
          }
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center"
        />

        <p className="text-sm self-center">

          {fileUploadError ? (

            <span className="text-red-700">
              Image upload failed
            </span>

          ) : filePerc > 0 && filePerc < 100 ? (

            <span>
              Uploading {filePerc}%
            </span>

          ) : filePerc === 100 ? (

            <span className="text-green-700">
              Image uploaded successfully
            </span>

          ) : (
            ""
          )}

        </p>

        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase"
        >
          {loading ? "Loading..." : "Update"}
        </button>

        <Link
          to="/create-listing"
          className="bg-green-700 text-white p-3 rounded-lg text-center uppercase"
        >
          Create Listing
        </Link>

      </form>

      <div className="flex justify-between mt-5">

        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>

        <span
          onClick={handleSignOut}
          className="text-red-700 cursor-pointer"
        >
          Sign out
        </span>

      </div>

      <p className="text-red-700 mt-5">{error}</p>

      <p className="text-green-700 mt-5">
        {updateSuccess ? "User updated successfully!" : ""}
      </p>

      <button
        onClick={handleShowListings}
        className="text-green-700 w-full mt-5"
      >
        Show Listings
      </button>

      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>

      {userListings && userListings.length > 0 && (

        <div className="flex flex-col gap-4 mt-5">

          <h1 className="text-center text-2xl font-semibold">
            Your Listings
          </h1>

          {userListings.map((listing) => (

            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center"
            >

              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing"
                  className="h-16 w-16 object-cover"
                />
              </Link>

              <Link
                to={`/listing/${listing._id}`}
                className="flex-1 ml-3"
              >
                {listing.name}
              </Link>

              <div className="flex flex-col">

                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700"
                >
                  Delete
                </button>

                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700">
                    Edit
                  </button>
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}