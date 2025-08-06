export const ALL_PERMISSIONS = {
  CATEGORIES: {
    GET_PAGINATE: {
      method: "GET",
      path: "/api/v1/categories",
      module: "CATEGORIES",
    },
    CREATE: {
      method: "POST",
      path: "/api/v1/categories",
      module: "CATEGORIES",
    },
    UPDATE: {
      method: "PUT",
      path: "/api/v1/categories/{id}",
      module: "CATEGORIES",
    },
    DELETE: {
      method: "DELETE",
      path: "/api/v1/categories/{id}",
      module: "CATEGORIES",
    },
  },
  BOOKS: {
    GET_PAGINATE: { method: "GET", path: "/api/v1/books", module: "BOOKS" },
    CREATE: { method: "POST", path: "/api/v1/books", module: "BOOKS" },
    UPDATE: { method: "PUT", path: "/api/v1/books/{id}", module: "BOOKS" },
    DELETE: { method: "DELETE", path: "/api/v1/books/{id}", module: "BOOKS" },
  },
  PERMISSIONS: {
    GET_PAGINATE: {
      method: "GET",
      path: "/api/v1/permissions",
      module: "PERMISSIONS",
    },
    CREATE: {
      method: "POST",
      path: "/api/v1/permissions",
      module: "PERMISSIONS",
    },
    UPDATE: {
      method: "PUT",
      path: "/api/v1/permissions/{id}",
      module: "PERMISSIONS",
    },
    DELETE: {
      method: "DELETE",
      path: "/api/v1/permissions/{id}",
      module: "PERMISSIONS",
    },
  },
  // RESUMES: {
  //     GET_PAGINATE: { method: "GET", path: '/api/v1/resumes', module: "RESUMES" },
  //     CREATE: { method: "POST", path: '/api/v1/resumes', module: "RESUMES" },
  //     UPDATE: { method: "PUT", path: '/api/v1/resumes', module: "RESUMES" },
  //     DELETE: { method: "DELETE", path: '/api/v1/resumes/{id}', module: "RESUMES" },
  // },
  ROLES: {
    GET_PAGINATE: { method: "GET", path: "/api/v1/roles", module: "ROLES" },
    CREATE: { method: "POST", path: "/api/v1/roles", module: "ROLES" },
    UPDATE: { method: "PUT", path: "/api/v1/roles/{id}", module: "ROLES" },
    DELETE: { method: "DELETE", path: "/api/v1/roles/{id}", module: "ROLES" },
  },
  USERS: {
    GET_PAGINATE: { method: "GET", path: "/api/v1/users", module: "USERS" },
    CREATE: { method: "POST", path: "/api/v1/users", module: "USERS" },
    UPDATE: { method: "PUT", path: "/api/v1/users/{id}", module: "USERS" },
    DELETE: { method: "DELETE", path: "/api/v1/users/{id}", module: "USERS" },
  },
  ORDERS: {
    GET_PAGINATE: { method: "GET", path: "/api/v1/orders", module: "ORDERS" },
    CREATE: { method: "POST", path: "/api/v1/admin/orders", module: "ORDERS" },
    UPDATE: {
      method: "PUT",
      path: "/api/v1/admin/orders/{id}",
      module: "ORDERS",
    },
  },
};

export const ALL_MODULES = {
  CATEGORIES: "CATEGORIES",
  FILES: "FILES",
  BOOKS: "BOOKS",
  PERMISSIONS: "PERMISSIONS",
  // RESUMES: 'RESUMES',
  ROLES: "ROLES",
  USERS: "USERS",
  ORDERS: "ORDERS",
};
