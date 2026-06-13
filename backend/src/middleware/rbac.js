export function checkPermission(module, action) {
  return (req, res, next) => {
    const role = req.user.role
    if (role.name === 'Super Admin') return next()

    const perm = role.permissions.find((p) => p.module === module)
    if (!perm || !perm[action]) {
      return res.status(403).json({ message: `No ${action} permission for ${module}` })
    }
    next()
  }
}
