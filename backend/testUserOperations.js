require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const dbAsync = require("./config/database");

/**
 * Test user database operations
 */
async function testUserOperations() {
  console.log("🧪 Testing user database operations...\n");

  try {
    // Test 1: Insert a test user
    console.log("1️⃣ Inserting test user...");
    const testUser = {
      google_id: "test_google_" + Date.now(),
      email: "test@example.com",
      name: "Test User",
      profile_picture: "https://example.com/photo.jpg",
    };

    const insertResult = await dbAsync.run(
      `INSERT INTO users (google_id, email, name, profile_picture, login_count, last_login) 
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        testUser.google_id,
        testUser.email,
        testUser.name,
        testUser.profile_picture,
        1,
        new Date().toISOString(),
      ]
    );

    const userId = insertResult.rows && insertResult.rows[0] ? insertResult.rows[0].id : insertResult.lastID;
    console.log(`✅ Test user created with ID: ${userId}\n`);

    // Test 2: Query all users
    console.log("2️⃣ Querying all users...");
    const allUsers = await dbAsync.all("SELECT * FROM users");
    console.log(`✅ Found ${allUsers.length} user(s):`);
    allUsers.forEach((user) => {
      console.log(
        `   - ${user.name} (${user.email}) - ${user.login_count} logins`
      );
    });
    console.log();

    // Test 3: Query with pagination (like admin dashboard)
    console.log("3️⃣ Testing pagination query...");
    const page = 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const paginatedQuery = `SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const paginatedUsers = await dbAsync.query(paginatedQuery, [limit, offset]);
    console.log(
      `✅ Paginated query returned ${paginatedUsers.rows.length} user(s)\n`
    );

    // Test 4: Count query
    console.log("4️⃣ Testing count query...");
    const countResult = await dbAsync.get("SELECT COUNT(*) as count FROM users");
    console.log(`✅ Total users: ${countResult.count}\n`);

    // Test 5: Update login count
    console.log("5️⃣ Testing login count update...");
    await dbAsync.run(
      "UPDATE users SET login_count = login_count + 1, last_login = ? WHERE id = ?",
      [new Date().toISOString(), userId]
    );
    const updatedUser = await dbAsync.get("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    console.log(
      `✅ Updated user login count: ${updatedUser.login_count} logins\n`
    );

    // Test 6: Search query (like admin dashboard search)
    console.log("6️⃣ Testing search query...");
    const searchTerm = "test";
    const searchQuery = `SELECT * FROM users WHERE name LIKE ? OR email LIKE ? LIMIT 10`;
    const searchResults = await dbAsync.query(searchQuery, [
      `%${searchTerm}%`,
      `%${searchTerm}%`,
    ]);
    console.log(`✅ Search for '${searchTerm}' returned ${searchResults.rows.length} result(s)\n`);

    // Clean up: Delete test user
    console.log("7️⃣ Cleaning up test user...");
    await dbAsync.run("DELETE FROM users WHERE id = ?", [userId]);
    console.log(`✅ Test user deleted\n`);

    console.log("🎉 All tests passed successfully!");
    console.log("\n📊 Final user count:");
    const finalCount = await dbAsync.get("SELECT COUNT(*) as count FROM users");
    console.log(`   ${finalCount.count} user(s) in database`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

testUserOperations();
