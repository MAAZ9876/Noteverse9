
import React, { useState } from "react";
import "./BuildConversation.css";
import { useSelector } from "react-redux";
import { Search, People, Chat } from "@material-ui/icons";
import CircularLoader from "../CircularLoader";
import { publicRequest, errorMessage } from "../../requestMethods";
import SearchedUser from "../SearchedUser/SearchedUser";

const BuildConversation = () => {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [searchedItem, setSearchedItem] = useState("");
  const [users, setUsers] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const searchHandler = async (e) => {
    e.preventDefault();

    const query = searchedItem.trim();

    if (!query) {
      setUsers(null);
      setError("");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await publicRequest.get(
        "users/findusers/" + encodeURIComponent(query)
      );

      const fetchedUsers = Array.isArray(response.data)
        ? response.data
        : [];

      // Exclude the currently logged-in user.
      const otherUsers = fetchedUsers.filter(
        (person) => person._id !== currentUser?._id
      );

      setUsers(otherUsers);
    } catch (err) {
      console.error("User search failed:", err);
      setUsers([]);
      setError(
        errorMessage(err, "Could not search users. Please try again.")
      );
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchedItem("");
    setUsers(null);
    setError("");
  };

  return (
    <aside className="conversation-panel">
      <div className="conversation-header">
        <div className="conversation-header-icon">
          <Chat />
        </div>

        <div className="conversation-heading">
          <h2>Find people</h2>
          <p>Connect and start a conversation.</p>
        </div>
      </div>

      <form className="conversation-search" onSubmit={searchHandler}>
        <div className="conversation-search-field">
          <Search className="conversation-search-icon" />

          <input
            type="search"
            placeholder="Search by username..."
            aria-label="Search users"
            value={searchedItem}
            onChange={(e) => setSearchedItem(e.target.value)}
            required
          />

          {searchedItem && (
            <button
              type="button"
              className="conversation-clear-button"
              aria-label="Clear search"
              onClick={clearSearch}
            >
              &times;
            </button>
          )}
        </div>

        <button
          type="submit"
          className="conversation-search-button"
          disabled={isSearching || !searchedItem.trim()}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="conversation-results">
        <div className="conversation-results-heading">
          <span>
            {users === null ? "Discover people" : "Search results"}
          </span>

          {users !== null && (
            <span className="conversation-results-count">
              {users.length}
            </span>
          )}
        </div>

        {isSearching ? (
          <div className="conversation-state">
            <CircularLoader item="users" />
          </div>
        ) : error ? (
          <div className="conversation-empty">
            <p>{error}</p>
          </div>
        ) : users === null ? (
          <div className="conversation-empty">
            <div className="conversation-empty-icon">
              <People />
            </div>

            <h3>Find your people</h3>
            <p>
              Search for another NoteVerse user to start a conversation.
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="conversation-empty">
            <div className="conversation-empty-icon">
              <Search />
            </div>

            <h3>No users found</h3>
            <p>Try searching with a different username.</p>
          </div>
        ) : (
          <div className="conversation-user-list">
            {users.map((person) => (
              <SearchedUser
                key={person._id}
                receiverUser={person}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default BuildConversation;
