const User = require("../../db/UserModel");

const checkPermission = (requiredPermission) => async (req, res, next) => {
  const user = await User.findById(req.user).populate("role");

  if (!user) {
    return res.status(404).json({ message: "User not found", status: false });
  }

  if (!user.role) {
    return res.status(403).json({ message: "User role not found", status: false });
  }

  // Role.permissions is a plain string array
  const rolePermissions = new Set(user.role.permissions || []);

  // Extra & Revoked permissions (also string arrays)
  const extraPermissions = new Set(user.extraPermissions || []);
  const revokedPermissions = new Set(user.revokedPermissions || []);

  // Merge all permissions
  const finalPermissions = new Set([
    ...rolePermissions,
    ...extraPermissions,
  ]);

  // Remove revoked
  revokedPermissions.forEach((p) => finalPermissions.delete(p));

  // Check required permission
  // Helper: check permission with common aliases (READ<->VIEW, UPDATE<->EDIT, plural/singular)
  const hasPermission = (permSet, perm) => {
    if (permSet.has(perm)) return true;

    // READ <-> VIEW
    const altReadView = perm.includes("READ") ? perm.replace("READ", "VIEW") : perm.includes("VIEW") ? perm.replace("VIEW", "READ") : null;
    if (altReadView && permSet.has(altReadView)) return true;

    // UPDATE <-> EDIT
    const altUpdateEdit = perm.includes("UPDATE") ? perm.replace("UPDATE", "EDIT") : perm.includes("EDIT") ? perm.replace("EDIT", "UPDATE") : null;
    if (altUpdateEdit && permSet.has(altUpdateEdit)) return true;

    // singular/plural resource part (assumes format RESOURCE_ACTION)
    const parts = perm.split("_");
    if (parts.length >= 2) {
      const resource = parts[0];
      const action = parts.slice(1).join("_");
      const singular = resource.endsWith("S") ? resource.slice(0, -1) : resource + "S";
      const alt1 = `${singular}_${action}`;
      if (permSet.has(alt1)) return true;

      // also try action synonyms on the alt
      if (altReadView) {
        const altReadViewAlt = alt1.replace("READ", "VIEW");
        if (permSet.has(altReadViewAlt)) return true;
      }
      if (altUpdateEdit) {
        const altUpdateEditAlt = alt1.replace("UPDATE", "EDIT");
        if (permSet.has(altUpdateEditAlt)) return true;
      }
    }

    return false;
  };

  if (!hasPermission(finalPermissions, requiredPermission)) {
    return res.status(403).json({
      message: "You do not have permission to perform this action",
      status: false,
    });
  }

  next();
};

module.exports = checkPermission;
