import React from "react";

export default function Heading() {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="heading_img">
          <img
            className="w-full"
            src="/images/pexels-pixabay.png"
            alt="Banner"
          />
        </div>
        <div className="heading_text">
          <h2 className="text-xl font-[700] mt-10">Seamless & Secure Transactions at Your Fingertips</h2>
          <p className="text-[#676767] text-base mt-8">
          Managing your finances has never been easier. With our hassle-free digital payment solutions, you can enjoy fast, secure, and convenient transactions anytime, anywhere. Say goodbye to long queues and paperwork—experience a smooth and effortless way to handle your payments.
          </p>
          <h2 className="text-xl font-[700] mt-10">Why Choose Us?</h2>

          <p className="text-[#676767] text-base mt-4">
          ✔ Fast & Secure – Advanced encryption ensures your transactions are always protected.
          </p>
          <p className="text-[#676767] text-base mt-8">
          ✔ Convenient Access – Make payments anytime, from anywhere in the world.
          </p>
          <p className="text-[#676767] text-base mt-8">
          ✔ Hassle-Free Process – Say goodbye to complex paperwork and enjoy seamless transactions.
          </p>
         
        </div>
      </div>
    </>
  );
}
