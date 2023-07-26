import React from 'react';
import { Link } from 'react-router-dom';
import "../../assets/style/common/footer.scss";
import { BsDiscord } from "react-icons/bs";
import { AiFillTwitterCircle } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa"
const Footer = () => {
  return (
    <>
      <footer className='app_footer'>
        {/* <Container fluid> */}
        <div className='footer_text_wrap'>
          <ul>
            <li><Link to="https://www.hypr.network">Hypr</Link></li>
          </ul>
        </div>
        <div className='footer_icn_wrap'>
          <ul>
            <li><Link to="https://twitter.com/op_hypr"><AiFillTwitterCircle /></Link></li>
          </ul>
        </div>
        {/* </Container> */}
      </footer>
    </>
  )
}

export default Footer