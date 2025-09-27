"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Upload, X } from "lucide-react";
import type { ChangeEvent, DragEvent } from "react";
import { useState } from "react";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = ["Morning", "Afternoon", "Evening"];

type Availability = {
  [key: string]: string[];
};

export default function ServiceRequestForm() {
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [availability, setAvailability] = useState<Availability>({});

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prevPhotos) => [...prevPhotos, ...newFiles].slice(0, 5)); // Limit to 5 photos
    }
  };

  const handlePhotoDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setPhotos((prevPhotos) => [...prevPhotos, ...newFiles].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const toggleAvailability = (day: string, slot: string) => {
    setAvailability((prev) => {
      const newAvailability = { ...prev };
      if (!newAvailability[day]) {
        newAvailability[day] = [];
      }
      if (newAvailability[day].includes(slot)) {
        newAvailability[day] = newAvailability[day].filter((s) => s !== slot);
      } else {
        newAvailability[day].push(slot);
      }
      if (newAvailability[day].length === 0) {
        delete newAvailability[day];
      }
      return newAvailability;
    });
  };

  const handleSubmit = () => {
    const formData = {
      category,
      urgency,
      description,
      photos: photos.map((p) => p.name),
      availability,
    };
    console.log("Form Submitted:", formData);
    // Here you would typically send the data to your backend
    alert("Service request submitted! Check the console for the form data.");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Request a Service</CardTitle>
        <CardDescription>
          Fill out the form below to connect with a service provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a service category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="assembly">Furniture Assembly</SelectItem>
                <SelectItem value="maintenance">General Maintenance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select onValueChange={setUrgency} value={urgency}>
              <SelectTrigger id="urgency">
                <SelectValue placeholder="How urgent is it?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Within a week</SelectItem>
                <SelectItem value="medium">Medium - Within 72 hours</SelectItem>
                <SelectItem value="high">High - Within 24 hours</SelectItem>
                <SelectItem value="emergency">Emergency - ASAP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photos">Photos</Label>
          <div
            className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/20 hover:bg-muted/50"
            onDrop={handlePhotoDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
          >
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 10MB (Max 5 photos)
            </p>
            <Input
              id="photos"
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handlePhotoChange}
            />
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2 sm:grid-cols-5">
              {photos.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="object-cover w-full h-24 rounded-md"
                    onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Please describe the issue in detail. What needs to be done?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <Label>Availability</Label>
          <div className="p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div />
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground"
                >
                  <Clock className="w-3 h-3" />
                  {slot}
                </div>
              ))}
            </div>
            {daysOfWeek.map((day) => (
              <div key={day} className="grid grid-cols-4 gap-2 mt-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {day}
                </div>
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "transition-colors",
                      availability[day]?.includes(slot) &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => toggleAvailability(day, slot)}
                  >
                    {slot.slice(0, 3)}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="lg" className="w-full" onClick={handleSubmit}>
          Submit Request
        </Button>
      </CardFooter>
    </Card>
  );
}
