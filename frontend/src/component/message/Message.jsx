import { IMAGES_URL } from "../../requestMethods";
import "./message.css";
import { format } from "timeago.js";

export default function Message({ message, own }) {
  const pf=IMAGES_URL;
  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img
          className="messageImg"
          src={pf + "DefaultPic.png"}
          alt=""
        />
        <p className="messageText">{message.text}</p>
      </div>
      <div className="messageBottom">{format(message.createdAt)}</div>
    </div>
  );
}
