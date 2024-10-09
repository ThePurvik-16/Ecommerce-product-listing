import { memo, useEffect, useMemo, useState } from 'react'
import { PencilIcon, ChevronDownIcon, ChevronUpIcon, XIcon, GripVertical } from 'lucide-react'
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { useDispatch } from 'react-redux';
import { addRemoveProduct, fetchProducts, updateProducts, updateProductVariants } from '../store/productSlice';

export default function AddProducts() {
  const { products, selectedProducts } = useSelector((state: RootState) => state.products)
  const [expandedProducts, setExpandedProducts] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch: AppDispatch = useDispatch()


  const [draggedVariantId, setDraggedVariantId] = useState<string | null>(null);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [draggedProductIndex, setDraggedProductIndex] = useState<number | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchProducts({ limit: 10, page: currentPage })).unwrap();
      } catch (error) {
        console.error(error);
      } finally {
      }
    };

    fetchData();
  }, [dispatch, currentPage]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const bottom = event.currentTarget.scrollHeight === event.currentTarget.scrollTop + event.currentTarget.clientHeight;
    if (bottom) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };
  const MemoImage = memo(({ src }: { src: string }) => {
    return (
      <div>
        <img
          loading='lazy'
          decoding='async'
          src={src}
          alt=""
          className="w-10 h-10 object-cover ml-2"
        />
      </div>
    );
  });
  const selectedProductIds = useMemo(() => {
    return selectedProducts.map(prd => prd.parent)
  }, [selectedProducts]);


  const selectedVariantsIds = useMemo(() => {
    return selectedProducts.map(prd => prd.child).flat(1);
  }, [selectedProducts]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const filteredProducts = Array.from(new Set(products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.variants.some((variant: any) => variant.title.toLowerCase().includes(searchTerm.toLowerCase()))
  ).map(product => product.id)), id => {
    return products.find(product => product.id === id);
  });

  const selectedProductsList = (mainIds: any, variantIds: any) => {
    return filteredProducts
      .filter(product => mainIds.includes(product?.id))
      .map(product => {
        const filteredVariants = product?.variants.filter(variant => variantIds.includes(variant.id));
        return {
          ...product,
          variants: filteredVariants
        };
      })
      .filter((product: any) => product?.variants?.length > 0);
  };
  const [showDiscountInput, setShowDiscountInput] = useState(new Array(selectedProductIds.length).fill(false));
  const toggleDiscountInput = (index: number) => {
    const newShowDiscountInput = [...showDiscountInput];
    newShowDiscountInput[index] = !newShowDiscountInput[index];
    setShowDiscountInput(newShowDiscountInput);
  };

  const toggleVariants = (productId: number) => {
    setExpandedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleDragStart = (productId: string, variantId: string) => {
    setDraggedVariantId(variantId);
    setDraggedProductId(productId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const handleDrop = (productId: string, targetVariantId: string) => {
    if (draggedVariantId && draggedProductId && draggedProductId === productId && draggedVariantId !== targetVariantId) {
      const draggedProduct = products.find((product: any) => product.id === productId);

      if (draggedProduct) {
        const draggedIndex = draggedProduct.variants.findIndex((v: any) => v.id === draggedVariantId);
        const targetIndex = draggedProduct.variants.findIndex((v: any) => v.id === targetVariantId);

        const newVariants = Array.from(draggedProduct.variants);
        const [draggedVariant] = newVariants.splice(draggedIndex, 1);
        newVariants.splice(targetIndex, 0, draggedVariant);

        dispatch(updateProductVariants({ productId: draggedProduct.id, variants: newVariants }));

        setDraggedVariantId(null);
        setDraggedProductId(null);
      }
    }
  };

  const handleDragStartProduct = (productId: string, index: number) => {
    setDraggedProductId(productId);
    setDraggedProductIndex(index);
  };
  const handleDropProduct = (targetIndex: number) => {
    if (draggedProductId !== null && draggedProductIndex !== null && draggedProductIndex !== targetIndex) {
      const newProducts = Array.from(products);
      const [draggedProduct] = newProducts.splice(draggedProductIndex, 1);
      newProducts.splice(targetIndex, 0, draggedProduct);
      dispatch(updateProducts(newProducts));
      setDraggedProductId(null);
      setDraggedProductIndex(null);
    }
  };


  return (
    <>
      <div className="min-h-screen bg-white p-4 md:p-8 lg:p-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8">Add Products</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-2 pl-8">Product</h2>
              {selectedProductsList(selectedProductIds, selectedVariantsIds).length === 0 && (
                <div className="relative">
                  <button
                    className="w-full custom-input-color bg-white border border-gray-300 rounded-md py-2 px-3 text-left focus:outline-none focus:ring-2 focus:custom-border-green-color focus:border-transparent"
                    onClick={toggleModal}
                  >
                    <span className="block truncate">Select Product</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <PencilIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-2 pl-8">Discount</h2>
              {selectedProductsList(selectedProductIds, selectedVariantsIds).length === 0 && (
                <button className="w-full custom-Bg-green-color text-white rounded-md py-2 px-4">
                  Add Discount
                </button>
              )}
            </div>
          </div>
          {selectedProductsList(selectedProductIds, selectedVariantsIds).map((product: any, index) => (
            <>
              <div key={index} className="space-y-2" >
                <div className={`grid ${showDiscountInput[index] ? 'grid-cols-[0.85fr_100px_100px_30px]' : 'grid-cols-[0.85fr_200px]'} gap-4 items-center`}>
                  <div className="flex items-center gap-2 relative">
                    <button draggable
                      onDragStart={() => handleDragStartProduct(product.id, index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropProduct(index)}>
                      <GripVertical className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </button>
                    <span className="text-gray-400">{index + 1}.</span>
                    <button
                      className="w-full custom-input-color bg-white border border-gray-300 rounded-md py-2 px-3 text-left focus:outline-none focus:ring-2 focus:custom-border-green-color focus:border-transparent"
                      onClick={toggleModal}
                    >
                      <span className="block truncate">{product.title}</span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <PencilIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      </span>
                    </button>
                  </div>

                  {showDiscountInput[index] ? (
                    <>
                      <input
                        value={product.discount}
                        onChange={(e) => { }}
                        className="bg-white custom-input-color border border-gray-300 rounded-md py-2 px-3 w-20"
                      />
                      <select className="bg-white custom-input-color border border-gray-300 rounded-md py-2 px-3 w-30">
                        <option>% Off</option>
                        <option>Flat</option>
                      </select>
                      <button onClick={() => dispatch(addRemoveProduct({ productId: product.id }))}>
                        <XIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleDiscountInput(index)}
                      className="w-full custom-Bg-green-color text-white rounded-md py-2 px-4"
                    >
                      Add Discount
                    </button>
                  )}
                </div>
                {expandedProducts.includes(product.id) && (
                  <div className="pl-16 pt-5 space-y-2">
                    {product.variants.map((variant: any) => (
                      <div key={variant.id} className="grid grid-cols-[0.83fr_100px_100px_30px] gap-4 items-center">
                        <div className='flex items-center'>
                          <button draggable onDragStart={() => handleDragStart(product.id, variant.id)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(product.id, variant.id)}>
                            <GripVertical className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          </button>

                          <input
                            value={variant.title}
                            onChange={(e) => { }}
                            className="bg-white custom-input-color border border-gray-300 w-full rounded-3xl py-2 px-3"
                          />
                        </div>
                        <input value="20" className="bg-white custom-input-color border border-gray-300 rounded-3xl py-2 px-3 w-20"
                          onChange={(e) => { }} />
                        <select className="bg-white custom-input-color border border-gray-300 rounded-3xl py-2 px-3 w-30">
                          <option>% Off</option>
                          <option>Flat</option>
                        </select>
                        <button onClick={() => dispatch(addRemoveProduct({ productId: product.id, variantId: variant.id }))}>
                          <XIcon className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className='flex justify-end mr-10'>
                  <button
                    onClick={() => toggleVariants(product.id)}
                    className="text-blue-500 text-sm flex items-end pr-12"
                  >
                    {expandedProducts.includes(product.id) ? (
                      <>Hide variants <ChevronUpIcon className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>Show variants <ChevronDownIcon className="w-4 h-4 ml-1" /></>
                    )}
                  </button>
                </div>
              </div>
              <div className='py-5'>

                <div className='border-b'></div>
              </div>
            </>
          ))}

          <div className="flex justify-center">
            <button className="w-full md:w-auto bg-white custom-green-color border custom-border-green-color rounded-md py-2 px-8" onClick={toggleModal}>
              Add Product
            </button>
          </div>
        </div>
      </div>


      {isModalOpen && (
        <div
          id="default-modal"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 z-50 flex justify-center items-center w-full h-screen bg-black bg-opacity-50"
        >
          <div className="relative p-4 w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 ">
                  Select Products
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                  onClick={toggleModal}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="">
                <div className="p-2 md:p-3 space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search product"
                      className="w-full border rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className='border-b'></div>
                <div className="max-h-96 overflow-y-auto" onScroll={handleScroll}>
                  {filteredProducts.map((product: any, index) => (
                    <>
                      <div key={`${product.id}`} className="p-2 md:p-3 space-y-4">
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-green-600"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => dispatch(addRemoveProduct({ productId: product.id }))}
                          />
                          {product.image && product.image.src && (
                            <MemoImage src={product.image.src} />
                            // <img src={product.image.src} decoding="async" key={`${product.id}-${index}`} loading="lazy" alt={product.title} className="w-10 h-10 object-cover ml-2" />
                          )}
                          <span className="ml-2 font-medium">{product.title}</span>
                        </div>
                      </div>
                      <div className='border-b'></div>
                      {product.variants.map((variant: any) => (
                        <>
                          <div key={`${variant.id}`} className="flex items-center justify-between p-4 pl-7">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-green-600"
                                checked={selectedVariantsIds.includes(variant.id)}
                                onChange={() => dispatch(addRemoveProduct({ productId: product.id, variantId: variant.id }))}
                              />
                              <span className="ml-2">{variant.title}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-4">{variant.available} available</span>
                              <span className="font-medium">${parseInt(variant.price).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className='border-b'></div>
                        </>
                      ))}
                    </>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 border-t">
                <div>{selectedProductIds.length} product{selectedProductIds.length > 1 ? 's' : ''} selected</div>
                <div>
                  <button onClick={toggleModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-2">
                    Cancel
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
