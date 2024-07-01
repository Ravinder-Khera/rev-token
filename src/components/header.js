import React from "react";
import { ReactComponent as Logo } from "../assets/siteHeaderLogo.svg";
import { CiHamburgerMd, TelegramIcon, YoutubeIcon } from "../assets/svg";
import { ReactComponent as TwitterLogo } from "../assets/twitterRev.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConnectBtn } from "./connectButton";

function Header() {
  return (
    <header>
      <nav className="customContainer navbar navbar-expand-lg navbar-light bg-transparent">
        <div className="container-fluid">
          <a
            className="navbar-brand"
            target="_blank"
            rel="noreferrer"
            href="/"
          > 
            <Logo />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
             <span class="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 navBtns">
              {/* <li className="nav-item">
                                <button className="customOutlineBtn" onClick={(e) => { address ? logout() : connectMetamask(e) }}>{address ? address : "Metamask"}</button>
                            </li> */}
              <li className="nav-item">
                {/* <button className="customOutlineBtn">Connect Wallet</button> */}
                <ConnectBtn />
              </li>
            </ul>
            <div className="socialIcons d-lg-none">
              <a href="/#" target="_blank"><TelegramIcon /></a>
              <a href="/#" target="_blank"><YoutubeIcon /></a>
              <a href="/#" target="_blank"><TwitterLogo /></a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
