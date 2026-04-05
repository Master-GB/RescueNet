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
  const [skills, setSkills] = useState([]);
  const [districtsInput, setDistrictsInput] = useState("");
  const [clientError, setClientError] = useState("");

  const SKILLS = [
    "FIRST_AID",
    "RESCUE",
    "LOGISTICS",
    "MEDICAL",
    "DRIVING",
    "COMMUNICATION",
  ];

  const toggleSkill = (skill) => {
    setClientError("");
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!phone.trim()) {
      setClientError("Phone is required.");
      return;
    }

    await onSubmit({
      phone: phone.trim(),
      skills: skills, // already an array of selected skills
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
        <div className="grid grid-cols-2 gap-2">
          {SKILLS.map((s) => (
            <label key={s} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                name="skills"
                value={s}
                checked={skills.includes(s)}
                onChange={() => toggleSkill(s)}
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Select one or more skills you have.</p>
      </div>

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
