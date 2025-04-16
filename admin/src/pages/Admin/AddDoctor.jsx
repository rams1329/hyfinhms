import React, { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";

const AddDoctor = () => {
  const [loading, setLoading] = useState(false);
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { backendUrl, aToken } = useContext(AdminContext);

  // Hardcoded specialties list
  const specialties = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist"
  ];

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!docImg) {
        return toast.error("Image Not Selected");
      }

      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({
          line1: address1,
          line2: address2,
        })
      );

      //   console log formData
      formData.forEach((value, key) => {
        console.log(`${key} :${value}`);
      });

      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-doctor`,
        formData,
        {
          headers: {
            aToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setDocImg(false);
        setName("");
        setPassword("");
        setEmail("");
        setAddress1("");
        setAddress2("");
        setDegree("");
        setAbout("");
        setFees("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt=""
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
            />
          </label>
          <input
            type="file"
            id="doc-img"
            hidden
            onChange={(e) => setDocImg(e.target.files[0])}
          />
          <p>
            Upload doctor <br /> picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor name</p>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Email</p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Password</p>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Year</option>
                <option value="3 Year">3 Year</option>
                <option value="4 Year">4 Year</option>
                <option value="5 Year">5 Year</option>
                <option value="6 Year">6 Year</option>
                <option value="7 Year">7 Year</option>
                <option value="8 Year">8 Year</option>
                <option value="9 Year">9 Year</option>
                <option value="10 Year">10 Year</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Fees</p>
              <input
                type="number"
                placeholder="fees"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                required
                className="border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Speciality</p>
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="border rounded px-3 py-2"
                required
              >
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Education</p>
              <input
                type="text"
                placeholder="Education"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                required
                className="border rounded px-3 py-2"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Address</p>
              <input
                type="text"
                placeholder="address 1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                required
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="address 2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                required
                className="border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mt-4 mb-2">About Doctor</p>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="About Doctor"
            required
            className="w-full border rounded px-3 py-2 h-32"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-6 px-4 py-2 rounded ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-indigo-600"
          }`}
        >
          {loading ? "Adding..." : "Add Doctor"}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
