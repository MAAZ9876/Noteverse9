import { IMAGES_URL, assetUrl } from "../../requestMethods";
import React, { useContext, useRef } from "react";
import "./UpdateUser.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicRequest, errorMessage } from "../../requestMethods";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../redux/userRedux";
import Navbar from '../Navbar';
const UpdateUser = () => {
  const pf = IMAGES_URL;
  const { currentUser: user } = useSelector((state) => state.user);
  const [firstname, setfirstname] = useState(user.firstname || "");
  const [lastname, setlastname] = useState(user.lastname || "");
  const [institution, setinstitution] = useState(user.institution || "");
  const [interested, setinterested] = useState(user.interested || "");
  const [photo, setphoto] = useState(null);
  const [password, setpassword] = useState();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const UpdateFormHandler = async (e) => {
    e.preventDefault();

    const newUser = { firstname, lastname, interested, institution };
    if (password) newUser.password = password;

    try {
      if (photo) {
        const data = new FormData();
        data.append("file", photo);
        const res = await publicRequest.post("upload", data);
        newUser.profilePicture = res.data.url;
      }
      const res = await publicRequest.put(`users/${user._id}`, newUser);
      dispatch(updateUser(res.data)); // refresh the logged-in user in the app
      alert("Profile updated successfully");
      navigate("/");
    } catch (err) {
      alert(errorMessage(err, "Could not update your profile"));
    }
  };

  return (
    <>
      <Navbar />
      <div className="Update-container">
        <div className="Update-profile-container">
          <div className="Update-profile-container-left">
            <div className="Update-profile-container-left-top">
              <img
                src={
                  assetUrl(user?.profilePicture, pf + "DefaultPic.png")
                }
                className="Update-profile-container-left-top-img"
              ></img>

              <div className="Update-profile-container-left-top-user-desc">
                <p className="Update-profile-container-left-top-name">
                  <span>{user.firstname}</span> <span>{user.lastname} </span>
                </p>
                <p className="Update-profile-container-left-top-username">
                  {user.username}
                </p>
              </div>
            </div>
          </div>

          <div className="Update-profile-container-right">
            <p className="Update-profile-container-right-heading">
              Your Personal Profile Info
            </p>
            <form
              onSubmit={UpdateFormHandler}
              className="Update-profile-container-right-form"
            >
              <div className="input-box">
                <p className="input-heading">first name</p>
                <input
                  type="text"
                  placeholder="firstname"
                  defaultValue={firstname}
                  onChange={(e) => setfirstname(e.target.value)}
                  className="input-block"
                ></input>
              </div>

              <div className="input-box">
                <p className="input-heading">last name</p>
                <input
                  type="text"
                  placeholder="lastname"
                  defaultValue={lastname}
                  onChange={(e) => setlastname(e.target.value)}
                  className="input-block"
                ></input>
              </div>

              

             

              <div className="input-box">
                <p className="input-heading">Institution</p>
                <input
                  type="text"
                  placeholder="institution"
                  defaultValue={institution}
                  onChange={(e) => setinstitution(e.target.value)}
                  className="input-block"
                ></input>
              </div>

              <div className="input-box">
                <p className="input-heading">Interested field</p>
                <input
                  type="text"
                  placeholder="eg. physics,coding,biology..."
                  defaultValue={interested}
                  onChange={(e) => setinterested(e.target.value)}
                  className="input-block"
                ></input>
              </div>

              

              <div className="input-box">
                <p className="input-heading">Update your password</p>
                <input
                  type="password"
                  placeholder="not required"
                  onChange={(e) => setpassword(e.target.value)}
                  minLength="6"
                  className="input-block"
                ></input>
              </div>

              <div className="input-box">
                <p className="input-heading">Profile picture</p>
                <input
                  type="file"
                  className="input-block"
                  id="input-bloack-file"
                  accept=".png,.jpeg,.jpg"
                  onChange={(e) => setphoto(e.target.files[0])}
                  style={{ border: "none", borderRadius: "0%" }}
                ></input>
              </div>

              <button
                type="submit"
                className="Update-profile-container-right-form-submit"
              >
                Update-profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateUser;
