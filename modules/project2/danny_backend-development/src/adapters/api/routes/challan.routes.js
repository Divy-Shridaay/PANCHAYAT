const generateCrudRoutes = require("mongoose-crud-generator");
const checkPermission = require("../middlewares/checkPermission");
const Challan = require("../../db/ChallanModel");
const { response } = require("express");

const challanRouter = generateCrudRoutes({
  model: Challan,
  modelName: "Challan",
  middlewareOptions: {
    beforeGetAll: checkPermission("CHALLAN_READ"),
    beforeGetById: checkPermission("CHALLAN_READ"),
    beforeCreate: checkPermission("CHALLAN_CREATE"),
    beforeUpdate: checkPermission("CHALLAN_UPDATE"),
    beforeSoftDelete: checkPermission("CHALLAN_DELETE"),
  },
  preHooksOptions: {
    create: async (req, res) => {
      // const lastEntry = await Challan.findOne({type: req.body.type})
      //   .sort({ challanNo: -1 })
      //   .select("challanNo")
      //   .lean();
      // const nextChallanNo = parseInt(lastEntry?.challanNo || 0) + 1;
      // req.body.challanNo = nextChallanNo;
    },
  },
  postHooksOptions: {
    getAll: async (req, res, response) => {
      try {
        console.log(req.query.limit);
        if (req.query.limit == 100000  || req.query.limit == 10000) {
          // console.log(response.data.data);
          const temp = response.data.data || []
           temp.sort((a, b) => {
            const na = parseInt(a.challanNo, 10);
            const nb = parseInt(b.challanNo, 10);

            const va = Number.isNaN(na) ? Number.POSITIVE_INFINITY : na;
            const vb = Number.isNaN(nb) ? Number.POSITIVE_INFINITY : nb;
            return va - vb;
          });

          response.data.data = temp

          return response;
        }
      } catch (error) {}
    },
  },
});

module.exports = challanRouter;
