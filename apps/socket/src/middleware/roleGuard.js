const roleGuard = (socket, requiredRoles) => {
  const role = socket.data.user?.role;
  if (!role || !requiredRoles.includes(role)) {
    throw new Error(`ROLE_ERROR: Requires one of [${requiredRoles.join(', ')}]`);
  }
};

export default roleGuard;