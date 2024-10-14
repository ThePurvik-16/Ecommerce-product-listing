import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as I from '../common/interface';
import { fetchProducts as apiFetchProducts } from '../api/productApi';
import { apiUrl } from '../common/api_enum';

interface ProductState {
  products: I.SingleProduct[];
  selectedProducts: I.SelectedProducts[];
}

const initialState: ProductState = {
  products: [],
  selectedProducts: [],
};

export const fetchProducts = createAsyncThunk<
  { data: I.SingleProduct[], isSearch: boolean },
  { params: Record<string, string | number>, isSearch: boolean }
>('products/fetchProducts',
  async ({ params, isSearch }) => {
    const url = apiUrl.product_list;
    const response = await apiFetchProducts(url, params);
    return { data: response, isSearch };
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addRemoveProduct: (state, { payload }: PayloadAction<{ productId: number; variantId?: number; discount?: any, index?: number }>) => {
      const { index, productId, variantId } = payload;
      if (index === 0) {
        state.selectedProducts = []
      }

      if (index) {
        if (productId && !variantId) {
          const exists = state.selectedProducts.findIndex((prod) => prod.parent === productId);

          if (exists === -1) {
            const product = state.products.find(prod => prod.id === productId);
            const variantIds = product?.variants ? product.variants.map(variant => variant.id) : [];
            state.selectedProducts.push({
              child: variantIds,
              parent: productId,
            });
          } else {
            state.selectedProducts = state.selectedProducts.filter(prod => prod.parent !== productId);
            const product = state.products.find(prod => prod.id === productId);
            const variantIds = product?.variants ? product.variants.map(variant => variant.id) : [];
            state.selectedProducts.push({
              child: variantIds,
              parent: productId,
            });
          }
        }

        if (productId && variantId) {
          const existingProductIndex = state.selectedProducts.findIndex((prod) => prod.parent === productId);

          if (existingProductIndex === -1) {
            state.selectedProducts.push({ parent: productId, child: [variantId] });
          } else {
            const selectedProduct = state.selectedProducts[existingProductIndex];
            const variants = selectedProduct.child;

            if (!variants.includes(variantId)) {
              state.selectedProducts[existingProductIndex].child.push(variantId);
            }
          }
        }

      } else {
        if (productId && !variantId) {
          const exists = state.selectedProducts.findIndex((prod) => prod.parent === productId);
          if (exists === -1) {
            const product = state.products.find(prod => prod.id === productId);
            const variantIds = product?.variants ? product.variants.map(variant => variant.id) : [];
            state.selectedProducts.push({
              child: variantIds,
              parent: productId,
            });
          } else {
            state.selectedProducts = state.selectedProducts.filter(prod => prod.parent !== productId);
          }
        }

        if (productId && variantId) {
          const existingProductIndex = state.selectedProducts.findIndex((prod) => prod.parent === productId);
          if (existingProductIndex === -1) {
            state.selectedProducts.push({ parent: productId, child: [variantId] });
          } else {
            const selectedProduct = state.selectedProducts[existingProductIndex];
            const variants = selectedProduct.child;

            if (variants.includes(variantId)) {
              state.selectedProducts[existingProductIndex] = {
                ...selectedProduct,
                child: selectedProduct.child.filter(vart => vart !== variantId),
              };
            } else {
              state.selectedProducts[existingProductIndex].child.push(variantId);
            }

            if (state.selectedProducts[existingProductIndex].child.length === 0) {
              state.selectedProducts = state.selectedProducts.filter(prod => prod.parent !== productId);
            }
          }
        }
      }
    },
    updateProducts: (state, { payload }: PayloadAction<any[]>) => {
      state.products = payload;
    },
    updateProductVariants: (
      state,
      { payload }: PayloadAction<{ productId: number; variants: any[] }>
    ) => {
      const { productId, variants } = payload;

      const productIndex = state.products.findIndex(product => product.id === productId);
      if (productIndex !== -1) {
        state.products[productIndex].variants = variants;
      }
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(fetchProducts.fulfilled, (state: any, action: PayloadAction<any>, isSearch: boolean) => {
        const data:any = action
        const page  = data.meta.arg.params.page
        if (isSearch || page === 1) {
          state.products = action.payload.data
        } else {
          state.products = [...state.products, ...action.payload.data]
        }
      })
      .addCase(fetchProducts.rejected, (state: any, action: any) => {
        console.error(action.error.message);
      });
  },
});

export const { addRemoveProduct, updateProducts, updateProductVariants } = productSlice.actions;
export default productSlice.reducer;
