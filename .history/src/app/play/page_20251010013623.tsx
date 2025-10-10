import React from 'react'

const page = () => {
      const userData = await getUserDat();
        console.log('USER in cors', userData);
  return (
    <div>page</div>
  )
}

export default page