import "./messenger.css";
import Navbar from "../../component/Navbar";
import Conversation from "../../component/conversations/Conversation";
import Message from "../../component/message/Message";
import ChatOnline from "../../component/chatOnline/chatOnline";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { publicRequest, API_ORIGIN, errorMessage } from "../../requestMethods";
import { io } from "socket.io-client";

export default function Messenger() {
  const location = useLocation();
  const { currentUser: user, token } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  // SearchedUser passes the conversation it just created/found
  const [currentChat, setCurrentChat] = useState(location.state?.conversation || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineIds, setOnlineIds] = useState([]);
  const socket = useRef(null);
  const currentChatRef = useRef(currentChat);
  const scrollRef = useRef();

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  const loadConversations = async () => {
    try {
      const res = await publicRequest.get("/conversations/" + user._id);
      setConversations(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // connect to the realtime server (same address as the API) with our login token
  useEffect(() => {
    const s = io(API_ORIGIN, { auth: { token } });
    socket.current = s;

    s.on("getUsers", (ids) => setOnlineIds(ids));
    s.on("getMessage", (data) => {
      const chat = currentChatRef.current;
      if (chat && data.conversationId === chat._id) {
        setMessages((prev) => [
          ...prev,
          { _id: `live-${data.createdAt}-${Math.random()}`, sender: data.senderId, text: data.text, createdAt: data.createdAt },
        ]);
      } else {
        loadConversations(); // a message for a chat that isn't open - make sure it is listed
      }
    });

    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user._id]);

  useEffect(() => {
    if (!currentChat) return;
    let cancelled = false;
    setMessages([]);
    publicRequest
      .get("/messages/" + currentChat._id)
      .then((res) => !cancelled && setMessages(res.data))
      .catch((err) => console.log(err));
    return () => {
      cancelled = true;
    };
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !currentChat) return;

    const receiverId = currentChat.members.find((member) => member !== user._id);
    try {
      const res = await publicRequest.post("/messages", { conversationId: currentChat._id, text });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      socket.current?.emit("sendMessage", { receiverId, conversationId: currentChat._id, text });
    } catch (err) {
      alert(errorMessage(err, "Message could not be sent"));
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // people you follow who are online right now
  const onlineUsers = (user.followings || []).filter((f) => onlineIds.includes(f));

  return (
    <>
      <Navbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input placeholder="Search for users" className="chatMenuInput" />
            {conversations.map((c) => (
              <div key={c._id} onClick={() => setCurrentChat(c)}>
                <Conversation conversation={c} currentUser={user} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div ref={scrollRef} key={m._id}>
                      <Message message={m} own={m.sender === user._id} />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <input
                    className="chatMessageInput"
                    placeholder="write something..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    value={newMessage}
                  ></input>
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">Open a conversation to start a chat.</span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <p style={{ fontSize: "25px", margin: "2vh", borderBottom: "1px solid brown" }}>Online Users</p>
          <div className="chatOnlineWrapper">
            <ChatOnline
              onlineUsers={onlineUsers}
              currentId={user._id}
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}
