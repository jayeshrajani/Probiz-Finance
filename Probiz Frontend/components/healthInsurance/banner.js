import React from 'react'

export default function Healthbanner() {
  return (
    <div
    className="w-full h-[700px] bg-cover bg-center flex items-center justify-center mt-10"
    style={{
      backgroundImage: "url('/images/healthInsurance.jpg')", // Update your image path
    }}
  >
    <h1 className="text-black text-4xl md:text-6xl font-bold text-center drop-shadow-lg">
      Health Insurance Made Easy
    </h1>
  </div>
  )
}
 