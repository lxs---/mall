var express = require('express');
var router = express.Router();
require('./../util/util');
var User = require('./../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//登录
router.post('/login', function (req, res, next) {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  };
  User.findOne(param, function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message
      })
    } else {
      if (doc) {
        res.cookie("userId", doc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        res.cookie("userName", doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        res.json({
          status: 0,
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  })
});

//退出登录
router.post('/logout', function (req, res, next) {
  res.cookie("userId", "", {
    path: '/',
    maxAge: -1
  });
  res.cookie("userName", "", {
    path: '/',
    maxAge: -1
  });
  res.json({
    status: 0,
    msg: '',
    result: ''
  })
});

//监测登录
router.get('/checkLogin', function (req, res, next) {
  if (req.cookies.userId) {
    res.json({
      status: 0,
      msg: '',
      result: req.cookies.userName || ''
    })
  } else {
    res.json({
      status: 1,
      msg: '未登录',
      result: ''
    })
  }
});

//查询用户的购物车列表
router.get('/cartList', function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: 0,
          msg: '',
          result: doc.cartList
        })
      }
    }
  })
});

//删除购物车
router.post('/delCart', function (req, res, next) {
  var userId = req.cookies.userId, productId = req.body.productId;
  User.update({userId: userId}, {
      $pull: {
        cartList: {
          productId: productId
        }
      }
    }, function (err, doc) {
      if (err) {
        res.json({
          status: 1,
          msg: err.message,
          result: ''
        })
      } else {
        res.json({
          status: 0,
          msg: '',
          result: 'success'
        })
      }
    }
  )
});

//修改购物车
router.post('/cartEdit', function (req, res, next) {
  var userId = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked;
  User.update({
    userId: userId,
    'cartList.productId': productId
  }, {'cartList.$.productNum': productNum, 'cartList.$.checked': checked}, function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: 0,
        msg: '',
        result: 'success'
      })
    }
  })
});

//
router.post('/checkAll', function (req, res, next) {
  var userId = req.cookies.userId, checkAllFlag = req.body.checkAllFlag ? '1' : '0';
  User.findOne({userId: userId}, function (err, user) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      user.cartList.forEach(item => {
        item.checked = checkAllFlag;
      })
      user.save(function (err1, doc) {
        if (err1) {
          res.json({
            status: 1,
            msg: err1.message,
            result: ''
          })
        } else {
          res.json({
            status: 0,
            msg: '',
            result: 'succ'
          })
        }
      })
    }
  })
});

//查询用户地址接口
router.get('/addressList', function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: err1.message,
        result: ''
      })
    } else {
      res.json({
        status: 0,
        msg: '',
        result: doc.addressList
      })
    }
  })
});


//设定默认地址接口
router.post('/setDefault', function (req, res, next) {
  var userId = req.cookies.userId, addressId = req.body.addressId;
  if (!addressId) {
    res.json({
      status: '1003',
      msg: 'addressId is null',
      result: ''
    });
  } else {
    User.findOne({userId: userId}, function (err, doc) {
      if (err) {
        res.json({
          status: 1,
          msg: err.message,
          result: ''
        })
      } else {
        doc.addressList.forEach(item => {
          if (item.addressId == addressId) {
            item.isDefault = true;
          } else {
            item.isDefault = false;
          }
        })
        doc.save(function (err1, doc1) {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            });
          } else {
            res.json({
              status: '0',
              msg: '',
              result: ''
            });
          }
        })
      }
    })
  }
});

//删除地址接口
router.post('/delAddress', function (req, res, next) {
  var userId = req.cookies.userId, addressId = req.body.addressId;
  User.update({userId: userId}, {
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: ''
      });
    }
  })
});

//生成订单接口
router.post('/payment', function (req, res, next) {
  let userId = req.cookies.userId,
    addressId = req.body.addressId,
    orderTotal = req.body.orderTotal;

  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      let addressItem = '', cartList = [];
      doc.addressList.forEach((item) => {
        if (item.addressId == addressId) {
          addressItem = item;
        }
      });
      doc.cartList.forEach((item) => {
        if (item.checked == '1') {
          cartList.push(item);
        }
      });
      var platform = '520';
      var r1 = Math.floor(Math.random() * 10);
      var r2 = Math.floor(Math.random() * 10);
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var date = new Date().Format('yyyy-MM-dd hh:mm:ss');
      var orderId = platform + r1 + sysDate + r2;

      let orderItem = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: addressItem,
        goodsList: cartList,
        orderStatus: '1',
        createDate: date
      };
      doc.orderList.push(orderItem);
      doc.save(function (err1, doc1) {
        if (err1) {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          });
        } else {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: orderItem.orderId,
              orderTotal: orderItem.orderTotal
            }
          });
        }
      })
    }
  })
});
router.get('/orderDetails', function (req, res, next) {
  let userId = req.cookies.userId, orderId = req.param('orderId');
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      var orderList = doc.orderList;
      if (orderList.length > 0) {
        var orderTotal = 0;
        orderList.forEach(item => {
          if (item.orderId == orderId) {
            orderTotal = item.orderTotal;
          }
        });
        if (orderTotal > 0) {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: orderId,
              orderTotal: orderTotal
            }
          })
        } else {
          res.json({
            status: '120002',
            msg: '无此订单',
            result: ''
          });
        }
      } else {
        res.json({
          status: '120001',
          msg: '此用户没有创建此订单',
          result: ''
        });
      }
    }
  })
});
router.get('/getCartCount', function (req, res, next) {
  if (req.cookies && req.cookies.userId) {
    let userId = req.cookies.userId;
    User.findOne({userId: userId}, function (err, doc) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        let cartCount = 0;
        doc.cartList.map(item => {
          cartCount += item.productNum;
        });
        res.json({
          status: '0',
          msg: '',
          result: cartCount
        })
      }
    })

  }
});

module.exports = router;