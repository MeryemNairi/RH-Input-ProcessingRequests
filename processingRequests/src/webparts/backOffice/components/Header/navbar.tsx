import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom'; 
import styles from './navbar.module.scss';



const Navbar: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  const toggleActiveClass = () => {
    setIsActive(!isActive);
  };

  const removeActive = () => {
    setIsActive(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav className={`${styles.navbar}`}>
          <Link to="/CnexiaForEveryone" className={`${styles.logo}`}>
          
            <svg width="172" height="40" viewBox="0 0 172 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M96.5175 21.3175V60H87.5555L70.5653 39.3893V60H59.8987V21.3175H68.8607L85.8509 41.9282V21.3175H96.5175Z" fill="#002920"/>
            <path d="M135.111 51.5465V60H104.214V21.3175H134.396V29.771H114.987V36.2906H132.084V44.4671H114.987V51.5409H135.111V51.5465Z" fill="#002920"/>
            <path d="M149.35 29.9972H137.53V21.3232H172V29.9972H160.236V60H149.35V29.9972Z" fill="#002920"/>
            <path d="M40.6077 7.37913L47.9494 0H56.2701C58.3123 0 59.9663 1.66243 59.9663 3.71501V12.078L52.5683 19.5137V9.68617C52.5683 8.40825 51.5331 7.37348 50.2617 7.37913H40.6077Z" fill="white"/>
            <path d="M24.6864 60C18.1266 60 11.9381 57.4102 7.25738 52.7057C2.57665 48.0011 0 41.7812 0 35.188C0 28.5949 2.57665 22.3749 7.25738 17.6704C11.9381 12.9658 18.1266 10.376 24.6864 10.376V20.7973C20.8945 20.7973 17.3108 22.3014 14.5879 25.0382C11.865 27.775 10.3685 31.3769 10.3685 35.188C10.3685 38.9992 11.865 42.6011 14.5879 45.3379C17.3108 48.0747 20.8945 49.5787 24.6864 49.5787C28.4782 49.5787 32.0619 48.0747 34.7848 45.3379C37.5077 42.6011 39.0042 38.9992 39.0042 35.188H49.3727C49.3727 41.7812 46.7961 48.0011 42.1153 52.7057C37.4346 57.4102 31.2461 60 24.6864 60Z" fill="#002920"/>
            </svg>
          </Link>
          <ul className={`${styles.navMenu} ${isActive ? styles.active : ''}`}>
            <li onClick={removeActive}>
              <Link to="/CnexiaForEveryone/people-culture" className={`${styles.navLink}`}>
                People & Culture
              </Link>
            </li>
            <li onClick={removeActive}>
              <Link to="/CnexiaForEveryone/career" className={`${styles.navLink}`}>
                Career
              </Link>
            </li>
            <li onClick={removeActive}>
              <Link to="/CnexiaForEveryone/communication" className={`${styles.navLink}`}>
                Communication
              </Link>
            </li>
            <li onClick={removeActive}>
              <Link to="/CnexiaForEveryone/support" className={`${styles.navLink}`}>
                Support
              </Link>
            </li>
          </ul>
          <div
            className={`${styles.hamburger} ${isActive ? styles.active : ''}`}
            onClick={toggleActiveClass}
          >
            <span className={`${styles.bar}`}></span>
            <span className={`${styles.bar}`}></span>
            <span className={`${styles.bar}`}></span>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
