import React, { useEffect, useRef, useState } from "react";
import FileInputWithPreview from "./FileInputWithPreview ";
import databaseService from "../../backend-services/database/database";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import Select from "react-select";
import {
  Individual,
  Partnership,
  Company,
  HinduUndividedFamily,
  Proprietor,
  LimitedLiabilityPartnership,
  Trust,
  Society,
  PublicAuthority,
  AopBoi,
  JointVenture,
  Others,
} from "./promoter-form-components/index.js";

import { validateFormData } from "./promoter-form-components/validateFormData.jsx";

const PromoterForm = ({ id, disabled }) => {
  const selectRef = useRef(null);

  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    promoter_name: "", // from promoters table (not shown but assumed)
    contact_number: "",
    email_id: "",
    district: "",
    city: "",
    promoter_type: "", // e.g., 'individual', 'company', etc.
    promoter_photo_uploaded_url: "",
    office_address: "",
    contact_person_name: "",
  });

  const [individualTypeForm, setIndividualTypeForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    father_full_name: "",
    dob: "",
    aadhar_number: "",
    aadhar_uploaded_url: "",
    pan_number: "",
    pan_uploaded_url: "",
    gstin_number: "",
    individual_disclosure_of_interest: false,
  });
  const [hinduUndividedFamilyForm, setHinduUndividedFamilyForm] = useState({
    huf_name: "",
    karta_first_name: "",
    karta_middle_name: "",
    karta_last_name: "",
    karta_pan_card: "",
    karta_pan_uploaded_url: "",
    huf_pan_card: "",
    huf_pan_pan_uploaded_url: "",
    huf_gstin_number: "",
  });
  const [proprietorForm, setProprietorForm] = useState({
    proprietor_concern_name: "",
    proprietor_first_name: "",
    proprietor_middle_name: "",
    proprietor_last_name: "",
    proprietor_pan_number: "",
    pan_uploaded_url: "",
    proprietor_father_full_name: "",
    proprietor_gstin_number: "",
    proprietor_disclosure_of_interest: false,
  });
  const [companyForm, setCompanyForm] = useState({
    company_name: "",
    company_pan_number: "",
    company_pan_uploaded_url: "",
    company_cin_number: "",
    company_gstin_number: "",
    company_incorporation_number: "",
    company_incorporation_uploaded_url: "",
  });
  const [partnershipForm, setPartnershipForm] = useState({
    partnership_name: "",
    partnership_pan_number: "",
    partnership_pan_uploaded_url: "",
    partnership_gstin_number: "",
  });
  const [llpForm, setLlpForm] = useState({
    llp_name: "",
    llp_pan_number: "",
    llp_pan_uploaded_url: "",
    llp_gstin_number: "",
    llp_llpin_number: "",
  });
  const [trustForm, setTrustForm] = useState({
    trust_name: "",
    trust_registration_number: "",
    trust_pan_number: "",
    trust_pan_uploaded_url: "",
    trust_gstin_number: "",
  });
  const [societyForm, setSocietyForm] = useState({
    society_name: "",
    society_registration_number: "",
    society_pan_number: "",
    society_pan_uploaded_url: "",
    society_gstin_number: "",
  });
  const [publicAuthorityForm, setPublicAuthorityForm] = useState({
    public_authority_name: "",
    public_authority_pan_number: "",
    public_authority_pan_uploaded_url: "",
    public_authority_gstin_number: "",
  });
  const [aopBoiForm, setAopBoiForm] = useState({
    aop_boi_name: "",
    aop_boi_gstin_number: "",
    aop_boi_pan_number: "",
    aop_boi_pan_uploaded_url: "",
    aop_boi_deed_of_formation_uploaded_url: "",
  });
  const [jointVentureForm, setJointVentureForm] = useState({
    joint_venture_name: "",
    joint_venture_no_of_entities_involved: "",
    joint_venture_pan_number: "",
    joint_venture_pan_uploaded_url: "",
    joint_venture_gstin_number: "",
    joint_venture_deed_of_formation_uploaded_url: "",
  });

  const [othersForm, setOthersForm] = useState({});

  const [filePreviews, setFilePreviews] = useState({});

  const [districtCityMap, setDistrictCityMap] = useState({})

  // Fetch cities and districts on component mount
  useEffect(() => {
    async function fetchCitiesAndDistricts() {
      try {
        const {districtOptions, districtCityMap } =
          await databaseService.getAllCitiesAndDistricts(); // Make sure this returns data
        setDistrictCityMap(districtCityMap)
        setDistrictOptions(districtOptions);
      } catch (error) {
        console.error("Error fetching cities and districts:", error);
      }
    }

    fetchCitiesAndDistricts();
  }, []);

    useEffect(() => {
    if (formData.district) {
      setCityOptions(districtCityMap[formData.district] || []);
      // console.log(districtCityMap[formData.district]|| []);
      
    }
  }, [formData.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.promoter_type) {
    toast.error("⚠️ Please select promoter type");
    return;
  }

  const confirmed = window.confirm(
    id
      ? "Do you want to update this promoter?"
      : "Do you want to create a new promoter?"
  );
  if (!confirmed) return;

  setLoading(true);

  // Choose correct formData based on promoter type
  let typeFormData = null;
  switch (formData.promoter_type) {
    case "individual":
      typeFormData = individualTypeForm;
      break;
    case "hindu_undivided_family":
      typeFormData = hinduUndividedFamilyForm;
      break;
    case "proprietor":
      typeFormData = proprietorForm;
      break;
    case "company":
      typeFormData = companyForm;
      break;
    case "partnership":
      typeFormData = partnershipForm;
      break;
    case "limited_liability_partnership":
      typeFormData = llpForm;
      break;
    case "trust":
      typeFormData = trustForm;
      break;
    case "society":
      typeFormData = societyForm;
      break;
    case "public_authority":
      typeFormData = publicAuthorityForm;
      break;
    case "aop_boi":
      typeFormData = aopBoiForm;
      break;
    case "joint_venture":
      typeFormData = jointVentureForm;
      break;
    case "others":
      typeFormData = othersForm;
      break;
    default:
      toast.error("⚠️ Unknown promoter type");
      setLoading(false);
      return;
  }

  // Run validations
  const isCommonValid = validateFormData(formData);
  const isTypeValid = validateFormData(typeFormData);

  if (!isCommonValid || !isTypeValid) {
    setLoading(false);
    return;
  }

  try {
    let response;

    if (id) {
      response = await databaseService.updatePromoter(id, {
        commonData: formData,
        formData: typeFormData,
        promoterType: formData.promoter_type,
      });
      console.log("✅ Promoter updated:", response);
      toast.success("✅ Promoter updated successfully!");
    } else {
      response = await databaseService.uploadPromoterData({
        commonData: formData,
        formData: typeFormData,
        promoterType: formData.promoter_type,
      });
      console.log("✅ Promoter created:", response);
      toast.success("✅ Promoter created successfully!");
    }

    navigate("/promoters");
  } catch (error) {
    console.error("❌ Error handling Promoter:", error);
    toast.error(`❌ Failed to handle Promoter: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // If the currently focused element is react-select and menu is not open
      if (
        document.activeElement === selectRef.current?.inputRef &&
        !selectRef.current?.state?.menuIsOpen
      ) {
        e.preventDefault(); // prevent accidental form submit
        return;
      }

      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1]?.focus();
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
    const fetchPromoterData = async () => {
      if (!id) return;

      try {
const response = await databaseService.getPromoterDetailsById(id);
console.log("✅ Promoter Response:", response);

// Set formData (common data)
setFormData({
  promoter_name: response.promoter_name || "",
  contact_number: response.contact_number || "",
  email_id: response.email_id || "",
  district: response.district || "",
  city: response.city || "",
  promoter_type: response.promoter_type || "",
  promoter_photo_uploaded_url: response.promoter_details?.promoter_photo_uploaded_url || "",
  office_address: response.promoter_details?.office_address || "",
  contact_person_name: response.promoter_details?.contact_person_name || "",
});

// Set promoter-type-specific form
const promoterDetails = response.promoter_details || {};
const promoterType = response.promoter_type;

switch (promoterType) {
  case "individual":
    setIndividualTypeForm({
      first_name: promoterDetails.individual?.first_name || "",
      middle_name: promoterDetails.individual?.middle_name || "",
      last_name: promoterDetails.individual?.last_name || "",
      father_full_name: promoterDetails.individual?.father_full_name || "",
      dob: promoterDetails.individual?.dob || "",
      aadhar_number: promoterDetails.individual?.aadhar_number || "",
      aadhar_uploaded_url: promoterDetails.individual?.aadhar_uploaded_url || "",
      pan_number: promoterDetails.individual?.pan_number || "",
      pan_uploaded_url: promoterDetails.individual?.pan_uploaded_url || "",
      gstin_number: promoterDetails.individual?.gstin_number || "",
      individual_disclosure_of_interest: promoterDetails.individual?.individual_disclosure_of_interest || false,
    });
    break;

  case "hindu_undivided_family":
    setHinduUndividedFamilyForm({
      huf_name: promoterDetails.hindu_undivided_family?.huf_name || "",
      karta_first_name: promoterDetails.hindu_undivided_family?.karta_first_name || "",
      karta_middle_name: promoterDetails.hindu_undivided_family?.karta_middle_name || "",
      karta_last_name: promoterDetails.hindu_undivided_family?.karta_last_name || "",
      karta_pan_card: promoterDetails.hindu_undivided_family?.karta_pan_card || "",
      karta_pan_uploaded_url: promoterDetails.hindu_undivided_family?.karta_pan_uploaded_url || "",
      huf_pan_card: promoterDetails.hindu_undivided_family?.huf_pan_card || "",
      huf_pan_pan_uploaded_url: promoterDetails.hindu_undivided_family?.huf_pan_pan_uploaded_url || "",
      huf_gstin_number: promoterDetails.hindu_undivided_family?.huf_gstin_number || "",
    });
    break;

  case "proprietor":
    setProprietorForm({
      proprietor_concern_name: promoterDetails.proprietor?.proprietor_concern_name || "",
      proprietor_first_name: promoterDetails.proprietor?.proprietor_first_name || "",
      proprietor_middle_name: promoterDetails.proprietor?.proprietor_middle_name || "",
      proprietor_last_name: promoterDetails.proprietor?.proprietor_last_name || "",
      proprietor_pan_number: promoterDetails.proprietor?.proprietor_pan_number || "",
      pan_uploaded_url: promoterDetails.proprietor?.pan_uploaded_url || "",
      proprietor_father_full_name: promoterDetails.proprietor?.proprietor_father_full_name || "",
      proprietor_gstin_number: promoterDetails.proprietor?.proprietor_gstin_number || "",
      proprietor_disclosure_of_interest: promoterDetails.proprietor?.proprietor_disclosure_of_interest || false,
    });
    break;

  case "company":
    setCompanyForm({
      company_name: promoterDetails.company?.company_name || "",
      company_pan_number: promoterDetails.company?.company_pan_number || "",
      company_pan_uploaded_url: promoterDetails.company?.company_pan_uploaded_url || "",
      company_cin_number: promoterDetails.company?.company_cin_number || "",
      company_gstin_number: promoterDetails.company?.company_gstin_number || "",
      company_incorporation_number: promoterDetails.company?.company_incorporation_number || "",
      company_incorporation_uploaded_url: promoterDetails.company?.company_incorporation_uploaded_url || "",
    });
    break;

  case "partnership":
    setPartnershipForm({
      partnership_name: promoterDetails.partnership?.partnership_name || "",
      partnership_pan_number: promoterDetails.partnership?.partnership_pan_number || "",
      partnership_pan_uploaded_url: promoterDetails.partnership?.partnership_pan_uploaded_url || "",
      partnership_gstin_number: promoterDetails.partnership?.partnership_gstin_number || "",
    });
    break;

  case "llp":
    setLlpForm({
      llp_name: promoterDetails.llp?.llp_name || "",
      llp_pan_number: promoterDetails.llp?.llp_pan_number || "",
      llp_pan_uploaded_url: promoterDetails.llp?.llp_pan_uploaded_url || "",
      llp_gstin_number: promoterDetails.llp?.llp_gstin_number || "",
      llp_llpin_number: promoterDetails.llp?.llp_llpin_number || "",
    });
    break;

  case "trust":
    setTrustForm({
      trust_name: promoterDetails.trust?.trust_name || "",
      trust_registration_number: promoterDetails.trust?.trust_registration_number || "",
      trust_pan_number: promoterDetails.trust?.trust_pan_number || "",
      trust_pan_uploaded_url: promoterDetails.trust?.trust_pan_uploaded_url || "",
      trust_gstin_number: promoterDetails.trust?.trust_gstin_number || "",
    });
    break;

  case "society":
    setSocietyForm({
      society_name: promoterDetails.society?.society_name || "",
      society_registration_number: promoterDetails.society?.society_registration_number || "",
      society_pan_number: promoterDetails.society?.society_pan_number || "",
      society_pan_uploaded_url: promoterDetails.society?.society_pan_uploaded_url || "",
      society_gstin_number: promoterDetails.society?.society_gstin_number || "",
    });
    break;

  case "public_authority":
    setPublicAuthorityForm({
      public_authority_name: promoterDetails.public_authority?.public_authority_name || "",
      public_authority_pan_number: promoterDetails.public_authority?.public_authority_pan_number || "",
      public_authority_pan_uploaded_url: promoterDetails.public_authority?.public_authority_pan_uploaded_url || "",
      public_authority_gstin_number: promoterDetails.public_authority?.public_authority_gstin_number || "",
    });
    break;

  case "aop_boi":
    setAopBoiForm({
      aop_boi_name: promoterDetails.aop_boi?.aop_boi_name || "",
      aop_boi_gstin_number: promoterDetails.aop_boi?.aop_boi_gstin_number || "",
      aop_boi_pan_number: promoterDetails.aop_boi?.aop_boi_pan_number || "",
      aop_boi_pan_uploaded_url: promoterDetails.aop_boi?.aop_boi_pan_uploaded_url || "",
      aop_boi_deed_of_formation_uploaded_url: promoterDetails.aop_boi?.aop_boi_deed_of_formation_uploaded_url || "",
    });
    break;

  case "joint_venture":
    setJointVentureForm({
      joint_venture_name: promoterDetails.joint_venture?.joint_venture_name || "",
      joint_venture_no_of_entities_involved: promoterDetails.joint_venture?.joint_venture_no_of_entities_involved || "",
      joint_venture_pan_number: promoterDetails.joint_venture?.joint_venture_pan_number || "",
      joint_venture_pan_uploaded_url: promoterDetails.joint_venture?.joint_venture_pan_uploaded_url || "",
      joint_venture_gstin_number: promoterDetails.joint_venture?.joint_venture_gstin_number || "",
      joint_venture_deed_of_formation_uploaded_url: promoterDetails.joint_venture?.joint_venture_deed_of_formation_uploaded_url || "",
    });
    break;

  default:
    console.warn("Unknown promoter type:", promoterType);
}

        const uploadedUrls = {};

            Object.entries(response.promoter_details || {}).forEach(([key, value]) => {
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

        toast.success("✅ Promoter details loaded successfully!");
      } catch (error) {
        console.error("❌ Error fetching promoter data:", error);
        toast.error(`❌ Failed to load promoter data: ${error.message}`);
      }
    };

    fetchPromoterData();
  }, [id]);

  const commonInputClass =
    "border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] focus:border-[#5CAAAB] focus:outline-none transition ease-in-out duration-150 ";
  const renderConditionalFields = () => {
    const PromoterTypeComponentMap = {
      individual: {
        component: Individual,
        formObject: individualTypeForm,
        setObjData: setIndividualTypeForm,
      },
      hindu_undivided_family: {
        component: HinduUndividedFamily,
        formObject: hinduUndividedFamilyForm,
        setObjData: setHinduUndividedFamilyForm,
      },
      proprietor: {
        component: Proprietor,
        formObject: proprietorForm,
        setObjData: setProprietorForm,
      },
      company: {
        component: Company,
        formObject: companyForm,
        setObjData: setCompanyForm,
      },
      partnership: {
        component: Partnership,
        formObject: partnershipForm,
        setObjData: setPartnershipForm,
      },
      limited_liability_partnership: {
        component: LimitedLiabilityPartnership,
        formObject: llpForm,
        setObjData: setLlpForm,
      },
      trust: {
        component: Trust,
        formObject: trustForm,
        setObjData: setTrustForm,
      },
      society: {
        component: Society,
        formObject: societyForm,
        setObjData: setSocietyForm,
      },
      public_authority: {
        component: PublicAuthority,
        formObject: publicAuthorityForm,
        setObjData: setPublicAuthorityForm,
      },
      aop_boi: {
        component: AopBoi,
        formObject: aopBoiForm,
        setObjData: setAopBoiForm,
      },
      joint_venture: {
        component: JointVenture,
        formObject: jointVentureForm,
        setObjData: setJointVentureForm,
      },
      others: {
        component: Others,
        formObject: othersForm,
      },
    };

    const mapEntry = PromoterTypeComponentMap[formData.promoter_type];
    if (!mapEntry) return null;

    const { component: SelectedComponent, formObject, setObjData } = mapEntry;

    return (
      <SelectedComponent
        formData={formObject}
        setFormData={setObjData}
        disabled={disabled}
        commonInputClass={commonInputClass}
      />
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8"
    >
      {loading ? (
        <div className="fixed inset-0 min-h-screen bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="flex items-center space-x-2 text-white">
            <FaSpinner className="animate-spin text-4xl" />
            <span className="text-xl">Submitting...</span>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-[#5CAAAB] text-center mb-6">
            Promoter Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Common Fields */}

            <FileInputWithPreview
              label="Upload Photo"
              name="promoter_photo_uploaded_url"
              onChange={handleFileChange}
              disabled={disabled}
              className={' w-[150px] h-[150px]'}
              filePreview={filePreviews.promoter_photo_uploaded_url}
              onDelete={() => handleFileDelete("promoter_photo_uploaded_url")}
            />

<div className=" lg:col-span-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="flex flex-col w-full">
              <label className="mb-2 font-medium text-gray-700">
                Promoter Type *
              </label>
              <Select
                options={[
                  { label: "Individual", value: "individual" },
                  {
                    label: "Hindu Undivided Family",
                    value: "hindu_undivided_family",
                  },
                  { label: "Proprietor", value: "proprietor" },
                  { label: "Company", value: "company" },
                  { label: "Partnership", value: "partnership" },
                  {
                    label: "Limited Liability Partnership",
                    value: "limited_liability_partnership",
                  },
                  { label: "Trust", value: "trust" },
                  { label: "Society", value: "society" },
                  { label: "Public Authority", value: "public_authority" },
                  { label: "AOP/BOI", value: "aop_boi" },
                  { label: "Joint Venture", value: "joint_venture" },
                  // { label: "Others", value: "others" },
                ]}
                value={{
                  label:
                    formData.promoter_type === "individual"
                      ? "Individual"
                      : formData.promoter_type === "hindu_undivided_family"
                      ? "Hindu Undivided Family"
                      : formData.promoter_type === "proprietor"
                      ? "Proprietor"
                      : formData.promoter_type === "company"
                      ? "Company"
                      : formData.promoter_type === "partnership"
                      ? "Partnership"
                      : formData.promoter_type ===
                        "limited_liability_partnership"
                      ? "Limited Liability Partnership"
                      : formData.promoter_type === "trust"
                      ? "Trust"
                      : formData.promoter_type === "society"
                      ? "Society"
                      : formData.promoter_type === "public_authority"
                      ? "Public Authority"
                      : formData.promoter_type === "aop_boi"
                      ? "AOP/BOI"
                      : formData.promoter_type === "joint_venture"
                      ? "Joint Venture"
                      : formData.promoter_type === "others"
                      ? "Others"
                      : "",
                  value: formData.promoter_type,
                }}
                required={true}
                isDisabled={disabled}
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev,
                    promoter_type: selectedOption ? selectedOption.value : "",
                  }));
                }}
                isSearchable={true}
                placeholder="Select Promoter Type"
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

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-semibold text-sm mb-1">
                Promoter Name *
              </label>
              <input
                type="text"
                name="promoter_name"
                value={formData.promoter_name}
                onChange={handleChange}
                disabled={disabled}
                placeholder="Enter Name"
                onKeyDown={handleKeyDown}
                required
                className={commonInputClass}
              />
            </div>

            <div className="flex col-span-2 flex-col gap-2">
              <label className="text-gray-700 font-semibold text-sm mb-1">
                Office Address
              </label>
              <input
                type="text"
                name="office_address"
                value={formData.office_address || ""}
                onChange={handleChange}
                disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>

</div>

          </div>

            {/* Conditional Fields */}
            {renderConditionalFields()}

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6  mb-6">
                          <div className="flex flex-col w-full">
              <label className="mb-2 font-medium text-gray-700">
                Select District *
              </label>
              <Select
                options={districtOptions} // This should be the array of districts
                value={districtOptions.find(
                  (opt) => opt.value === formData.district
                )}
                required={true}
                isDisabled={disabled}
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev,
                    district: selectedOption ? selectedOption.value : "",
                  }));
                }}
                isSearchable={true}
                ref={selectRef}
                placeholder="Select a district"
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

            <div className="flex flex-col w-full">
              <label className="mb-2 font-medium text-gray-700">
                Select City *
              </label>
              <Select
                options={cityOptions} // This should be the array of cities
                value={cityOptions.find((opt) => opt.value === formData.city)}
                required={true}
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev,
                    city: selectedOption ? selectedOption.value : "",
                  }));
                }}
                isSearchable={true}
                ref={selectRef}
                isDisabled={disabled || (cityOptions.length < 1)}
                placeholder="Select a city"
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
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                        <div className="flex flex-col">
              <label className="mb-2 font-medium">Contact Person Name</label>
              <input
                type="text"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleChange}
                disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>

             <div className="flex flex-col">
              <label className="mb-2 font-medium">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
                pattern="\d{10}"
                maxLength={10}
                minLength={10}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Email ID</label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
          </div>

          {!disabled && (
            <button
              type="submit"
              className="w-full bg-[#5CAAAB] hover:bg-[#489496] text-white py-3 rounded-md font-semibold transition"
            >
              Submit
            </button>
          )}
        </>
      )}
    </form>
  );
};

export default PromoterForm;