import React from "react";
import { Link } from "react-router-dom";
import "../../assets/style/common/footer.scss";
import { BsDiscord } from "react-icons/bs";
import { AiFillTwitterCircle } from "react-icons/ai";
import logo from "../../assets/images/full_white_mixed.svg";
import jbc from "../../assets/images/jbc.png";
import { FaTelegram } from "react-icons/fa";
import { Image } from "react-bootstrap";
const Footer = () => {
  return (
    <>
      <footer className="app_footer">
        {/* <Container fluid> */}
        <div className="footer_text_wrap">
          <ul>
            <li>
              <Link to="https://jibchain.net">
                <Image src={jbc} alt="logo" width="50" fluid />
              </Link>
              {/* &nbsp; &nbsp;
              <Link to="https://www.hypr.network">
                <Image src={logo} alt="logo" width="50" fluid />
              </Link> */}
            </li>
          </ul>
        </div>
        <div className="footer_icn_wrap">
          <ul>
            {/* <li>
              <Link to="https://t.me/hyprnetwork">
                <FaTelegram />
              </Link>
            </li> */}
            <li>
              <Link to="https://twitter.com/jibchain">
                <AiFillTwitterCircle />
              </Link>
            </li>
          </ul>
        </div>
        {/* </Container> */}
      </footer>
    </>
  );
};

export default Footer;
