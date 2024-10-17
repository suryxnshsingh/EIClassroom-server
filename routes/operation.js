const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

router.use(express.json());

const prisma = new PrismaClient();

// Route to create a new sheet entry
router.post('/submit-form', async (req, res) => {
  const { id, name, subjectCode, MST1, MST2, Quiz_Assignment, EndSem } = req.body;

  try {
    // Find the teacher based on subjectCode
    const subject = await prisma.subject.findUnique({
      where: {
        code: subjectCode,
      },
      include: {
        teacher: true, // Include the teacher data in the result
      },
    });

    if (!subject || !subject.teacher) {
      return res.status(404).json({ error: 'Subject or Teacher not found' });
    }

    // Create the new sheet and connect it with the subject and teacher
    await prisma.sheet.create({
      data: {
        id,
        name,
        subjectCode,
        teacherId: subject.teacher.id, // Dynamically connect teacher through subjectCode
        MST1: parseInt(MST1),
        MST2: parseInt(MST2),
        Quiz_Assignment: parseInt(Quiz_Assignment),
        EndSem: parseInt(EndSem),
      },
    });

    res.status(201).json({ message: 'Form data saved successfully' });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Error saving form data' });
  }
});

// Route to get all rows from the Sheet table with a specific subjectCode
router.get('/sheets', async (req, res) => {
  const { subjectCode } = req.query; // Retrieve subjectCode from query parameter

  try {
    const sheets = await prisma.sheet.findMany({
      where: {
        subjectCode: subjectCode, // Filter records based on subjectCode
      },
    });
    res.status(200).json(sheets);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({ error: 'Error fetching sheets' });
  }
});

// Route to update a specific sheet entry by ID and subjectCode
router.put('/sheets/:id/:subjectCode', async (req, res) => {
  const { id, subjectCode } = req.params;
  const { name, MST1, MST2, Quiz_Assignment, EndSem } = req.body;

  try {
    const updatedSheet = await prisma.sheet.update({
      where: {
        id_subjectCode: {
          id: id,
          subjectCode: subjectCode,
        },
      },
      data: {
        name,
        MST1,
        MST2,
        Quiz_Assignment,
        EndSem,
      },
    });

    res.status(200).json(updatedSheet);
  } catch (error) {
    console.error('Error updating sheet:', error);
    res.status(500).json({ error: 'Error updating sheet' });
  }
});

const ExcelJS = require('exceljs');

// Route to download an Excel sheet with averages and MSTB calculation
router.get('/download-sheets', async (req, res) => {
  const { subjectCode } = req.query; // Get subjectCode from query parameter

  try {
    // Fetch the sheets for the specified subjectCode
    const sheets = await prisma.sheet.findMany({
      where: {
        subjectCode: subjectCode,
      },
    });

    if (sheets.length === 0) {
      return res.status(404).json({ error: 'No sheets found for this subject code.' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet Data');

    // Add header row
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'MST1', key: 'MST1', width: 10 },
      { header: 'MST2', key: 'MST2', width: 10 },
      { header: 'MSTB (Max of MST1 & MST2)', key: 'MSTB', width: 20 },
      { header: 'Quiz/Assignment', key: 'Quiz_Assignment', width: 20 },
      { header: 'End Sem', key: 'EndSem', width: 10 },
    ];

    // Add data rows with MSTB calculation
    sheets.forEach((sheet) => {
      worksheet.addRow({
        id: sheet.id,
        name: sheet.name,
        MST1: sheet.MST1,
        MST2: sheet.MST2,
        MSTB: Math.max(sheet.MST1 || 0, sheet.MST2 || 0), // Calculate MSTB dynamically
        Quiz_Assignment: sheet.Quiz_Assignment,
        EndSem: sheet.EndSem,
      });
    });

    // Add the average row at the end of the data
    const lastRowNumber = worksheet.lastRow.number + 1; // Calculate the last row number
    worksheet.addRow({
      id: 'Average',
      MST1: { formula: `AVERAGE(C2:C${lastRowNumber - 1})` }, // Average for MST1
      MST2: { formula: `AVERAGE(D2:D${lastRowNumber - 1})` }, // Average for MST2
      MSTB: { formula: `AVERAGE(E2:E${lastRowNumber - 1})` }, // Average for MSTB
      Quiz_Assignment: { formula: `AVERAGE(F2:F${lastRowNumber - 1})` }, // Average for Quiz/Assignments
      EndSem: { formula: `AVERAGE(G2:G${lastRowNumber - 1})` }, // Average for End Sem
    }).font = { bold: true }; // Make the average row bold

    // Set response headers for the download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sheets.xlsx');

    // Write the Excel file to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel sheet:', error);
    res.status(500).json({ error: 'Error generating Excel sheet' });
  }
});

module.exports = router;