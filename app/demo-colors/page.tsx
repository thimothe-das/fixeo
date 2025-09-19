"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SERVICE_COLORS } from "@/lib/colors";

export default function ColorDemoPage() {
  const colorShades = [
    "50",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ] as const;

  const ColorSwatch = ({
    colorVar,
    name,
    description,
  }: {
    colorVar: string;
    name: string;
    description?: string;
  }) => (
    <div className="group relative">
      <div
        className="w-full h-16 rounded-lg border border-fixeo-gray-200 flex items-center justify-center transition-all hover:scale-105 hover:shadow-md cursor-pointer"
        style={{
          backgroundColor: `var(--color-${colorVar})`,
          borderColor: "var(--color-fixeo-gray-200)",
        }}
      >
        <span
          className={`text-sm font-medium ${
            name.includes("800") || name.includes("900") || name.includes("700")
              ? "text-white"
              : name.includes("600") || name.includes("blue-500")
              ? "text-white"
              : ""
          }`}
          style={{
            color:
              name.includes("800") ||
              name.includes("900") ||
              name.includes("700") ||
              name.includes("600") ||
              name.includes("blue-500")
                ? "white"
                : "var(--color-fixeo-gray-900)",
          }}
        >
          {name}
        </span>
      </div>
      {description && (
        <p
          className="text-xs mt-1 text-center"
          style={{ color: "var(--color-fixeo-gray-500)" }}
        >
          {description}
        </p>
      )}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
    </div>
  );

  return (
    <div
      className="min-h-screen py-8"
      style={{ backgroundColor: "var(--color-fixeo-gray-50)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--color-fixeo-gray-900)" }}
          >
            Fixeo Color System
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--color-fixeo-gray-600)" }}
          >
            A comprehensive color palette with 9 shades each for blue (main),
            orange (accent), and gray (neutral) colors, designed using OKLCH
            color space for optimal consistency.
          </p>
        </div>

        {/* Main Color Palettes */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Blue Palette */}
          <Card
            className="bg-white"
            style={{ borderColor: "var(--color-fixeo-gray-200)" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fixeo-gray-900)" }}>
                Main Blue
              </CardTitle>
              <p
                className="text-sm"
                style={{ color: "var(--color-fixeo-gray-600)" }}
              >
                Primary brand colors
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {colorShades.map((shade) => (
                  <ColorSwatch
                    key={shade}
                    colorVar={`fixeo-blue-${shade}`}
                    name={`blue-${shade}`}
                    description={
                      shade === "600"
                        ? "Brand main"
                        : shade === "500"
                        ? "Primary"
                        : undefined
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Orange Palette */}
          <Card
            className="bg-white"
            style={{ borderColor: "var(--color-fixeo-gray-200)" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fixeo-gray-900)" }}>
                Accent Orange
              </CardTitle>
              <p
                className="text-sm"
                style={{ color: "var(--color-fixeo-gray-600)" }}
              >
                Secondary accent colors
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {colorShades.map((shade) => (
                  <ColorSwatch
                    key={shade}
                    colorVar={`fixeo-orange-${shade}`}
                    name={`orange-${shade}`}
                    description={shade === "500" ? "Accent" : undefined}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gray Palette */}
          <Card
            className="bg-white"
            style={{ borderColor: "var(--color-fixeo-gray-200)" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fixeo-gray-900)" }}>
                Gray System
              </CardTitle>
              <p
                className="text-sm"
                style={{ color: "var(--color-fixeo-gray-600)" }}
              >
                Neutral colors
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {colorShades.map((shade) => (
                  <ColorSwatch
                    key={shade}
                    colorVar={`fixeo-gray-${shade}`}
                    name={`gray-${shade}`}
                    description={shade === "500" ? "Medium" : undefined}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Utility Classes Test */}
        <Card
          className="bg-white mb-12"
          style={{ borderColor: "var(--color-fixeo-gray-200)" }}
        >
          <CardHeader>
            <CardTitle style={{ color: "var(--color-fixeo-gray-900)" }}>
              Tailwind Utility Classes Test
            </CardTitle>
            <p
              className="text-sm"
              style={{ color: "var(--color-fixeo-gray-600)" }}
            >
              Testing if Tailwind generates the utility classes automatically
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-fixeo-blue-500 text-white p-4 rounded">
                bg-fixeo-blue-500
              </div>
              <div className="bg-fixeo-orange-500 text-white p-4 rounded">
                bg-fixeo-orange-500
              </div>
              <div className="bg-fixeo-gray-500 text-white p-4 rounded">
                bg-fixeo-gray-500
              </div>
            </div>
            <p
              className="text-xs mt-2"
              style={{ color: "var(--color-fixeo-gray-500)" }}
            >
              If you see colors above, Tailwind utility classes are working. If
              not, only CSS variables work.
            </p>
          </CardContent>
        </Card>

        {/* UI Components Examples */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Buttons */}
          <Card
            className="bg-white"
            style={{ borderColor: "var(--color-fixeo-gray-200)" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fixeo-gray-900)" }}>
                Button Variants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fixeo-gray-700)" }}
                  >
                    Primary
                  </h4>
                  <Button
                    className="text-white"
                    style={{
                      backgroundColor: "var(--color-fixeo-main-600)",
                      borderColor: "var(--color-fixeo-main-600)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-fixeo-main-700)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-fixeo-main-600)";
                    }}
                  >
                    Primary Button
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fixeo-gray-700)" }}
                  >
                    Secondary
                  </h4>
                  <Button
                    style={{
                      backgroundColor: "var(--color-fixeo-gray-100)",
                      color: "var(--color-fixeo-gray-900)",
                      borderColor: "var(--color-fixeo-gray-300)",
                    }}
                  >
                    Secondary Button
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fixeo-gray-700)" }}
                  >
                    Accent
                  </h4>
                  <Button
                    className="text-white"
                    style={{
                      backgroundColor: "var(--color-fixeo-accent-500)",
                      borderColor: "var(--color-fixeo-accent-500)",
                    }}
                  >
                    Accent Button
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fixeo-gray-700)" }}
                  >
                    Outline
                  </h4>
                  <Button
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--color-fixeo-main-600)",
                      borderColor: "var(--color-fixeo-main-300)",
                    }}
                    className="border"
                  >
                    Outline Button
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card
            className="bg-white"
            style={{ borderColor: "var(--color-fixeo-gray-200)" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fixeo-gray-900)" }}>
                Form Elements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fixeo-gray-700)" }}
                  >
                    Default Input
                  </label>
                  <Input
                    placeholder="Enter text..."
                    style={{
                      borderColor: "var(--color-fixeo-gray-300)",
                      color: "var(--color-fixeo-gray-900)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor =
                        "var(--color-fixeo-main-500)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor =
                        "var(--color-fixeo-gray-300)";
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fixeo-gray-700)" }}
                  >
                    Success State
                  </label>
                  <Input
                    placeholder="Valid input"
                    style={{
                      borderColor: "#10b981",
                      color: "var(--color-fixeo-gray-900)",
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fixeo-gray-700)" }}
                  >
                    Error State
                  </label>
                  <Input
                    placeholder="Invalid input"
                    style={{
                      borderColor: "#ef4444",
                      color: "var(--color-fixeo-gray-900)",
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Type Colors */}
        <Card
          className="bg-white mb-12"
          style={{ borderColor: "var(--color-fixeo-gray-200)" }}
        >
          <CardHeader>
            <CardTitle style={{ color: "var(--color-fixeo-gray-900)" }}>
              Service Type Colors
            </CardTitle>
            <p
              className="text-sm"
              style={{ color: "var(--color-fixeo-gray-600)" }}
            >
              Color coding for different service categories
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(SERVICE_COLORS).map(([service, colorClass]) => (
                <div key={service} className="text-center">
                  <div
                    className={`w-full h-16 rounded-lg ${colorClass} flex items-center justify-center mb-2`}
                  >
                    <span className="text-sm font-medium capitalize">
                      {service}
                    </span>
                  </div>
                  <p
                    className="text-xs capitalize"
                    style={{ color: "var(--color-fixeo-gray-500)" }}
                  >
                    {service}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CSS Variables Reference */}
        <Card
          className="bg-white mb-12"
          style={{ borderColor: "var(--color-fixeo-gray-200)" }}
        >
          <CardHeader>
            <CardTitle style={{ color: "var(--color-fixeo-gray-900)" }}>
              CSS Variables Reference
            </CardTitle>
            <p
              className="text-sm"
              style={{ color: "var(--color-fixeo-gray-600)" }}
            >
              All colors are available as CSS custom properties
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4
                  className="font-medium mb-2"
                  style={{ color: "var(--color-fixeo-gray-800)" }}
                >
                  Blue Variables
                </h4>
                <ul
                  className="space-y-1"
                  style={{ color: "var(--color-fixeo-gray-600)" }}
                >
                  {colorShades.map((shade) => (
                    <li key={shade} className="font-mono">
                      --color-fixeo-main-{shade}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4
                  className="font-medium mb-2"
                  style={{ color: "var(--color-fixeo-gray-800)" }}
                >
                  Orange Variables
                </h4>
                <ul
                  className="space-y-1"
                  style={{ color: "var(--color-fixeo-gray-600)" }}
                >
                  {colorShades.map((shade) => (
                    <li key={shade} className="font-mono">
                      --color-fixeo-accent-{shade}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4
                  className="font-medium mb-2"
                  style={{ color: "var(--color-fixeo-gray-800)" }}
                >
                  Gray Variables
                </h4>
                <ul
                  className="space-y-1"
                  style={{ color: "var(--color-fixeo-gray-600)" }}
                >
                  {colorShades.map((shade) => (
                    <li key={shade} className="font-mono">
                      --color-fixeo-gray-{shade}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges and Status */}
        <Card className="bg-white border-fixeo-gray-200 mb-12">
          <CardHeader>
            <CardTitle className="text-fixeo-gray-900">
              Badges & Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-fixeo-gray-700 mb-3">
                  Status Colors
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800">Success</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Warning
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">Error</Badge>
                  <Badge className="bg-fixeo-blue-100 text-fixeo-blue-800">
                    Info
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-fixeo-gray-700 mb-3">
                  Urgency Levels
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-red-100 text-red-800">🚨 Urgent</Badge>
                  <Badge className="bg-orange-100 text-orange-800">
                    📅 This Week
                  </Badge>
                  <Badge className="bg-fixeo-orange-100 text-fixeo-orange-800">
                    ⏰ Flexible
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-fixeo-gray-700 mb-3">
                  Custom Badges
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-fixeo-blue-100 text-fixeo-blue-800 border-fixeo-blue-200">
                    Blue Badge
                  </Badge>
                  <Badge className="bg-fixeo-orange-100 text-fixeo-orange-800 border-fixeo-orange-200">
                    Orange Badge
                  </Badge>
                  <Badge className="bg-fixeo-gray-100 text-fixeo-gray-800 border-fixeo-gray-200">
                    Gray Badge
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white border-fixeo-gray-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-fixeo-gray-900">
                Default Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-fixeo-gray-600">
                Standard card with gray border and white background.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-fixeo-blue-50 border-fixeo-blue-300 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-fixeo-blue-900">
                Highlighted Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-fixeo-blue-700">
                Featured card with blue background and border.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-fixeo-orange-50 border-fixeo-orange-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-fixeo-orange-900">
                Accent Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-fixeo-orange-700">
                Accent card with orange background and border.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-fixeo-gray-50 border-fixeo-gray-300 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-fixeo-gray-900">
                Neutral Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-fixeo-gray-600">
                Neutral card with gray background and border.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Typography Showcase */}
        <Card className="bg-white border-fixeo-gray-200">
          <CardHeader>
            <CardTitle className="text-fixeo-gray-900">
              Typography Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-fixeo-gray-900 mb-2">
                  Primary Heading
                </h1>
                <p className="text-fixeo-gray-600">
                  Using fixeo-gray-900 for primary headings
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-fixeo-gray-800 mb-2">
                  Secondary Heading
                </h2>
                <p className="text-fixeo-gray-600">
                  Using fixeo-gray-800 for secondary headings
                </p>
              </div>

              <div>
                <p className="text-fixeo-gray-900 mb-1">
                  Primary body text using fixeo-gray-900
                </p>
                <p className="text-fixeo-gray-600 mb-1">
                  Secondary body text using fixeo-gray-600
                </p>
                <p className="text-fixeo-gray-400">
                  Muted text using fixeo-gray-400
                </p>
              </div>

              <div>
                <a
                  href="#"
                  className="text-fixeo-blue-600 hover:text-fixeo-blue-700 underline"
                >
                  Link using fixeo-blue-600
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p
            className="text-sm"
            style={{ color: "var(--color-fixeo-gray-500)" }}
          >
            This color system uses OKLCH color space for consistent, accessible
            colors across all UI elements.
          </p>
        </div>
      </div>
    </div>
  );
}
