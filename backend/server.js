const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { generateDocument } = require('./docx_utils');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Setup file uploads
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
        // Unique filename to prevent overwrites
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Admin Endpoints ---

// Login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    db.get('SELECT password FROM admin_profile WHERE id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row && row.password === password) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    });
});

// Update Password
app.put('/api/admin/password', (req, res) => {
    const { newPassword } = req.body;
    db.run('UPDATE admin_profile SET password = ? WHERE id = 1', [newPassword], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Password updated successfully' });
    });
});

// Get Admin Profile
app.get('/api/admin/profile', (req, res) => {
    db.get('SELECT name, roll_number FROM admin_profile WHERE id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Update Admin Profile
app.put('/api/admin/profile', (req, res) => {
    const { name, roll_number } = req.body;
    db.run('UPDATE admin_profile SET name = ?, roll_number = ? WHERE id = 1', [name, roll_number], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Profile updated successfully' });
    });
});

// Upload Lab
app.post('/api/labs', upload.single('file'), (req, res) => {
    const { lab_id, original_date_string } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = file.path;
    const fileName = file.originalname;

    db.run('INSERT INTO labs (lab_id, original_date_string, file_path, file_name) VALUES (?, ?, ?, ?)',
        [lab_id, original_date_string, filePath, fileName],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID, message: 'Lab uploaded successfully' });
        }
    );
});

// Get All Labs
app.get('/api/labs', (req, res) => {
    db.all('SELECT * FROM labs ORDER BY id DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Delete Lab
app.delete('/api/labs/:id', (req, res) => {
    const id = req.params.id;

    // First get the file path to remove it from disk
    db.get('SELECT file_path FROM labs WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row && row.file_path && fs.existsSync(row.file_path)) {
            try {
                fs.unlinkSync(row.file_path);
            } catch (e) {
                console.error('Failed to delete file from disk:', e);
            }
        }

        db.run('DELETE FROM labs WHERE id = ?', [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Lab deleted successfully' });
        });
    });
});

// --- Public Endpoints ---

// Generate Document
app.post('/api/generate', async (req, res) => {
    const { labId, userName, userRoll, userDate } = req.body;

    if (!userName || !userRoll) {
        return res.status(400).json({ error: 'Name and Roll Number are required' });
    }

    try {
        // 1. Get the admin profile for replacements
        const adminProfile = await new Promise((resolve, reject) => {
            db.get('SELECT name, roll_number FROM admin_profile WHERE id = 1', (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });

        // 2. Get the lab details
        const labInfo = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM labs WHERE id = ?', [labId], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });

        if (!labInfo) {
            return res.status(404).json({ error: 'Lab not found' });
        }

        // 3. Build replacements map
        const replacements = {};
        if (adminProfile.name) {
            replacements[adminProfile.name] = userName;
        }
        if (adminProfile.roll_number) {
            replacements[adminProfile.roll_number] = userRoll;
        }
        if (userDate && labInfo.original_date_string) {
            replacements[labInfo.original_date_string] = userDate;
        }

        // 4. Create temp output file path
        const outFileName = `My_${labInfo.lab_id}.docx`;
        const tempDir = fs.mkdtempSync(path.join(__dirname, 'uploads', 'tmp-'));
        const outPath = path.join(tempDir, outFileName);

        // 5. Generate replaced document
        await generateDocument(labInfo.file_path, outPath, replacements);

        // 6. Send the file to client
        res.download(outPath, outFileName, (err) => {
            if (err) {
                console.error("Download Error:", err);
            }
            // 7. Cleanup temp directory after sending
            try {
                fs.unlinkSync(outPath);
                fs.rmdirSync(tempDir);
            } catch (cleanupErr) {
                console.error("Cleanup Error:", cleanupErr);
            }
        });

    } catch (e) {
        console.error("Generation error:", e);
        res.status(500).json({ error: 'Failed to generate document', details: e.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Backend Server running on port ${port}`);
});
