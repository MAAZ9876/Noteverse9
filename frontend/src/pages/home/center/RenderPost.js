import React, { useState, useEffect } from "react";
import HomePost from "./Homepost.js";
import styled from "styled-components";
import { Search, ArrowForward, Close } from "@material-ui/icons";
import { search } from "../../../redux/userRedux";
import { useSelector, useDispatch } from "react-redux";
import { mobile } from "../../../responsive";
import CircularLoader from "../../../component/CircularLoader";
import { publicRequest, errorMessage } from "../../../requestMethods";

/* Main feed container */
const Container = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

/* Search section */
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  margin: 4px 0 22px;

  ${mobile({
    marginTop: "8px",
    marginBottom: "16px",
  })}
`;

const SearchContainer = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 560px;
  min-width: 0;
  padding: 6px 8px 6px 16px;
  box-sizing: border-box;

  background: #ffffff;
  border: 1px solid #e0e7ff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(49, 95, 232, 0.06);

  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: #91aaff;
    box-shadow: 0 0 0 3px rgba(75, 112, 245, 0.1);
  }

  ${mobile({
    maxWidth: "100%",
    padding: "5px 6px 5px 12px",
    borderRadius: "12px",
  })}
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 42px;
  padding: 5px 0;

  color: #172554;
  background: transparent;
  border: none;
  outline: none;

  font-family: inherit;
  font-size: 15px;

  &::placeholder {
    color: #929db5;
  }

  ${mobile({
    height: "38px",
    fontSize: "14px",
  })}
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 40px;
  height: 40px;
  padding: 0;

  color: #ffffff;
  background: #315fe8;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #244dcc;
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 3px solid #b9ccff;
    outline-offset: 2px;
  }

  ${mobile({
    width: "36px",
    height: "36px",
    borderRadius: "9px",
  })}
`;

const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  min-height: 38px;
  padding: 8px 12px;

  color: #315fe8;
  background: #edf1ff;
  border: 1px solid #dce5ff;
  border-radius: 10px;

  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #dfe7ff;
  }
`;

/* Show more button */
const ShowmoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  min-height: 46px;
  margin: 8px auto 20px;
  padding: 12px 24px;

  color: #ffffff;
  background: #315fe8;
  border: none;
  border-radius: 12px;

  font-family: inherit;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;

  box-shadow: 0 5px 14px rgba(49, 95, 232, 0.15);
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #244dcc;
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid #b9ccff;
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 24px 18px;
  margin: 8px 0;

  text-align: center;
  color: #53627e;
  background: #ffffff;
  border: 1px solid #e3e9ff;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.6;
`;

const ErrorMessage = styled(Message)`
  color: #9f3144;
  background: #fff5f7;
  border-color: #f4d6df;
`;

const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  min-width: 0;
`;

const RenderPost = () => {
  const { searchedValue } = useSelector((state) => state.user);
  const [notes, setnotes] = useState([]);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState(null);
  const [postcount, setpostcount] = useState(5);
  const [searchedItem, setsearchedItem] = useState(searchedValue || "");
  const dispatch = useDispatch();

  useEffect(() => {
    setsearchedItem(searchedValue || "");
  }, [searchedValue]);

  useEffect(() => {
    let cancelled = false;

    const fetchallnotes = async () => {
      setloading(true);

      try {
        const res = searchedValue
          ? await publicRequest.get(
              "notes/findnotes/" + encodeURIComponent(searchedValue)
            )
          : await publicRequest.get(`notes/?count=${postcount}`);

        if (!cancelled) {
          setnotes(res.data);
          seterror(null);
        }
      } catch (err) {
        if (!cancelled) {
          seterror(errorMessage(err, "Could not load notes"));
        }
      } finally {
        if (!cancelled) {
          setloading(false);
        }
      }
    };

    fetchallnotes();

    return () => {
      cancelled = true;
    };
  }, [searchedValue, postcount]);

  const searchHandler = (e) => {
    e.preventDefault();
    setpostcount(5);
    dispatch(search(searchedItem.trim() || null));
  };

  const clearSearch = () => {
    setsearchedItem("");
    setpostcount(5);
    dispatch(search(null));
  };

  return (
    <Container>
      <Wrapper>
        <SearchContainer onSubmit={searchHandler}>
          <Input
            placeholder="Search notes..."
            aria-label="Search notes"
            value={searchedItem}
            onChange={(e) => setsearchedItem(e.target.value)}
          />

          <SearchButton type="submit" aria-label="Search">
            <Search style={{ fontSize: 22, color: "#ffffff" }} />
          </SearchButton>
        </SearchContainer>

        {searchedValue && (
          <ClearButton type="button" onClick={clearSearch}>
            <Close style={{ fontSize: 16 }} />
            Clear search
          </ClearButton>
        )}
      </Wrapper>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading && notes.length === 0 && !error ? (
        <CircularLoader item={"notes"} />
      ) : !error && notes.length === 0 ? (
        <Message>
          {searchedValue
            ? "No matching notes found. Try another search."
            : "No notes yet — upload the first one!"}
        </Message>
      ) : (
        <FeedList>
          {notes.map((p) => (
            <HomePost x={p} key={p._id} />
          ))}
        </FeedList>
      )}

      {!searchedValue && notes.length >= postcount && !error && (
        <ShowmoreButton
          type="button"
          disabled={loading}
          onClick={() => setpostcount((count) => count + 5)}
        >
          {loading ? "Loading..." : "Show More"}
          {!loading && <ArrowForward style={{ fontSize: 18 }} />}
        </ShowmoreButton>
      )}
    </Container>
  );
};

export default RenderPost;