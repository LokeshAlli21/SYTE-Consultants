import React, { useState, useEffect } from "react";
import FileInputWithPreview from "./FileInputWithPreview ";
import Select from "react-select";
import { IoClose } from "react-icons/io5";

const unitTypeOptions = [
  { value: "1 BHK", label: "1 BHK" },
  { value: "2 BHK", label: "2 BHK" },
  { value: "3 BHK", label: "3 BHK" },
  { value: "4 BHK", label: "4 BHK" },
  { value: "Duplex", label: "Duplex" },
  { value: "Office Space", label: "Office Space" },
  { value: "Other", label: "Other" },
  { value: "5 BHK", label: "5 BHK" },
  { value: "6 BHK", label: "6 BHK" },
  { value: "Bunglow", label: "Bunglow" },
  { value: "Shops", label: "Shops" },
  { value: "Showroom", label: "Showroom" },
  { value: "Hall", label: "Hall" },
  { value: "Amenity", label: "Amenity" },
  { value: "Multi Purpose Room", label: "Multi Purpose Room" },
  { value: "1 Room Kitchen", label: "1 Room Kitchen" },
  { value: "Row Houses", label: "Row Houses" },
];

const unitStatusOptions = [
  { value: "Sold", label: "Sold" },
  { value: "Unsold", label: "Unsold" },
  { value: "Booked", label: "Booked" },
  { value: "Mortgage", label: "Mortgage" },
  { value: "Reservation", label: "Reservation" },
  { value: "Rehab", label: "Rehab" },
  {
    value: "Land Owner/Investor Share (Not for Sale)",
    label: "Land Owner/Investor Share (Not for Sale)",
  },
  {
    value: "Land Owner/Investor Share (for Sale)",
    label: "Land Owner/Investor Share (for Sale)",
  },
];

function UnitDetailsForm({
  setIsDesabled,
  disabled = false,
  setIsUnitDetailsFormActive,
  formData,
  setFormData,
  handleSubmitProjectUnit,
  setCurrentUnitId,
  currentUnitId,
  handleUpdateProjectUnit,
}) {
  const [filePreviews, setFilePreviews] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle financial year input change (to handle received amounts for each year)
  const handleFyChange = (e, year) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [`received_fy_${year}`]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to submit?");
    if (confirmed) {
      if (currentUnitId) {
        handleUpdateProjectUnit(currentUnitId) && setCurrentUnitId(null);
      } else {
        handleSubmitProjectUnit();
      }
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({
          ...prev,
          [name]: { url: reader.result, type: file.type },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDelete = (name) => {
    setFormData((prev) => ({ ...prev, [name]: null }));

    setFilePreviews((prev) => {
      const updatedPreviews = { ...prev };
      delete updatedPreviews[name];
      return updatedPreviews;
    });
  };

  useEffect(() => {
    const uploadedUrls = {};

    Object.entries(formData || {}).forEach(([key, value]) => {
      if (
        typeof key === "string" &&
        key.endsWith("_uploaded_url") &&
        typeof value === "string" &&
        value.startsWith("http")
      ) {
        uploadedUrls[key] = value;
      }
    });

    // console.log("✅ Uploaded URLs:", uploadedUrls);

    if (Object.keys(uploadedUrls).length > 0) {
      setFilePreviews(uploadedUrls);
    }
  }, [formData]);

  useEffect(() => {
    const total =
      Number(formData.received_fy_2018_19 || 0) +
      Number(formData.received_fy_2019_20 || 0) +
      Number(formData.received_fy_2020_21 || 0) +
      Number(formData.received_fy_2021_22 || 0) +
      Number(formData.received_fy_2022_23 || 0) +
      Number(formData.received_fy_2023_24 || 0) +
      Number(formData.received_fy_2024_25 || 0) +
      Number(formData.received_fy_2025_26 || 0) +
      Number(formData.received_fy_2026_27 || 0) +
      Number(formData.received_fy_2027_28 || 0) +
      Number(formData.received_fy_2028_29 || 0) +
      Number(formData.received_fy_2029_30 || 0);

    const agreementValue = Number(formData.agreement_value || 0);

    setFormData((prev) => ({
      ...prev,
      total_received: total,
      balance_amount: agreementValue - total,
    }));
  }, [
    formData.received_fy_2018_19,
    formData.received_fy_2019_20,
    formData.received_fy_2020_21,
    formData.received_fy_2021_22,
    formData.received_fy_2022_23,
    formData.received_fy_2023_24,
    formData.received_fy_2024_25,
    formData.received_fy_2025_26,
    formData.received_fy_2026_27,
    formData.received_fy_2027_28,
    formData.received_fy_2028_29,
    formData.received_fy_2029_30,
    formData.agreement_value,
  ]);

  // Common input styles
  const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

  return (
<div className="fixed inset-0 bg-zinc-100 p-6 overflow-y-auto z-50">
  <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-0">
            <button
          onClick={() => {
                setIsUnitDetailsFormActive(false);
                setCurrentUnitId(null);
                setIsDesabled(false)
              }}
          className="fixed top-4 right-4 text-gray-600 hover:text-red-500 text-5xl"
          aria-label="Close"
        >
          <IoClose />
        </button>
        <div className="p-2 bg-[#5CAAAB] rounded-t-2xl  px-6">
          <h1 className="text-2xl  font-bold text-white">Add Unit Details</h1>
        </div>
        <form className=" p-8  space-y-6" onSubmit={handleSubmit}>
          {/* Unit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Unit Name</label>
              <input
                disabled={disabled}
                type="text"
                name="unit_name"
                value={formData.unit_name}
                onChange={handleChange}
                className={commonInputStyles}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Unit Type</label>
              <Select
                isDisabled={disabled}
                options={unitTypeOptions}
                value={unitTypeOptions.find(
                  (opt) => opt.value === formData.unit_type
                )}
                onChange={(selectedOption) =>
                  setFormData((prev) => ({
                    ...prev,
                    unit_type: selectedOption ? selectedOption.value : "",
                  }))
                }
                isSearchable={true}
                placeholder="Select Unit Type"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    padding: "6px",
                    borderRadius: "0.5rem",
                    borderColor: state.isFocused ? "#5caaab" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 2px #5caaab66" : "none",
                    "&:hover": {
                      borderColor: "#5caaab",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    zIndex: 20,
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#5caaab"
                      : state.isFocused
                      ? "#5caaab22"
                      : "white",
                    color: state.isSelected ? "white" : "black",
                    padding: "10px 12px",
                    cursor: "pointer",
                  }),
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Carpet Area</label>
              <input
                disabled={disabled}
                type="number"
                name="carpet_area"
          onWheel={(e) => e.target.blur()}
                value={formData.carpet_area || ""}
                onChange={handleChange}
                className={`${commonInputStyles} pr-10 appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none 
            [&::-webkit-outer-spin-button]:appearance-none 
            moz:appearance-none`}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Unit Status</label>
              <Select
                isDisabled={disabled}
                options={unitStatusOptions}
                value={unitStatusOptions.find(
                  (opt) => opt.value === formData.unit_status
                )}
                onChange={(selectedOption) =>
                  setFormData((prev) => ({
                    ...prev,
                    unit_status: selectedOption ? selectedOption.value : "",
                  }))
                }
                isSearchable={false}
                placeholder="Select Unit Status"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    padding: "6px",
                    borderRadius: "0.5rem",
                    borderColor: state.isFocused ? "#5caaab" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 2px #5caaab66" : "none",
                    "&:hover": {
                      borderColor: "#5caaab",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    zIndex: 20,
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#5caaab"
                      : state.isFocused
                      ? "#5caaab22"
                      : "white",
                    color: state.isSelected ? "white" : "black",
                    padding: "10px 12px",
                    cursor: "pointer",
                  }),
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Customer Name</label>
              <input
                disabled={disabled}
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className={commonInputStyles}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Agreement Value</label>
              <div className="relative">
                <input
                  disabled={disabled}
                  type="number"
          onWheel={(e) => e.target.blur()}
                  name="agreement_value"
                  value={formData.agreement_value || ""}
                  onChange={handleChange}
                  className={`${commonInputStyles} pr-10 appearance-none
                [&::-webkit-inner-spin-button]:appearance-none 
                [&::-webkit-outer-spin-button]:appearance-none 
                moz:appearance-none`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  ₹
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details in Table Format */}
          <div className="bg-white rounded-xl mt-[-10px]">
            <h2 className="text-xl font-bold text-[#4a9899] mb-4">
              Customer Payment Received
              {/* to increase financial years needs changes in database schema,  */}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-md">
                <thead className="bg-gray-100 border-gray-300 text-[#5caaab] font-semibold">
                  <tr>
                    <th className="border border-gray-300 p-2 text-center w-15">
                      Sr No
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Financial Year
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Received Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "2018_19",
                    "2019_20",
                    "2020_21",
                    "2021_22",
                    "2022_23",
                    "2023_24",
                    "2024_25",
                    "2025_26",
                    "2026_27",
                    "2027_28",
                    "2028_29",
                    "2029_30",
                  ].map((year, index) => (
                    <tr key={year} className="even:bg-gray-50">
                      <td className="border border-gray-300 p-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 p-2">
                        FY {year.replace("_", "-")}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="relative">
                          <input
                            disabled={disabled}
                            type="number"
          onWheel={(e) => e.target.blur()}
                            name={`received_fy_${year}`}
                            value={formData[`received_fy_${year}`] || ""}
                            onChange={(e) => handleFyChange(e, year)}
                            className={`${commonInputStyles} pr-10 appearance-none 
                              [&::-webkit-inner-spin-button]:appearance-none 
                              [&::-webkit-outer-spin-button]:appearance-none 
                              moz:appearance-none`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                            ₹
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Year Received Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Total Received</label>
              <div className="relative">
                <input
                  disabled={true}
                  type="number"
          onWheel={(e) => e.target.blur()}
                  name="total_received"
                  value={formData.total_received || ""}
                  onChange={handleChange}
                  className={`${commonInputStyles} pr-10 appearance-none
                [&::-webkit-inner-spin-button]:appearance-none 
                [&::-webkit-outer-spin-button]:appearance-none 
                moz:appearance-none`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  ₹
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Balance Amount</label>
              <div className="relative">
                <input
                  disabled={true}
                  type="number"
          onWheel={(e) => e.target.blur()}
                  name="balance_amount"
                  value={
                    formData.balance_amount >= 0 ? formData.balance_amount : 0
                  }
                  onChange={handleChange}
                  className={`${commonInputStyles} pr-10 appearance-none
                [&::-webkit-inner-spin-button]:appearance-none 
                [&::-webkit-outer-spin-button]:appearance-none 
                moz:appearance-none`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  ₹
                </span>
              </div>
            </div>
          </div>

          {/* uplods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileInputWithPreview
              label="Upload AFS (Agreement for Sale)"
              name="afs_uploaded_url"
              disabled={disabled}
              onChange={handleFileChange}
              filePreview={filePreviews.afs_uploaded_url}
              onDelete={() => handleFileDelete("afs_uploaded_url")}
            />
            <FileInputWithPreview
              label="Upload Sale Deed"
              name="sale_deed_uploaded_url"
              onChange={handleFileChange}
              disabled={disabled}
              filePreview={filePreviews.sale_deed_uploaded_url}
              onDelete={() => handleFileDelete("sale_deed_uploaded_url")}
            />

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Agreement for Sale Date</label>
              <input
                disabled={disabled}
                type="date"
                name="agreement_for_sale_date"
                value={formData.agreement_for_sale_date || ""}
                onChange={handleChange}
                className={commonInputStyles}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Sale Deed Date</label>
              <input
                disabled={disabled}
                type="date"
                name="sale_deed_date"
                value={formData.sale_deed_date || ""}
                onChange={handleChange}
                className={commonInputStyles}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
                        <button
              className="px-6 top-4 right-4 py-3 bg-red-400 hover:bg-red-500 border-0 shadow-lg text-white rounded-lg"
              onClick={() => {
                setIsUnitDetailsFormActive(false);
                setCurrentUnitId(null);
                setIsDesabled(false)
              }}
              type="button"
            >
              Close
            </button>
            {!disabled && (
              <button
                type="submit"
                className="px-6 py-3 bg-[#5CAAAB] text-white rounded-lg shadow-lg hover:bg-[#489496]"
              >
                Save
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UnitDetailsForm;