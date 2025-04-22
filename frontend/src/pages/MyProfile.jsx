import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverBusy, setServerBusy] = useState(false);
  const [showPiiInfo, setShowPiiInfo] = useState(false);

  const updateUserProfileData = async () => {
    try {
      setIsUploading(true);
      setServerBusy(false);
      let busyTimeout = setTimeout(() => setServerBusy(true), 5000);
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      image && formData.append("image", image);
      const { data } = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        formData,
        {
          headers: {
            token,
          },
        }
      );
      clearTimeout(busyTimeout);
      setIsUploading(false);
      setServerBusy(false);
      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setIsUploading(false);
      setServerBusy(false);
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    userData && (
      <div className="max-w-lg flex flex-col gap-2 text-sm">
        {isEdit ? (
          <label htmlFor="image">
            <div className="inline-block relative cursor-pointer">
              <img
                src={image ? URL.createObjectURL(image) : userData.image}
                alt=""
                className="w-36 rounded opacity-75"
              />
              <img
                src={image ? "" : assets.upload_icon}
                alt=""
                className="w-10 absolute bottom-12 right-12"
              />
            </div>

            <input
              type="file"
              id="image"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
        ) : (
          <img src={userData?.image} alt="" className="w-36 rounded" />
        )}

        {isEdit ? (
          <input
            type="text"
            value={userData?.name}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="bg-gray-100 text-3xl font-medium max-w-60 mt-4"
          />
        ) : (
          <p className="font-medium text-3xl text-neutral-800 mt-4">
            {userData?.name}
          </p>
        )}
        <hr className="bg-zinc-400 h-[1px] border-none" />
        <div>
          <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email id:</p>
            <p className="text-blue-500">{userData?.email}</p>
            <p className="font-medium">Phone:</p>
            {isEdit ? (
              <input
                type="text"
                value={userData?.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="bg-gray-100 max-w-52"
              />
            ) : (
              <span className="flex items-center gap-2 relative">
                <p className="text-blue-400 mb-0">{userData?.phone}</p>
                <button
                  type="button"
                  className="ml-1 p-1 rounded-full hover:bg-blue-100 focus:outline-none"
                  onClick={() => setShowPiiInfo((v) => !v)}
                  aria-label="PII Encryption Info"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" /></svg>
                </button>
                {showPiiInfo && (
                  <div className="absolute left-6 top-6 z-50 bg-white border border-blue-200 rounded shadow-lg p-4 w-72 text-xs text-gray-700" onMouseLeave={() => setShowPiiInfo(false)}>
                    <div className="font-semibold text-blue-600 mb-2">PII Encryption</div>
                    <div className="mb-2">Your phone number is protected using strong encryption:</div>
                    <div className="flex flex-col items-center mb-2">
                      <span className="font-mono text-xs text-gray-600">User Input Phone</span>
                      <span className="text-blue-400">↓</span>
                      <span className="font-mono text-xs text-gray-600">[ Encrypt ]</span>
                      <span className="text-blue-400">↓</span>
                      <span className="font-mono text-xs text-gray-600">Store in MongoDB</span>
                      <span className="text-blue-400">↓</span>
                      <span className="font-mono text-xs text-gray-600">[ Decrypt ]</span>
                      <span className="text-blue-400">↓</span>
                      <span className="font-mono text-xs text-gray-600">[ Mask ]</span>
                      <span className="text-blue-400">↓</span>
                      <span className="font-mono text-xs text-gray-600">Frontend Display</span>
                    </div>
                    <div className="text-gray-500">Only the first 2 and last 4 digits are shown. The rest are hidden for your privacy.</div>
                  </div>
                )}
              </span>
            )}
            <p className="font-medium">Address:</p>
            {isEdit ? (
              <p>
                <input
                  type="text"
                  value={userData?.address.line1}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  className="bg-gray-100"
                />
                <br />
                <input
                  type="text"
                  value={userData?.address.line2}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                  className="bg-gray-100"
                />
              </p>
            ) : (
              <p className="text-gray-500">
                {userData?.address.line1} <br /> {userData?.address.line2}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                value={userData?.gender}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="max-w-20 bg-gray-100"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="text-gray-400">{userData?.gender}</p>
            )}
            <p className="font-medium">Birthday:</p>
            {isEdit ? (
              <input
                type="date"
                value={userData?.dob}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
                className="max-w-28 bg-gray-100"
              />
            ) : (
              <p className="text-gray-400">{userData?.dob}</p>
            )}
          </div>
        </div>

        <div className="mt-10">
          {isEdit ? (
            <>
              <button
                onClick={updateUserProfileData}
                className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
                disabled={isUploading}
              >
                {isUploading ? (
                  <span>
                    <svg className="inline w-5 h-5 mr-2 animate-spin text-primary" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Uploading...
                  </span>
                ) : (
                  "Save information"
                )}
              </button>
              {isUploading && serverBusy && (
                <div className="text-red-500 mt-2">Server busy, please wait...</div>
              )}
            </>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    )
  );
};

export default MyProfile;
