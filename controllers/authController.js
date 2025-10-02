import validator from 'validator'
import { getDBConnection } from '../db/db.js'
import bcrypt from 'bcryptjs'

export async function registerUser(req, res) {

  let { name, email, username, password } = req.body

  if((name === undefined || name.trim() === '') || (username === undefined || username === '') || (email === undefined || email.trim() === '') || (password === undefined || password.trim() === ''))
  {
    console.log('All fields are required.')
    res.status(400).json({ error: "All fields are required." });
  }
  else
  {

    if(!/^[a-zA-Z0-9_-]{1,20}$/.test(username.trim()))
    {
      return res.status(400).json({ error: "Use appropriate characters for your username!" });
    }

    if(!validator.isEmail(email))
    {
      return res.status(400).json({ error: "Type in an appropriate email address!!!" });
    }
    /*res.json()*/
  }

  try 
  {
    const db = await getDBConnection()

    const query = `SELECT * FROM users WHERE username = ? OR email = ?`;

    const value = [username, email]

    const identical = await db.all(query, value)

    if(identical.length !== 0)
    {
      res.status(400).json({ error: 'Email or username already in use.' })
    }
    else
    {
      const hashed = await bcrypt.hash(password, 10)

      const result = await db.run(
        `INSERT INTO users (name, email, username, password)
        VALUES (?, ?, ?, ?)`,
        [name, email, username, hashed]
      )

      req.session.userId = result.lastID;

      res.status(201).json({ message: 'User registered'})
    }

  } catch (err) 
  {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
}

export async function loginUser(req, res) {

  let {username, password} = req.body
  
  if (!username || !password) {

    return res.status(400).json({ error: 'All fields are required.' })

  }

  try {
    const db = await getDBConnection()

    const query = 'SELECT * FROM users WHERE username = ?'

		const params = [username]

		const user = await db.get(query, params)

    if(user)
    {
      if(user.username && (await bcrypt.compare(password, user.password)))
      {
        req.session.userId = user.id
        res.json({message: 'Logged in'})
      }
      else
      {
        res.status(401).json({error: 'Invalid credentials'})
      }
    }
    else
    {
      res.status(401).json({error: 'Invalid credentials'})
    }

  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
}


export async function logoutUser(req, res) {

  req.session.destroy( () => 
  {
    res.json({ message: 'Logged out' })
  })
  
}