import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import PromotersPage from '../pages/PromotersPage';

function Promoters() {

  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };


const handleBack = () => {
  if (currentStep === 1) {
    navigate(-1); // or any route you want
  } else {
    setCurrentStep((prev) => prev - 1);
  }
};


  return (
    <div className="min-h-screen bg-[#F4F6FF] font-inter">
    <PromotersPage />
  </div>
  )
}

export default Promoters