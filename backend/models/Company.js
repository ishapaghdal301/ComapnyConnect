// models/Company.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    companyName: { type: String, required: true },
    companyAddress: { type: String, default: '' },
    companyPhone: { type: String, default: '' },
    companyEmail: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    numberOfEmployees: { type: Number },
    foundedDate: { type: Date },
    industryType: { type: String, enum: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Other'], required: true },
    contacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }] // Reference to Contact documents
});

module.exports = mongoose.model('Company', companySchema);
