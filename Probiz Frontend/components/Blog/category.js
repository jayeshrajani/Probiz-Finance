import React from "react";

export default function Category() {
  const categories = [
    { id: 1, name: "Home Loan Archive" },
    { id: 2, name: "Mutual Funds Archive" },
    { id: 3, name: "Personal Loan Archive" },
    { id: 4, name: "LAP Archive" },
    { id: 5, name: "CIBIL Archive" },
    { id: 6, name: "Financial News" },
    { id: 7, name: "Business Loan Archive" },
    { id: 8, name: "Media Coverage" },
    { id: 9, name: "Car Loan Archive" },
  ];
  return (
    <>
      <section className="py-12">
        <h2 className="text-center text-2xl font-semibold">Categories</h2>
        <p className="text-center text-gray-600 mt-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam, dapibus
          mattis vel feugiat erat tortor eleifend.
        </p>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center p-6 bg-white shadow rounded-lg"
              >
                <div
                  className="flex items-center justify-center w-20 h-20 bg-orange-500 text-white rounded-full text-2xl font-bold"
                  style={{
                    boxShadow: "0 0 10px 10px rgba(251, 114, 76, 0.2);",
                  }}
                >
                  {category.id}
                </div>
                <p className="mt-4 text-center font-medium">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
