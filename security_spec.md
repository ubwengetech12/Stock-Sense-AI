# Firebase Security Specification - StockSense AI

## 1. Data Invariants
- A Product must have a valid `userId` matching the authenticated user.
- Sales records must link to a valid Product ID owned by the same user.
- Stock quantities cannot be negative.
- Users can only read and write their own data (private per-user isolation).

## 2. The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create a product with `userId: "NOT_ME"`.
2. **Ghost Field**: Add `isAdmin: true` to a SaleRecord.
3. **Invalid Type**: Set `currentStock: "LOTS"` (string instead of integer).
4. **Huge ID**: Use a 2KB string as a `productId`.
5. **Orphaned Sale**: Create a sale for a `productId` that does not exist.
6. **Cross-User Read**: Access `/products/USER_B_PRODUCT_ID` as User A.
7. **Negative Stock**: Update `currentStock` to `-50`.
8. **Immutable Field Attack**: Try to change `createdAt` on an existing Product.
9. **Bulk Delete**: Attempt to delete all products in a single operation without ownership check.
10. **Price Manipulation**: Customer trying to update the `sellingPrice` of a product.
11. **Spoofed Email**: Use an unverified email token to gain access (if email check enabled).
12. **System Field Injection**: Attempting to write to a hypothetical `ai_insights` internal field.

## 3. Test Runner (Draft Logic)
- Login as User A.
- Attempt each payload.
- Expect `PERMISSION_DENIED`.
