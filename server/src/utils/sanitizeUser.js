export function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isAccountVerified: user.isAccountVerified,
    createdAt: user.createdAt,
  };
}
