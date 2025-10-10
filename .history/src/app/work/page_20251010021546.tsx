import { getUserData } from '@/actions/get-user-data';
import React from 'react'

const page = async() => {
      const userData = await getUserData();
        console.log('USER wor', userData);
  return (
    <div>page</div>
  )
}

export default page