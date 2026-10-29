import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowForward,
  MenuBook,
  School,
} from '@material-ui/icons';

import Author from '../../component/Author/Author.jsx';
import RenderPost from './center/RenderPost.js';
import Homeprofile from './left/Homeprofile.jsx';
import './Home.css';
import UploadNote from '../../component/uploadNote/UploadNote';
import Navbar from '../../component/Navbar';
import Footer from '../../component/footer/Footer';
import BuildConversation from '../../component/BuildConversation/BuildConversation';

// NEW: NoteVerse AI Study Assistant
import AIStudyAssistant from '../../component/AIStudyAssistant/AIStudyAssistant';

const Home = () => (
  <div className="nv-app-shell">
    <Navbar />

    <div className="home-container">
      <div className="main">

        {/* Left Sidebar */}
        <aside className="left-container">
          <div className="sidebar-upload">
            <UploadNote />
          </div>

          <Homeprofile />

          <div className="sidebar-promo">
            <div className="promo-icon">
              <School />
            </div>

            <h3>Learning looks better together.</h3>

            <p>
              Share your notes, discover fresh ideas, and help someone
              learn something new.
            </p>

            <Link to="/searchuser">
              Explore community <ArrowForward />
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="center-container">

          {/* Hero Banner */}
          <section className="nv-hero">
            <div className="hero-copy">
              <span className="hero-eyebrow">
                <MenuBook /> YOUR LEARNING COMMUNITY
              </span>

              <h1>
                Share knowledge,
                <br />
                build a <span>brighter tomorrow.</span>
              </h1>

              <p>
                Upload, explore, and discover notes from students and
                learners around the world.
              </p>

              <div className="hero-points">
                <span>
                  <MenuBook /> Helpful notes
                </span>

                <span>
                  <School /> Learn together
                </span>
              </div>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="hero-orbit orbit-one"></div>
              <div className="hero-orbit orbit-two"></div>

              <div className="hero-book book-back">✦</div>
              <div className="hero-book book-mid">Aa</div>

              <div className="hero-book book-front">
                <MenuBook />
              </div>

              <span className="hero-star star-one">✦</span>
              <span className="hero-star star-two">✧</span>
            </div>
          </section>

          {/* NEW: AI Study Assistant */}
          <section className="ai-study-section">
            <AIStudyAssistant />
          </section>

          {/* Featured Authors */}
          <section className="featured-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  MEET THE COMMUNITY
                </span>

                <h2>Featured authors</h2>
              </div>

              <Link to="/searchuser">
                Discover more <ArrowForward />
              </Link>
            </div>

            <Author />
          </section>

          {/* Recent Notes */}
          <section className="notes-section">
            <div className="section-heading notes-heading">
              <div>
                <span className="section-kicker">
                  FRESH FROM YOUR COMMUNITY
                </span>

                <h2>Recent notes</h2>
              </div>
            </div>

            <RenderPost />
          </section>

        </main>

        {/* Right Sidebar */}
        <aside className="right-container">
          <BuildConversation />
        </aside>

      </div>
    </div>

    <Footer />
  </div>
);

export default Home;