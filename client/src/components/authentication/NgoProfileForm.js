import React, { useState } from "react";
import Button from "../ui/Button";
import AuthAlert from "./AuthAlert";
import AuthInput from "./AuthInput";

const DISTRICT_OPTIONS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const normalizeDistrictSearchValue = (value) => {
  return value.toLowerCase().replace(/\s+/g, "").replace(/h/g, "");
};

export default function NgoProfileForm({
  onSubmit,
  submitting = false,
  serverError = "",
}) {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [services, setServices] = useState([]);
  const [districtSearch, setDistrictSearch] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [clientError, setClientError] = useState("");

  const SERVICES = [
    "FOOD",
    "MEDICAL",
    "TRANSPORT",
    "SHELTER",
    "RESCUE",
    "EDUCATION",
  ];

  const toggleService = (service) => {
    setClientError("");
    setServices((prev) => {
      if (prev.includes(service)) return prev.filter((s) => s !== service);
      return [...prev, service];
    });
  };

  const addDistrict = (district) => {
    setClientError("");
    setSelectedDistricts((prev) => {
      if (prev.includes(district)) {
        return prev;
      }
      return [...prev, district];
    });
    setDistrictSearch("");
  };

  const removeDistrict = (district) => {
    setSelectedDistricts((prev) => prev.filter((item) => item !== district));
  };

  const normalizedSearch = districtSearch.trim().toLowerCase();
  const normalizedLooseSearch = normalizeDistrictSearchValue(districtSearch.trim());
  const filteredDistricts = DISTRICT_OPTIONS.filter((district) => {
    if (selectedDistricts.includes(district)) {
      return false;
    }

    const districtLower = district.toLowerCase();
    const districtLoose = normalizeDistrictSearchValue(district);

    return (
      districtLower.includes(normalizedSearch) ||
      districtLoose.includes(normalizedLooseSearch)
    );
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!registrationNumber.trim() || !contactPhone.trim()) {
      setClientError("Registration number and contact phone are required.");
      return;
    }

    await onSubmit({
      registrationNumber: registrationNumber.trim(),
      contactPhone: contactPhone.trim(),
      services: services, // already an array of selected service strings
      serviceDistricts: selectedDistricts,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthAlert message={clientError || serverError} variant="error" />
      <AuthAlert
        variant="info"
        message="NGO profiles enter a strict admin approval queue before dashboard access is granted."
      />

      <AuthInput
        id="ngo-registration-number"
        label="Registration Number"
        value={registrationNumber}
        onChange={(event) => {
          setRegistrationNumber(event.target.value);
          setClientError("");
        }}
        placeholder="NGO registration number"
        required
      />

      <AuthInput
        id="ngo-contact-phone"
        label="Contact Phone"
        value={contactPhone}
        onChange={(event) => {
          setContactPhone(event.target.value);
          setClientError("");
        }}
        placeholder="+94 11 123 4567"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
        <div className="grid grid-cols-2 gap-2">
          {SERVICES.map((s) => (
            <label key={s} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                name="services"
                value={s}
                checked={services.includes(s)}
                onChange={() => toggleService(s)}
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Select one or more services offered by the NGO.</p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.08em] text-secondary-container font-semibold mb-2">
          Service Districts
        </label>

        {selectedDistricts.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedDistricts.map((district) => (
              <span
                key={district}
                className="inline-flex items-center gap-2 rounded-full border border-primary-container bg-auth-surface px-3 py-1 text-xs text-auth-text"
              >
                {district}
                <button
                  type="button"
                  onClick={() => removeDistrict(district)}
                  className="rounded-full px-1 text-auth-text-muted transition hover:text-danger"
                  aria-label={`Remove ${district}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <input
          id="ngo-district-search"
          type="text"
          value={districtSearch}
          onChange={(event) => setDistrictSearch(event.target.value)}
          placeholder="Search district (e.g., Ratnapura)"
          className="focus-ghost w-full rounded-lg bg-auth-bg border border-auth-border px-4 py-3 text-sm text-auth-text outline-none transition placeholder:text-auth-placeholder focus:bg-auth-surface focus:border-primary-container"
          autoComplete="off"
        />

        {normalizedSearch ? (
          <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-auth-border bg-auth-bg">
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => addDistrict(district)}
                  className="block w-full px-4 py-2 text-left text-sm text-auth-text transition hover:bg-auth-surface"
                >
                  {district}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-xs text-auth-text-muted">
                No matching district found in the predefined list.
              </p>
            )}
          </div>
        ) : null}

        <p className="mt-2 text-xs text-auth-text-muted">
          Search and select one or more districts from the predefined list.
        </p>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full py-3 text-sm font-semibold disabled:opacity-70"
      >
        {submitting ? "Saving profile..." : "Submit NGO Profile"}
      </Button>
    </form>
  );
}
