import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label, FieldError } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    college: z.string().min(2, "College is required"),
    phone: z
      .string()
      .min(7, "Enter a valid phone number")
      .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const { register: registerUser, login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setServerError("");
    try {
      await registerUser(values);
      toast.success("Account created! Logging you in…");
      await login({ email: values.email, password: values.password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
            <p className="mt-1 text-sm text-ink-500">Join your campus marketplace</p>
          </div>

          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" required>
                  Full name
                </Label>
                <Input
                  id="name"
                  placeholder="Jordan Patel"
                  error={!!errors.name}
                  {...register("name")}
                />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <Label htmlFor="email" required>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  error={!!errors.email}
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="college" required>
                  College
                </Label>
                <Input
                  id="college"
                  placeholder="ABC Institute of Technology"
                  error={!!errors.college}
                  {...register("college")}
                />
                <FieldError message={errors.college?.message} />
              </div>
              <div>
                <Label htmlFor="phone" required>
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  error={!!errors.phone}
                  {...register("phone")}
                />
                <FieldError message={errors.phone?.message} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="password" required>
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={!!errors.password}
                    className="pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>
              <div>
                <Label htmlFor="confirmPassword" required>
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  error={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <FieldError message={errors.confirmPassword?.message} />
              </div>
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
