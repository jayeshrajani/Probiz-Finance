import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getApihandler } from "../components/api-handler";
import HeaderSec from "../components/common-component/HeaderSec";
import Footer from "../components/common-component/Footer";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

export default function PropertyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) getProperty();
  }, [id]);

  const getProperty = async () => {
    const res = await getApihandler(`getPropertyById/${id}`);
    // console.log("res",res);
    
    if (res.success === true) {
      setData(res.data);
    }
  };

  if (!data) return <div className="loading">Loading...</div>;

  return (
    <>
      <HeaderSec />
      <button
          className="text-black-600 hover:underline mt-8 ml-8 mb-4"
          onClick={() => router.back()}
        >
          ← Back
        </button>
      <div className="max-w-6xl mx-auto px-4 py-6">
        

       <div className="grid md:grid-cols-2 gap-6 bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Image Slider */}
      <Swiper
        navigation={true}
        modules={[Navigation]}
        className="w-full h-full"
      >
        {(Array.isArray(data.propertyImage) ? data.propertyImage : [data.propertyImage]).map((img, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={img}
              alt={`Property ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
         
      </Swiper>
 
      {/* Property Details */}
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">{data.propertyName}</h2>

        <div className="text-gray-700 space-y-1">
          <p><span className="font-medium">Property Type:</span> {data.propertyType} ({data.bhk_of_house})</p>
          {
           data.buildUpArea !== "0" ? "" : 
           <><p><span className="font-medium">Plot Area:</span> {data.plotArea} sq.ft.</p></>
           }
          {
           data.plotArea !== "0" ? "" : 
           <>
           <p><span className="font-medium">Build-up Area:</span> {data.buildUpArea} sq.ft.</p>
          <p><span className="font-medium">Carpet Area:</span> {data.carpetArea || "N/A"} sq.ft.</p>
          </>
          }
          <p><span className="font-medium">Price:</span> ₹ {data.price.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Address</div>
            <div>{data.address}</div>
            <div>{data.city}, {data.state}</div>
          </div>

          <div>
            <div className="font-medium">Facing</div>
            <div>{data.houseFacing}</div>
          </div>

          <div>
            <div className="font-medium">Furnishing</div>
            <div>{data.furnishingStatus}</div>
          </div>

          <div>
            <div className="font-medium">Bathrooms</div>
            <div>{data.bathrooms}</div>
          </div>

          <div>
            <div className="font-medium">Balconies</div>
            <div>{data.numberOfBalconies}</div>
          </div>

          <div>
            <div className="font-medium">Build-up Type</div>
            <div>{data.buildUp_type || "N/A"}</div>
          </div>

          <div>
            <div className="font-medium">Construction Year</div>
            <div>{data.construction_year}</div>
          </div>

          <div>
            <div className="font-medium">Created On</div>
            <div>{new Date(data.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="font-medium text-lg mb-1">Description</div>
          <p className="text-gray-600 text-sm">{data.description}</p>
        </div>

      
      </div>
      {/* Optional Video Link */}
        {data.propertyVideo && (
          <div className="mt-4">
            <div className="font-medium text-lg mb-1">Property Video</div>
            <video
              src={data.propertyVideo}
              controls
              className="w-full rounded-lg"
            />
          </div>
        )}
    </div>
      </div>
      <Footer />
    </>
  );
}
