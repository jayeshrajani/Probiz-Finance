import React, { useState } from "react";
import { PostRequest } from "../api-handler";
import swal from "sweetalert";
import { useRouter } from "next/router";
export default function NewsLetter() {
   const router = useRouter();
  const [email, setEmail] = useState("");
  const AddNewsLetter = async () => {
    const data = {
      email: email,
    };
    const res = await PostRequest("addNewsLatters", data);
        setEmail("");
    if(res.message === "Email added successfully"){
   
            swal({
               icon: "success",
               text: "Email added successfully",
             }).then(() => {
               // Refresh the page after OK click
               router.reload();
             });
          
    }
   
  };
  return (
    <>
      <section className="bg-[#FFF1E4] py-16 mt-10">
        <h1 className="text-center font-[700] text-4xl text-[#343434]">
        Stay Financially Savvy
        </h1>
        <p className="text-[#716D6D] text-center font-[600] mt-4">
        Get expert tips and tools delivered to your inbox
        </p>
        <div className="text-center mt-10">
          <input
            type="email"
            value={email}
            placeholder="Your Email Address"
            className="py-2  w-96 md:mr-4 border border-[#CCCCCC]-600  rounded-md text-left px-5"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="bg-[#4C1F7A] text-white py-2 px-5 rounded-md "
            onClick={AddNewsLetter}
          >
            Subscribe
          </button>
        </div>
      </section>
    </>
  );
}
