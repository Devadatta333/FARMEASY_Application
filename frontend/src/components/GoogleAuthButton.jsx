import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { googleAuth } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const GoogleAuthButton = ({ role = 'consumer', text = 'signin_with' }) => {
  const dispatch = useDispatch();

  const handleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      dispatch(googleAuth({ credential: credentialResponse.credential, role }))
        .unwrap()
        .then((res) => {
          toast.success(res.message || 'Google Authentication successful!');
        })
        .catch((err) => {
          toast.error(err || 'Google sign-in failed');
        });
    }
  };

  const handleError = () => {
    toast.error('Google Sign-In was cancelled or failed');
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={text}
        theme="outline"
        size="large"
        shape="pill"
        width="100%"
        useOneTap={false}
      />
    </div>
  );
};

export default GoogleAuthButton;
