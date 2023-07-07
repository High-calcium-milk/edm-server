const express = require('express')
const path = require('path')
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { log } = require('console');
const app = express()
const port = 8080
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'myEdMusic';

mongoose.connect(url + '/' + dbName)
mongoose.connection.once('open', () => { console.log('数据库连接成功！'); })
mongoose.connection.once('close', () => { console.log('数据库连接关闭！'); })

const usersSchema = new mongoose.Schema({
    name: String,
    user: Number,
    password: String,
    likeMusic: Array
})
const singersSchema = new mongoose.Schema({
    url: String,
    name: String,
    country: Array
})
const musicsSchema = new mongoose.Schema({
    url: String,
    name: String,
    singer: String,
    album: String,
    time: String
})
const songListsSchema = new mongoose.Schema({
    name: String,
    musicList: Array
})
const bannersSchema = new mongoose.Schema({
    url: String,
    title: String
})
const hotSongsSchema = new mongoose.Schema({
    url: String,
    name: String,
    singer: String,
    album: String,
    list: String
})

const allListSchema = new mongoose.Schema({
    url: String,
    name: String,
    singer: String,
    album: String,
    list: String,
    time: String
})

const usersModle = mongoose.model('users', usersSchema)
const singersModle = mongoose.model('singers', singersSchema)
const musicsModle = mongoose.model('musics', musicsSchema)
const songListsModle = mongoose.model('songLists', songListsSchema)
const bannersModle = mongoose.model('banners', bannersSchema)
const hotSongsModle = mongoose.model('hotSongs', hotSongsSchema)
const allListModle = mongoose.model('allList', allListSchema)

app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//修改用户名
app.post('/changeName/:user', async (req, res) => {
    const user = req.params.user
    await usersModle.updateOne({ user }, req.body)
    const newUser = await usersModle.findOne({ user })
    res.send(newUser)
})

//修改密码
app.post('/changePW/:user', async (req, res) => {
    const user = req.params.user
    await usersModle.updateOne({ user }, req.body)
    const newUser = await usersModle.findOne({ user })
    res.send(newUser)
})

// 添加或者移除喜爱音乐
app.get('/addRemove/:music/:user', async (req, res) => {
    const music = await musicsModle.find({ name: req.params.music })
    const user = await usersModle.findOne({ user: req.params.user })
    console.log(user);
    let arr = []
    if (user.likeMusic.length > 0) {
        arr = user.likeMusic.filter((item, index) => {
            return item.name !== music[0].name
        })
    }
    if (arr.length < user.likeMusic.length) {
        user.likeMusic = [...arr]
        await usersModle.updateOne({ user: req.params.user }, { likeMusic: user.likeMusic })
        // const newUser = await usersModle.findOne({ user: 123 })
        res.send('0')
    } else {
        user.likeMusic = [...user.likeMusic, ...music]
        await usersModle.updateOne({ user: req.params.user }, { likeMusic: user.likeMusic })
        // const newUser = await usersModle.findOne({ user: 123 })
        res.send('1')
    }
})

// 登陆注册
app.post('/setUser', async (req, res) => {
    const data = await usersModle.findOne({ user: req.body.user })
    if (data === null) {
        userName = '用户' + uuidv4()
        usersModle.create({
            name: userName,
            user: req.body.user,
            password: req.body.password,
            likeMusic: []
        })
        const data = await usersModle.findOne({ user: req.body.user })
        res.send({
            msg: '注册成功',
            data
        })
    } else {
        if (data.password === req.body.password) {
            res.send({
                msg: '密码正确',
                data
            })
        } else {
            res.send({ msg: '密码错误' })
        }
    }
})

// 热门歌手
app.get('/hotSinger/:key', async (req, res) => {
    if (req.params.key === '华语') {
        const data = await singersModle.find({ country: 'china' })
        res.send(data)
    } else if (req.params.key === '欧美') {
        const data = await singersModle.find({ country: 'ea' })
        res.send(data)
    } else {
        const data = await singersModle.find({ country: 'korea' })
        res.send(data)
    }
})

// 轮播图
app.get('/homeBanner', async (req, res) => {
    const data = await bannersModle.find({})
    res.send(data)
})

// 热门榜单
app.get('/hotSong', async (req, res) => {
    const surgeSong = await hotSongsModle.find({ list: 'surge' })
    const topSong = await hotSongsModle.find({ list: 'top' })
    const dySong = await hotSongsModle.find({ list: 'dy' })
    const data = { surgeSong, topSong, dySong }
    res.send(data)
})

//榜单
app.get('/list/:key', async (req, res) => {
    let data = []
    if (req.params.key === '飙升榜') {
        data = await allListModle.find({ list: 'surge' })
    }
    if (req.params.key === 'Top500') {
        data = await allListModle.find({ list: 'top' })
    }
    if (req.params.key === '抖音热歌榜') {
        data = await allListModle.find({ list: 'dy' })
    }
    if (req.params.key === '新歌榜') {
        data = await allListModle.find({ list: 'new' })
    }

    res.send(data)
})

//搜索音乐
app.get('/searchMusic/:key', async (req, res) => {
    let key = req.params.key
    let data = await musicsModle.find({ name: new RegExp(key) })
    res.send(data)
})

app.listen(port, () => {
    console.log(`正在监听${port}端口！`)
})