import type { RootState } from "@/lib/store";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/app/definitions";

const initialState = {
  items: [] as CartItem[],
  cartTabStatus: false,
};

const findCartItem = (items: CartItem[], id: number) =>
  items.find((item) => item.id === id);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = findCartItem(state.items, action.payload.id);

      if (!existingItem) {
        state.items.push({
          ...action.payload,
          quantity: 1,
        });
      }
    },
    incrementQuantity: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const existingItem = findCartItem(state.items, id);

      if (existingItem) {
        existingItem.quantity += 1;
      }
    },
    decrementQuantity: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const existingItem = findCartItem(state.items, id);

      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          state.items = state.items.filter((item) => item.id !== id);
        }
      }
    },
    removeItemFromCart: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleCartTab: (state) => {
      state.cartTabStatus = !state.cartTabStatus;
    },
  },
});

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartItemsLength = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce((total: number, item: CartItem) => total + item.quantity, 0)
);

export const selectIsItemInCart = (state: RootState, productID: number) =>
  state.cart.items.some((item: CartItem) => item.id === productID);

export const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce(
    (total: number, item: CartItem) => total + item.price * item.quantity,
    0
  )
);

export const selectCartTabStatus = (state: RootState) =>
  state.cart.cartTabStatus;

export const {
  addItemToCart,
  incrementQuantity,
  decrementQuantity,
  removeItemFromCart,
  clearCart,
  toggleCartTab,
} = cartSlice.actions;

export default cartSlice.reducer;
