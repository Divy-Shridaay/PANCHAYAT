const generateCrudRoutes = require("mongoose-crud-generator");
const LocalFundMaangnu = require("../../db/LocalFundMaangnuModel");
const Master = require("../../db/MasterModel");

const localFundMaangnuRouter = generateCrudRoutes({
  model: LocalFundMaangnu,
  modelName: "Local Fund Maangnu",
  postHooksOptions: {
    getAll: async (req, res, response) => {
     
// const ids = response.data.data.map((r) => r._id);
// await LocalFundMaangnu.deleteMany({ _id: { $in: ids } });
// return
     
      const master = await Master.findOne({ status: 1 });
     

      const temp = await Promise.all(
        response.data.data.map((r) => {
             const left = parseFloat(r?.left || 0);
          const fajal = parseFloat(r?.fajal || 0);
          const rotating = parseFloat(r?.rotating || 0);
     
          r.total = left + fajal + rotating;

          // const left = parseFloat(r?.left || 0);
          // const fajal = parseFloat(r?.fajal || 0);
          // const rotating = parseFloat(r?.rotating || 0);
          const sarkari =
            (parseFloat(r?.villager?.sarkari || 0) * master.lSarkari) / 100;
          const sivay =
            (parseFloat(r?.villager?.sivay || 0) * master.lSivay) / 100;

          // r.total = left + rotating + sarkari + sivay - fajal;
          r.sarkari = sarkari.toFixed(2);
          r.sivay = sivay.toFixed(2);
          return r;
        })
      );

      return {
        ...response,
        data: {
          ...response.data,
          data: temp,
        },
      };
    },
  },
});

module.exports = localFundMaangnuRouter;
