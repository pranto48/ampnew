"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Clock, Server, RefreshCw, Info } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Product, getProducts } from "@/services/portalService"; // Assuming portalService.ts exists and has getProducts
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      showSuccess("Products loaded successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to load products from the license portal. Ensure you are logged into the portal.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleBuyNow = (product: Product) => {
    // Redirect to the external portal's product page or cart page
    // For simplicity, we'll redirect to the main products page of the portal.
    const portalUrl = `https://portal.itsupport.com.bd/products.php`;
    window.open(portalUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card text-foreground border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Package className="h-5 w-5" />
            Available License Products
          </CardTitle>
          <CardDescription>
            Browse licenses for AMPNM and other applications. Click 'Buy Now' to proceed to the external license portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={fetchProducts} disabled={isLoading} variant="outline" className="bg-secondary hover:bg-secondary/80 text-foreground border-border">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh List
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 space-y-3 bg-background border-border">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border rounded-lg bg-muted border-border">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>No products are currently available in the license portal.</p>
              <p className="text-sm mt-2">
                Please ensure you are logged into the <a href="https://portal.itsupport.com.bd/login.php" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">IT Support BD Portal</a>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="flex flex-col justify-between bg-background border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-foreground">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-lg font-bold text-primary">
                      <DollarSign className="h-5 w-5" />
                      {product.price === 0 ? 'FREE' : `$${product.price.toFixed(2)}`}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Server className="h-4 w-4" />
                        <span>Max Devices: {product.max_devices === 99999 ? 'Unlimited' : product.max_devices}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Duration: {product.license_duration_days / 365} Year(s)</span>
                      </div>
                    </div>
                    <Button onClick={() => handleBuyNow(product)} className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                      {product.price === 0 ? 'Get Free License' : 'Buy Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="p-3 border rounded-lg bg-blue-500/10 text-blue-400 flex items-start gap-2 border-primary mt-6">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Important:</p>
              <p className="text-sm">
                Purchasing or renewing licenses will redirect you to the external
                <a href="https://portal.itsupport.com.bd/products.php" target="_blank" rel="noopener noreferrer" className="underline ml-1 text-primary hover:text-primary/80">IT Support BD Portal</a>.
                Your license key will then be available in the "License Details" tab after purchase.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;