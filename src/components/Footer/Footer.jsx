import React from 'react';
import { Globe, Film } from 'lucide-react';
import './Footer.scss';

export default function Footer() {
  return (
    <footer className="netflix-footer">
      <div className="footer-content">
        <div className="footer-top">
          <p className="footer-contact">Questions? Call 1-800-012-3456</p>
        </div>

        <div className="footer-links-grid">
          <ul>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#investor">Investor Relations</a></li>
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="#speed">Speed Test</a></li>
          </ul>
          <ul>
            <li><a href="#help">Help Center</a></li>
            <li><a href="#jobs">Jobs</a></li>
            <li><a href="#cookie">Cookie Preferences</a></li>
            <li><a href="#legal">Legal Notices</a></li>
          </ul>
          <ul>
            <li><a href="#account">Account</a></li>
            <li><a href="#ways">Ways to Watch</a></li>
            <li><a href="#corporate">Corporate Information</a></li>
            <li><a href="#only">Only on Netflix</a></li>
          </ul>
          <ul>
            <li><a href="#media">Media Center</a></li>
            <li><a href="#terms">Terms of Use</a></li>
            <li><a href="#contact">Contact Us</a></li>
            <li><a href="https://vsembed.su/vidsrc/docs/" target="_blank" rel="noreferrer">VidSrc API Docs</a></li>
          </ul>
        </div>

        <div className="footer-lang-button">
          <Globe size={16} />
          <span>English</span>
        </div>

        <div className="footer-bottom">
          <p className="copyright-text">KMOVIZ Cinema Engine — Ultra-Performance Streaming Platform powered by TMDB & VidSrc</p>
        </div>
      </div>
    </footer>
  );
}
