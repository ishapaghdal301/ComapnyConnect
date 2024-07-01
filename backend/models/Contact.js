const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, default: '' },
    dateOfBirth: { type: Date },
    contactType: { type: String, enum: ['Primary', 'Secondary', 'Other'], required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true } // Reference to Company document
});

module.exports = mongoose.model('Contact', contactSchema);
