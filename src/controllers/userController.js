const { pool } = require("../DB/pool");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Input validation function
const validateUserInput = ({ username, email, password }) => {
  if (!username || typeof username !== "string" || username.length < 3) {
    return "Invalid or missing username";
  }
  if (
    !email ||
    typeof email !== "string" ||
    !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)
  ) {
    return "Invalid or missing email";
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return "Invalid or missing password (min 6 characters)";
  }
  return null;
};

const registerUser = async (req, res) => {
  // Validate input
  const { username, email, password, role } = req.body;

  const error = validateUserInput({ username, email, password });

  if (error) return res.status(400).json({ error });

  try {
    const [users] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (users.length > 0)
      return res
        .status(400)
        .json({ error: "Username or email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())",
      [username, email, hashedPassword, role || "customer"]
    );

    return res.status(201).json({
      userId: result.insertId,
      username,
      email,
      role: role || "customer",
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const [users] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (users.length === 0)
      return res.status(401).json({ error: "User not found" });

    const user = users[0];

    // Compare password with hashed password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserDetails = async (req, res) => {
  const userId = req.params.id;

  try {
    const [users] = await pool.query(
      "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.status(200).json(users[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser, getUserDetails };
