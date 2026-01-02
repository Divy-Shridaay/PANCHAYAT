const generateCrudRoutes = require("mongoose-crud-generator");
const EducationCessMaangnu = require("../../db/EducationMaangnuModel");
const Master = require("../../db/MasterModel");

const educationCessMaangnuRouter = generateCrudRoutes({
  model: EducationCessMaangnu,
  modelName: "Education Cess Maangnu",
  postHooksOptions: {
    getAll: async (req, res, response) => {


// const ids = response.data.data.map((r) => r._id);
// await EducationCessMaangnu.deleteMany({ _id: { $in: ids } });
// return;


      const master = await Master.findOne({ status: 1 });
 
      
      const temp = await Promise.all(
        response.data.data.map((r) => {
          const left = parseFloat(r?.left || 0).toFixed(2);
          const fajal = parseFloat(r?.fajal || 0);
          const rotating = parseFloat(r?.rotating || 0);
     
          r.total = left + fajal + rotating;
          //       const left = parseFloat(r?.left || 0);
          // const fajal = parseFloat(r?.fajal || 0);
          // const rotating = parseFloat(r?.rotating || 0);
          // const sarkari =
          //   parseFloat((parseFloat(r?.villager?.sarkari || 0) * master.sSarkari) / 100);

          const sarkari = parseFloat(
        ((parseFloat(r?.villager?.sarkari || 0) * master.sSarkari) / 100)
      );

          // const sivay =
          //   parseFloat((parseFloat(r?.villager?.sivay || 0) * master.sSivay) / 100).toFixed(2);


         const sivay =    parseFloat(
        ((parseFloat(r?.villager?.sivay || 0) * master.sSivay) / 100)
      );

          // r.total = left + rotating + sarkari + sivay - fajal;
          r.sarkari = sarkari
          r.sivay = sivay

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

module.exports = educationCessMaangnuRouter;
