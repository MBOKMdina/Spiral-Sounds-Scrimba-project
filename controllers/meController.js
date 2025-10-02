import { getDBConnection } from '../db/db.js'

export async function getCurrentUser(req, res) {
  try {
    const db = await getDBConnection();
    if(req.session.userId)
    {
      const query = 'SELECT * FROM users WHERE id = ?'

      const params = [req.session.userId]

      const user = await db.get(query, params)

      res.json({ isLoggedIn: true, name: user.name })
    }
    else
    {
      res.json({isLoggedIn: false})
    }
  } catch (err) {
    console.error('getCurrentUser error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
} 