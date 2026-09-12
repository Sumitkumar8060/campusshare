import { useEffect } from "react";
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

export function ListingForm({ defaultValues, onSubmit, submitLabel = "Create listing", loading }) {
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

  function handleFormSubmit(values) {
    const images = (values.images || []).map((i) => i.value.trim()).filter(Boolean);
    const payload = {
      ...values,
      images,
      price: listingType === "Sell" ? Number(values.price) || 0 : 0,
      rentPricePerDay: listingType === "Rent" ? Number(values.rentPricePerDay) || 0 : 0,
      securityDeposit: listingType === "Rent" ? Number(values.securityDeposit) || 0 : 0,
      quantity: Number(values.quantity) || 1,
      availableFrom: values.availableFrom || undefined,
      availableUntil: values.availableUntil || undefined,
    };
    onSubmit(payload);
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

      <div>
        <Label>Image URLs</Label>
        <p className="mb-2 text-xs text-ink-400">
          Paste direct image links (upload hosting isn't built into this backend yet — see note
          below).
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

      <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
        <Button type="submit" size="lg" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
