import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSelect, TiptapEditor } from "@/components/common";
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
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addCar, updateCar } from "@/redux/slices/carSlice";
import { toast } from "@/utils/toast";
import { carClassFilterOptions } from "@/pages/carlist/carData";
import { PricingConfiguration } from "./components/PricingConfiguration";
import type { Car, CarClass, PricingConfig, WeekendConfig } from "@/types";
import { cn } from "@/utils/cn";

const pricingSchema = z.object({
  oneDay: z.number().min(0.01, "1 Day price is required"),
  threeDays: z.number().min(0.01, "3 Days price is required"),
  sevenDays: z.number().min(0.01, "7 Days price is required"),
  fourteenDays: z.number().min(0.01, "14 Days price is required"),
  oneMonth: z.number().min(0.01, "1 Month price is required"),
});

const weekendSchema = z.object({
  selectedDays: z.array(z.enum(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])).min(1, "Select at least one weekend day"),
  weekendPrice: z.number().min(0.01, "Weekend price is required"),
});

const carSchema = z.object({
  name: z.string().min(1, "Car name is required"),
  carNumber: z.string().min(1, "Car number is required"),
  doors: z.number().min(2).max(5),
  suitcases: z.string().min(1, "Suitcases is required"),
  seats: z.number().refine((val) => [2, 4, 5, 7, 9].includes(val), {
    message: "Seats must be 2, 4, 5, 7, or 9",
  }),
  location: z.string().min(1, "Location is required"),
  fuelPolicy: z.enum(["Full to Full", "Full to Empty", "Pre-paid", "Same to Same", "Fair"]),
  kilometers: z.enum(["Unlimited Mileage", "200km (per day limit)", "400km (per day limit)", "500km (per day limit)"]),
  carClass: z.string().min(1, "Class is required"),
  transmission: z.enum(["Automatic", "Manual"]),
  climate: z.enum(["Automatic", "Manual"]),
  fuelType: z.enum(["Petrol", "Diesel", "Electric", "Hybrid"]).optional(),
  insuranceCoverage: z.string().optional(),
  termsConditions: z.string().optional(),
  pricing: pricingSchema,
  weekend: weekendSchema,
});

type CarFormData = z.infer<typeof carSchema>;

const transmissionOptions = [
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
];

const carClassOptions = carClassFilterOptions.filter(
  (opt) => opt.value !== "all"
);

const seatsOptions = [
  { value: "2", label: "2 Seats" },
  { value: "4", label: "4 Seats" },
  { value: "5", label: "5 Seats" },
  { value: "7", label: "7 Seats" },
  { value: "9", label: "9 Seats" },
];

const doorsOptions = [
  { value: "2", label: "2 Doors" },
  { value: "4", label: "4 Doors" },
  { value: "5", label: "5 Doors" },
];

const fuelPolicyOptions = [
  { value: "Full to Full", label: "Full to Full" },
  { value: "Full to Empty", label: "Full to Empty" },
  { value: "Pre-paid", label: "Pre-paid" },
  { value: "Same to Same", label: "Same to Same" },
  { value: "Fair", label: "Fair" },
];

const kilometersOptions = [
  { value: "Unlimited Mileage", label: "Unlimited Mileage" },
  { value: "200km (per day limit)", label: "200km (per day limit)" },
  { value: "400km (per day limit)", label: "400km (per day limit)" },
  { value: "500km (per day limit)", label: "500km (per day limit)" },
];

const climateOptions = [
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
];

const fuelTypeOptions = [
  { value: "Petrol", label: "Petrol" },
  { value: "Diesel", label: "Diesel" },
  { value: "Electric", label: "Electric" },
  { value: "Hybrid", label: "Hybrid" },
];

export default function AddCar() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const { list } = useAppSelector((state) => state.cars);
  
  const isEditMode = !!id;
  const car = isEditMode ? list.find((c) => c.id === id) : null;

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [insuranceContent, setInsuranceContent] = useState("");
  const [termsContent, setTermsContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<string>("");
  
  // Pricing state
  const [pricing, setPricing] = useState<PricingConfig>({
    oneDay: 0,
    threeDays: 0,
    sevenDays: 0,
    fourteenDays: 0,
    oneMonth: 0,
  });
  
  const [weekend, setWeekend] = useState<WeekendConfig>({
    selectedDays: [],
    weekendPrice: 0,
  });

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
      fuelPolicy: "Full to Full",
      kilometers: "Unlimited Mileage",
      carClass: "",
      transmission: "Automatic",
      climate: "Automatic",
      fuelType: "Petrol",
      insuranceCoverage: "",
      termsConditions: "",
      pricing: {
        oneDay: 0,
        threeDays: 0,
        sevenDays: 0,
        fourteenDays: 0,
        oneMonth: 0,
      },
      weekend: {
        selectedDays: [],
        weekendPrice: 0,
      },
    },
  });

  // Load car data when in edit mode
  useEffect(() => {
    if (isEditMode && car) {
      const carPricing = car.pricing || {
        oneDay: car.amount || 0,
        threeDays: (car.amount || 0) * 3,
        sevenDays: (car.amount || 0) * 7,
        fourteenDays: (car.amount || 0) * 14,
        oneMonth: (car.amount || 0) * 30,
      };
      
      const carWeekend = car.weekend || {
        selectedDays: [],
        weekendPrice: car.amount || 0,
      };

      reset({
        name: car.name,
        carNumber: car.carNumber || "",
        doors: car.doors,
        suitcases: car.suitcases || "",
        seats: car.seats,
        location: car.location || "",
        fuelPolicy: (car.fuelPolicy as "Full to Full" | "Full to Empty" | "Pre-paid" | "Same to Same" | "Fair") || "Full to Full",
        kilometers: (car.kilometers as "Unlimited Mileage" | "200km (per day limit)" | "400km (per day limit)" | "500km (per day limit)") || "Unlimited Mileage",
        carClass: car.carClass,
        transmission: car.transmission,
        climate: (car.climate as "Automatic" | "Manual") || "Automatic",
        fuelType: car.fuelType || "Petrol",
        insuranceCoverage: car.insuranceCoverage || "",
        termsConditions: car.termsConditions || "",
        pricing: carPricing,
        weekend: carWeekend,
      });
      
      setPricing(carPricing);
      setWeekend(carWeekend);
      setInsuranceContent(car.insuranceCoverage || "");
      setTermsContent(car.termsConditions || "");
      if (car.images && car.images.length > 0) {
        setImagePreviews(car.images);
      }
      if (car.image) {
        setImagePreviews([car.image]);
      }
    } else {
      // Reset form for add mode
      reset({
        name: "",
        carNumber: "",
        doors: 4,
        suitcases: "",
        seats: 5,
        location: "",
        fuelPolicy: "Full to Full",
        kilometers: "Unlimited Mileage",
        carClass: "",
        transmission: "Automatic",
        climate: "Automatic",
        fuelType: "Petrol",
        insuranceCoverage: "",
        termsConditions: "",
        pricing: {
          oneDay: 0,
          threeDays: 0,
          sevenDays: 0,
          fourteenDays: 0,
          oneMonth: 0,
        },
        weekend: {
          selectedDays: [],
          weekendPrice: 0,
        },
      });
      setPricing({
        oneDay: 0,
        threeDays: 0,
        sevenDays: 0,
        fourteenDays: 0,
        oneMonth: 0,
      });
      setWeekend({
        selectedDays: [],
        weekendPrice: 0,
      });
      setInsuranceContent("");
      setTermsContent("");
      setImages([]);
      setImagePreviews([]);
      setImageError("");
    }
  }, [isEditMode, car, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...images, ...files];
      setImages(newImages);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
      setImageError("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    // Clear error if images still exist after removal
    if (newPreviews.length > 0 || (isEditMode && car?.images && car.images.length > 0)) {
      setImageError("");
    }
  };

  const onSubmit = async (data: CarFormData) => {
    // Validate pricing
    if (!pricing.oneDay || pricing.oneDay <= 0) {
      toast({
        title: "Validation Error",
        description: "Please set all pricing durations",
        variant: "destructive",
      });
      return;
    }
    
    // Validate weekend if days are selected
    if (weekend.selectedDays.length > 0 && (!weekend.weekendPrice || weekend.weekendPrice <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please set weekend price when weekend days are selected",
        variant: "destructive",
      });
      return;
    }
    
    // Update form values with pricing and weekend
    setValue("pricing", pricing);
    setValue("weekend", weekend);
    
    // Validate images
    if (!isEditMode && imagePreviews.length === 0) {
      setImageError("At least one image is required");
      return;
    }
    if (isEditMode && imagePreviews.length === 0 && (!car?.images || car.images.length === 0) && !car?.image) {
      setImageError("At least one image is required");
      return;
    }
    setImageError("");

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
      fuelType: data.fuelType,
      amount: pricing.oneDay, // Keep for backward compatibility
      priceDuration: "Per Day", // Keep for backward compatibility
      pricing: pricing,
      weekend: weekend,
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
    navigate("/cars");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/cars")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-xl font-bold text-slate-800">
              {isEditMode ? "Edit Car" : "Add New Car"}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Grid Layout - 2 Columns */}
            <div className="grid grid-cols-2 gap-3 gap-x-5">
              {/* Car Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Car Name <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="carNumber">
                  Car Number <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="doors">Doors</Label>
                <Select
                  value={String(watch("doors"))}
                  onValueChange={(value) => setValue("doors", Number(value))}
                >
                  <SelectTrigger error={!!errors.doors}>
                    <SelectValue placeholder="Select Number of Doors" />
                  </SelectTrigger>
                  <SelectContent>
                    {doorsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doors && (
                  <p className="text-xs text-destructive">{errors.doors.message}</p>
                )}
              </div>

              {/* Suitcases */}
              <div className="space-y-1.5">
                <Label htmlFor="suitcases">Suitcases</Label>
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
                <Label htmlFor="seats">
                  Seats <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={String(watch("seats"))}
                  onValueChange={(value) => setValue("seats", Number(value))}
                >
                  <SelectTrigger error={!!errors.seats}>
                    <SelectValue placeholder="Select Number of Seats" />
                  </SelectTrigger>
                  <SelectContent>
                    {seatsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.seats && (
                  <p className="text-xs text-destructive">{errors.seats.message}</p>
                )}
              </div>

              {/* Class */}
              <div className="space-y-1.5">
                <Label htmlFor="carClass">
                  Class <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="transmission">
                  Transmission <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="climate">Climate</Label>
                <Select
                  value={watch("climate")}
                  onValueChange={(value) =>
                    setValue("climate", value as "Automatic" | "Manual")
                  }
                >
                  <SelectTrigger error={!!errors.climate}>
                    <SelectValue placeholder="Select Climate" />
                  </SelectTrigger>
                  <SelectContent>
                    {climateOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.climate && (
                  <p className="text-xs text-destructive">
                    {errors.climate.message}
                  </p>
                )}
              </div>

              {/* Fuel Type */}
              <div className="space-y-1.5">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={watch("fuelType") || "Petrol"}
                  onValueChange={(value) =>
                    setValue(
                      "fuelType",
                      value as "Petrol" | "Diesel" | "Electric" | "Hybrid"
                    )
                  }
                >
                  <SelectTrigger error={!!errors.fuelType}>
                    <SelectValue placeholder="Select Fuel Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fuelType && (
                  <p className="text-xs text-destructive">
                    {errors.fuelType.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
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
                <Label htmlFor="fuelPolicy">Fuel Policy</Label>
                <Select
                  value={watch("fuelPolicy")}
                  onValueChange={(value) =>
                    setValue(
                      "fuelPolicy",
                      value as
                        | "Full to Full"
                        | "Full to Empty"
                        | "Pre-paid"
                        | "Same to Same"
                        | "Fair"
                    )
                  }
                >
                  <SelectTrigger error={!!errors.fuelPolicy}>
                    <SelectValue placeholder="Select Fuel Policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelPolicyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fuelPolicy && (
                  <p className="text-xs text-destructive">
                    {errors.fuelPolicy.message}
                  </p>
                )}
              </div>

              {/* Kilometers/Mileage Limit */}
              <div className="space-y-1.5">
                <Label htmlFor="kilometers">
                  Mileage Limit <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("kilometers")}
                  onValueChange={(value) =>
                    setValue(
                      "kilometers",
                      value as
                        | "Unlimited Mileage"
                        | "200km (per day limit)"
                        | "400km (per day limit)"
                        | "500km (per day limit)"
                    )
                  }
                >
                  <SelectTrigger error={!!errors.kilometers}>
                    <SelectValue placeholder="Select Mileage Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {kilometersOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            {/* Pricing Configuration Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-800">
                Pricing Configuration
              </Label>
              <PricingConfiguration
                pricing={pricing}
                weekend={weekend}
                onPricingChange={(newPricing) => {
                  setPricing(newPricing);
                  setValue("pricing", newPricing);
                }}
                onWeekendChange={(newWeekend) => {
                  setWeekend(newWeekend);
                  setValue("weekend", newWeekend);
                }}
                errors={{
                  pricing: {
                    oneDay: errors.pricing?.oneDay?.message,
                    threeDays: errors.pricing?.threeDays?.message,
                    sevenDays: errors.pricing?.sevenDays?.message,
                    fourteenDays: errors.pricing?.fourteenDays?.message,
                    oneMonth: errors.pricing?.oneMonth?.message,
                  },
                  weekend: {
                    selectedDays: errors.weekend?.selectedDays?.message,
                    weekendPrice: errors.weekend?.weekendPrice?.message,
                  },
                }}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>
                Photos <span className="text-destructive">*</span>
              </Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 transition-colors",
                  imageError
                    ? "border-destructive"
                    : "border-green-300 bg-green-50/30 hover:border-green-400"
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
                    className="bg-secondary hover:bg-secondary/80 text-white border-secondary hover:text-white"
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
              {imageError && (
                <p className="text-xs text-destructive">{imageError}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cars")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/80 text-white"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Add New Car"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
