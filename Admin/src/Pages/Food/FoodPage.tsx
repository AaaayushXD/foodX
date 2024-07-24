import { Filter, Plus, Search } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import FoodTable from "../../Components/Collection/FoodTable";
import UploadFood from "../../Components/Upload/UploadFood";
import Modal from "../../Components/Common/Popup/Popup";
import { DropDown } from "../../Components/Common/DropDown/DropDown";
import { debounce } from "../../Utility/Debounce";
import Table from "../../Components/Common/Table/Table";
import { ArrangedProduct, ProductType } from "../../models/productMode";
import { getProducts } from "../../Services";
import { deleteProductFromDatabase } from "../../firebase/order";
import { SearchProduct } from "../../Utility/Search";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Reducer/Store";
import { addProducts } from "../../Reducer/Action";
import { FilterButton } from "../../Components/Common/Sorting/Sorting";
import toast from "react-hot-toast";

const FoodPage: React.FC = () => {
  const [isModalOpen, setIsModelOpen] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>("");

  const [fetchedProducts, setFetchedProducts] = useState<ArrangedProduct[]>([]);
  const [productsHeader, setProductsHeader] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<{field : string, order: string}>({ field: "", order: "desc" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  // get all products
  const getAllProducts = async () => {
    setLoading(true);
    try {
      const products = await getProducts();
      const allProducts = (await products.data.products) as ProductType[];
      const arrangeProducts = allProducts?.map((product) => ({
        ID: product.id,
        Name: product.name,
        Image: product.image,
        Quantity: product.quantity,
        Price: product.price,
        Category: product.tag,
      }));
      setFetchedProducts(arrangeProducts as ArrangedProduct[]);
    } catch (error) {
      setError(true);
      return console.log(`Error while fetching products` + error);
    }
    setLoading(false);
  };

  const dispatch = useDispatch<AppDispatch>();

  const handleSelect = async (value: string) => {
    const newOrder = sortOrder.order === "asc" ? "desc" : "asc";

    let sortedCustomers;
    if (value === "Name") {
      sortedCustomers = [...fetchedProducts].sort((a: any, b: any) =>
        newOrder === "desc"
          ? b.Name.localeCompare(a.Name)
          : a.Name.localeCompare(b.Name)
      );
    }
    if (value === "Quantity") {
      sortedCustomers = [...fetchedProducts].sort((a: any, b: any) =>
        newOrder === "desc" ? b.Quantity - a.Quantity : a.Quantity - b.Quantity
      );
    }
    if (value === "Price") {
      sortedCustomers = [...fetchedProducts].sort((a: any, b: any) =>
        newOrder === "desc" ? b.Price - a.Price : a.Price - b.Price
      );
    }

    setSortOrder({ field: value, order: newOrder });
    setFetchedProducts(sortedCustomers as ArrangedProduct[]);
  };

  useEffect(() => {
    // call getAllProducts
    getAllProducts();
  }, []);

  // delete products
  const handleClick = async (id: string) => {
    try {
     const toastLoading =  toast.loading("Product deleting...")
      await deleteProductFromDatabase(id);
      const refreshOrder = await getProducts();
      toast.dismiss(toastLoading)
      toast.success("Deleted successfully")
      setFetchedProducts(refreshOrder.data.products);
    } catch (error) {
      throw new Error("Unable to delete order");
    }
  };

  // headers buttons
  useEffect(() => {
    if (fetchedProducts?.length > 0) {
      const headers = Object.keys(fetchedProducts[0]);
      headers.push("Button");
      setProductsHeader(headers);
    }

    if (fetchedProducts.length > 0) {
      fetchedProducts?.forEach((product) => {
        dispatch(
          addProducts({
            id: product.ID,
            name: product.Name,
            quantity: product.Quantity,
            price: product.Price,
            image: product.Image,
            category: product.Category,
          })
        );
      });
    }
  }, [fetchedProducts, dispatch]);

  useEffect(() => {
    (async () => {
      if (userSearch?.length > 0) {
        const getAllProducts = await getProducts();
        const filterProducts = SearchProduct(
          getAllProducts.data.products,
          userSearch
        );
        const arrangeProducts = filterProducts?.map((product) => ({
          ID: product.id,
          Name: product.name,
          Image: product.image,
          Quantity: product.quantity,
          Price: product.price,
          Category: product.tag,
        }));
        setFetchedProducts(arrangeProducts as any);
      } else {
        getAllProducts();
      }
    })();
  }, [userSearch]);

  const closeModal = () => setIsModelOpen(true);

  const handleChange = (value: string) => {
    setUserSearch(value);
  };

  const debounceSearch = useCallback(debounce(handleChange, 300), [userSearch]);

  return (
    <div className="relative flex flex-col items-start justify-center w-full px-5 py-7 gap-7 ">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start justify-center">
          <h4 className="text-[1.25rem] font-[600] tracking-wide text-[var(--dark-text)]">
            All products
          </h4>
          <p className="text-[14px] text-[var(--dark-secondary-text)] text-nowrap ">
            {fetchedProducts?.length} entries found
          </p>
        </div>
        <div className="flex items-center justify-center gap-5 ">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setIsModelOpen(!isModalOpen)}
              className="flex items-center gap-2 justify-center bg-[var(--primary-color)] text-[var(--light-foreground)] py-[0.5rem] border-[1px] border-[var(--primary-color)] px-4 rounded"
            >
              <Plus className="size-4" />
              <p className="text-[15px]">Item</p>
            </button>
            <DropDown
              children={
                <>
                  <Filter className="size-4 text-[var(--dark-secondary-text)]" />
                  <span className="text-[var(--dark-secondary-text)]">
                    Filter
                  </span>
                </>
              }
              options={[
                <FilterButton
                  
                sortOrder={sortOrder.order}
                  onSelect={handleSelect}
                  sortingOptions={["Name", "Quantity", "Price"]}
                />,
              ]}
              style={{
                display: "flex",
                fontSize: "15px",
                borderRadius: "4px",
                padding: "0.5rem 1rem 0.5rem 1rem",
                color: "var(--dark-text)",
                border: "1px solid var(--light-secondary-text)  ",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: "",
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-start w-full ">
        <form action="" className="relative w-full">
          <input
            id="search"
            type="search"
            onChange={(event) => debounceSearch(event?.target.value)}
            className=" border placeholder:text-sm placeholder:text-[var(--dark-secondary-text)] outline-none sm:w-[300px] w-full py-2 px-2  border-[var(--dark-secondary-background)] bg-[var(--light-background)] rounded-lg  focus:border-[var(--primary-color)] "
            placeholder="Search for products"
          />
        </form>
      </div>

      <Table
        pagination={{ currentPage: 1, perPage: 7 }}
        bodyStyle={{
          gridTemplateColumns: "repeat(8,1fr)",
        }}
        headerStyle={{
          display: "grid",
          gridTemplateColumns: "repeat(8,1fr)",
        }}
        headers={productsHeader}
        data={fetchedProducts as ArrangedProduct[]}
        actions={handleClick}
        loading={loading}
        error={error}
      />

      <Modal close={isModalOpen} closeModal={closeModal}>
        <UploadFood />
      </Modal>
    </div>
  );
};

export default FoodPage;
