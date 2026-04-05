import React, { useState } from "react";
import Button from "../ui/Button";
import AuthAlert from "./AuthAlert";
import AuthInput from "./AuthInput";

const splitValues = (value, makeUppercase = false) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (makeUppercase ? item.toUpperCase() : item));
};

export default function NgoProfileForm({
  onSubmit,
  submitting = false,
  serverError = "",
}) {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [services, setServices] = useState([]);
  const [districtsInput, setDistrictsInput] = useState("");
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
      serviceDistricts: splitValues(districtsInput),
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

      <AuthInput
        id="ngo-districts"
        label="Service Districts"
        value={districtsInput}
        onChange={(event) => setDistrictsInput(event.target.value)}
        placeholder="Colombo, Kandy"
        hint="Comma-separated districts"
      />

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
