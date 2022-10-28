import uuid from "uuid-random";
const mongoose = require("mongoose");

const cache = new Map();

const Schema = mongoose.Schema(
   {
      code: {
         type: String,
         required: true,
      },
      availableUntil: {
         type: Number,
         required: true,
      },
   },
   {
      collection: "auth_codes",
   }
);

const Model = mongoose.model("auth_codes", Schema);

module.exports = {
   generateUniqueAuthCode: async () => {
      const code = uuid();
      const newCode = new Model({
         code: code,
         availableUntil: Date.now() + 2592000000, // 30 days
      });
      await newCode.save();
      return code;
   },
   deleteAuthCode: async (code: string) => {
      const _code = await Model.findOne({
         code: code,
      });
      if (!_code) return false;
      await _code.delete();
      return true;
   },
   isAuthCodeValid: async (code: string) => {
      const _code = await Model.findOne({
         code: code,
      });
      if (!_code) return false;
      if (_code.availableUntil < Date.now()) return false;
      return true;
   },
};
