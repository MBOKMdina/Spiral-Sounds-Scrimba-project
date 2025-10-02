import { getDBConnection } from '../db/db.js'

export async function getGenres(req, res) {

  const db = await getDBConnection();

  try {
      let query = 'SELECT DISTINCT genre FROM products';

      const genres = await db.all(query)

      const stringifiedGenres = genres.map((genreObj)=>
      {
        return genreObj.genre;
      })

      res.json(stringifiedGenres);
      
  } catch (err) {

    res.status(500).json({error: 'Failed to fetch genres', details: err.message})

  }
  finally
  {
    db.close()
    console.log('Database closed');
  }
}

export async function getProducts(req, res) {
  try 
  {
    const db = await getDBConnection();

    let query = 'SELECT * FROM products'

    let products = await db.all(query)

    const {genre, search} = req.query

    console.log(`The genre selected is ${genre}`)

    if(genre)
    {

      query = 'SELECT * FROM products where genre=?'

      const value = [genre]

      products = await db.all(query, value)

    }
    else if (search)
    {
      query = 'SELECT * FROM products WHERE title LIKE ? OR artist LIKE ? OR genre LIKE ?'
      const value = [`%${search}%`, `%${search}%`, `%${search}%`]
      products = await db.all(query, value)
    }
    else
    {

      let query = 'SELECT * FROM products'

      products = await db.all(query)

    }

    res.json(products)

  } catch (err) {
    res.status(500).json({error: 'Failed to fetch products', details: err.message})
  }
}