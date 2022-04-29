//import express
const express = require("express")
const app = express()
app.use(express.json()) 

// import md5
const md5 = require("md5")
const bodyParser = require('body-parser');

//import auth
const auth = require("../auth")
const jwt = require("jsonwebtoken")
const SECRET_KEY = "susahkabeh"

//implementasi library
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//import model
const models = require("../models/index")
const transaksi = models.transaksi
const detail_transaksi = models.detail_transaksi
const paket = models.paket
const outlet = models.outlet
const member = models.member
const user = models.user

//endpoint menampilkan semua data transaksi dan detail transaksi, method: GET, function: findAll()
app.get("/", auth, (req,res) => {
    detail_transaksi.findAll({
        include: [
            {
                model: transaksi,
                include: [
                    { model: outlet},
                    { model: member},
                    {
                        model: user,
                        attributes: ['id_user', 'nama', 'username', 'id_outlet', 'role'],
                        include: [{
                            model: outlet
                        }]
                    }
                ]
            },
            { model: paket}
        ]
    })
        .then(result => {
            res.json(result)
        })
        .catch(error => {
            res.json(error)
      })
})

//endpoint menampilkan data transaksi dan detail transaksi berdasarkan id, method: GET, function: findOne()
app.get("/:id_transaksi", (req,res) => {
    detail_transaksi.findOne({ where: {id_transaksi: req.params.id_transaksi},
        include: [
            {
                model: transaksi,
                include: [
                    { model: outlet },
                    { model: member },
                    {
                        model: user,
                        attributes: ['id_user', 'nama', 'id_outlet', 'role'],
                        include: {
                            model: outlet
                        }
                    }
                ]
            },
            { model: paket },
        ]
    })
        .then(result => {
            res.json(result)
        })
        .catch(error => {
            res.json(error)
      })
})

//endpoint menampilkan konfirmasi
app.get("/belum/konfirmasi", (req, res) => {
    let bayar = "belum_dibayar";
        detail_transaksi.findAll({
        include: [
            {
                model: transaksi,
                where: { dibayar: "belum_dibayar" },
                include: [
                    { model: outlet },
                    { model: member },
                    {
                        model: user,
                        attributes: ['id_outlet', 'nama', 'id_outlet', 'role'],
                        include: {
                            model: outlet
                        }
                    }
                ]
            },
            { model: paket },
        ]
    })
        .then(result => {
            res.json(result)
        })
        .catch(error => {
            res.json(error)
        })
})

//endpoint untuk membuat data transaksi baru, METHOD: POST, function: create
app.post("/", (req,res) => {
    let invoice = Math.floor(Math.random() * 100000000);
    let tanggal = Date.now();
    let tenggat = new Date();
    tenggat.setDate(tenggat.getDate()+7);

    let data = {
        id_outlet : req.body.id_outlet,
        kode_invoice : 'TRX-' + invoice,
        id_member : req.body.id_member,
        tgl : tanggal,
        batas_waktu : tenggat,
        biaya_tambahan : req.body.biaya_tambahan,
        diskon : req.body.diskon,
        pajak : req.body.pajak,
        status : "baru",
        dibayar : "belum_dibayar",
        id_user: req.body.id_user
    }

    transaksi.create(data)
    .then(async(result) => {
        let pakett = await paket.findByPk(req.body.id_paket)
        console.log(pakett.harga)
        let jumlah = req.body.qty
        let harga = pakett.harga
        let diskon = req.body.diskon
        let pajak = req.body.pajak
        let biaya_tambahan = req.body.biaya_tambahan
        let total = (jumlah * harga) - (diskon / 100 * harga * jumlah) + biaya_tambahan
        let total_harga = total + (pajak / 100 * total)
        let data2 = {
            id_transaksi: result.id_transaksi,
            id_paket: req.body.id_paket,
            qty: req.body.qty,
            keterangan: req.body.keterangan,
            total_harga: total_harga
        }
        console.log('biaya')
        console.log(total_harga)
        await detail_transaksi.create(data2)
            .then(() => {
                res.json({
                    message: "Transaksi berhasil"
                })
            })
            .catch(error => {
                res.json(error)
            })
    })
    .catch(error => {
        res.json(error)
    })
})

//         .then(result => {
//             res.json({
//                 message: "data has been inserted"
//             })
//         })
//         .catch(error => {
//             res.json({
//                 message: error.message
//             })
//         })
// })

//endpoint mengupdate data transaksi, METHOD: PUT, function:update
app.put("/bayar/:id_transaksi", (req,res) => {
    let param = req.params.id_transaksi
    let data = {
        total_bayar: req.body.total_bayar
    }
    let data2 = {
        dibayar: "dibayar"
    }
    let waktu_bayar = Date.now(); //pr, bukan waktu indonesia
    let data3 = {
        tgl_bayar: waktu_bayar
    }
    // let total_hargaa;
    let tagihan = detail_transaksi.findOne({ where: { id_transaksi: param } })
    tagihan.then(function(result) { //Dimasukin result semua agar data variabelnya bisa dipakai (karena lokal)
        let total_hargaa = result.total_harga
        console.log(result)
        let susuk = req.body.total_bayar - total_hargaa
        console.log(susuk)

        let data4 = {
            kembalian: susuk
        }

        if (total_hargaa > req.body.total_bayar) {
            res.json({
                status: "error",
                message: "Maaf uang anda kurang"
            })
        } else {
            detail_transaksi.update(data, { where: { id_transaksi: param } })
                .then(() => {
                    transaksi.update(data2, {where: {id_transaksi : param}})
                    .then(() => {
                        transaksi.update(data3, {where: {id_transaksi : param}})
                        .then(() => {
                            detail_transaksi.update(data4, {where: {id_transaksi : param}})
                            .then(() => {
                            res.json({
                                message: "Pembayaran Berhasil"
                            })
                        })
                    })
                    })
                    .catch(error => {
                        res.json(error)
                    })
                })
                .catch(error => {
                    res.json(error)
                })
        }
    })

    
})

//endpoint mengubah status transaksi, METHOD: PUT, function: update
app.put('/ubah_status/:id_transaksi', (req,res) => {
    let param = req.params.id_transaksi
    let data = {
        status: req.body.status
    }
    transaksi.update(data, {where: {id_transaksi : param}})
    .then(() => {
        res.json({
            status : "success",
            message: "Status berhasil di ubah"
        })
    })
    .catch(error => {
        res.json(error)
    })
})

//endpoint menghapus data transaksi dan detail_transaksi, METHOD: DELETE, function: destroy
app.delete("/:id", (req,res) => {
    let param = {
        id_transaksi : req.params.id
    }
    transaksi.destroy({where: param})
        .then(result => {
            res.json({
                message: "data has been deleted"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})


module.exports = app