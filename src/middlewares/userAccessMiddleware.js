export function checkRole(role) {
    return (req, res, next) => {
        console.log("Entered checkRole middleware:", req.user.role);
        if (req.user && req.user.role === role) {
          console.log("Role is: ", req.user.role);
        next();
      } else {
        res.status(403).send("Access Denied: Unauthorized role");
      }
    };
  }
  