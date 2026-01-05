import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DoorOpen,
  Luggage,
  Users,
  MapPin,
  Fuel,
  Gauge,
  Settings,
  Snowflake,
  Upload,
  X,
  Car as CarIcon,
  Hash,
  Star,
  DollarSign,
} from "lucide-react";
import { ModalWrapper, FormSelect, TiptapEditor } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch } from "@/redux/hooks";
import { addCar, updateCar } from "@/redux/slices/carSlice";
import { useToast } from "@/components/ui/use-toast";
import { carClassFilterOptions } from "@/pages/carlist/carData";
import type { Car, CarClass } from "@/types";
import { cn } from "@/utils/cn";

const carSchema = z.object({
  name: z.string().min(1, "Car name is required"),
  carNumber: z.string().optional(),
  doors: z.number().min(1, "Doors must be at least 1"),
  suitcases: z.string().min(1, "Suitcases is required"),
  seats: z.number().min(1, "Seats must be at least 1"),
  location: z.string().min(1, "Location is required"),
  fuelPolicy: z.string().min(1, "Fuel policy is required"),
  kilometers: z.string().min(1, "Kilometers is required"),
  carClass: z.string().min(1, "Class is required"),
  transmission: z.enum(["Automatic", "Manual"]),
  climate: z.string().min(1, "Climate is required"),
  amount: z.number().min(0.01, "Price must be greater than 0"),
  insuranceCoverage: z.string().optional(),
  termsConditions: z.string().optional(),
});

type CarFormData = z.infer<typeof carSchema>;

interface AddEditCarModalProps {
  open: boolean;
  onClose: () => void;
  car?: Car | null;
}

const transmissionOptions = [
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
];

const carClassOptions = carClassFilterOptions.filter(
  (opt) => opt.value !== "all"
);

export function AddEditCarModal({ open, onClose, car }: AddEditCarModalProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [insuranceContent, setInsuranceContent] = useState("");
  const [termsContent, setTermsContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!car;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      name: "",
      carNumber: "",
      doors: 4,
      suitcases: "",
      seats: 5,
      location: "",
      fuelPolicy: "",
      kilometers: "",
      carClass: "",
      transmission: "Automatic",
      climate: "",
      amount: 0,
      insuranceCoverage: "",
      termsConditions: "",
    },
  });

  // Reset form when modal opens or car changes
  useEffect(() => {
    if (open) {
      if (isEditMode && car) {
        reset({
          name: car.name,
          carNumber: car.carNumber || "",
          doors: car.doors,
          suitcases: car.suitcases || "",
          seats: car.seats,
          location: car.location || "",
          fuelPolicy: car.fuelPolicy || "",
          kilometers: car.kilometers || "",
          carClass: car.carClass,
          transmission: car.transmission,
          climate: car.climate || "",
          amount: car.amount,
          insuranceCoverage: car.insuranceCoverage || "",
          termsConditions: car.termsConditions || "",
        });
        setInsuranceContent(car.insuranceCoverage || "");
        setTermsContent(car.termsConditions || "");
        if (car.images && car.images.length > 0) {
          setImagePreviews(car.images);
        }
      } else {
        reset({
          name: "",
          carNumber: "",
          doors: 4,
          suitcases: "",
          seats: 5,
          location: "",
          fuelPolicy: "",
          kilometers: "",
          carClass: "",
          transmission: "Automatic",
          climate: "",
          amount: 0,
          insuranceCoverage: "",
          termsConditions: "",
        });
        setInsuranceContent("");
        setTermsContent("");
        setImages([]);
        setImagePreviews([]);
      }
    }
  }, [open, isEditMode, car, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...images, ...files];
      setImages(newImages);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data: CarFormData) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const carData: Car = {
      id: isEditMode && car ? car.id : Date.now().toString(),
      name: data.name,
      carNumber: data.carNumber,
      description: `${data.name} - ${data.carClass}`,
      image: imagePreviews[0] || car?.image || "",
      images: imagePreviews,
      doors: data.doors,
      transmission: data.transmission,
      seats: data.seats,
      suitcases: data.suitcases,
      location: data.location,
      fuelPolicy: data.fuelPolicy,
      kilometers: data.kilometers,
      climate: data.climate,
      amount: data.amount,
      priceDuration: "Per Day",
      carClass: data.carClass as CarClass,
      insuranceCoverage: insuranceContent,
      termsConditions: termsContent,
      createdAt: isEditMode && car ? car.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditMode) {
      dispatch(updateCar(carData));
      toast({
        title: "Car Updated",
        description: `${data.name} has been updated successfully.`,
      });
    } else {
      dispatch(addCar(carData));
      toast({
        title: "Car Created",
        description: `${data.name} has been created successfully.`,
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit Car" : "Add New Car"}
      size="full"
      className="max-w-3xl bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Grid Layout - 2 Columns */}
        <div className="grid grid-cols-2 gap-3 gap-x-5">
          {/* Car Name */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CarIcon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="name">Car Name</Label>
            </div>
            <Input
              id="name"
              placeholder="Enter Car Name"
              error={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Car Number */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="carNumber">Car Number</Label>
            </div>
            <Input
              id="carNumber"
              placeholder="Enter Car Number"
              error={!!errors.carNumber}
              {...register("carNumber")}
            />
            {errors.carNumber && (
              <p className="text-xs text-destructive">
                {errors.carNumber.message}
              </p>
            )}
          </div>

          {/* Doors */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="doors">Doors</Label>
            </div>
            <Input
              id="doors"
              type="number"
              placeholder="Enter Number of Doors"
              error={!!errors.doors}
              {...register("doors", { valueAsNumber: true })}
            />
            {errors.doors && (
              <p className="text-xs text-destructive">{errors.doors.message}</p>
            )}
          </div>

          {/* Suitcases */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Luggage className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="suitcases">Suitcases</Label>
            </div>
            <Input
              id="suitcases"
              placeholder="Enter Number of Suitcases"
              error={!!errors.suitcases}
              {...register("suitcases")}
            />
            {errors.suitcases && (
              <p className="text-xs text-destructive">
                {errors.suitcases.message}
              </p>
            )}
          </div>

          {/* Seats */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="seats">Seats</Label>
            </div>
            <Input
              id="seats"
              type="number"
              placeholder="Enter Number of Seats"
              error={!!errors.seats}
              {...register("seats", { valueAsNumber: true })}
            />
            {errors.seats && (
              <p className="text-xs text-destructive">{errors.seats.message}</p>
            )}
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="carClass">Class</Label>
            </div>
            <FormSelect
              value={watch("carClass")}
              options={carClassOptions}
              onChange={(value) => setValue("carClass", value)}
              placeholder="Select Car Class"
              error={errors.carClass?.message}
              required
            />
          </div>

          {/* Transmission */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="transmission">Transmission</Label>
            </div>
            <Select
              value={watch("transmission")}
              onValueChange={(value) =>
                setValue("transmission", value as "Automatic" | "Manual")
              }
            >
              <SelectTrigger error={!!errors.transmission}>
                <SelectValue placeholder="Select Transmission" />
              </SelectTrigger>
              <SelectContent>
                {transmissionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.transmission && (
              <p className="text-xs text-destructive">
                {errors.transmission.message}
              </p>
            )}
          </div>

          {/* Climate */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="climate">Climate</Label>
            </div>
            <Input
              id="climate"
              placeholder="Select Climate"
              error={!!errors.climate}
              {...register("climate")}
            />
            {errors.climate && (
              <p className="text-xs text-destructive">
                {errors.climate.message}
              </p>
            )}
          </div>

          {/* Per Day Price */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="amount">Per Day Price</Label>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter Per Day Price"
              error={!!errors.amount}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5 ">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="location">Location</Label>
            </div>
            <Input
              id="location"
              placeholder="Enter Location"
              error={!!errors.location}
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Fuel Policy */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="fuelPolicy">Fuel Policy</Label>
            </div>
            <Input
              id="fuelPolicy"
              placeholder="Enter Fuel Policy"
              error={!!errors.fuelPolicy}
              {...register("fuelPolicy")}
            />
            {errors.fuelPolicy && (
              <p className="text-xs text-destructive">
                {errors.fuelPolicy.message}
              </p>
            )}
          </div>

          {/* Kilometers */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="kilometers">Kilometers</Label>
            </div>
            <Input
              id="kilometers"
              placeholder="Enter Kilometers"
              error={!!errors.kilometers}
              {...register("kilometers")}
            />
            {errors.kilometers && (
              <p className="text-xs text-destructive">
                {errors.kilometers.message}
              </p>
            )}
          </div>
        </div>

        {/* Insurance & Coverage - TiptapEditor */}
        <div className="space-y-2">
          <Label>Insurance & Coverage</Label>
          <TiptapEditor
            content={insuranceContent}
            onChange={(content) => {
              setInsuranceContent(content);
              setValue("insuranceCoverage", content);
            }}
            placeholder="Enter insurance and coverage details..."
            className="h-[280px]"
          />
        </div>

        {/* Terms & Conditions - TiptapEditor */}
        <div className="space-y-2">
          <Label>Terms & Conditions</Label>
          <TiptapEditor
            content={termsContent}
            onChange={(content) => {
              setTermsContent(content);
              setValue("termsConditions", content);
            }}
            placeholder="Enter terms and conditions..."
            className="h-[280px]"
          />
        </div>

        {/* File Upload Section */}
        <div className="space-y-2">
          <Label>Photos</Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-colors",
              "border-green-300 bg-green-50/30 hover:border-green-400"
            )}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-purple-100 p-3">
                  <Upload className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Photos, Jpg, Png...
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-secondary hover:bg-secondary/80 text-white  border-secondary hover:text-white"
                onClick={() => document.getElementById("car-images")?.click()}
              >
                Select files
              </Button>
              <input
                id="car-images"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-foreground hover:bg-primary-foreground/80 text-white"
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
              ? "Save Changes"
              : "Add New Car"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
