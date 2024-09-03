import { Filter, Plus, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import UploadFood from "../../Components/Upload/Product.upload";
import Modal from "../../Components/Common/Popup/Popup";
import { debounce } from "../../Utility/debounce";
import { Product, GetProductModal } from "../../models/product.model";
import {
  bulkDeleteOfProduct,
  deleteProduct,
  getProducts,
} from "../../Services/product.services";
import { addLogs } from "../../Services/log.services";

import toast from "react-hot-toast";
import UpdateFood from "../../Components/Upload/Product.update.upload";
import Delete, { DeleteButton } from "../../Components/Common/Delete/Delete";
import { FoodTable } from "./Product.table.page";
import { Button } from "../../Components/Common/Button/Button";
import { searchProduct } from "../../Services/product.services";

const FoodPage: React.FC = () => {
  const [isModalOpen, setIsModelOpen] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const [type, setType] = useState<"specials" | "products">();
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [isBulkDelete, setIsBulkDelete] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Product>();
  const [id, setId] = useState<string>();
  const [bulkSelectedProduct, setBulkSelectedProduct] = useState<
    {
      category: "specials" | "products";
      id: string;
    }[]
  >([]);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    perPage: number;
  }>({ currentPage: 1, perPage: 5 });
  const [currentDoc, setCurrentDoc] = useState<{
    currentFirstDoc: string;
    currentLastDoc: string;
  }>();

  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">();
  const [isFilter, setIsFilter] = useState<{
    typeFilter?: "products" | "specials" | string;
    sortFilter?: string;
  }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalData, setTotalData] = useState<number>();

  // get all products
  const getAllProducts = async (data: GetProductModal) => {
    setLoading(true);
    try {
      let products;
      if (pagination.currentPage === 1) {
        products = await getProducts({
          path: data.path,
          pageSize: data.pageSize,
          direction: data.direction,
          filter: data.filter,
          sort: data.sort,
          currentFirstDoc: data.currentFirstDoc || null,
          currentLastDoc: data.currentLastDoc || null,
        });
      }
      // const special = await getSpecialProducts();
      const normalProducts = products.data as {
        currentFirstDoc: string;
        currentLastDoc: string;
        products: Product[];
        length: number;
      };
      setCurrentDoc(() => ({
        currentFirstDoc: normalProducts.currentFirstDoc,
        currentLastDoc: normalProducts.currentLastDoc,
      }));
      setTotalData(normalProducts.length);
      const arrangeNormalProducts: Product[] = normalProducts?.products.map(
        (product: Product) => ({
          id: product.id,
          name: product.name,
          image: product.image,
          quantity: product.quantity as number,
          price: product.price as number,
          tag: product.tag,
          order: Math.floor(Math.random() * (500 - 50 + 1)) + 50,
          rating: Math.floor(Math.random() * (10 - 1 + 1)) + 1,
          revenue: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000,
          type: "products",
        })
      );
      const getAllProducts = [
        ...arrangeNormalProducts,
        // ...arrangeSpecialProducts,
      ];
      setFetchedProducts(getAllProducts as Product[]);
    } catch (error) {
      throw new Error(`Error while fetching products` + error);
    }
    setLoading(false);
  };

  const handleSelectedDelete = async () => {
    const toastLoader = toast.loading("Deleting products...");
    try {
      // Separate products into specials and normal products
      const { specials, products } = bulkSelectedProduct.reduce<{
        specials: string[];
        products: string[];
      }>(
        (acc, product) => {
          if (product.category === "specials") {
            acc.specials.push(product.id);
          } else if (product.category === "products") {
            acc.products.push(product.id);
          }
          return acc;
        },
        { specials: [], products: [] }
      );
      if (specials.length > 0) {
        await bulkDeleteOfProduct({ category: "specials", ids: specials });
      }

      // Perform bulk delete for normal products
      if (products.length > 0) {
        await bulkDeleteOfProduct({ category: "products", ids: products });
      }
      await addLogs({
        action: "delete",
        date: new Date(),
        detail: `Delete Product : specials:${JSON.stringify(
          specials
        )}, products : ${JSON.stringify(products)} `,
      });
      toast.dismiss(toastLoader);
      const refreshProducts = fetchedProducts?.filter((product) => {
        return !specials.includes(product.id) && !products.includes(product.id);
      });
      toast.dismiss(toastLoader);
      setFetchedProducts(refreshProducts);
      toast.success("Successfully deleted");
    } catch (error) {
      toast.dismiss(toastLoader);
      toast.error("Unable to delete products");
      console.error("Error deleting products:", error);
    }
    setIsBulkDelete(false);
  };

  //Sorting
  const handleTypeCheck = async (
    isChecked: boolean,
    value: "specials" | "products"
  ) => {
    if (!isChecked) return setIsFilter((prev) => ({ ...prev, typeFilter: "" }));
    setIsFilter((prev) => ({ ...prev, typeFilter: value }));
  };

  const handleSortCheck = async (
    isChecked: boolean,
    value: "price" | "orders" | "revenue"
  ) => {
    if (!isChecked) return setIsFilter((prev) => ({ ...prev, sortFilter: "" }));
    setIsFilter((prev) => ({ ...prev, sortFilter: value }));
  };

  useEffect(() => {
    // call getAllProducts
    getAllProducts({
      path: (isFilter?.typeFilter as "products" | "specials") || "products",
      pageSize: pagination.perPage,
      currentLastDoc: null,
      direction: "next",
      filter: (isFilter?.sortFilter as keyof Product) || "name",
      sort: sortOrder || "asc",
    });
  }, [
    pagination.perPage,
    isFilter?.sortFilter,
    isFilter?.typeFilter,
    sortOrder,
  ]);

  // delete products
  const handleDelete = async (id: string, type: "specials" | "products") => {
    if (!id && !type) return toast.error(`${id} || ${type} not found`);
    const toastLoader = toast.loading("Deleting product...");
    try {
      await deleteProduct({ id: id, type: type });
      toast.dismiss(toastLoader);
      toast.success("Successfully deleted");
      const refreshProducts = fetchedProducts?.filter(
        (product) => product.id !== id
      );
      await addLogs({
        action: "delete",
        date: new Date(),
        detail: `Product : ${id} `,
      });
      setFetchedProducts(refreshProducts);
    } catch (error) {
      toast.dismiss(toastLoader);
      toast.error("Error while deleting...");

      throw new Error("Error while deleting product" + error);
    }
  };
  const handleBulkSelected = (id: string, isChecked: boolean) => {
    const refreshIds = bulkSelectedProduct?.filter(
      (product) => product.id !== id
    );

    isChecked
      ? setBulkSelectedProduct((prev) => {
          const newProduct = prev?.filter((product) => product.id !== id);
          const findProduct = fetchedProducts?.find(
            (product) => product.id === id
          );
          return newProduct
            ? [
                ...newProduct,
                { category: findProduct?.type, id: findProduct?.id },
              ]
            : [{ category: findProduct?.type, id: findProduct?.id }];
        })
      : setBulkSelectedProduct(refreshIds);
  };
  const handleAllSelected = (isChecked: boolean) => {
    if (isChecked) {
      const allProducts = fetchedProducts?.map((product) => {
        return { category: product.type, id: product.id };
      });
      setBulkSelectedProduct(
        allProducts as {
          category: "specials" | "products";
          id: string;
        }[]
      );
    }
    if (!isChecked) {
      setBulkSelectedProduct([]);
    }
  };

  // fetch next page
  useEffect(() => {
    if (
      pagination.currentPage > 1 &&
      currentDoc?.currentLastDoc &&
      currentDoc.currentLastDoc
    ) {
      const fetchNextPage = async () => {
        setLoading(true);
        try {
          const products = await getProducts({
            path:
              (isFilter?.typeFilter as "products" | "specials") || "products",
            pageSize: pagination.perPage,
            direction: "next",
            filter: (isFilter?.sortFilter as keyof ProductType) || "price",
            sort: sortOrder || "asc",
            currentLastDoc: currentDoc.currentLastDoc,
          });

          const normalProducts = products.data as {
            currentFirstDoc: string;
            currentLastDoc: string;
            products: ProductType[];
            length: number;
          };
          // const number: number = normalProducts.length;

          setCurrentDoc({
            currentFirstDoc: normalProducts.currentFirstDoc,
            currentLastDoc: normalProducts.currentLastDoc,
          });
          setTotalData(normalProducts.length);

          const newProducts = normalProducts.products?.map((product) => ({
            id: product.id,
            name: product.name,
            image: product.image,
            quantity: product.quantity as number,
            price: product.price as number,
            category: product.tag,
            order: 20,
            rating: 4.3,
            revenue: 15000,
            type: "products",
          }));

          setFetchedProducts((prev) => {
            return [
              ...prev,
              ...newProducts.filter(
                (product) => !prev.some((p) => p.id === product.id)
              ),
            ];
          });
        } catch (error) {
          throw new Error(`Error while fetching products: ${error}`);
        }
        setLoading(false);
      };

      fetchNextPage();
    }
  }, [
    pagination.currentPage,
    currentDoc?.currentLastDoc,
    pagination.perPage,
    currentDoc?.currentFirstDoc,
    isFilter?.sortFilter,
    isFilter?.typeFilter,
    sortOrder,
  ]);

  const closeModal = () => setIsModelOpen(true);

  const handleChange = async (value: string) => {
    if (value.length <= 0)
      return getAllProducts({
        path: (isFilter?.typeFilter as "products" | "specials") || "products",
        pageSize: pagination.perPage,
        currentLastDoc: null,
        direction: "next",
        filter: (isFilter?.sortFilter as keyof Product) || "name",
        sort: sortOrder || "asc",
      });

    const filterProducts = (await searchProduct(value)) as Product[];
    const aggregateProducts = filterProducts?.map((product) => {
      return {
        id: product.id,
        name: product.name,
        image: product.image,
        quantity: product.quantity as number,
        price: product.price as number,
        category: product.tag,
        order: Math.floor(Math.random() * (500 - 50 + 1)) + 50,
        rating: Math.floor(Math.random() * (10 - 1 + 1)) + 1,
        revenue: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000,
      };
    });
    setTotalData(aggregateProducts.length);
    setFetchedProducts(aggregateProducts);
  };

  const debounceSearch = useCallback(debounce(handleChange, 300), []);

  return (
    <div className="relative flex flex-col items-start justify-center w-full px-5 py-7 gap-7 ">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col -space-y-1.5 items-start justify-center gap-1">
          <h4 className="text-[1.25rem] font-[600] tracking-wider text-[var(--dark-text)]">
            All Products
          </h4>
          <p className="text-[15px] tracking-wider text-[var(--dark-secondary-text)] text-nowrap ">
            {totalData || 0} entries found
          </p>
        </div>
        <div className="flex items-center justify-center gap-5 ">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setIsModelOpen(!isModalOpen)}
              className="flex items-center gap-2 justify-center bg-[var(--primary-color)] text-white py-[0.5rem] border-[1px] border-[var(--primary-color)] px-4 rounded"
            >
              <Plus strokeWidth={2.5} className="size-5" />
              <p className="text-[16px] tracking-widest ">Item</p>
            </button>
            <Button
              sortFn={(value) => setSortOrder(value)}
              bodyStyle={{
                width: "400px",
                top: "3.5rem",
                left: "-18rem",
              }}
              parent={
                <div className="flex border-[1px] border-[var(--dark-border)] px-4 py-2 rounded items-center justify-start gap-2">
                  <Filter
                    strokeWidth={2.5}
                    className="size-5 text-[var(--dark-secondary-text)]"
                  />
                  <p className="text-[16px] text-[var(--dark-secondary-text)] tracking-widest ">
                    Filter
                  </p>
                </div>
              }
              types={[
                { label: "Specials", value: "specials", id: "fklsdjf" },
                { label: "products", value: "products", id: "fkjdls" },
              ]}
              sort={[
                { label: "Price", value: "price", id: "jfhkdj" },
                { label: "Orders", value: "orders", id: "fkdsj" },
                { label: "Revenue", value: "revenue", id: "flkjdsf" },
              ]}
              checkFn={{
                checkSortFn: (isChecked, value) =>
                  handleSortCheck(isChecked, value),
                checkTypeFn: (isChecked, type) =>
                  handleTypeCheck(isChecked, type),
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-start w-full gap-2 ">
        <div className="flex items-center justify-start sm:w-auto gap-2 w-full ">
          {" "}
          <form action="" className="relative text-[var(--dark-text)] w-full ">
            <input
              id="search"
              type="search"
              onChange={(event) => debounceSearch(event?.target.value)}
              className=" border placeholder:tracking-wider placeholder:text-[16px] placeholder:text-[var(--dark-secondary-text)] outline-none sm:w-[300px] w-full py-2 px-2  border-[var(--dark-border)] bg-[var(--light-background)] rounded-lg  ring-[var(--primary-color)] focus:ring-[3px] duration-150 "
              placeholder="Search for products"
            />
          </form>
          <div className="h-10  w-[1px] bg-[var(--dark-border)] "></div>
          <DeleteButton
            dataLength={bulkSelectedProduct.length}
            deleteFn={() => setIsBulkDelete(true)}
          />
        </div>
        <div className="flex items-center justify-start gap-2">
          {isFilter?.sortFilter && (
            <div className="flex px-2 py-0.5  gap-3 border-[var(--dark-secondary-text)]  items-center rounded border  justify-start">
              <div className="flex gap-1 items-center justify-center">
                <span className="text-[15px] text-[var(--dark-secondary-text)] ">
                  {isFilter.sortFilter && isFilter.sortFilter.toLowerCase()}
                </span>
              </div>
              <button
                onClick={() =>
                  setIsFilter((prev) => ({ ...prev, sortFilter: "" }))
                }
                className=" "
              >
                <X className="text-[var(--danger-text)] " size={20} />
              </button>
            </div>
          )}
          {isFilter?.typeFilter && (
            <div className="flex px-2 py-0.5  gap-3 border-[var(--dark-secondary-text)]  items-center rounded border  justify-start">
              <div className="flex gap-1 items-center justify-center">
                <span className="  text-[15px] text-[var(--dark-secondary-text)] ">
                  {isFilter.typeFilter && isFilter.typeFilter.toLowerCase()}
                </span>
              </div>
              <button
                onClick={() =>
                  setIsFilter((prev) => ({ ...prev, typeFilter: "" }))
                }
                className=" "
              >
                <X className="text-[var(--danger-text)] " size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      <FoodTable
        totalData={totalData as number}
        onPageChange={(page: number) =>
          setPagination((prev) => ({ ...prev, currentPage: page }))
        }
        pagination={{
          currentPage: pagination.currentPage,
          perPage: pagination.perPage,
        }}
        selectedData={bulkSelectedProduct}
        products={fetchedProducts}
        actions={{
          delete: (id) => {
            const findProduct = fetchedProducts?.find(
              (product) => product.id === id
            );
            setType(findProduct?.type);
            setId(id);
            setIsDelete(true);
          },
          edit: (id) => {
            const findProduct = fetchedProducts?.find(
              (product) => product.id === id
            );
            setIsEdit(false);
            setModalData(findProduct);
          },
          checkFn: (id: string, isChecked: boolean) =>
            handleBulkSelected(id, isChecked),
          checkAllFn: (isChecked: boolean) => handleAllSelected(isChecked),
        }}
        loading={loading}
      />

      <Modal close={isModalOpen} closeModal={closeModal}>
        <UploadFood />
      </Modal>
      <Modal close={isEdit} closeModal={() => setIsEdit(true)}>
        <UpdateFood
          product={modalData as Product}
          closeModal={() => setIsEdit(true)}
        />
      </Modal>
      {isDelete && (
        <Delete
          closeModal={() => setIsDelete(false)}
          id={id as string}
          type={type}
          isClose={isDelete}
          setDelete={(id: string, type: "specials" | "products") =>
            handleDelete(id, type)
          }
        />
      )}
      {isBulkDelete && (
        <Delete
          closeModal={() => setIsBulkDelete(false)}
          id={id as string}
          isClose={isBulkDelete}
          setDelete={() => handleSelectedDelete()}
        />
      )}
    </div>
  );
};

export default FoodPage;