'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');

const Schema = mongoose.Schema;

const EventSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    dateTime : {
        type : Number,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    settings : {
        needApprove : {
            type : Boolean,
            default : false
        },
        allowGuest : {
            type : Boolean,
            default : true
        },
        allowSearch : {
            type : Boolean,
            default : true
        },
        guestsVisibility : {
            type : Number,
            default : 1 // visible by guests
        }
    },
    guests : {
        type : [ {
            openId : {
                type : String,
                required : true
            },
            guests : [ String ]
        } ]
    },
    pendingGuests : {
        type : [ String ]
    },
    watchers : [ String ],
    createdBy : {
        type : String,
        required : true
    },
    createdDateTime : {
        type : Number,
        default : function(){ return new Date().getTime() }
    }
});

EventSchema.methods.participated = function(openId) {
    let i;
    for (i = 0; i < this.guests.length; i++) {
        if (this.guests[i].openId == openId) return i;
    }
    return -1;
};

EventSchema.methods.participatePending = function(openId) {
    return this.pendingGuests.indexOf(openId);
};

EventSchema.statics = {
    hosting : function(openId) {
        return this.aggregate([ {
            $match : {
                createdBy : openId
            }
        }, {
            $project : {
                name : 1,
                dateTime : 1,
            }
        }
        ]).exec();
    },
    participating : function(openId) {
        return this.aggregate([ {
            $match : {
                guests : {
                    $elemMatch : {
                        openId : openId
                    }
                }
            }
        }, {
            $project : {
                name : 1,
                dateTime : 1,
            }
        }
        ]).exec();
    },
    pending : function(openId) {
        return this.aggregate([ {
            $match : {
                pendingGuests : openId
            }
        }, {
            $project : {
                name : 1,
                dateTime : 1,
            }
        }
        ]).exec();
    },
    watching : function(openId) {
        return this.aggregate([ {
            $match : {
                watchers : openId
            }
        }, {
            $project : {
                name : 1,
                dateTime : 1,
            }
        }
        ]).exec();
    },
    watch : function(id, openId) {
        return this.update({
            $and : [ {
                "_id" : {
                    $eq : id
                }
            }, {
                pendingGuests : {
                    $ne : openId
                }
            }, {
                "guests.openId" : {
                    $ne : openId
                }
            }, {
                watchers : {
                    $ne : openId
                }
            } ]
        }, {
            $push : {
                watchers : openId
            }
        }).exec();
    },
    unwatch : function(id, openId) {
        return this.update({
            _id : id,
            watchers : openId
        }, {
            $pull : {
                watchers : openId
            }
        }).exec();
    },
    getGuests : function(id, openId) {
        return this.aggregate([ {
            $match : {
                _id : mongoose.Types.ObjectId(id)
            },
        }, {
            $unwind : {
                path : '$pendingGuests',
                preserveNullAndEmptyArrays : true
            }
        }, {
            $lookup : {
                from : 'users',
                localField : 'pendingGuests',
                foreignField : 'openId',
                as : 'pendingDoc'
            }
        }, {
            $unwind : {
                path : '$pendingDoc',
                preserveNullAndEmptyArrays : true
            }
        }, {
            $group : {
                _id : null,
                guests : {
                    $first : '$guests'
                },
                pendingGuests : {
                    $push : {
                        openId : '$pendingGuests',
                        name : '$pendingDoc.name',
                        image : '$pendingDoc.avatarUrl'
                    }
                },
                isMine : {
                    $first : {
                        $eq : [
                            '$createdBy'
                            , openId ]
                    }
                }
            }
        }, {
            $unwind : {
                path : '$guests',
                preserveNullAndEmptyArrays : true
            }
        }, {
            $lookup : {
                from : 'users',
                localField : 'guests.openId',
                foreignField : 'openId',
                as : 'guestDoc'
            }
        }, {
            $unwind : {
                path : '$guestDoc',
                preserveNullAndEmptyArrays : true
            }
        }, {
            $addFields : {
                numGuests : {
                    $add : [ {
                        $cond : [ {
                            $not : [ "$guests" ]
                        }, 0, 1 ]
                    }, {
                        $size : {
                            "$ifNull" : [ '$guests.guests', [] ]
                        }
                    } ]
                }
            }
        }, {
            $group : {
                _id : null,
                guests : {
                    $push : {
                        name : '$guestDoc.name',
                        openId : '$guests.openId',
                        guests : '$guests.guests',
                        image : '$guestDoc.avatarUrl'
                    }
                },
                pendingGuests : {
                    $first : '$pendingGuests'
                },
                totalGuests : {
                    $sum : '$numGuests'
                },
                isMine : {
                    $first : '$isMine'
                }
            }
        }
        ]).exec();
    },
    getThumbnail : function(id) {
        return this.aggregate([ {
            $match : {
                _id : mongoose.Types.ObjectId(id)
            }
        }, {
            $project : {
                name : 1,
                description : 1,
                address : 1,
                dateTime : 1,
                settings : 1,
            }
        }
        ]).exec();
    },
    getDetail : function(id, openId) {
        return this.aggregate([
            {
                $match : {
                    _id : mongoose.Types.ObjectId(id)
                }
            }, {
                $lookup : {
                    from : 'users',
                    localField : 'createdBy',
                    foreignField : 'openId',
                    as : 'hostDoc'
                }
            }, {
                $unwind : '$hostDoc'
            }, {
                $unwind : {
                    path : '$guests',
                    preserveNullAndEmptyArrays : true
                }
            }, {
                $addFields : {
                    numGuests : {
                        $add : [ {
                            $cond : [ {
                                $not : [ "$guests" ]
                            }, 0, 1 ]
                        }, {
                            $size : {
                                "$ifNull" : [ '$guests.guests', [] ]
                            }
                        } ]
                    },
                    participating : {
                        $eq : [ '$guests.openId', openId ]
                    },
                    pending : {
                        $in : [ openId, '$pendingGuests' ]
                    },
                    watching : {
                        $in : [ openId, '$watchers' ]
                    }
                }
            }, {
                $group : {
                    _id : '$_id',
                    totalGuests : {
                        $sum : '$numGuests'
                    },
                    participating : {
                        $max : '$participating'
                    },
                    pending : {
                        $max : '$pending'
                    },
                    watching : {
                        $max : '$watching'
                    },
                    name : {
                        $first : '$name'
                    },
                    description : {
                        $first : '$description'
                    },
                    dateTime : {
                        $first : '$dateTime'
                    },
                    /*createdBy : {
                        $first : '$createdBy'
                    },*/
                    host : {
                        $first : "$hostDoc.name"
                    },
                    address : {
                        $first : '$address'
                    },
                    totalPending : {
                        $first : {
                            $size : {
                                $ifNull : [
                                    '$pendingGuests'
                                    , [] ]
                            }
                        }
                    },
                    totalWatching : {
                        $first : {
                            $size : {
                                $ifNull : [
                                    '$watchers'
                                    , [] ]
                            }
                        }
                    },
                    settings : {
                        $first : '$settings'
                    },
                    /*pendingGuests : {
                        $first : '$pendingGuests'
                    },*/
                    isMine : {
                        $first : {
                            $eq : [
                                '$createdBy'
                                , openId ]
                        }
                    }
                }
            }
        ]).exec();
    },
    bringGuests : function(id, openId, guests) {
        return this.update({
            "_id" : mongoose.Types.ObjectId(id),
            "guests.openId" : openId
        }, {
            $set : {
                "guests.$.guests" : guests
            }
        }).exec();
    },
    getMyGuests : function(id, openId) {
        return this.aggregate([
            {
                $match : {
                    _id : mongoose.Types.ObjectId(id)
                }
            }, {
                $unwind : "$guests"
            }, {
                $match : {
                    'guests.openId' : openId
                }
            }, {
                $project : {
                    guests : '$guests.guests'
                }
            }
        ]).exec();
    }
};

module.exports = mongoose.model('Event', EventSchema);