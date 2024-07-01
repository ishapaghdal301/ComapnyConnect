const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const fileUpload = require('express-fileupload');
const xlsx = require('xlsx');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Models
const Company = require('./models/Company');
const Contact = require('./models/Contact');

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload());

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('connected');
    }
    catch (err) {
        console.error(' Failed to connect to MongoDB', err);
        process.exit(1);
    }
};
connectDB();

// File Upload Endpoint
app.post('/api/upload', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        console.log("-----------------------------------------");

        const excelFile = req.files.excelFile;
        const workbook = xlsx.read(excelFile.data, { type: 'buffer' });

        // Process the Excel sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Display data for review
        res.status(200).json({ data });
        console.log(data);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Save Data to Database Endpoint
app.post('/api/save', async (req, res) => {
    try {
        const { data } = req.body;

        const savedCompanies = [];
        const savedContacts = [];

        for (const item of data) {
            if (item.companyName && item.industryType) {
                // Save Company
                const company = new Company({
                    companyName: item.companyName,
                    companyAddress: item.companyAddress || '',
                    companyPhone: item.companyPhone || '',
                    companyEmail: item.companyEmail || '',
                    companyWebsite: item.companyWebsite || '',
                    numberOfEmployees: parseInt(item.numberOfEmployees) || undefined,
                    foundedDate: item.foundedDate ? new Date(item.foundedDate) : undefined,
                    industryType: item.industryType,
                    contacts: [] // Initialize empty contacts array
                });
                const savedCompany = await company.save();
                savedCompanies.push(savedCompany);

                // Save Contacts for the Company
                if (item.contacts && Array.isArray(item.contacts)) {
                    for (const contactData of item.contacts) {
                        if (contactData.contactName && contactData.contactEmail && contactData.contactType) {
                            const contact = new Contact({
                                contactName: contactData.contactName,
                                contactEmail: contactData.contactEmail,
                                contactPhone: contactData.contactPhone || '',
                                dateOfBirth: contactData.dateOfBirth ? new Date(contactData.dateOfBirth) : undefined,
                                contactType: contactData.contactType,
                                companyId: savedCompany._id // Link contact to the saved company
                            });
                            const savedContact = await contact.save();
                            savedContacts.push(savedContact);

                            // Update company's contacts array
                            savedCompany.contacts.push(savedContact);
                            await savedCompany.save(); // Save updated company
                        }
                    }
                }
            }
        }

        res.status(201).json({ message: 'Data saved successfully', savedCompanies, savedContacts });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
