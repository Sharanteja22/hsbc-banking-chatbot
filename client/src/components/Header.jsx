import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaSignOutAlt } from 'react-icons/fa';
import { resetState } from '../redux/slice/userSlice';
import './Header.css'
function Header() {
  const { loginUserStatus } = useSelector(state => state.userLogin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = () => {
    dispatch(resetState());
    // localStorage.removeItem('token') is now handled in the userslice
    navigate('/login');
  };

  return (
    <Navbar className="header bg-dark" expand="lg" data-bs-theme="dark">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="nav-link text-white">
          HSBC Bank
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="nav-link text-white">Home</Nav.Link>
            {!loginUserStatus ? (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link text-white">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-link text-white">Register</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/chat" className="nav-link text-white">Chat</Nav.Link>
                <Nav.Link onClick={signOut} className="nav-link d-flex align-items-center text-white">
                  <FaSignOutAlt style={{ marginRight: '5px' }} />
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;