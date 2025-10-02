import { getDBConnection } from '../db/db.js'

export async function addToCart(req, res) {
  let productId = req.body.productId;
  const db = await getDBConnection()

  const query = 'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'

  const values = [req.session.userId, productId]

  const user = await db.get(query, values)

  if(user)
  {
    await db.run(
      `UPDATE cart_items SET quantity = quantity + 1 
      WHERE user_id = ? AND product_id = ?`,
      [req.session.userId, productId]
    )

    return res.json({message: 'Added to cart'})
  }

  await db.run(
    `INSERT INTO cart_items(user_id, product_id, quantity) 
    VALUES(?, ?, ?)`,
    [req.session.userId, productId, 1]
  );

  await db.close()
  
  res.json({message: 'Added to cart'})

}

export async function getCartCount(req, res) {
  const db = await getDBConnection();

  const query = `SELECT SUM(quantity) AS total_quantity FROM cart_items 
               GROUP BY user_id 
               HAVING user_id = ?`

  const params = [req.session.userId]

  const user = await db.get(query, params)

  if(user)
  {
    return res.json({ totalItems: user.total_quantity })
  }
  res.json({totalItems: 0})
}  


export async function getAll(req, res) 
{

// Don't touch this code! 
  // if (!req.session.userId) {
  //   return res.json({err: 'not logged in'})
  // } 

  const db = await getDBConnection()

  const query = `SELECT cart_items.id AS cartItemId, quantity, title, artist, price 
                 FROM products JOIN cart_items ON cart_items.product_id = products.id
                 WHERE user_id = ?`

  const params = [req.session.userId]

  const cartItems = await db.all(query, params)

  res.json({items: cartItems})

  await db.close();
}  


export async function deleteItem(req, res) {

    const db = await getDBConnection();

    const { itemId } = req.params;

    db.run(				
      'DELETE FROM cart_items WHERE id = ?;',
			 [itemId]
    )

    res.sendStatus(204);
    
    await db.close();
  
}

export async function deleteAll(req, res) {

  const db = await getDBConnection()

  await db.run(
    'DELETE FROM cart_items WHERE user_id = ?', 
    [req.session.userId]
  )

  res.status(204).send()

  await db.close()
  
}

