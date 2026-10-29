import React, { useState, useEffect } from "react";
import "./UpdatePost.css";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { publicRequest, errorMessage } from "../../requestMethods";
import Navbar from "../Navbar";

function UpdatePost() {
  const { notesid } = useParams();
  const navigate = useNavigate();
  const { currentUser: user } = useSelector((state) => state.user);
  const [notename, setnotename] = useState("");
  const [desc, setdesc] = useState("");
  const [noteFile, setNoteFile] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // load the current values so the form is pre-filled (and nothing is overwritten by accident)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await publicRequest.get(`notes/${notesid}`);
        if (res.data.userId !== user._id) {
          alert("You can edit only your own notes");
          navigate("/");
          return;
        }
        setnotename(res.data.notename || "");
        setdesc(res.data.desc || "");
        setLoaded(true);
      } catch (err) {
        alert(errorMessage(err, "Note not found"));
        navigate("/");
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesid]);

  const UpdateNoteHandler = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { notename, desc };
      if (noteFile) {
        const fd = new FormData();
        fd.append("file", noteFile);
        body.notefilename = (await publicRequest.post("upload", fd)).data.url;
      }
      if (thumb) {
        const fd = new FormData();
        fd.append("file", thumb);
        body.thumbnailfilename = (await publicRequest.post("upload", fd)).data.url;
      }
      await publicRequest.put(`notes/${notesid}`, body);
      alert("Note updated successfully");
      navigate("/");
    } catch (err) {
      alert(errorMessage(err, "Could not update the note"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="Update-post-container-complete">
        <div className="Update-post-container">
          <p className="Update-post-container-name">Update your note</p>
          {!loaded ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={UpdateNoteHandler} className="Update-post-container-form">
              <div className="Update-post-input-box">
                <p className="Update-post-input-heading">Note name</p>
                <input
                  type="text"
                  placeholder="notename"
                  value={notename}
                  maxLength="60"
                  required
                  onChange={(e) => setnotename(e.target.value)}
                  className="Update-post-input-block"
                ></input>
              </div>

              <div className="Update-post-input-box">
                <p className="Update-post-input-heading">Descritpion</p>
                <input
                  type="text"
                  placeholder="Descritpion"
                  value={desc}
                  maxLength="500"
                  onChange={(e) => setdesc(e.target.value)}
                  className="Update-post-input-block"
                ></input>
              </div>

              <div className="Update-post-input-box-file">
                <p className="Update-post-input-heading-file">Replace note file (optional)</p>
                <input
                  type="file"
                  className="Update-post-input-block-file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={(e) => setNoteFile(e.target.files[0])}
                ></input>
              </div>

              <div className="Update-post-input-box-file">
                <p className="Update-post-input-heading-file">Thumbnail file (optional)</p>
                <input
                  type="file"
                  className="Update-post-input-block-file"
                  accept=".png,.jpeg,.jpg"
                  onChange={(e) => setThumb(e.target.files[0])}
                ></input>
              </div>
              <button type="submit" className="Update-post-container-form-submit" disabled={saving}>
                {saving ? "Saving..." : "Update-Note"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default UpdatePost;
