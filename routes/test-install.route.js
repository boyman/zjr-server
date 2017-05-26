'use strict';

const express = require('express');
const router = express.Router();
const Event = require('../models/event.model');
const User = require('../models/user.model');
const config = require('../config');

const myOpenId = 'o6DD80DlNkJKCmYRLeRWeS_2dfyU';

const users = [ {
    openId : '001',
    name : '赵敏',
    avatarUrl : 'http://p1.qhimg.com/t018c640f9feb3e3f4c.jpg?size=580x456'
}, {
    openId : '002',
    name : '钱掌柜',
    avatarUrl : 'http://img.mp.itc.cn/upload/20161205/5b711e2233244cfe93aa294202d72047_th.jpg'
}, {
    openId : '003',
    name : '孙悟空',
    avatarUrl : 'http://a0.att.hudong.com/51/78/20300000921826141283781099475_s.jpg'
}, {
    openId : '004',
    name : '李达康',
    avatarUrl : 'http://photocdn.sohu.com/20170404/Img486445288.jpeg'
}, {
    openId : '005',
    name : '周瑜',
    avatarUrl : 'http://pic.pimg.tw/emmy25213855/4911759f49904.jpg'
}, ];

const events = [ {
    "dateTime" : (new Date("2017-06-07 12:00:00 GMT-0700")).getTime() / 1000,
    "createdBy" : myOpenId,
    "name" : "738公社中午聚餐无验证",
    "address" : "18537 E Arrow Hwy Covina, CA 91722",
    "description" : "2017-06-07 12:00，客人所有人可见0，无验证但是，颜宁的终身讲席教授职位4月27日就已在普林斯顿大学董事会通过，5月3日国内微博也已传出消息。这本来是一条大长中国人志气的好消息啊，这么牛的普林斯顿，给予这么年轻的中国教授这么顶，众多媒体大都讳莫如深，连清华大学和颜宁本人都很",
    "watchers" : [],
    "pendingGuests" : [],
    "guests" : [],
    "settings" : {
        "guestsVisibility" : 0,
        "allowSearch" : true,
        "allowGuest" : true,
        "needApprove" : false
    },
}, {
    "dateTime" : (new Date("2017-06-09 13:00:00 GMT-0700")).getTime() / 1000,
    "createdBy" : myOpenId,
    "name" : "738公社中午聚餐有验证",
    "address" : "18537 E Arrow Hwy Covina, CA 91722",
    "description" : "2017-06-09 13:00，有验证 但是，颜宁的终身讲席教授职位4月27日就已在普林斯顿大学董事会通过，5月3日国内微博也已传出消息。这本来是一条大长中国人志气的好消息啊，这么牛的普林斯顿，给予这么年轻的中国教授这么顶级的终身教授职位，中国人难道不该自豪吗？但奇怪的是，众多媒体大都讳莫如深，连清华大学和颜宁本人都很",
    "watchers" : [],
    "pendingGuests" : [],
    "guests" : [],
    "settings" : {
        "guestsVisibility" : 0,
        "allowSearch" : true,
        "allowGuest" : true,
        "needApprove" : true
    },
}, {
    "dateTime" : (new Date("2017-07-09 18:00:00 GMT-0700")).getTime() / 1000,
    "createdBy" : "001",
    "name" : "美国华人专家会2017年会",
    "address" : "444 Washington St San Francisco, CA 94111",
    "description" : "2017-07-09T18:00，客人所有人可见0，有验证，颜宁搞不懂，评委的意见都是“建议资助”甚至是“优先资助”，为什么她连当面答辩的机会都没有？她质疑说：“请问根据评审意见决定邀请谁来答辩的标准是什么？……难道评委们这些意见不恰恰应该让我当面去解释再决定最终资助与否么？为何连答辩的机会都不肯给？”",
    "watchers" : [],
    "pendingGuests" : [],
    "guests" : [],
    "settings" : {
        "guestsVisibility" : 0,
        "allowSearch" : true,
        "allowGuest" : true,
        "needApprove" : true
    },
}, {
    "dateTime" : (new Date("2017-05-18 01:00:00 GMT-0700")).getTime() / 1000,
    "createdBy" : "002",
    "name" : "侯亮平的活动",
    "address" : "最高人民检察院反贪污贿赂总局招待所",
    "description" : "2017-05-18T01:00 客人仅客人可见1，无验证，侯亮平是电视剧《人民的名义》里的男一号，由著名演员陆毅主演，剧中被设定为人民检察官，先后担任最高人民检察院反贪污贿赂总局侦查处处长和汉东省人民检察院反贪污贿赂局局长。",
    "watchers" : [],
    "pendingGuests" : [],
    "guests" : [],
    "settings" : {
        "guestsVisibility" : 1,
        "allowSearch" : true,
        "allowGuest" : true,
        "needApprove" : false
    },
}, {
    "dateTime" : (new Date("2017-10-16 08:00:00 GMT-0700")).getTime() / 1000,
    "createdBy" : "003",
    "name" : "鸿门宴1110",
    "address" : "故秦都城咸阳郊外",
    "description" : "2017-10-16T08:00，客人仅自己可见2，无验证，不能带客人，公元前206年，当时为楚国武安侯的刘邦率军攻破武关，进入关中地区。秦王子婴向刘邦投降。刘邦入关后，与秦民约法三章，并派人驻守函谷关，以防项羽楚军进关",
    "watchers" : [],
    "pendingGuests" : [],
    "guests" : [],
    "settings" : {
        "guestsVisibility" : 2,
        "allowSearch" : true,
        "allowGuest" : false,
        "needApprove" : false
    },
}, {
    "dateTime" : (new Date("2017-08-09 18:00:00 GMT-0700")).getTime() / 1000,
    "createdBy" : "004",
    "name" : "中国科技大学南加州校友会活动",
    "address" : "201 Franklin St, San Francisco, CA 94102",
    "description" : "中国科学技术大学隶属于中国科学院，是一所由中国科学院直属管理的全国重点大学。本科生生源和培养质量一直在全国高校中名列前茅。为中国首批7所“211工程”重点建设的大学和首批9所“985工程”重点建设的大学之一[4]。学校在国际上也享有一定声誉，东亚研究型大学协会和环太平洋大学联盟的",
    "watchers" : [],
    "pendingGuests" : [],
    "guests" : [],
    "settings" : {
        "guestsVisibility" : 0,
        "allowSearch" : true,
        "allowGuest" : true,
        "needApprove" : false
    },
}, {
    "dateTime" : (new Date("2017-05-18 01:00:00 GMT-0700")).getTime() / 1000,
    "createdBy" : "005",
    "name" : "新约客体验活动",
    "address" : "任何地方，只要您能使用微信",
    "description" : "要验证，无客人，全可见，欢迎大家围观体验新约客",
    "watchers" : [],
    "pendingGuests" : [],
    "guests" : [],
    "settings" : {
        "needApprove" : true,
        "allowGuest" : false,
        "allowSearch" : true,
        "guestsVisibility" : 0
    },
} ]

router.get('/', (req, res, next) => {
    if (config.productMode) {
        res.json({
            code : -1,
            message : 'test-install is disabled in product mode'
        })
    }

    var result = {};

    User.collection.insert(users, function(err, insertedUsers) {
        if (err) {
            debug(err)
        } else {
            result.usersInserted = insertedUsers.length
            Event.collection.insert(events, function(er, insertedEvents) {
                if (er) {
                    debug(err)
                } else {
                    result.eventsInserted = insertedEvents.length
                }
            })
        }
    });

    res.json({
        code : 0,
        message : 'processed',
        result : result,
    })
});

module.exports = router;
