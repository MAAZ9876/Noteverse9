
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { API_ORIGIN } from "../../requestMethods";
import "./AIStudyAssistant.css";

const AIStudyAssistant = () => {
  const token = useSelector((state) => state.user.token);

  const [task, setTask] = useState("analyze");
  const [text, setText] = useState("");
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const chooseFile = (event) => {
    const selected = event.target.files?.[0] || null;

    setError("");
    setAnswer("");

    if (!selected) {
      setFile(null);
      return;
    }

    if (
      selected.type !== "application/pdf" ||
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      event.target.value = "";
      setError("Please select a PDF file.");
      return;
    }

    if (selected.size > 8 * 1024 * 1024) {
      setFile(null);
      event.target.value = "";
      setError("Please select a PDF smaller than 8 MB.");
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!text.trim() && !file) {
      setError("Paste some text or select a PDF first.");
      return;
    }

    if (!token) {
      setError("Please log in before using the AI assistant.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const formData = new FormData();

      formData.append("task", task);
      formData.append("text", text.trim());
      formData.append("question", question.trim());

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(
        `${API_ORIGIN}/api/ai/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "AI analysis failed.");
      }

      setAnswer(data.answer || "No answer was returned.");
    } catch (err) {
      setError(err.message || "Could not connect to the AI assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="nv-ai-assistant">
      <div className="nv-ai-header">
        <div className="nv-ai-mark">AI</div>

        <div>
          <span className="nv-ai-eyebrow">POWERED BY GEMINI</span>
          <h2>NoteVerse AI</h2>
          <p>Understand more. Learn smarter.</p>
        </div>
      </div>

      <form className="nv-ai-form" onSubmit={handleSubmit}>
        <label className="nv-ai-label" htmlFor="nv-ai-task">
          What would you like help with?
        </label>

        <select
          id="nv-ai-task"
          value={task}
          onChange={(event) => setTask(event.target.value)}
        >
          <option value="analyze">Analyze in detail</option>
          <option value="summarize">Summarize</option>
          <option value="explain">Explain simply</option>
          <option value="key-points">Extract key points</option>
          <option value="quiz">Create a study quiz</option>
        </select>

        <label className="nv-ai-label" htmlFor="nv-ai-text">
          Your notes or text
        </label>

        <textarea
          id="nv-ai-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste notes, an article, an assignment, or any text you want to understand..."
          maxLength={20000}
          rows={6}
        />

        <div className="nv-ai-char-count">
          {text.length.toLocaleString()} / 20,000 characters
        </div>

        <label className="nv-ai-label" htmlFor="nv-ai-file">
          Or attach a PDF (optional)
        </label>

        <input
          id="nv-ai-file"
          className="nv-ai-file"
          type="file"
          accept="application/pdf,.pdf"
          onChange={chooseFile}
        />

        {file && (
          <div className="nv-ai-selected-file">
            <span>{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              aria-label="Remove PDF"
            >
              Remove
            </button>
          </div>
        )}

        <label className="nv-ai-label" htmlFor="nv-ai-question">
          Ask a specific question (optional)
        </label>

        <input
          id="nv-ai-question"
          className="nv-ai-question"
          type="text"
          maxLength={1000}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What are the most important concepts?"
        />

        <p className="nv-ai-privacy">
          Your supplied text or PDF is sent to Gemini to generate the answer.
          Avoid including passwords or sensitive personal information.
        </p>

        {error && (
          <div className="nv-ai-error" role="alert">
            {error}
          </div>
        )}

        <button
          className="nv-ai-submit"
          type="submit"
          disabled={loading || (!text.trim() && !file)}
        >
          {loading ? "Analyzing with Gemini..." : "Analyze with Gemini"}
        </button>
      </form>

      {answer && (
        <div className="nv-ai-answer" aria-live="polite">
          <div className="nv-ai-answer-heading">
            <h3>AI analysis</h3>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(answer)}
            >
              Copy answer
            </button>
          </div>

          <div className="nv-ai-answer-text">{answer}</div>
        </div>
      )}
    </section>
  );
};

export default AIStudyAssistant;
