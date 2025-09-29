import React from "react";

import LandingNavBar from "../Components/LandingNavBar";
import HowItWorks from "../../Shared/Components/HowItWorks";

function LandingPage() {
  return (
    <div className="font-sans text-gray-800">
      {/* Navbar */}
      <LandingNavBar />

      {/* Hero Section */}
      <section
  id="hero"
  className="relative min-h-screen flex items-center justify-center text-center"
  style={{
    backgroundImage: "url('/L1.png')", // <-- change to your image path
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* overlay */}
  <div className="absolute inset-0 "></div>

  {/* content */}
  <div className="relative z-10 max-w-6xl mx-auto px-4">
    <h2 className="text-6xl font-bold  text-[#1060F3]">
      Transparent Relief Distribution
    </h2>
    <p className="mt-4 text-xl  text-[#3D3D3D]">
      A public, tamper-proof record of aid distribution.
    </p>
    <div className="mt-6">
      <a
        href="/public"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        View Public Dashboard
      </a>
    </div>
  </div>
</section>

<section>
  <HowItWorks />
</section>


    </div>
  );
}

export default LandingPage;
