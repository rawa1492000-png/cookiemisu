const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// اتصال الداتا بيس
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cookiemisu"
});

db.connect(err => {
  if (err) {
    console.log("DB Error:", err);
  } else {
    console.log("Connected to DB");
  }
});


// 🔥 حفظ الطلب
app.post("/order", (req, res) => {

  const { name, phone, note, cart } = req.body;

  if (!name || !phone || !cart || cart.length === 0) {
    return res.status(400).send("Missing data");
  }

  const sql = `
    INSERT INTO orders (name, phone, product, size, quantity, price, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;

  let completed = 0;

  cart.forEach(item => {

    db.query(sql, [
      name,
      phone,
      item.name,
      item.size || "",
      item.quantity,
      item.price
    ], (err) => {

      if (err) {
        console.log(err);
        return res.status(500).send("Database error");
      }

      completed++;

      if (completed === cart.length) {
        res.send("Order saved");
      }

    });

  });

});


// 🔥 عرض الطلبات
app.get("/orders", (req, res) => {

  db.query("SELECT * FROM orders ORDER BY created_at DESC", (err, result) => {

    if (err) {
      console.log(err);
      res.status(500).send("Error fetching");
    } else {
      res.json(result);
    }

  });

});


// 🔥 تحديث الحالة (Done)
app.put("/order/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "UPDATE orders SET status='done' WHERE id=?",
    [id],
    (err) => {

      if (err) {
        console.log(err);
        res.status(500).send("Error updating");
      } else {
        res.send("updated");
      }

    }
  );

});


// تشغيل السيرفر (خليه آخر شي)
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});