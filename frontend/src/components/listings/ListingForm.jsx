import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, ImagePlus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label, FieldError } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { LISTING_TYPES, CONDITIONS, SUGGESTED_CATEGORIES } from "@/lib/constants";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB, matches backend's multer limit

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    category: z.string().min(2, "Category is required"),
    description: z.string().min(10, "Description should be at least 10 characters"),
    condition: z.enum(["New", "Good", "Fair", "Poor"], {
      errorMap: () => ({ message: "Select a condition" }),
    }),
    listingType: z.enum(["Sell", "Rent", "GiveAway"], {
      errorMap: () => ({ message: "Select a listing type" }),
    }),
    price: z.coerce.number().min(0).optional(),
    rentPricePerDay: z.coerce.number().min(0).optional(),
    securityDeposit: z.coerce.number().min(0).optional(),
    availableFrom: z.string().optional(),
    availableUntil: z.string().optional(),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1").default(1),
    location: z.string().min(2, "Location is required"),
    // Only used in "edit" mode, where the backend's PUT /api/items/:id endpoint
    // still expects a plain JSON array of image URL strings (see note in
    // EditListing.jsx / api/items.js). Not used in "create" mode.
    images: z.array(z.object({ value: z.string() })).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.listingType === "Sell" && (!data.price || data.price <= 0)) {
      ctx.addIssue({ code: "custom", message: "Enter a sale price", path: ["price"] });
    }
    if (data.listingType === "Rent" && (!data.rentPricePerDay || data.rentPricePerDay <= 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a rent price per day",
        path: ["rentPricePerDay"],
      });
    }
  });

export function ListingForm({
  defaultValues,
  onSubmit,
  submitLabel = "Create listing",
  loading,
  mode = "create", // "create" -> file upload (FormData); "edit" -> existing URL-based flow
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: "",
      category: "",
      description: "",
      condition: "Good",
      listingType: "Sell",
      price: 0,
      rentPricePerDay: 0,
      securityDeposit: 0,
      availableFrom: "",
      availableUntil: "",
      quantity: 1,
      location: "",
      images: [{ value: "" }],
    },
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: "images" });
  const listingType = watch("listingType");

  // --- File-upload state (create mode only) ---
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  function handleFileChange(e) {
    const incoming = Array.from(e.target.files || []);
    // Reset the input so selecting the same file again after removing it
    // still fires a change event.
    e.target.value = "";
    if (incoming.length === 0) return;

    const next = [...selectedFiles];
    let error = "";

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        error = `"${file.name}" isn't an image file.`;
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        error = `"${file.name}" is larger than 5 MB.`;
        continue;
      }
      if (next.length >= MAX_IMAGES) {
        error = "You can upload up to 5 photos.";
        break;
      }
      next.push(file);
    }

    setSelectedFiles(next.slice(0, MAX_IMAGES));
    setFileError(error);
  }

  function removeFile(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  }

  function handleFormSubmit(values) {
    const numericFields = {
      price: listingType === "Sell" ? Number(values.price) || 0 : 0,
      rentPricePerDay: listingType === "Rent" ? Number(values.rentPricePerDay) || 0 : 0,
      securityDeposit: listingType === "Rent" ? Number(values.securityDeposit) || 0 : 0,
      quantity: Number(values.quantity) || 1,
    };

    if (mode === "edit") {
      // Unchanged behavior: the update endpoint takes a JSON body, and image
      // changes go through the same pasted-URL list as before.
      const images = (values.images || []).map((i) => i.value.trim()).filter(Boolean);
      const payload = {
        ...values,
        images,
        ...numericFields,
        availableFrom: values.availableFrom || undefined,
        availableUntil: values.availableUntil || undefined,
      };
      onSubmit(payload);
      return;
    }

    // Create mode: build multipart/form-data so files reach
    // upload.array("images", 5) on the backend.
    if (fileError) return;

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("description", values.description);
    formData.append("condition", values.condition);
    formData.append("listingType", values.listingType);
    formData.append("price", String(numericFields.price));
    formData.append("rentPricePerDay", String(numericFields.rentPricePerDay));
    formData.append("securityDeposit", String(numericFields.securityDeposit));
    if (values.availableFrom) formData.append("availableFrom", values.availableFrom);
    if (values.availableUntil) formData.append("availableUntil", values.availableUntil);
    formData.append("quantity", String(numericFields.quantity));
    formData.append("location", values.location);
    selectedFiles.forEach((file) => formData.append("images", file));

    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" required>
            Item name
          </Label>
          <Input
            id="name"
            placeholder="e.g. Casio FX-991ES Calculator"
            error={!!errors.name}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="category" required>
            Category
          </Label>
          <Input
            id="category"
            list="category-suggestions"
            placeholder="e.g. Electronics"
            error={!!errors.category}
            {...register("category")}
          />
          <datalist id="category-suggestions">
            {SUGGESTED_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <FieldError message={errors.category?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="description" required>
          Description
        </Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe the item's condition, features, and anything a student should know before requesting it."
          error={!!errors.description}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="listingType" required>
            Listing type
          </Label>
          <Select id="listingType" error={!!errors.listingType} {...register("listingType")}>
            {LISTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <FieldError message={errors.listingType?.message} />
        </div>
        <div>
          <Label htmlFor="condition" required>
            Condition
          </Label>
          <Select id="condition" error={!!errors.condition} {...register("condition")}>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <FieldError message={errors.condition?.message} />
        </div>
        <div>
          <Label htmlFor="quantity" required>
            Quantity
          </Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            error={!!errors.quantity}
            {...register("quantity")}
          />
          <FieldError message={errors.quantity?.message} />
        </div>
      </div>

      {listingType === "Sell" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price" required>
              Price (₹)
            </Label>
            <Input id="price" type="number" min={0} error={!!errors.price} {...register("price")} />
            <FieldError message={errors.price?.message} />
          </div>
        </div>
      )}

      {listingType === "Rent" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="rentPricePerDay" required>
              Rent price per day (₹)
            </Label>
            <Input
              id="rentPricePerDay"
              type="number"
              min={0}
              error={!!errors.rentPricePerDay}
              {...register("rentPricePerDay")}
            />
            <FieldError message={errors.rentPricePerDay?.message} />
          </div>
          <div>
            <Label htmlFor="securityDeposit">Security deposit (₹)</Label>
            <Input id="securityDeposit" type="number" min={0} {...register("securityDeposit")} />
          </div>
        </div>
      )}

      {listingType === "Rent" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="availableFrom">Available from</Label>
            <Input id="availableFrom" type="date" {...register("availableFrom")} />
          </div>
          <div>
            <Label htmlFor="availableUntil">Available until</Label>
            <Input id="availableUntil" type="date" {...register("availableUntil")} />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="location" required>
          Location
        </Label>
        <Input
          id="location"
          placeholder="e.g. Boys Hostel Block C, Room 214"
          error={!!errors.location}
          {...register("location")}
        />
        <FieldError message={errors.location?.message} />
      </div>

      {mode === "edit" ? (
        <div>
          <Label>Image URLs</Label>
          <p className="mb-2 text-xs text-ink-400">
            Paste direct image links (photo uploads aren't supported when editing an existing
            listing yet — see note below).
          </p>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder="https://example.com/photo.jpg"
                  {...register(`images.${index}.value`)}
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="shrink-0 rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-red-500"
                    aria-label="Remove image URL"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: "" })}
          >
            <Plus className="h-3.5 w-3.5" /> Add another image URL
          </Button>
          {fields.every((f) => !f.value) && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
              <ImagePlus className="h-3.5 w-3.5" />
              No images yet — the listing will show a placeholder until you add one.
            </div>
          )}
        </div>
      ) : (
        <div>
          <Label>Photos</Label>
          <p className="mb-2 text-xs text-ink-400">
            Upload up to 5 photos. Each photo should be less than 5 MB.
          </p>
          <input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink-700 hover:file:bg-ink-200"
          />
          <FieldError message={fileError} />
          {selectedFiles.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600"
                >
                  <span className="truncate">
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="shrink-0 rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-red-500"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
              <ImagePlus className="h-3.5 w-3.5" />
              No photos selected yet — the listing will show a placeholder until you add one.
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
        <Button type="submit" size="lg" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
