import React, { useEffect, useMemo, useState } from "react";

const EMPTY_FORM = {
  title: "",
  description: "",
  targetAmount: "",
  bankDetails: {
    accountName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
  },
  acceptedItems: [],
  campaignImageUrl: "",
  status: "Active",
};

const normalizeInitialValues = (values = {}) => {
  const bankDetails = values.bankDetails || {};

  return {
    title: String(values.title || ""),
    description: String(values.description || ""),
    targetAmount:
      values.targetAmount !== undefined && values.targetAmount !== null
        ? String(values.targetAmount)
        : "",
    bankDetails: {
      accountName: String(bankDetails.accountName || ""),
      accountNumber: String(bankDetails.accountNumber || ""),
      bankName: String(bankDetails.bankName || ""),
      branchName: String(bankDetails.branchName || ""),
    },
    acceptedItems: Array.isArray(values.acceptedItems)
      ? values.acceptedItems.map((item) => String(item).trim()).filter(Boolean)
      : [],
    campaignImageUrl: String(values.campaignImageUrl || ""),
    status: values.status || "Active",
  };
};

const NGOCampaignForm = ({
  initialValues,
  mode = "create",
  submitting,
  serverError,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [itemInput, setItemInput] = useState("");
  const [campaignImage, setCampaignImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [clientError, setClientError] = useState("");

  const isEditMode = mode === "edit";

  useEffect(() => {
    const next = normalizeInitialValues(initialValues || EMPTY_FORM);
    setForm(next);
    setCampaignImage(null);
    setImagePreviewUrl(next.campaignImageUrl || "");
    setClientError("");
  }, [initialValues]);

  useEffect(() => {
    if (!(campaignImage instanceof File)) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(campaignImage);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [campaignImage]);

  const canSubmit = useMemo(() => !submitting, [submitting]);

  const updateField = (field, value) => {
    setClientError("");
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateBankField = (field, value) => {
    setClientError("");
    setForm((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  const addAcceptedItem = (rawValue) => {
    const value = String(rawValue || "").trim();
    if (!value) {
      return;
    }

    setForm((prev) => {
      if (prev.acceptedItems.includes(value)) {
        return prev;
      }
      return {
        ...prev,
        acceptedItems: [...prev.acceptedItems, value],
      };
    });
    setItemInput("");
  };

  const removeAcceptedItem = (value) => {
    setForm((prev) => ({
      ...prev,
      acceptedItems: prev.acceptedItems.filter((item) => item !== value),
    }));
  };

  const handleItemInputKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addAcceptedItem(itemInput);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setClientError("Please upload a JPG or PNG image.");
      return;
    }

    setClientError("");
    setCampaignImage(file);
  };

  const validate = () => {
    if (form.title.trim().length < 3) {
      return "Campaign title must be at least 3 characters.";
    }

    if (form.description.trim().length < 10) {
      return "Campaign description must be at least 10 characters.";
    }

    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      return "Target amount must be greater than 0.";
    }

    const bank = form.bankDetails;
    if (!bank.accountName.trim() || !bank.accountNumber.trim() || !bank.bankName.trim() || !bank.branchName.trim()) {
      return "All bank detail fields are required.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setClientError(validationError);
      return;
    }

    await onSubmit({
      title: form.title,
      description: form.description,
      targetAmount: Number(form.targetAmount),
      bankDetails: form.bankDetails,
      acceptedItems: form.acceptedItems,
      campaignImage,
      status: form.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-surface-container-high p-6 shadow-ambient sm:p-8">
      {clientError ? <p className="rounded-lg bg-auth-danger-bg px-4 py-3 text-sm text-danger">{clientError}</p> : null}
      {serverError ? <p className="rounded-lg bg-auth-danger-bg px-4 py-3 text-sm text-danger">{serverError}</p> : null}

      <section className="space-y-4 rounded-xl bg-surface-container p-5">
        <h2 className="text-lg font-bold text-on-surface">Campaign details</h2>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
            placeholder="Flood relief in Galle district"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Description</label>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={5}
            className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
            placeholder="Describe who needs support, current urgency, and where contributions will be used."
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Target amount (LKR)</label>
            <input
              type="number"
              min="1"
              value={form.targetAmount}
              onChange={(event) => updateField("targetAmount", event.target.value)}
              className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
              placeholder="500000"
              required
            />
          </div>

          {isEditMode ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Status</label>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4 rounded-xl bg-surface-container p-5">
        <h2 className="text-lg font-bold text-on-surface">Bank details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Account name</label>
            <input
              type="text"
              value={form.bankDetails.accountName}
              onChange={(event) => updateBankField("accountName", event.target.value)}
              className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Account number</label>
            <input
              type="text"
              value={form.bankDetails.accountNumber}
              onChange={(event) => updateBankField("accountNumber", event.target.value)}
              className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Bank name</label>
            <input
              type="text"
              value={form.bankDetails.bankName}
              onChange={(event) => updateBankField("bankName", event.target.value)}
              className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Branch name</label>
            <input
              type="text"
              value={form.bankDetails.branchName}
              onChange={(event) => updateBankField("branchName", event.target.value)}
              className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl bg-surface-container p-5">
        <h2 className="text-lg font-bold text-on-surface">Accepted supply items</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={itemInput}
            onChange={(event) => setItemInput(event.target.value)}
            onKeyDown={handleItemInputKeyDown}
            className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
            placeholder="Type item and press Enter (e.g., Dry rations)"
          />
          <button
            type="button"
            onClick={() => addAcceptedItem(itemInput)}
            className="rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
          >
            Add item
          </button>
        </div>

        <p className="text-xs text-secondary">
          Tip: press Enter or comma after typing an item name. This helps create a clean array payload.
        </p>

        {form.acceptedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {form.acceptedItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface"
              >
                {item}
                <button
                  type="button"
                  className="text-secondary transition hover:text-danger"
                  onClick={() => removeAcceptedItem(item)}
                  aria-label={`Remove ${item}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary">No accepted items added yet.</p>
        )}
      </section>

      <section className="space-y-4 rounded-xl bg-surface-container p-5">
        <h2 className="text-lg font-bold text-on-surface">Campaign cover image (optional)</h2>

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleImageChange}
          className="block w-full text-sm text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-primary hover:file:bg-primary-container"
        />

        <p className="text-xs text-secondary">Upload a JPG or PNG cover image to improve campaign visibility for donors.</p>

        {imagePreviewUrl ? (
          <img
            src={imagePreviewUrl}
            alt="Campaign preview"
            className="h-52 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-44 items-center justify-center rounded-xl bg-surface-container-high">
            <p className="text-xs uppercase tracking-[0.08em] text-secondary">No image selected</p>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-surface-container px-5 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-bright"
          disabled={submitting}
        >
          Back to campaigns
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!canSubmit}
        >
          {submitting ? "Saving..." : isEditMode ? "Update campaign" : "Create campaign"}
        </button>
      </div>
    </form>
  );
};

export default NGOCampaignForm;
