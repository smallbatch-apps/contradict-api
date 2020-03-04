const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LicenceSchema = new Schema({
  licenceId: {
    type: String,
    trim: true,
    required: true
  },
  zoneString: {
    type: String,
    trim: true,
    required: true
  },
  zoneIndex: {
    type: Number,
    required: true
  },
  allocation: {
    type: Number,
    required: true
  },
  ethAccount: {
    type: String,
    trim: true,
    required: false
  },
  endDate: Date
});

const UserSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  partyId: {
    type: String,
    trim: true,
    required: true
  },
  migrated: {
    type: Boolean,
    default: false
  },
  code: String,
  licences: [LicenceSchema]
});

const User = mongoose.model('user', UserSchema);

module.exports = User;