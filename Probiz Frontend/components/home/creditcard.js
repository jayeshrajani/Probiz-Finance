import React from "react";

export default function CreditCard() {
  return (
    <>
      <section className="bg-[#FFF1E4] py-20">
        <h1 className="text-center text-3xl font-[700]">
        Swipe Like A Pro – Your Credit Card, Your Freedom!
        </h1>
        <p className="text-[#716D6D] text-center mt-4">
        Unlock a world of convenience and possibilities with your credit card. Whether you're saving, traveling, investing, or indulging in life's little luxuries, we've got you covered.
        </p>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="credit_card mt-8">
              <div>
                <img
                  className="w-full"
                  src="/images/creditcardimg1.png"
                  alt="creditcardimg"
                />
              </div>
              <div className="mt-5">
                <h3 className="text-[#363940] text-lg font-[600]">Smart Savings – Earn rewards while you spend and grow your financial future.</h3>
               
               
              </div>
            </div>
            <div className="credit_card mt-8">
              <div>
                <img
                  className="w-full"
                  src="/images/creditcardimg2.png"
                  alt="creditcardimg"
                />
              </div>
              <div className="flex justify-between mt-5">
                <h3 className="text-[#363940] text-lg font-[600]">Travel with Ease – Enjoy seamless transactions anywhere in the world.</h3>
                
              </div>
            </div>
            <div className="credit_card mt-8">
              <div>
                <img
                  className="w-full"
                  src="/images/creditcardimg3.png"
                  alt="creditcardimg"
                />
              </div>
              <div className="flex justify-between mt-5">
                <h3 className="text-[#363940] text-lg font-[600]">Secure & Reliable – Your money is protected with top-tier security features.</h3>
                
              </div>
            </div>
            <div className="credit_card mt-8">
              <div>
                <img
                  className="w-full"
                  src="/images/creditcardimg4.png"
                  alt="creditcardimg"
                />
              </div>
              <div className="flex justify-between mt-5">
                <h3 className="text-[#363940] text-lg font-[600]">Instant Access – From rides to dining, experience uninterrupted transactions.</h3>
               
              </div>
             
            </div>
           
          </div>
          <p className="text-[#716D6D] text-center mt-4">
              Take charge of your finances—Spend Smart, Live Better!
        </p>
        </div>
      </section>
    </>
  );
}
