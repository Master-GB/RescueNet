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
  const [servicesInput, setServicesInput] = useState("");
  const [districtsInput, setDistrictsInput] = useState("");
  const [clientError, setClientError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!registrationNumber.trim() || !contactPhone.trim()) {
      setClientError("Registration number and contact phone are required.");
      return;
    }

    await onSubmit({
      registrationNumber: registrationNumber.trim(),
      contactPhone: contactPhone.trim(),
      services: splitValues(servicesInput, true),
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

      <AuthInput
        id="ngo-services"
        label="Services"
        value={servicesInput}
        onChange={(event) => setServicesInput(event.target.value)}
        placeholder="FOOD, MEDICAL, TRANSPORT"
        hint="Comma-separated values"
      />

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
