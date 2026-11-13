import React from "react";

export default function BlogAssistance() {
  return (
    <>
      <section className="py-12">
        <div className="bg-[#219B9E] p-8 rounded-lg max-w-6xl mx-auto">
          <h2 className="text-white text-center text-2xl font-semibold mb-6">
            Need Loan Assistance?
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <input
              type="text"
              placeholder="Mobile Number"
              className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <select className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300">
              <option>Choose City</option>
              <option>City 1</option>
              <option>City 2</option>
              <option>City 3</option>
            </select>
            <select className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300">
              <option>Personal Loan</option>
              <option>Loan 1</option>
              <option>Loan 2</option>
            </select>
            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                className="bg-[#4C1F7A]
-700 text-white py-2 px-6 rounded hover:bg-purple-800 transition"
              >
                SUBMIT
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
