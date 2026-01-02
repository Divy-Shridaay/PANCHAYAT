import React, { createContext, useContext, useState } from "react";

// Create a context to store the user document
const UserContext = createContext();

// Custom hook to access the user document from the context
export const useUser = () => useContext(UserContext);

// Provider component to wrap the application and provide the user document
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permission, setPermission] = useState(null);

 const updateUser = (newUser) => {
  setUser(newUser);

  // Normalize roles (backend sends single role)
  const roles = Array.isArray(newUser.roles)
    ? newUser.roles
    : newUser.role
    ? [newUser.role]
    : [];

  // Get all role permissions safely
  let rolePermissions = roles.flatMap((role) => role.permissions || []);

  // Remove revoked permissions
  rolePermissions = rolePermissions.filter(
    (perm) => !newUser.revokedPermissions?.includes(perm)
  );

  // Add extra permissions
  const finalPermissions = [
    ...new Set([
      ...rolePermissions,
      ...(newUser.extraPermissions || []),
    ]),
  ];

  setPermission(finalPermissions);
};


  return (
    <UserContext.Provider value={{ user, updateUser, permission }}>
      {children}
    </UserContext.Provider>
  );
};