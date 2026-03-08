import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {  updateUserStart, updateUserFailure, updateUserSuccess, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart, signOutUserFailure, signOutUserSuccess } from '../redux/user/userSlice'


export default function Profile() {

  const fileRef = useRef(null);

  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [file, setFile] = useState(undefined );
  const [filePerc, setFilePerc] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

  const handleFileUpload = async (file) => {
    setUploading(true);
    setFilePerc(0);
    setFileUploadError(false);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "unsigned_profile_upload");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dmzx36hxd/image/upload",
        data,
        {
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setFilePerc(percent);
          },
        }
      );

      const downloadURL = res.data.secure_url;

      setFormData((prev) => ({
        ...prev,
        avatar: downloadURL,
      }));


      setFilePerc(100);
      setUploading(false);

    } catch (error) {
      console.log(error);
      setUploading(false);
      setFileUploadError(true);
    }
  };
const handleChange = (e) =>{
  setFormData({ ...formData, [e.target.id]: e.target.value});  
};
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    dispatch(updateUserStart()); 
    const res = await fetch(`/api/user/update/${currentUser._id}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if(data.success === false){
      dispatch(updateUserFailure(data.message))
      return;
    }
    dispatch(updateUserSuccess(data));
    
  } catch (error) {
    dispatch(updateUserFailure(error.message));
   
  }

};
const handleDeleteUser = async () =>{
  try {
    dispatch(deleteUserStart())
    const res = await fetch(`/api/user/delete/${currentUser._id}`,{
      method: 'DELETE',
    });
    const data = await res.json();
    if(data.success === false){
      dispatch(deleteUserFailure(data.message));
      return;
    }
    dispatch(deleteUserSuccess(data));
  } catch (error) {
     dispatch(deleteUserFailure(error.message))
  }
};
const handleSignOut = async () =>{
try {
  dispatch(signOutUserStart())
  const res = await fetch('/api/auth/signout');
  const data = await res.json();
  if(data.success === false){
    dispatch(signOutUserFailure(data.message));
    return;
  }
  dispatch(signOutUserSuccess(data))
} catch (error) {
   dispatch(signOutUserFailure(data.message))
}
}
  return (
    <div className="p-3 max-w-lg mx-auto">

      <h1 className="text-3xl font-semibold text-center my-7">
        Profile
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* File input hidden */}
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* Profile image */}
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />

        {/* Upload status */}
        <p className="text-sm self-center">
          {uploading && filePerc < 100 && (
            <span className="text-slate-700">Uploading {filePerc}%</span>
          )}
          {fileUploadError && (
            <span className="text-red-700">Error uploading image</span>
          )}
          {!uploading && filePerc === 100 && !fileUploadError && (
            <span className="text-green-700">Successfully uploaded</span>
          )}
        </p>

        {/* Form fields */}
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          className="border p-3 rounded-lg"
          onChange={handleChange
          }
          id="username"
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg"
          onChange={handleChange
          }
          id="email"
        />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          onChange={handleChange
          }
          id="password"
        />

        <button disabled={loading} className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80">
          {loading ? 'Loading...' : 'Update'}
        </button>
      </form>

      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer" onClick={handleDeleteUser}>Delete account</span>
        <span  className="text-red-700 cursor-pointer" onClick={handleSignOut}>Sign out</span>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ''}</p>
    </div>
  );
}