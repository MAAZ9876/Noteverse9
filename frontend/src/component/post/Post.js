import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThumbUp, ThumbUpAltOutlined, Visibility, Comment, Edit, Delete } from "@material-ui/icons";
import { format } from "timeago.js";
import "./Post.css";
import { useSelector } from "react-redux";
import { publicRequest, assetUrl, errorMessage, IMAGES_URL } from "../../requestMethods";

const Post = ({ note, postUser }) => {
  const { currentUser: user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const pf = IMAGES_URL;

  const [like, setlike] = useState(note.likes.length);
  const [islike, setislike] = useState(false);
  const [seen, setseen] = useState(note.buy.length);
  const [commentCount, setCommentCount] = useState(0);

  // keep the counters in sync when the note (or the logged-in user) changes
  useEffect(() => {
    setlike(note.likes.length);
    setislike(!!user && note.likes.includes(user._id));
    setseen(note.buy.length);
  }, [note, user]);

  useEffect(() => {
    let cancelled = false;
    publicRequest
      .get("comments/" + note._id)
      .then((res) => !cancelled && setCommentCount(res.data.length))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [note._id]);

  const likehandler = async () => {
    if (!user) return navigate("/login");
    const next = !islike;
    setislike(next);
    setlike((n) => n + (next ? 1 : -1));
    try {
      const res = await publicRequest.put("notes/" + note._id + "/like");
      setislike(res.data.liked);
      setlike(res.data.likes);
    } catch (err) {
      // undo the optimistic update
      setislike(!next);
      setlike((n) => n + (next ? -1 : 1));
    }
  };

  // Open the file first (inside the click, so the browser doesn't block the popup),
  // then record the view.
  const openNote = () => {
    window.open(assetUrl(note.notefilename), "_blank", "noopener,noreferrer");
    if (!user) return;
    publicRequest
      .put("notes/" + note._id + "/view")
      .then((res) => setseen(res.data.views))
      .catch(() => {});
  };

  const DeleteNotes = async () => {
    if (!window.confirm("Do you really want to delete this note?")) return;
    try {
      await publicRequest.delete(`notes/${note._id}`);
      window.location.reload();
    } catch (err) {
      alert(errorMessage(err, "Sorry, you can not delete this note"));
    }
  };

  return (
    <>
      <div className="post-container" key={note._id}>
        <div className="post-topbar" style={{ lineHeight: "1" }}>
          <Link to={`/profile/${note.userId}`} style={{ textDecoration: "none" }}>
            <img
              src={assetUrl(postUser?.profilePicture, pf + "DefaultPic.png")}
              className="post-topbar-img"
              alt=""
            ></img>
          </Link>
          <div className="post-topbar-desc">
            <Link to={`/profile/${note.userId}`} style={{ textDecoration: "none" }}>
              <p className="post-topbar-name">{postUser && postUser.username}</p>
            </Link>
            <div className="post-topbar-follow-ago-container">
              <p>{postUser?.followers?.length ?? 0} Followers</p>
              <p style={{ marginLeft: "5px" }}>{format(note.createdAt)}</p>
            </div>
          </div>

          {user && note.userId === user._id && (
            <div className="post-topbar-edit-delete-container">
              <Link
                to={`/note/update/${note._id}`}
                style={{ textDecoration: "none", color: "black" }}
                className="post-topbar-edit-icon"
              >
                <Edit />
              </Link>
              <Delete onClick={DeleteNotes} className="delete-icon" />
            </div>
          )}
        </div>

        <div className="main-post" style={{ height: "57vh" }}>
          <div className="main-post-img-container" onClick={openNote}>
            <img
              src={assetUrl(note.thumbnailfilename, pf + "images-notes.jpg")}
              alt="note-thumbnail"
            ></img>
            <div className="View-pdf-1">
              <p>View-pdf</p>
              <img src="/image/icons8-view-50.png" alt="" />
            </div>
          </div>
          <div className="main-post-about" style={{ lineHeight: "1.4" }}>
            <p className="main-post-notename">{note.notename}</p>
            <p className="main-post-description">Description:</p>
            <p className="main-post-desc">{note.desc}</p>
          </div>
        </div>

        <div className="post-reaction-container">
          <div className="post-reaction">
            {islike ? (
              <ThumbUp onClick={likehandler} style={{ color: " #3E8DE3" }} />
            ) : (
              <ThumbUpAltOutlined onClick={likehandler} />
            )}
            <p>{like}</p>
          </div>
          <Link
            to={`/viewcomment/${note._id}`}
            className="link-in-comment"
            style={{ textDecoration: "none", color: "black" }}
          >
            <div className="post-reaction">
              <Comment />
              <p>{commentCount}</p>
            </div>
          </Link>
          <div className="post-reaction">
            <Visibility />
            <p>{seen}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
