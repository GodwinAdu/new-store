"use client"

import BrandSelection from "@/components/commons/BrandSelection"
import CategorySelection from "@/components/commons/CategorySelection"
import { DataTable } from "@/components/table/data-table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { columns } from "./column"
import { fetchAllProducts } from '@/lib/actions/product.actions';

interface Props {
  categories: ICategory[],
  brands: IBrand[]
}
const ProductTable = ({ categories, brands }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [products, setProducts] = useState<IProduct[] | []>([])


  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchAllProducts();
      setProducts(response);


    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [selectedBrand, selectedCategory]);
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <BrandSelection SelectedBrand={(value) => setSelectedBrand(value)} brands={brands} />
          <CategorySelection
            SelectedCategory={(value) => setSelectedCategory(value)}
            categories={categories}
          />
          <Button disabled={isLoading} size="sm" onClick={() => { }}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable isLoading={isLoading} searchKey="name" columns={columns} data={products} />

    </>
  )
}

export default ProductTable