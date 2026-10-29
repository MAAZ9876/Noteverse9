import { assetUrl } from "../../requestMethods";
import React, { useContext } from "react";
import "./Profile.css";
import Post from '../../component/post/Post'
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../component/Navbar";
import {
  Add, Remove
} from "@material-ui/icons";
import { publicRequest, errorMessage, IMAGES_URL } from "../../requestMethods";
import { useDispatch, useSelector } from "react-redux";
import { follow, unFollow } from "../../redux/userRedux";
import CircularLoader from '../../component/CircularLoader'
const Profile = () => {

  const { userId } = useParams();
  const navigate = useNavigate();
  const pf = IMAGES_URL;
  const [user, setuser] = useState({})
  const [post, setpost] = useState([])
  const [notFound, setNotFound] = useState(false)
  const { currentUser: currentuser } = useSelector((state) => state.user)
  // derived from the logged-in user, so it is always right when you move between profiles
  const isfollow = !!currentuser?.followings?.includes(userId)
  const dispatch = useDispatch();

  const loadUser = async () => {
    try {
      const res = await publicRequest.get(`users/${userId}`);
      setuser(res.data);
      setNotFound(false);
    } catch (err) {
      setNotFound(true);
    }
  }

  useEffect(() => {
    setuser({});
    setpost([]);
    setNotFound(false);
    loadUser();
    publicRequest.get(`notes/profile/${userId}`).then((res) => setpost(res.data)).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const FollowHandle = async () => {
    if (!currentuser) {
      navigate("/login");
      return;
    }
    try {
      if (isfollow) {
        await publicRequest.put(`/users/${user._id}/unfollow`);
        dispatch(unFollow(user._id));
      } else {
        await publicRequest.put(`/users/${user._id}/follow`);
        dispatch(follow(user._id));
      }
      loadUser();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  if (notFound) {
    return (
      <>
        <Navbar />
        <h3 style={{ paddingTop: "20vh", textAlign: "center" }}>User not found</h3>
      </>
    );
  }

  const totallikes = post?.reduce((a, v) => a = a + v?.likes.length, 0)
  const totalviews = post?.reduce((a, v) => a = a + v?.buy.length, 0)

  return (
    <>
      <Navbar />
      {
        user && user.username ? (
          <div className="profile-container">
            <div className="profile-top">
              <div className="profile-top-img-container">
                <img src={assetUrl(user?.profilePicture, pf + "DefaultPic.png")} alt="profile picture"></img>
                <p className="username">
                  {user && user.username}
                </p>
              </div>
              <div className="profile-desc">

                {
                (user.firstname) &&
                <p className="fullname">
                    {user?.firstname + " " + user?.lastname}
                </p>
                }
                
                {(user.desc) &&
                  <p className="desc">{
                    user?.desc
                  }</p>
                }

                {(currentuser?._id === userId || user.institution) &&
                  <div className="institution-container">
                    {user.institution &&
                      <img src="https://img.icons8.com/external-fauzidea-glyph-fauzidea/64/undefined/external-college-building-fauzidea-glyph-fauzidea.png" />
                    }
                    <p className="institution">
                      {(user.institution) &&
                        user && user.institution
                      }</p>
                  </div>}
                 
                <div className="followers-followings">
                  <p className="number">{(user.followers || []).length}</p>
                  <p className="number-below">Followers</p>
                  <p>.</p>
                  <p className="number">{(user.followings || []).length}</p>
                  <p className="number-below">Followings</p>
                </div>
                <div className="follow-chat">
                  {user._id !== currentuser?._id && (
                    <button className="follow" onClick={FollowHandle}>
                      {isfollow ? "Unfollow" : "Follow"}
                      {isfollow ? <Remove /> : <Add />}
                    </button>
                  )}
                </div>

                <div className="contributions">
                  < div className="gain-container">
                    <div className="total-gain">
                      <img src="/image/icons8-microsoft-publisher-50.png" />
                      <p className="gain-value">{post && post.length}</p>
                    </div>
                    <p className="gain-desc">Published Notes</p>
                  </div>

                  <div className="gain-container">

                    <div className="total-gain">
                      <img src="/image/icons8-like-64.png" />
                      <p className="gain-value">{post && totallikes}</p>
                    </div>
                    <p className="gain-desc">Total likes</p>
                  </div>

                  <div className="gain-container">
                    <div className="total-gain">
                      <img src="/image/icons8-view-50.png" />
                      <p className="gain-value">{post && totalviews}</p>
                    </div>
                    <p className="gain-desc">Total views</p>
                  </div>
                </div>


                <div className="user-timeline">

              <div className="user-post-profile">
                {
                  post && post.map((note) => (
                    <Post note={note} postUser={user} key={note._id} />
                  ))
                }
              </div>
            </div>

              </div>
            </div>

            
          </div>

        )
          :
          <div style={{ paddingTop: "20vh" }}>
            <CircularLoader item={"User"} />
          </div>
      }

    </>
  );
};

export default Profile;
