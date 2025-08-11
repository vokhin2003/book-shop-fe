# Khắc phục hiện tượng Flash 403 trong Book Management

## Vấn đề
Khi truy cập trang `/admin/book`, component `Result` với status 403 (Truy cập bị từ chối) thường xuất hiện trong một khoảng thời gian ngắn trước khi hiển thị bảng dữ liệu. Hiện tượng này được gọi là "flash" và gây ra trải nghiệm người dùng không tốt.

## Nguyên nhân
1. **Component `Access` có state `allow` mặc định là `true`**
2. **Khi component mount, `permissions` từ Redux store có thể chưa được load xong** (vẫn là `[]` hoặc `undefined`)
3. **Component render với `allow = true` trước, sau đó khi `permissions` được load xong, `useEffect` chạy và set `allow = false`**
4. **Điều này gây ra hiện tượng "flash" - hiển thị nội dung trước, rồi mới hiển thị 403**

## Giải pháp đã áp dụng

### 1. Cải thiện component `Access` (`src/components/share/access.tsx`)
- Thay đổi state `allow` từ `boolean` thành `boolean | null` (null = loading)
- Thêm dependency `isLoading` vào `useEffect`
- Chỉ check permission khi không còn loading và permissions đã được load
- Thêm option `showLoading` để hiển thị loading state nếu cần
- Không render gì cả khi đang loading (trừ khi `showLoading = true`)

### 2. Cải thiện component `BookTab` (`src/pages/admin/book/book.tab.tsx`)
- Thêm loading state từ Redux store
- Chỉ filter tabs khi không còn loading và permissions đã được load
- Hiển thị loading spinner khi đang check permissions

### 3. Cập nhật tất cả các trang admin
- Thêm `showLoading={true}` cho component `Access` chính trong:
  - `BookPage` (`src/pages/admin/book/book.tsx`)
  - `CategoryPage` (`src/pages/admin/book/category.tsx`)
  - `UserPage` (`src/pages/admin/user.tsx`)
  - `RolePage` (`src/pages/admin/role.tsx`)
  - `PermissionPage` (`src/pages/admin/permission.tsx`)
  - `OrderPage` (`src/pages/admin/order/order.tsx`)

## Cách hoạt động mới

1. **Khi component mount**: `allow = null` (loading state)
2. **Nếu `showLoading = true`**: Hiển thị loading spinner
3. **Nếu `showLoading = false`**: Không render gì cả
4. **Khi permissions được load xong**: Check permission và set `allow = true/false`
5. **Render nội dung hoặc 403 error**: Không còn hiện tượng flash

## Lợi ích

- ✅ **Loại bỏ hiện tượng flash 403**
- ✅ **Trải nghiệm người dùng mượt mà hơn**
- ✅ **Loading state rõ ràng**
- ✅ **Áp dụng nhất quán cho tất cả các trang admin**
- ✅ **Không ảnh hưởng đến chức năng permission check**

## Lưu ý

- Các component `Access` với `hideChildren={true}` (như buttons) không cần thay đổi
- Chỉ các component `Access` chính (bao bọc toàn bộ nội dung trang) cần thêm `showLoading={true}`
- Loading state sẽ hiển thị cho đến khi permissions được load xong và check hoàn tất
