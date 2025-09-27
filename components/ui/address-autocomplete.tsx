"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AddressFeature {
  properties: {
    label: string;
    score: number;
    housenumber?: string;
    name?: string;
    street?: string;
    postcode: string;
    city: string;
    context: string;
    citycode: string;
    oldcitycode?: string;
    district?: string;
    oldcity?: string;
    importance: number;
    x: number;
    y: number;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface AddressData {
  label: string;
  housenumber?: string;
  street?: string;
  postcode: string;
  city: string;
  citycode: string;
  district?: string;
  coordinates: [number, number];
  context: string;
}

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  name?: string;
  value?: string;
  onChange?: (address: AddressData | null, rawValue: string) => void;
  className?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  label = "Adresse",
  placeholder = "Tapez votre adresse...",
  required = false,
  name = "address",
  value = "",
  onChange,
  className = "",
  disabled = false,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Debounced API call
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          query
        )}&limit=8`
      );
      const data = await response.json();

      // Filter addresses to only include those with valid geolocalisation details
      const addressesWithGeo = (data.features || []).filter(
        (feature: AddressFeature) => {
          return (
            feature.geometry &&
            feature.geometry.coordinates &&
            Array.isArray(feature.geometry.coordinates) &&
            feature.geometry.coordinates.length === 2 &&
            typeof feature.geometry.coordinates[0] === "number" &&
            typeof feature.geometry.coordinates[1] === "number" &&
            !isNaN(feature.geometry.coordinates[0]) &&
            !isNaN(feature.geometry.coordinates[1])
          );
        }
      );

      setSuggestions(addressesWithGeo);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedAddress(null);
    setShowSuggestions(true);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce API call
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);

    // Call onChange with null address data but current input value
    onChange?.(null, newValue);
  };

  const handleSuggestionClick = (feature: AddressFeature) => {
    const addressData: AddressData = {
      label: feature.properties.label,
      housenumber: feature.properties.housenumber,
      street: feature.properties.street,
      postcode: feature.properties.postcode,
      city: feature.properties.city,
      citycode: feature.properties.citycode,
      district: feature.properties.district,
      coordinates: feature.geometry.coordinates,
      context: feature.properties.context,
    };

    setInputValue(feature.properties.label);
    setSelectedAddress(addressData);
    setShowSuggestions(false);
    setSuggestions([]);

    onChange?.(addressData, feature.properties.label);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            id={name}
            name={name}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="pl-10 pr-10"
            autoComplete="address-line1"
          />
          {(isLoading || showSuggestions) && (
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          )}
        </div>

        {/* Hidden inputs for structured data */}
        {selectedAddress && (
          <>
            <input
              type="hidden"
              name={`${name}_housenumber`}
              value={selectedAddress.housenumber || ""}
            />
            <input
              type="hidden"
              name={`${name}_street`}
              value={selectedAddress.street || ""}
            />
            <input
              type="hidden"
              name={`${name}_postcode`}
              value={selectedAddress.postcode}
            />
            <input
              type="hidden"
              name={`${name}_city`}
              value={selectedAddress.city}
            />
            <input
              type="hidden"
              name={`${name}_citycode`}
              value={selectedAddress.citycode}
            />
            <input
              type="hidden"
              name={`${name}_district`}
              value={selectedAddress.district || ""}
            />
            <input
              type="hidden"
              name={`${name}_coordinates`}
              value={selectedAddress.coordinates.join(",")}
            />
            <input
              type="hidden"
              name={`${name}_context`}
              value={selectedAddress.context}
            />
          </>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((feature, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(feature)}
              >
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {feature.properties.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {feature.properties.context}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {isLoading && suggestions.length === 0 && inputValue.length >= 3 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Recherche en cours...
            </div>
          </div>
        )}

        {/* No results state */}
        {!isLoading &&
          suggestions.length === 0 &&
          inputValue.length >= 3 &&
          showSuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Aucune adresse trouvée
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export type { AddressData };
