const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({

    orderItem: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required : true
    }],
     shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },

})
// for converting  '_id' to 'id'

orderSchema.virtual('id').get(function(){
    return this._id.toHexString();
})

orderSchema.set('toJSON',{
    virtuals: true,
});

// for converting  '_id' to 'id'

exports.Order = mongoose.model('Order', orderSchema);
/**
Order Example:

{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "61221ad28dfb4b31787d21a3"
        },
        {
            "quantity": 2,
            "product" : "6159a4687ecf523d24e8d833"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "62cae90fa5dc030f70afe9e0"
}

 */