const bcrypt = require('bcryptjs');

async function hashPassword(newPassword) {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(newPassword, saltRounds);
  console.log("Hashed Password:----------------------", hashed);
}

hashPassword("NayaPassword123"); // apna password yahan daalo
