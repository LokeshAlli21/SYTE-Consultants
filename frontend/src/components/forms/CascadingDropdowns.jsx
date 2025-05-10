import React, { useState } from "react";
import data from "../../backend-services/database/districts_structure.json";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';

const CascadingDropdowns = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluka, setSelectedTaluka] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [pincode, setPincode] = useState("");

  const districtOptions = data.map(d => d.district);

  const talukaOptions = selectedDistrict
    ? data.find(d => d.district === selectedDistrict)?.talukas.map(t => t.taluka) || []
    : [];

  const cityOptions = selectedDistrict && selectedTaluka
    ? data.find(d => d.district === selectedDistrict)
        ?.talukas.find(t => t.taluka === selectedTaluka)
        ?.locations.map(l => l.city_village) || []
    : [];

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setSelectedTaluka("");
    setSelectedCity("");
    setPincode("");
  };

  const handleTalukaChange = (value) => {
    setSelectedTaluka(value);
    setSelectedCity("");
    setPincode("");
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    const selected = data.find(d => d.district === selectedDistrict)
      ?.talukas.find(t => t.taluka === selectedTaluka)
      ?.locations.find(l => l.city_village === value);
    setPincode(selected?.pincode || "");
  };

  return (
    <div className="grid gap-4 w-full max-w-md mx-auto py-8">
      <Select onValueChange={handleDistrictChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select District" />
        </SelectTrigger>
        <SelectContent>
          {districtOptions.map(d => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={handleTalukaChange} disabled={!selectedDistrict}>
        <SelectTrigger>
          <SelectValue placeholder="Select Taluka" />
        </SelectTrigger>
        <SelectContent>
          {talukaOptions.map(t => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={handleCityChange} disabled={!selectedTaluka}>
        <SelectTrigger>
          <SelectValue placeholder="Select City/Village" />
        </SelectTrigger>
        <SelectContent>
          {cityOptions.map(c => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {pincode && (
        <div className="text-center text-lg font-medium">Pincode: {pincode}</div>
      )}
    </div>
  );
};

export default CascadingDropdowns;