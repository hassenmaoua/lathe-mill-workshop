import React from 'react';
import styles from './LoginForm.module.css';
import LOGO from '../assets/images/logo.png';
import Button from '../ui/buttons/Button';
import Input from '../ui/inputs/Input';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';
import { Link } from 'react-router-dom';
import Spinner from '../layout/Spinner';

function LoginForm() {
  const navigate = useNavigate();

  const { setAuth } = useAuth();

  const userRef = useRef();

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('jwt')) {
      try {
        const response = axios.post('/verify', {
          jwt: localStorage.getItem('jwt'),
        });
        if (response.status === 201) {
          navigate('/home', { replace: true });
        } else {
          localStorage.removeItem('jwt');
          setAuth({ isConnected: false, accessToken: '' });
        }
      } catch (err) {
        console.log(err?.response?.data);
      }
    }
    setError('');
  }, [user, password, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    const body = JSON.stringify({ email: user, password: password });

    try {
      setIsLoading(true);
      const response = await axios.post('/login', body);

      console.log(response?.data?.message);

      const isConnected = response.data.status;
      const accessToken = response.data.accessToken;

      localStorage.setItem('jwt', accessToken);

      setAuth({ isConnected, accessToken });

      setUser('');
      setPassword('');

      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response.data.message);
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading && (
        <>
          <Spinner />
          <div className={styles.backdrop} />
        </>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        <img src={LOGO} alt='Logo'></img>
        <h2>Connectez-vous</h2>
        <h3 className={styles.err}>{error}</h3>
        <Input
          id='email'
          label='Email'
          type='text'
          refc={userRef}
          onChange={(e) => {
            setUser(e.target.value);
          }}
          value={user}
        />

        <Input
          id='password'
          label='Mot de passe'
          type='password'
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          value={password}
        />

        <Input id='isStayConnected' label='Restez connecté' type='checkbox' />

        <Button x={'login'}>Login</Button>

        <Link to='/forgot'>Mot de passe Oublier?</Link>
      </form>
    </>
  );
}

export default LoginForm;
