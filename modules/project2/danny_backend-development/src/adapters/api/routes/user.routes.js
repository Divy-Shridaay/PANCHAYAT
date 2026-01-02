const generateCrudRoutes = require("mongoose-crud-generator");
const User = require("../../db/UserModel");
const checkPermission = require("../middlewares/checkPermission");
const sendEmail = require("../../../utils/sendEmail");

const userRouter = generateCrudRoutes({
  model: User,
  modelName: "Users",
  preHooksOptions: {
  create: async (req, res, next) => {
    // Generate default password (plain). Let the User model hash it on save.
    const password = `${req.body.firstName.toUpperCase()}@123`;

    // Set plain password on request body so model pre-save will hash it
    req.body.password = password;

    next();
  },

  },
  postHooksOptions: {
    create: async (req, res) => {
     // mail send "this is your email and password"

      console.log(req.body);

      // Send plain password (req.body.password) generated above
      sendEmail({
        email: req.body.email,
        subject: "Your Password",
        message: `Your Password is ${req.body.password}`,
      });

    },
  },
  middlewareOptions: {
    beforeGetAll: checkPermission("USERS_READ"),
    beforeGetById: checkPermission("USERS_READ"),
    beforeCreate: checkPermission("USERS_CREATE"),
    beforeUpdate: checkPermission("USERS_UPDATE"),
    beforeSoftDelete: checkPermission("USERS_DELETE"),
  },
});

module.exports = userRouter;
