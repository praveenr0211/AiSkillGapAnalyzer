const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dbAsync = require("./database");

// Serialize user into session (store user ID)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session (retrieve user from database)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await dbAsync.get("SELECT * FROM users WHERE id = ?", [id]);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const google_id = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const profile_picture = profile.photos[0]?.value;

        // Check if user already exists
        const existingUser = await dbAsync.get(
          "SELECT * FROM users WHERE google_id = ?",
          [google_id]
        );

        if (existingUser) {
          // Update login count and last login time
          await dbAsync.run(
            "UPDATE users SET login_count = login_count + 1, last_login = ? WHERE id = ?",
            [new Date().toISOString(), existingUser.id]
          );

          console.log(`✅ User logged in: ${email} (Login #${existingUser.login_count + 1})`);
          return done(null, existingUser);
        } else {
          // Create new user
          const result = await dbAsync.run(
            `INSERT INTO users (google_id, email, name, profile_picture, login_count, last_login) 
             VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
            [google_id, email, name, profile_picture, 1, new Date().toISOString()]
          );

          // Get the newly created user ID from RETURNING clause
          const userId = result.rows && result.rows[0] ? result.rows[0].id : result.lastID;
          
          // Get the newly created user
          const newUser = await dbAsync.get(
            "SELECT * FROM users WHERE id = ?",
            [userId]
          );

          console.log(`✅ New user created: ${email}`);
          return done(null, newUser);
        }
      } catch (error) {
        console.error("❌ Error in Google OAuth strategy:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
