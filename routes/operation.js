const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

router.use(express.json());

const prisma = new PrismaClient();

// Route to create a new sheet entry
router.post('/submit-form', async (req, res) => {
    const { id, name, subjectCode, teacherId, MST1, MST2, Quiz_Assignment, EndSem } = req.body;
  
    try {
      await prisma.sheet.create({
        data: {
          id,
          name,
          subjectCode,
          teacherId,
          MST1,
          MST2,
          Quiz_Assignment,
          EndSem,
          subject: {
            connect: {
              subjectCode: subjectCode,
            },
          },
          teacher: {
            connect: {
              teacherId: teacherId,
            },
          },
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

module.exports = router;