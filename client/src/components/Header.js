import React from 'react';
import logo from '../assets/logo.svg';

function Header() {
  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h1 className="App-title">Welcome to Auto Comment Saver</h1>
    </header>
  );
}

Header.displayName = 'Header';

export default Header;
