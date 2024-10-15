const User = require('../models/userModel');
const factory = require('./factoryFunctions');

exports.getAllUsers = factory.getAllDocs(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getDoc(User);
exports.createUser = factory.createDoc(User);
