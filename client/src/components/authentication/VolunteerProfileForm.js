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

export default function VolunteerProfileForm({
  onSubmit,
  submitting = false,
  serverError = "",
}) {
  const [phone, setPhone] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [districtsInput, setDistrictsInput] = useState("");
  const [clientError, setClientError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!phone.trim()) {
      setClientError("Phone is required.");
      return;
    }

    await onSubmit({
      phone: phone.trim(),
      skills: splitValues(skillsInput, true),
      serviceDistricts: splitValues(districtsInput),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthAlert message={clientError || serverError} variant="error" />
      <AuthAlert
        variant="info"
        message="Volunteer accounts require admin approval before dashboard access is enabled."
      />

      <AuthInput
        id="volunteer-phone"
        label="Phone"
        value={phone}
        onChange={(event) => {
          setPhone(event.target.value);
          setClientError("");
        }}
        placeholder="+94 77 123 4567"
        required
      />

      <AuthInput
        id="volunteer-skills"
        label="Skills"
        value={skillsInput}
        onChange={(event) => setSkillsInput(event.target.value)}
        placeholder="FIRST_AID, RESCUE, LOGISTICS"
        hint="Comma-separated values"
      />

      <AuthInput
        id="volunteer-districts"
        label="Service Districts"
        value={districtsInput}
        onChange={(event) => setDistrictsInput(event.target.value)}
        placeholder="Colombo, Gampaha"
        hint="Comma-separated districts"
      />

      <Button
        type="submit"
        disabled={submitting}
        className="w-full py-3 text-sm font-semibold disabled:opacity-70"
      >
        {submitting ? "Saving profile..." : "Submit Volunteer Profile"}
      </Button>
    </form>
  );
}
