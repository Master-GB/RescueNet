import React, { useMemo, useState } from "react";
import Button from "../ui/Button";
import AuthAlert from "./AuthAlert";
import AuthInput from "./AuthInput";

export default function CitizenProfileForm({
  onSubmit,
  submitting = false,
  serverError = "",
}) {
  const [formData, setFormData] = useState({
    phone: "",
    street: "",
    city: "",
    province: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [clientError, setClientError] = useState("");

  const isFormValid = useMemo(() => {
    return (
      formData.phone.trim() &&
      formData.street.trim() &&
      formData.city.trim() &&
      formData.province.trim() &&
      formData.emergencyContactName.trim() &&
      formData.emergencyContactPhone.trim()
    );
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setClientError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid) {
      setClientError("Please complete all required fields before continuing.");
      return;
    }

    await onSubmit({
      phone: formData.phone.trim(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
      },
      emergencyContactName: formData.emergencyContactName.trim(),
      emergencyContactPhone: formData.emergencyContactPhone.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthAlert message={clientError || serverError} variant="error" />

      <AuthInput
        id="citizen-phone"
        label="Phone"
        value={formData.phone}
        onChange={(event) => updateField("phone", event.target.value)}
        placeholder="+94 77 123 4567"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput
          id="citizen-street"
          label="Street"
          value={formData.street}
          onChange={(event) => updateField("street", event.target.value)}
          placeholder="Street address"
          required
        />
        <AuthInput
          id="citizen-city"
          label="City"
          value={formData.city}
          onChange={(event) => updateField("city", event.target.value)}
          placeholder="City"
          required
        />
      </div>

      <AuthInput
        id="citizen-province"
        label="Province"
        value={formData.province}
        onChange={(event) => updateField("province", event.target.value)}
        placeholder="Province"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput
          id="citizen-emergency-name"
          label="Emergency Contact Name"
          value={formData.emergencyContactName}
          onChange={(event) =>
            updateField("emergencyContactName", event.target.value)
          }
          placeholder="Primary emergency contact"
          required
        />
        <AuthInput
          id="citizen-emergency-phone"
          label="Emergency Contact Phone"
          value={formData.emergencyContactPhone}
          onChange={(event) =>
            updateField("emergencyContactPhone", event.target.value)
          }
          placeholder="Contact phone number"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full py-3 text-sm font-semibold disabled:opacity-70"
      >
        {submitting ? "Saving profile..." : "Complete Citizen Profile"}
      </Button>
    </form>
  );
}
