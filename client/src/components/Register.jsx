import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css'
function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  async function registerUser(user) {
    try {
      // IMPORTANT: URL changed to your new FastAPI endpoint
      const res = await axios.post('http://127.0.0.1:8000/register', user);

      if (res.status === 201) { // Check for 201 Created status
        navigate('/login');
      } else {
        setErr(res.data.detail || "Registration failed");
      }
    } catch (error) {
      setErr(error.response?.data?.detail || "Something went wrong.");
    }
  }

  return (
    <Container className="mt-5" style={{maxWidth: "500px"}}>
      <h2>Register</h2>
      <Form onSubmit={handleSubmit(registerUser)}>
        <Form.Group className="mb-3">
          <Form.Control type="text" placeholder="Username" {...register("username", { required: true })} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control type="password" placeholder="Password" {...register("password", { required: true })} />
        </Form.Group>
        <Button type="submit" className="w-100">Register</Button>
        {err && <p className="text-danger mt-3">{err}</p>}
      </Form>
    </Container>
  );
}

export default Register;