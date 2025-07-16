import Hero from '@/components/root/Hero'
import { createRole } from '@/lib/actions/role.actions'
import React from 'react'

const page = async() => {
  
  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden'>
      <Hero />
    </div>
  )
}

export default page
