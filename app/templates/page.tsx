"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, Code, Download, Star, Heart, Zap, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const templates = [
  {
    id: 1,
    name: "Neon Cyber",
    description: "Futuristic portfolio with neon effects and cyberpunk aesthetics",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
    category: "Modern",
    features: ["Neon Glow", "Particle Effects", "3D Animations", "Dark Theme"],
    rating: 4.9,
    downloads: 1234,
    colors: { primary: "#8B5CF6", secondary: "#EC4899", bg: "#0a0a0a", text: "#FFFFFF" },
  },
  {
    id: 2,
    name: "Minimal Clean",
    description: "Clean and professional design with subtle animations",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    category: "Minimal",
    features: ["Clean Design", "Smooth Transitions", "Light Theme", "Typography Focus"],
    rating: 4.8,
    downloads: 987,
    colors: { primary: "#3B82F6", secondary: "#10B981", bg: "#FFFFFF", text: "#1F2937" },
  },
  {
    id: 3,
    name: "Brutalist Bold",
    description: "Bold and experimental design with strong typography",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    category: "Experimental",
    features: ["Bold Typography", "Geometric Shapes", "High Contrast", "Experimental Layout"],
    rating: 4.7,
    downloads: 756,
    colors: { primary: "#EF4444", secondary: "#F59E0B", bg: "#FEF3C7", text: "#1F2937" },
  },
  {
    id: 4,
    name: "Ocean Blue",
    description: "Calm and professional with ocean-inspired color palette",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
    category: "Modern",
    features: ["Ocean Colors", "Smooth Waves", "Professional", "Dark Mode"],
    rating: 4.9,
    downloads: 1456,
    colors: { primary: "#0EA5E9", secondary: "#06B6D4", bg: "#0F172A", text: "#F1F5F9" },
  },
  {
    id: 5,
    name: "Forest Green",
    description: "Nature-inspired design with earthy tones and organic shapes",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    category: "Organic",
    features: ["Earth Tones", "Organic Shapes", "Nature Inspired", "Soft Animations"],
    rating: 4.6,
    downloads: 623,
    colors: { primary: "#22C55E", secondary: "#84CC16", bg: "#0F1F14", text: "#ECFDF5" },
  },
  {
    id: 6,
    name: "Sunset Gradient",
    description: "Warm gradient colors with a creative and artistic feel",
    image: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&h=300&fit=crop",
    category: "Creative",
    features: ["Warm Gradients", "Artistic", "Creative Layout", "Sunset Colors"],
    rating: 4.8,
    downloads: 892,
    colors: { primary: "#F97316", secondary: "#EF4444", bg: "#1C1917", text: "#FEF3C7" },
  },
  {
  id: 7,
  name: "Glassmorphism Pro",
  description: "Modern glassmorphism UI with frosted cards and soft shadows",
  image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=400&h=300&fit=crop",
  category: "Modern",
  features: ["Glass UI", "Blur Effects", "Soft Shadows", "Floating Cards"],
  rating: 4.9,
  downloads: 1678,
  colors: { primary: "#6366F1", secondary: "#A5B4FC", bg: "#0F172A", text: "#F8FAFC" },
},
{
  id: 8,
  name: "Monochrome Grid",
  description: "Black and white grid-based portfolio with editorial vibes",
  image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&h=300&fit=crop",
  category: "Minimal",
  features: ["Grid Layout", "Monochrome", "Editorial Style", "Fast Loading"],
  rating: 4.7,
  downloads: 834,
  colors: { primary: "#000000", secondary: "#737373", bg: "#FFFFFF", text: "#000000" },
},
{
  id: 9,
  name: "Aurora Flow",
  description: "Animated aurora gradients with smooth flowing transitions",
  image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
  category: "Creative",
  features: ["Aurora Gradients", "Motion Effects", "WebGL Ready", "Dark Theme"],
  rating: 4.8,
  downloads: 1192,
  colors: { primary: "#22D3EE", secondary: "#A855F7", bg: "#020617", text: "#E5E7EB" },
},
{
  id: 10,
  name: "Terminal Hacker",
  description: "CLI-inspired portfolio for developers and hackers",
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  category: "Developer",
  features: ["Terminal UI", "Typing Animations", "Green Text", "Retro Feel"],
  rating: 4.9,
  downloads: 2034,
  colors: { primary: "#22C55E", secondary: "#16A34A", bg: "#020617", text: "#22C55E" },
},
{
  id: 11,
  name: "Luxury Black Gold",
  description: "Premium black and gold theme with elegant animations",
  image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=300&fit=crop",
  category: "Premium",
  features: ["Gold Accents", "Luxury Feel", "Smooth Hover", "Dark UI"],
  rating: 4.8,
  downloads: 654,
  colors: { primary: "#D4AF37", secondary: "#A16207", bg: "#020617", text: "#FAFAFA" },
},
{
  id: 12,
  name: "Retro Pixel",
  description: "Pixel-art inspired design with retro gaming aesthetics",
  image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
  category: "Experimental",
  features: ["Pixel Art", "8-bit Fonts", "Retro UI", "Fun Animations"],
  rating: 4.6,
  downloads: 512,
  colors: { primary: "#FACC15", secondary: "#22C55E", bg: "#1E293B", text: "#F8FAFC" },
},
{
  id: 13,
  name: "Pastel Soft",
  description: "Soft pastel colors with friendly and approachable design",
  image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
  category: "Friendly",
  features: ["Pastel Colors", "Rounded UI", "Soft Shadows", "Calm Animations"],
  rating: 4.7,
  downloads: 943,
  colors: { primary: "#F472B6", secondary: "#A78BFA", bg: "#FFF7ED", text: "#374151" },
},
{
  id: 14,
  name: "Startup Pitch",
  description: "Clean startup-style portfolio focused on metrics and impact",
  image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop",
  category: "Business",
  features: ["Metrics Focus", "Charts Ready", "CTA Sections", "Professional UI"],
  rating: 4.8,
  downloads: 1311,
  colors: { primary: "#2563EB", secondary: "#22C55E", bg: "#F8FAFC", text: "#0F172A" },
}

]

const categories = ["All", "Modern", "Minimal", "Experimental", "Organic", "Creative"]

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null)

  const filteredTemplates = selectedCategory === "All"
    ? templates
    : templates.filter((t) => t.category === selectedCategory)

  const handleUseTemplate = (template: typeof templates[0]) => {
    // Save template to localStorage and redirect to builder
    const portfolioData = {
      name: "",
      title: "",
      bio: "",
      email: "",
      github: "",
      linkedin: "",
      profilePicture: "",
      projects: [],
      skills: [],
      theme: {
        name: template.name,
        primaryColor: template.colors.primary,
        secondaryColor: template.colors.secondary,
        backgroundColor: template.colors.bg,
        textColor: template.colors.text,
        font: "Inter",
        layout: "grid",
      },
      animations: true,
      soundEffects: false,
    }
    localStorage.setItem("portfolio-data", JSON.stringify(portfolioData))
    window.location.href = "/builder"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Portfolio Templates</h1>
                <p className="text-sm text-gray-400 hidden sm:block">Choose from our collection of stunning templates</p>
              </div>
            </div>
            <Link href="/builder">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Start Building
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
                : "border-white/30 text-white hover:bg-white/10 bg-transparent"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-black/30 backdrop-blur-md border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col">
                <div className="relative overflow-hidden group">
                  <img
                    src={template.image || "/placeholder.svg"}
                    alt={template.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                      className="border-white text-white hover:bg-white hover:text-black bg-transparent"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Use
                    </Button>
                  </div>

                  {/* Category Badge */}
                  <Badge className="absolute top-3 left-3 bg-purple-600/90 text-white border-0">
                    {template.category}
                  </Badge>

                  {/* Color Preview */}
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <div className="w-5 h-5 rounded-full border-2 border-white/50" style={{ backgroundColor: template.colors.primary }} />
                    <div className="w-5 h-5 rounded-full border-2 border-white/50" style={{ backgroundColor: template.colors.secondary }} />
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{template.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/10 text-gray-300 text-xs border-0">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{template.downloads.toLocaleString()} uses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>Popular</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                      className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 md:mt-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Create your own custom portfolio from scratch with our powerful builder
          </p>
          <Link href="/builder">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 hover:from-yellow-600 hover:via-red-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-bold rounded-full"
            >
              Start From Scratch
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTemplate(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedTemplate.image || "/placeholder.svg"}
                alt={selectedTemplate.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedTemplate(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedTemplate.name}</h2>
                <Badge className="bg-purple-600 text-white">{selectedTemplate.category}</Badge>
              </div>

              <p className="text-gray-300 mb-6">{selectedTemplate.description}</p>

              {/* Color Palette */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Color Palette</h3>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg border border-white/20" style={{ backgroundColor: selectedTemplate.colors.primary }} />
                    <span className="text-xs text-gray-400 mt-1">Primary</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg border border-white/20" style={{ backgroundColor: selectedTemplate.colors.secondary }} />
                    <span className="text-xs text-gray-400 mt-1">Secondary</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg border border-white/20" style={{ backgroundColor: selectedTemplate.colors.bg }} />
                    <span className="text-xs text-gray-400 mt-1">Background</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg border border-white/20" style={{ backgroundColor: selectedTemplate.colors.text }} />
                    <span className="text-xs text-gray-400 mt-1">Text</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Features Included</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTemplate.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-4 h-4 text-green-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>{selectedTemplate.rating} rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>{selectedTemplate.downloads.toLocaleString()} uses</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Use This Template
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
