import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userLoginThunk } from '../redux/slice/userSlice';
import './Login.css'
function Login() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isPending, loginUserStatus, errMsg } = useSelector(state => state.userLogin);

  useEffect(() => {
    if (loginUserStatus) {
      navigate('/chat'); // Navigate to chat on successful login
    }
  }, [loginUserStatus, navigate]);

  function onSubmit(userCreds) {
    dispatch(userLoginThunk(userCreds));
  }

  return (
    <Container className="mt-5" style={{maxWidth: "500px"}}>
      <h2>Login</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3">
          <Form.Control type="text" placeholder="Username" {...register("username", { required: true })} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control type="password" placeholder="Password" {...register("password", { required: true })} />
        </Form.Group>
        <Button type="submit" className="w-100" disabled={isPending}>
          {isPending ? <Spinner size="sm" animation="border" /> : 'Login'}
        </Button>
        {errMsg && <p className="text-danger mt-3">{errMsg}</p>}
      </Form>
    </Container>
  );
}

export default Login;