import { IMAGES_URL, assetUrl } from "../../requestMethods";
import { useEffect, useState } from "react";
import { publicRequest } from "../../requestMethods";
import "./chatOnline.css";

export default function ChatOnline({ onlineUsers, currentId, setCurrentChat }) {
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const PF=IMAGES_URL;

  useEffect(() => {
    const getFriends = async () => {
      const res = await publicRequest.get("/users");
      setFriends(res.data);
    };

    getFriends();
  }, [currentId]);
  useEffect(() => {
    setOnlineFriends(friends.filter((f) => onlineUsers.includes(f._id)));
  }, [friends, onlineUsers]);

  const handleClick = async (user) => {
    try {
      const res = await publicRequest.post("/conversations", { receiverId: user._id });
      setCurrentChat(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chatOnline">
      {onlineFriends.map((o) => (
        <div className="chatOnlineFriend" key={o._id} onClick={() => handleClick(o)}>
          <div className="chatOnlineImgContainer">
            <img
              className="chatOnlineImg"
              src={
                assetUrl(o?.profilePicture, PF + "DefaultPic.png")
              }
              alt=""
            />
            <div className="chatOnlineBadge"></div>
          </div>
          <span className="chatOnlineName">{o?.username}</span>
        </div>
      ))}
    </div>
  );
}
