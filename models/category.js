const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: { 
        type: String,
    }
})
// for converting  '_id' to 'id'

categorySchema.virtual('id').get(function(){
    return this._id.toHexString();
})

categorySchema.set('toJSON',{
    virtuals: true,
});

// for converting  '_id' to 'id'

exports.Category = mongoose.model('Category', categorySchema);