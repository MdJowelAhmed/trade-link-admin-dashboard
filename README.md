# Dashboard Template

A production-ready, scalable React dashboard with reusable components for User Management, Product Management, and Category Management.

## Features

- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- 🔄 **State Management** - Redux Toolkit for predictable state management
- 📱 **Responsive** - Mobile-first design that works on all devices
- 🌙 **Dark Mode** - Built-in theme switcher with light/dark modes
- 🔍 **Search & Filter** - Reusable search and filter components
- 📄 **Pagination** - Flexible pagination with customizable page sizes
- 🖼️ **Image Upload** - Drag & drop image uploader with preview
- 📝 **Form Validation** - React Hook Form with Zod validation
- 🎭 **Modal System** - Reusable modal wrapper for CRUD operations
- ✨ **Animations** - Smooth transitions with Framer Motion

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Redux Toolkit** - State Management
- **React Router 6** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **React Hook Form** - Form Management
- **Zod** - Schema Validation
- **Framer Motion** - Animations
- **Lucide Icons** - Icon Library

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── DataTable.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchInput.tsx
│   │   ├── FilterDropdown.tsx
│   │   ├── ModalWrapper.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Form/
│   │       ├── FormInput.tsx
│   │       ├── FormSelect.tsx
│   │       └── FormTextarea.tsx
│   ├── layout/          # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/              # shadcn/ui components
│
├── pages/
│   ├── Dashboard/
│   ├── Users/
│   │   ├── UserList.tsx
│   │   ├── UserDetails.tsx
│   │   └── components/
│   ├── Products/
│   │   ├── ProductList.tsx
│   │   ├── AddEditProductModal.tsx
│   │   ├── DeleteProductModal.tsx
│   │   └── components/
│   ├── Categories/
│   │   ├── CategoryList.tsx
│   │   ├── AddEditCategoryModal.tsx
│   │   ├── DeleteCategoryModal.tsx
│   │   └── components/
│   └── Settings/
│       ├── Profile/
│       ├── ChangePassword/
│       ├── Terms/
│       └── Privacy/
│
├── redux/
│   ├── store.ts
│   ├── hooks.ts
│   └── slices/
│       ├── userSlice.ts
│       ├── productSlice.ts
│       ├── categorySlice.ts
│       └── uiSlice.ts
│
├── types/               # TypeScript types
├── utils/               # Utility functions
├── App.tsx
└── main.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd templete-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Reusable Components

#### DataTable

```tsx
<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
  rowKeyExtractor={(row) => row.id}
  onRowClick={(row) => handleRowClick(row)}
  actions={(row) => <ActionMenu row={row} />}
  emptyMessage="No data found"
/>
```

#### SearchInput

```tsx
<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Search..."
  debounceMs={300}
/>
```

#### FilterDropdown

```tsx
<FilterDropdown
  value={status}
  options={statusOptions}
  onChange={setStatus}
  placeholder="All Status"
/>
```

#### Pagination

```tsx
<Pagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={limit}
  onPageChange={setPage}
  onItemsPerPageChange={setLimit}
/>
```

#### ModalWrapper

```tsx
<ModalWrapper
  open={isOpen}
  onClose={closeModal}
  title="Modal Title"
  description="Modal description"
  size="md"
>
  <ModalContent />
</ModalWrapper>
```

#### ConfirmDialog

```tsx
<ConfirmDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  description="Are you sure?"
  confirmText="Yes, proceed"
  variant="danger"
/>
```

#### ImageUploader

```tsx
<ImageUploader
  value={image}
  onChange={setImage}
  maxSize={5 * 1024 * 1024}
/>
```

### Redux State Management

```tsx
// Using hooks
const dispatch = useAppDispatch()
const { list, filters, pagination } = useAppSelector((state) => state.users)

// Dispatching actions
dispatch(setFilters({ search: 'john' }))
dispatch(setPage(2))
dispatch(addUser(newUser))
```

## Customization

### Theme Colors

Edit `src/index.css` to customize the color palette:

```css
:root {
  --primary: 262 83% 58%;
  --primary-foreground: 0 0% 100%;
  /* ... other colors */
}
```

### Adding New Pages

1. Create a new folder in `src/pages/`
2. Add your page component
3. Create a Redux slice if needed
4. Add route in `App.tsx`
5. Add navigation item in `Sidebar.tsx`

## License

MIT License











