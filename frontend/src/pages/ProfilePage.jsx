import React from 'react'
import { useAuthStore } from '../store/useAuthStore';

const ProfilePage = () => {
  const { authUser } = useAuthStore();

  return (
    <div>ProfilePage</div>
  )
}

export default ProfilePage