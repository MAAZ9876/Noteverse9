import React, { useRef, useState } from "react";
import "./UploadNote.css";
import { useSelector } from "react-redux";
import {
  CloudUpload,
  Close,
  PictureAsPdf,
  AddCircle,
  Image,
} from "@material-ui/icons";
import { publicRequest, errorMessage } from "../../requestMethods";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  uploadIcon: {
    color: "#167eec",
    fontSize: "3rem",
  },
  UploadPdfIcon: {
    color: "#167eec",
    fontSize: "3rem",
  },
  closeIcon: {
    fontSize: "3rem",
  },
  uploadAdd: {
    color: "#167eec",
    fontSize: "3rem",
  },
  upload: {
    color: "#167eec",
    fontSize: "2rem",
  },
}));

const UploadNote = () => {
  const { currentUser: user } = useSelector((state) => state.user);

  const notename = useRef();
  const descritpion = useRef();

  const [isupload, setsetisupload] = useState(false);
  const [noteFile, setNoteFile] = useState(null);
  const [fileimg, setfileimg] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadNoteFormSubmitHandler = async (e) => {
    e.preventDefault();

    if (!noteFile) {
      alert("Please select a PDF or document.");
      return;
    }

    if (!user || !user._id) {
      alert("Please login first.");
      return;
    }

    setUploading(true);

    try {
      // 1) upload the document, 2) upload the optional thumbnail, 3) create the note.
      // The server takes the author from the login token, so no userId is sent.
      const noteData = new FormData();
      noteData.append("file", noteFile);
      const noteResponse = await publicRequest.post("upload", noteData);

      let thumbnailUrl = "";
      if (fileimg) {
        const imageData = new FormData();
        imageData.append("file", fileimg);
        const imageResponse = await publicRequest.post("upload", imageData);
        thumbnailUrl = imageResponse.data.url;
      }

      await publicRequest.post("notes", {
        desc: descritpion.current.value,
        notename: notename.current.value,
        notefilename: noteResponse.data.url,
        thumbnailfilename: thumbnailUrl,
      });

      alert("Note uploaded successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Upload error:", err);
      alert(errorMessage(err, "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const classes = useStyles();

  return (
    <>
      {!isupload && (
        <div
          className="uploadNote-post"
          onClick={() => {
            setsetisupload((curr) => !curr);
          }}
        >
          <PictureAsPdf className={classes.UploadPdfIcon} />

          <p className="uploadNote-post-text">
            Upload a Note
          </p>

          <CloudUpload className={classes.uploadIcon} />
        </div>
      )}

      {isupload && (
        <div className="uploadNote-form-container">

          <div className="upload-note-top">

            <div className="upload-note-top-left">
              <AddCircle className={classes.uploadAdd} />

              <p className="upload-note-title">
                Upload a Note
              </p>
            </div>

            <Close
              onClick={() => {
                setsetisupload((curr) => !curr);
              }}
              className={classes.closeIcon}
              id="close-icon"
            />

          </div>

          <form
            onSubmit={uploadNoteFormSubmitHandler}
            className="uploadNote-form"
          >

            {/* Note name */}
            <input
              type="text"
              placeholder="Notename (not more than 30 characters)*"
              className="uploadNote-form-note-name"
              id="upload-note-input"
              ref={notename}
              maxLength="30"
              required
            />

            {/* Description */}
            <input
              type="text"
              placeholder="Description (not more than 300 characters)*"
              className="uploadNote-form-descritpion"
              ref={descritpion}
              id="upload-note-input"
              maxLength="300"
              required
            />

            {/* PDF / Document */}
            <label
              htmlFor="note-file-upload"
              className="custom-file-upload"
            >
              <PictureAsPdf className={classes.upload} />

              <p>
                {noteFile
                  ? noteFile.name
                  : "Choose PDF / DOC / DOCX / PPT / PPTX / TXT"}
              </p>

              <CloudUpload className={classes.upload} />
            </label>

            <input
              type="file"
              id="note-file-upload"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              onChange={(e) => {
                setNoteFile(e.target.files[0]);
              }}
              required
            />

            {/* Thumbnail */}
            <label
              htmlFor="thumbnail-file-upload"
              className="custom-file-upload"
            >
              <Image className={classes.upload} />

              <p>
                {fileimg
                  ? fileimg.name
                  : "Upload a thumbnail image"}
              </p>

              <CloudUpload className={classes.upload} />
            </label>

            <input
              type="file"
              id="thumbnail-file-upload"
              accept=".png,.jpeg,.jpg"
              onChange={(e) => {
                setfileimg(e.target.files[0]);
              }}
            />

            {/* Upload button */}
            <button
              type="submit"
              className="uploadNote-form-submit-button"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

          </form>
        </div>
      )}
    </>
  );
};

export default UploadNote;
