"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingCart,
  Star,
  RefreshCw,
  Heart,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Shirt,
  Coffee,
  Package,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRecommendations } from "../hooks/useRecommendations";
import type { Product } from "../services/recommendation-service";

interface ProductRecommendationsProps {
  userEmail: string;
  className?: string;
}

export function ProductRecommendations({
  userEmail,
  className = "",
}: ProductRecommendationsProps) {
  const {
    recommendations,
    isLoading,
    error,
    getRecommendations,
    refreshRecommendations,
  } = useRecommendations(userEmail);
  const [selectedCategory, setSelectedCategory] = useState<string>("digital");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = [
    {
      id: "digital",
      name: "Kỹ thuật số",
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "clothes",
      name: "Thời trang",
      icon: Shirt,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "food",
      name: "Thực phẩm",
      icon: Coffee,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "orders",
      name: "Dịch vụ",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const currentProducts = recommendations[selectedCategory] || [];

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);

    // Always fetch recommendations when category is selected
    if (userEmail) {
      await getRecommendations(categoryId, userEmail);
    }
  };

  const handleRefresh = () => {
    if (userEmail) {
      refreshRecommendations(userEmail);
    }
  };

  const formatPrice = (price: number) => {
    // Handle Vietnamese pricing (already in thousands)
    if (price > 1000) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
      }).format(price * 1000); // Convert back to full VND amount
    }

    // Handle USD pricing for fallback products
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm">
      <CardContent className="p-3">
        <div className="relative mb-3">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-32 object-cover rounded-lg bg-gray-100"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg?height=200&width=200";
            }}
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
              -{product.discount}%
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(product.id)}
            className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
          >
            <Heart
              className={`w-4 h-4 ${
                favorites.has(product.id)
                  ? "text-red-500 fill-current"
                  : "text-gray-400"
              }`}
            />
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h4>

          <p className="text-xs text-gray-600 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center space-x-1">
            {renderStars(product.rating)}
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-sm text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {!product.inStock && (
              <Badge
                variant="outline"
                className="text-xs text-red-600 border-red-200"
              >
                Hết hàng
              </Badge>
            )}
          </div>

          <div className="flex space-x-1">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
              disabled={!product.inStock}
              onClick={() => {
                if (product.productUrl) {
                  window.open(product.productUrl, "_blank");
                }
              }}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {product.productUrl ? "Mua ngay" : "Thêm vào Giỏ"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 border-gray-200 hover:bg-gray-50"
              onClick={() => {
                if (product.productUrl) {
                  window.open(product.productUrl, "_blank");
                }
              }}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div
      className={`w-80 bg-white border-l border-gray-200 flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">Đề xuất</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className={`h-10 ${
                  isSelected
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-200 hover:bg-gray-50"
                } ${isLoading && isSelected ? "animate-pulse" : ""}`}
              >
                <Icon className="w-4 h-4 mr-1" />
                <span className="text-xs">{category.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {error && (
          <div className="p-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-gray-600">Đang tải đề xuất...</p>
            </div>
          </div>
        ) : currentProducts.length > 0 ? (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Được cá nhân hóa cho bạn
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-center space-y-2">
              <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm text-gray-600">
                {isLoading
                  ? "Đang tải đề xuất..."
                  : "Chọn danh mục để xem đề xuất"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
