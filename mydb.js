var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json() 
var jwt = require('jsonwebtoken');
const secret = 'Lilyn'

var app = express()
app.use(cors())
app.use(express.json())

require('dotenv').config()
const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected!')

app.get('/User', function (req, res, next) {
    connection.query(
        'SELECT * FROM `user`',
        function (err, results, fields) {
            res.json(results);
        }
    );
})

app.get('/Subject', function (req, res, next) {
    connection.query(
        'SELECT * FROM `subject`',
        function (err, results, fields) {
            res.json(results);
        }
    );
})

app.get('/GetUser/', function (req, res, next) {
    try {
    const token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, secret);
    connection.query(
        'SELECT * FROM `user` WHERE `id` = ?',
        [decoded.id],
        function (err, results) {
            res.json(results);
        }
    );
    } catch (err) {
        return res.json({ status: "error", message: err.message });
    }
})

app.post('/UpdateUser', function (req, res, next) {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    var decoded = jwt.verify(token, secret);
    console.log(decoded.id);
    connection.execute(
        'UPDATE `user` SET `name` = ?, `sname` = ?, `email` = ?, `tel` = ?, `id_card` = ?, `address` = ? WHERE id = ?',
        [req.body.name, req.body.sname, req.body.email, req.body.tel, req.body.id_card, req.body.address,decoded.id],
        function (err, results) {
            if (err) {
                console.log(err);
            }else{
                res.json({status: "Success!", message:results});
            }
        }
    );
})

app.post('/AddUser', function (req, res, next) {
    connection.execute(
        'INSERT INTO user (id,pass,name,sname,email,tel,id_card) VALUES (?,?,?,?,?,?,?)',
        [req.body.id,req.body.pass,req.body.name,req.body.sname,req.body.email,req.body.tel,req.body.id_card],
        function (err, results) {
            if (err) {
                console.log(err);
                return
            }
                res.json({status: "success", message:results});
            
        }
    );
})

app.post('/Login',function (req, res, next) {
    connection.execute(
        'SELECT (name,sname.email,tel,id_card,address) FROM user WHERE id = ? AND pass = ?',
        [req.body.id,req.body.pass],
        function(err, results, fields) {
            if (err) {
                res.json({status: 'error', message: err})
                return
            } else if(results.length > 0){
                const token = jwt.sign({id: results[0].id}, secret, { expiresIn: '1h' });
                res.json({status: 'ok', message: "Login Success!" ,token: token, user: results[0].id})
            }else{
                res.json({status: 'error', message: 'Something Was Wrong!'})
            }
        }
    );
})

app.post('/AddSubject', function (req, res, next) {
    connection.query(
      'INSERT INTO `subject`(`s_id`, `s_name`, `faculty`, `cost`, `photo`, `time`, `day`, `credit`) VALUES (?, ?, ?, ?,?, ?, ?, ?)',
      [req.body.s_id, req.body.s_name, req.body.faculty, req.body.cost,req.body.photo,req.body.time,req.body.day,req.body.credit],
      function(err, results) {
        res.json(results);
      }
    );
  })

app.delete('/DeleteSubject', function (req, res, next) {
    connection.query(
      'DELETE FROM `subject` WHERE s_id = ?',
      [req.body.s_id],
      function(err, results) {
        res.json(results);
      }
    );
  })

app.put('/SubjectUpdate', function (req, res, next) {
    connection.query(
      'UPDATE `subject` SET  `s_name` = ?, `faculty` = ?, `cost` = ?, `photo` = ?, `time` = ?, `day` = ?, `credit` = ? WHERE s_id = ?',
      [req.body.s_name, req.body.faculty, req.body.cost, req.body.photo, req.body.time, req.body.day, req.body.credit, req.body.s_id],
      function(err, results) {
        res.json(results);
      }
    );
  })

app.get('/GetSubject/', function (req, res, next) {
    try {
    const token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, secret);
    connection.query(
        'SELECT * FROM `subject` WHERE `s_id` = ?',
        [decoded.s_id],
        function (err, results) {
            res.json(results);
        }
    );
    } catch (err) {
        return res.json({ status: "error", message: err.message });
    }
})

app.listen(process.env.PORT || 3000)