const generateCrudRoutes = require("mongoose-crud-generator");
const LandMaangnu = require("../../db/LandMaangnuModel");
const Taluka = require("../../db/TalukaModel");
const Village = require("../../db/VillageModel");

const landMaangnuRouter = generateCrudRoutes({
  model: LandMaangnu,
  modelName: "Land Maangnu",
  postHooksOptions: {
    getAll: async (req, res, response) => {
      //     const ids = response.data.data.map((r) => r._id);
      // await LandMaangnu.deleteMany({ _id: { $in: ids } });
      // return;

      const { village } = req.query;


      const villageData = await Village.findById(village);

      

      const taluka = await Taluka.findById(villageData.taluka);

      let isLocal = false;

      if (["માણસા", "વિજાપુર"].includes(taluka.name.trim())) {
        isLocal = true;
      }

      const temp = await Promise.all(
        response.data.data.map((r) => {
          let local = 0;

          const left = parseFloat(r?.left || 0);
          const fajal = parseFloat(r?.fajal || 0);
          const rotating = parseFloat(r?.rotating || 0);
          const sarkari = parseFloat(r?.villager?.sarkari || 0);
          const sivay = parseFloat(r?.villager?.sivay || 0);

          r.sarkari = sarkari;
          r.sivay = sivay;

          r.total = left + sarkari + sivay + rotating - fajal;

          if (isLocal && !["વિજાપુર"].includes(taluka.name.trim())) {
            local = parseFloat(r.sarkari * 2 + r.sivay * 2);
            r.local = local;
          }

          if (isLocal && ["વિજાપુર"].includes(taluka.name.trim())) {
            local = parseFloat(r.sarkari / 2 + r.sivay / 2);
            r.local = local;
          }

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

module.exports = landMaangnuRouter;
