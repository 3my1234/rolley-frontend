import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";

export interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  discount?: number;
  inStock?: boolean;
  className?: string;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  onViewDetails?: () => void;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ 
    title, 
    description, 
    price, 
    originalPrice,
    image, 
    rating = 0,
    reviewCount = 0,
    discount,
    inStock = true,
    className, 
    onAddToCart,
    onAddToWishlist,
    onViewDetails,
    ...props 
  }, ref) => {
    const discountPercentage = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

    return (
      <Card
        ref={ref}
        className={cn("h-full overflow-hidden group", className)}
        {...props}
      >
        <div className="relative aspect-square w-full overflow-hidden">
          {image && (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              -{discountPercentage}%
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onAddToWishlist}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <CardHeader>
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            {rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                {reviewCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">${price.toFixed(2)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {onAddToCart && inStock && (
              <Button 
                className="flex-1" 
                onClick={onAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            )}
            {onViewDetails && (
              <Button variant="outline" className="flex-1" onClick={onViewDetails}>
                View Details
              </Button>
            )}
          </div>
          {!inStock && (
            <Badge variant="destructive" className="w-full justify-center">
              Out of Stock
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

export { ProductCard };
