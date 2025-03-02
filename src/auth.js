const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const {Link,User} = require('./mongoSchema');

const APP_SECRET = "this is my secret";
async function authenticateUser(request) {
  if (request?.headers?.authorization) {
    try {
      // 1. Extract token from Authorization header
      const token = request.headers.authorization.split(" ")[1];

      // 2. Verify the token
      const tokenPayload = jwt.verify(token, APP_SECRET);

      // 3. Extract user ID from the payload
      const userId = tokenPayload.userId;

      // 4. Find and return the user
      return await User.findById(userId);
    } catch (error) {
      return null;
    }
  }
  return null;
}

module.exports = {APP_SECRET, authenticateUser};
