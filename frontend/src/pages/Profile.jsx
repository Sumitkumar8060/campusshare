import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Mail } from "lucide-react";
import { useEffect } from "react";
import { getProfile, updateProfile } from "@/api/users";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label, FieldError } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Spinner";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  college: z.string().min(2, "College is required"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number"),
  profileImage: z.string().optional(),
});

export default function Profile() {
  const { updateLocalUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        college: profile.college || "",
        phone: profile.phone || "",
        profileImage: profile.profileImage || "",
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      toast.success("Profile updated");
      updateLocalUser(updated);
      queryClient.setQueryData(["profile"], updated);
    },
    onError: (err) => toast.error(err.message || "Could not update profile"),
  });

  const watchedImage = watch("profileImage");
  const watchedName = watch("name");

  if (isLoading) {
    return (
      <div className="container-page max-w-2xl py-10">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Your profile</h1>
        <p className="mt-1 text-ink-500">Manage your CampusShare account details.</p>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-4">
          <Avatar name={watchedName || profile?.name} src={watchedImage} size="xl" />
          <div>
            <p className="font-semibold text-ink-900">{profile?.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-ink-500">
              <Mail className="h-3.5 w-3.5" /> {profile?.email}
            </p>
            <p className="mt-1 text-xs text-ink-400">Email address cannot be changed.</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-4">
            <div>
              <Label htmlFor="name" required>
                Full name
              </Label>
              <Input id="name" error={!!errors.name} {...register("name")} />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="college" required>
                  College
                </Label>
                <Input id="college" error={!!errors.college} {...register("college")} />
                <FieldError message={errors.college?.message} />
              </div>
              <div>
                <Label htmlFor="phone" required>
                  Phone number
                </Label>
                <Input id="phone" type="tel" error={!!errors.phone} {...register("phone")} />
                <FieldError message={errors.phone?.message} />
              </div>
            </div>
            <div>
              <Label htmlFor="profileImage">Profile image URL</Label>
              <Input
                id="profileImage"
                placeholder="https://example.com/avatar.jpg"
                {...register("profileImage")}
              />
              <p className="mt-1 text-xs text-ink-400">
                Paste a link to an image — direct file uploads aren't supported by the backend yet.
              </p>
            </div>
            <div className="flex justify-end border-t border-ink-100 pt-5">
              <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
